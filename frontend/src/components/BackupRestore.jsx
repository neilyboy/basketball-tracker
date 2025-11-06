import React, { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, Database } from 'lucide-react';

function BackupRestore() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  const handleBackup = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/backup/full');
      
      if (response.ok) {
        // Get the blob from response
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Extract filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `basketball-tracker-backup-${new Date().toISOString().split('T')[0]}.zip`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setMessage('Full backup downloaded successfully! (includes all logos)');
        setMessageType('success');
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to create backup');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Backup error:', error);
      setMessage('Failed to create backup. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleRestore = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm('⚠️ WARNING: This will replace ALL current data AND logos with the backup data. Are you sure?')) {
      event.target.value = '';
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('backup', file);

      const response = await fetch('/api/admin/restore/full', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Full backup restored successfully! (including logos) Reloading page...');
        setMessageType('success');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(result.error || 'Failed to restore backup');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Restore error:', error);
      setMessage('Invalid backup file or restore failed. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
      event.target.value = '';
      if (messageType !== 'success') {
        setTimeout(() => setMessage(null), 5000);
      }
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-dark-surface rounded-xl p-6 border border-dark-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-lightred flex items-center justify-center shadow-lg shadow-accent-primary/30">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Backup & Restore</h2>
            <p className="text-sm text-gray-500">Manage your data backups</p>
          </div>
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-4 rounded-lg mb-6 ${
            messageType === 'success' 
              ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Backup Section */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Create Full Backup</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Download a complete backup including ALL events, scores, settings, AND team logos. 
                  This ZIP file contains everything needed to fully restore or migrate your data.
                </p>
              </div>
            </div>
            <button
              onClick={handleBackup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-lightred hover:from-accent-lightred hover:to-accent-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg shadow-accent-primary/30"
            >
              <Download className="w-5 h-5" />
              {loading ? 'Creating Full Backup...' : 'Download Full Backup (ZIP)'}
            </button>
          </div>

          {/* Restore Section */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Restore Backup</h3>
              <p className="text-sm text-gray-400 mb-4">
                Upload a previously created backup file to restore your data.
              </p>
              <div className="bg-accent-primary/10 border border-accent-primary/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <strong className="text-white">Warning:</strong> Restoring a backup will 
                    replace ALL current data (events, scores, settings) with the data from the backup file.
                    Make sure to create a backup of your current data first if you want to keep it.
                  </div>
                </div>
              </div>
            </div>
            <label className="block">
              <div className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-dark-surface hover:bg-dark-hover border-2 border-dashed border-gray-600 hover:border-accent-primary text-gray-300 hover:text-white font-semibold rounded-lg transition-all cursor-pointer">
                <Upload className="w-5 h-5" />
                {loading ? 'Restoring...' : 'Upload Backup File'}
              </div>
              <input
                type="file"
                accept=".zip"
                onChange={handleRestore}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>

          {/* Info Section */}
          <div className="bg-dark-card rounded-xl p-6 border border-dark-border">
            <h3 className="text-lg font-semibold text-white mb-3">Backup Information</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-accent-coral mt-0.5">•</span>
                <span>Backups include all events, game scores, team settings, configurations, AND team logos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-coral mt-0.5">•</span>
                <span>Backup files are in ZIP format containing database and all uploaded images</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-coral mt-0.5">•</span>
                <span>Restoring a backup will replace ALL data and images with the backup contents</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-coral mt-0.5">•</span>
                <span>Perfect for migrating to a new server or disaster recovery</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-coral mt-0.5">•</span>
                <span>Store backup files in a safe location for disaster recovery</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BackupRestore;
