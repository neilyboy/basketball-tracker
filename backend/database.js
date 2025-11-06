const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join('/app/data', 'basketball-tracker.db');
const db = new Database(dbPath);

// Initialize database schema
function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      homeTeamName TEXT,
      homeLocation TEXT,
      homeLogo TEXT
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      opponentName TEXT NOT NULL,
      opponentLogo TEXT,
      isHome INTEGER NOT NULL,
      location TEXT,
      time7th TEXT,
      time8th TEXT,
      score7thHome INTEGER,
      score7thAway INTEGER,
      score8thHome INTEGER,
      score8thAway INTEGER,
      notes TEXT,
      isNonConference INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    INSERT OR IGNORE INTO settings (id, homeTeamName, homeLocation, homeLogo)
    VALUES (1, 'Home Team', '', NULL);
  `);
  
  // Add isNonConference column if it doesn't exist (for existing databases)
  try {
    db.prepare('ALTER TABLE events ADD COLUMN isNonConference INTEGER DEFAULT 0').run();
  } catch (err) {
    // Column already exists, ignore error
  }
}

// Settings functions
function getSettings() {
  return db.prepare('SELECT * FROM settings WHERE id = 1').get() || {
    homeTeamName: 'Home Team',
    homeLocation: '',
    homeLogo: null
  };
}

function updateSettings(data) {
  const existing = getSettings();
  const stmt = db.prepare(`
    UPDATE settings 
    SET homeTeamName = ?,
        homeLocation = ?,
        homeLogo = ?
    WHERE id = 1
  `);
  
  stmt.run(
    data.homeTeamName || existing.homeTeamName,
    data.homeLocation || existing.homeLocation,
    data.homeLogo || existing.homeLogo
  );
}

// Event functions
function getAllEvents() {
  return db.prepare(`
    SELECT * FROM events 
    ORDER BY date ASC
  `).all();
}

function getEvent(id) {
  return db.prepare('SELECT * FROM events WHERE id = ?').get(id);
}

function createEvent(data) {
  const stmt = db.prepare(`
    INSERT INTO events (
      date, opponentName, opponentLogo, isHome, location,
      time7th, time8th, score7thHome, score7thAway,
      score8thHome, score8thAway, notes, isNonConference
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.date,
    data.opponentName,
    data.opponentLogo || null,
    (data.isHome === true || data.isHome === 'true' || data.isHome === '1' || data.isHome === 1) ? 1 : 0,
    data.location || null,
    data.time7th || null,
    data.time8th || null,
    data.score7thHome || null,
    data.score7thAway || null,
    data.score8thHome || null,
    data.score8thAway || null,
    data.notes || null,
    (data.isNonConference === true || data.isNonConference === 'true' || data.isNonConference === '1' || data.isNonConference === 1) ? 1 : 0
  );
  
  return result.lastInsertRowid;
}

function updateEvent(id, data) {
  const stmt = db.prepare(`
    UPDATE events 
    SET date = ?,
        opponentName = ?,
        opponentLogo = ?,
        isHome = ?,
        location = ?,
        time7th = ?,
        time8th = ?,
        score7thHome = ?,
        score7thAway = ?,
        score8thHome = ?,
        score8thAway = ?,
        notes = ?,
        isNonConference = ?
    WHERE id = ?
  `);
  
  stmt.run(
    data.date,
    data.opponentName,
    data.opponentLogo,
    (data.isHome === true || data.isHome === 'true' || data.isHome === '1' || data.isHome === 1) ? 1 : 0,
    data.location || null,
    data.time7th || null,
    data.time8th || null,
    data.score7thHome || null,
    data.score7thAway || null,
    data.score8thHome || null,
    data.score8thAway || null,
    data.notes || null,
    (data.isNonConference === true || data.isNonConference === 'true' || data.isNonConference === '1' || data.isNonConference === 1) ? 1 : 0,
    id
  );
}

function deleteEvent(id) {
  db.prepare('DELETE FROM events WHERE id = ?').run(id);
}

// Stats functions
function getSeasonStats() {
  const events = db.prepare(`
    SELECT 
      score7thHome, score7thAway,
      score8thHome, score8thAway,
      isHome
    FROM events
    WHERE ((score7thHome IS NOT NULL AND score7thAway IS NOT NULL)
       OR (score8thHome IS NOT NULL AND score8thAway IS NOT NULL))
       AND (isNonConference IS NULL OR isNonConference = 0)
  `).all();

  let stats = {
    '7th': { wins: 0, losses: 0 },
    '8th': { wins: 0, losses: 0 }
  };

  events.forEach(event => {
    // 7th grade stats
    if (event.score7thHome !== null && event.score7thAway !== null) {
      if (event.isHome) {
        // We are home team, so score7thHome is our score
        if (event.score7thHome > event.score7thAway) {
          stats['7th'].wins++;
        } else if (event.score7thHome < event.score7thAway) {
          stats['7th'].losses++;
        }
        // Ties don't count as win or loss
      } else {
        // We are away team, so score7thAway is our score
        if (event.score7thAway > event.score7thHome) {
          stats['7th'].wins++;
        } else if (event.score7thAway < event.score7thHome) {
          stats['7th'].losses++;
        }
        // Ties don't count as win or loss
      }
    }

    // 8th grade stats
    if (event.score8thHome !== null && event.score8thAway !== null) {
      if (event.isHome) {
        // We are home team, so score8thHome is our score
        if (event.score8thHome > event.score8thAway) {
          stats['8th'].wins++;
        } else if (event.score8thHome < event.score8thAway) {
          stats['8th'].losses++;
        }
        // Ties don't count as win or loss
      } else {
        // We are away team, so score8thAway is our score
        if (event.score8thAway > event.score8thHome) {
          stats['8th'].wins++;
        } else if (event.score8thAway < event.score8thHome) {
          stats['8th'].losses++;
        }
        // Ties don't count as win or loss
      }
    }
  });

  return stats;
}

// Backup functions
function createBackup() {
  const settings = getSettings();
  const events = getAllEvents();
  
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    settings,
    events
  };
}

function restoreBackup(backup) {
  if (!backup || !backup.settings || !backup.events) {
    throw new Error('Invalid backup data');
  }

  // Clear existing data
  db.prepare('DELETE FROM events').run();
  
  // Restore settings
  updateSettings(backup.settings);
  
  // Restore events
  backup.events.forEach(event => {
    const stmt = db.prepare(`
      INSERT INTO events (
        id, date, opponentName, opponentLogo, isHome, location,
        time7th, time8th, score7thHome, score7thAway,
        score8thHome, score8thAway, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      event.id,
      event.date,
      event.opponentName,
      event.opponentLogo,
      event.isHome,
      event.location,
      event.time7th,
      event.time8th,
      event.score7thHome,
      event.score7thAway,
      event.score8thHome,
      event.score8thAway,
      event.notes,
      event.createdAt
    );
  });
}

module.exports = {
  init,
  getSettings,
  updateSettings,
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getSeasonStats,
  createBackup,
  restoreBackup
};
