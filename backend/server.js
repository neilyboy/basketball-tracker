const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const db = require('./database');
const multer = require('multer');
const fs = require('fs');
const archiver = require('archiver');
const AdmZip = require('adm-zip');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure temp directory exists for zip uploads
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'basketball-tracker-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files (frontend and uploads)
app.use(express.static(path.join(__dirname, 'public')));

// Auth middleware
const requireAuth = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Auth routes
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/admin/check', (req, res) => {
  res.json({ isAdmin: !!req.session.isAdmin });
});

// Settings routes
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', requireAuth, upload.single('homeLogo'), (req, res) => {
  try {
    const { homeTeamName, homeLocation } = req.body;
    const homeLogo = req.file ? `/uploads/${req.file.filename}` : null;
    
    db.updateSettings({
      homeTeamName,
      homeLocation,
      homeLogo
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Events routes
app.get('/api/events', (req, res) => {
  try {
    const events = db.getAllEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events/:id', (req, res) => {
  try {
    const event = db.getEvent(req.params.id);
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events', requireAuth, upload.single('opponentLogo'), (req, res) => {
  try {
    const eventData = {
      ...req.body,
      opponentLogo: req.file ? `/uploads/${req.file.filename}` : null
    };
    
    const id = db.createEvent(eventData);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/events/:id', requireAuth, upload.single('opponentLogo'), (req, res) => {
  try {
    const eventData = {
      ...req.body,
      opponentLogo: req.file ? `/uploads/${req.file.filename}` : req.body.existingLogo || null
    };
    
    db.updateEvent(req.params.id, eventData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/events/:id', requireAuth, (req, res) => {
  try {
    db.deleteEvent(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stats route
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getSeasonStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Backup route (JSON only - legacy)
app.get('/api/admin/backup', requireAuth, (req, res) => {
  try {
    const backup = db.createBackup();
    res.json(backup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Full backup route (ZIP with database + uploads)
app.get('/api/admin/backup/full', requireAuth, (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipFilename = `basketball-tracker-backup-${timestamp}.zip`;
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
    
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(res);
    
    // Add database backup as JSON file
    const backup = db.createBackup();
    archive.append(JSON.stringify(backup, null, 2), { name: 'database.json' });
    
    // Add uploads directory
    const uploadsPath = path.join(__dirname, 'public', 'uploads');
    if (fs.existsSync(uploadsPath)) {
      archive.directory(uploadsPath, 'uploads');
    }
    
    archive.finalize();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore route (JSON only - legacy)
app.post('/api/admin/restore', requireAuth, (req, res) => {
  try {
    const { backup } = req.body;
    db.restoreBackup(backup);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Full restore route (ZIP with database + uploads)
const uploadZip = multer({ 
  dest: path.join(__dirname, 'temp'),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

app.post('/api/admin/restore/full', requireAuth, uploadZip.single('backup'), (req, res) => {
  console.log('[RESTORE] Starting full backup restore...');
  
  try {
    if (!req.file) {
      console.error('[RESTORE] No backup file provided');
      return res.status(400).json({ error: 'No backup file provided' });
    }
    
    console.log('[RESTORE] Uploaded file:', req.file.path, 'Size:', req.file.size);
    
    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries();
    
    console.log('[RESTORE] ZIP contains', zipEntries.length, 'entries');
    
    // Extract database.json
    let databaseEntry = zipEntries.find(entry => entry.entryName === 'database.json');
    if (!databaseEntry) {
      console.error('[RESTORE] Missing database.json in backup file');
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid backup file: missing database.json' });
    }
    
    console.log('[RESTORE] Found database.json');
    const backupData = JSON.parse(databaseEntry.getData().toString('utf8'));
    
    // Restore database
    console.log('[RESTORE] Restoring database...');
    db.restoreBackup(backupData);
    console.log('[RESTORE] Database restored successfully');
    
    // Extract uploads directory
    const uploadsPath = path.join(__dirname, 'public', 'uploads');
    console.log('[RESTORE] Uploads path:', uploadsPath);
    
    // Clear existing uploads by deleting individual files instead of directory
    if (fs.existsSync(uploadsPath)) {
      console.log('[RESTORE] Clearing existing uploads...');
      const existingFiles = fs.readdirSync(uploadsPath);
      console.log('[RESTORE] Found', existingFiles.length, 'existing files to delete');
      
      for (const file of existingFiles) {
        const filePath = path.join(uploadsPath, file);
        try {
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
            console.log('[RESTORE] Deleted:', file);
          }
        } catch (err) {
          console.warn('[RESTORE] Could not delete file:', file, err.message);
        }
      }
    } else {
      console.log('[RESTORE] Creating uploads directory...');
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    
    // Extract all files from uploads directory in zip
    console.log('[RESTORE] Extracting uploads from backup...');
    let extractedCount = 0;
    
    zipEntries.forEach(entry => {
      if (entry.entryName.startsWith('uploads/') && !entry.isDirectory) {
        const fileName = entry.entryName.replace('uploads/', '');
        const filePath = path.join(uploadsPath, fileName);
        
        try {
          fs.writeFileSync(filePath, entry.getData());
          console.log('[RESTORE] Extracted:', fileName);
          extractedCount++;
        } catch (err) {
          console.error('[RESTORE] Failed to extract:', fileName, err.message);
        }
      }
    });
    
    console.log('[RESTORE] Extracted', extractedCount, 'files');
    
    // Clean up temp file
    fs.unlinkSync(req.file.path);
    console.log('[RESTORE] Cleanup complete');
    
    console.log('[RESTORE] Full backup restored successfully!');
    res.json({ 
      success: true, 
      message: 'Full backup restored successfully',
      filesRestored: extractedCount
    });
  } catch (error) {
    console.error('[RESTORE] Error during restore:', error);
    console.error('[RESTORE] Stack trace:', error.stack);
    
    // Clean up temp file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// Catch-all route to serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database and start server
db.init();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Basketball Tracker running on port ${PORT}`);
  console.log(`Admin password: ${ADMIN_PASSWORD}`);
});
