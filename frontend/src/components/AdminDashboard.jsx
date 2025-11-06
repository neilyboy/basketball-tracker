import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Settings as SettingsIcon, Calendar, Home, Database } from 'lucide-react';
import EventForm from './EventForm';
import EventList from './EventList';
import SettingsForm from './SettingsForm';
import BackupRestore from './BackupRestore';

function AdminDashboard({ onLogout }) {
  const [view, setView] = useState('events'); // 'events', 'settings', or 'backup'
  const [events, setEvents] = useState([]);
  const [settings, setSettings] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsRes, settingsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/settings')
      ]);

      const eventsData = await eventsRes.json();
      const settingsData = await settingsRes.json();

      setEvents(eventsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadData();
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete event');
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingEvent(null);
    loadData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-border sticky top-0 z-10 backdrop-blur-lg bg-opacity-95">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setView('events')}
                  className={`px-4 py-2 rounded-lg transition-all font-medium ${
                    view === 'events'
                      ? 'bg-gradient-to-r from-accent-primary to-accent-lightred text-white shadow-lg shadow-accent-primary/30'
                      : 'text-gray-500 hover:text-white hover:bg-dark-card border border-dark-border'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Events
                </button>
                <button
                  onClick={() => setView('settings')}
                  className={`px-4 py-2 rounded-lg transition-all font-medium ${
                    view === 'settings'
                      ? 'bg-gradient-to-r from-accent-primary to-accent-lightred text-white shadow-lg shadow-accent-primary/30'
                      : 'text-gray-500 hover:text-white hover:bg-dark-card border border-dark-border'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4 inline mr-2" />
                  Settings
                </button>
                <button
                  onClick={() => setView('backup')}
                  className={`px-4 py-2 rounded-lg transition-all font-medium ${
                    view === 'backup'
                      ? 'bg-gradient-to-r from-accent-primary to-accent-lightred text-white shadow-lg shadow-accent-primary/30'
                      : 'text-gray-500 hover:text-white hover:bg-dark-card border border-dark-border'
                  }`}
                >
                  <Database className="w-4 h-4 inline mr-2" />
                  Backup
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                className="p-2 text-gray-500 hover:text-white hover:bg-dark-card rounded-lg transition-all border border-dark-border"
              >
                <Home className="w-5 h-5" />
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {view === 'events' ? (
          <>
            {showForm ? (
              <EventForm
                event={editingEvent}
                settings={settings}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Game Events</h2>
                  <button
                    onClick={handleAddEvent}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-primary to-accent-lightred hover:from-accent-lightred hover:to-accent-primary text-white rounded-lg transition-all font-semibold shadow-lg shadow-accent-primary/30"
                  >
                    <Plus className="w-5 h-5" />
                    Add Event
                  </button>
                </div>

                <EventList
                  events={events}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                />
              </>
            )}
          </>
        ) : view === 'settings' ? (
          <SettingsForm settings={settings} onUpdate={loadData} />
        ) : (
          <BackupRestore />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
