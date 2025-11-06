import React, { useState, useEffect } from 'react';
import { Save, Upload } from 'lucide-react';

function SettingsForm({ settings, onUpdate }) {
  const [formData, setFormData] = useState({
    homeTeamName: '',
    homeLocation: ''
  });
  const [homeLogo, setHomeLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        homeTeamName: settings.homeTeamName || '',
        homeLocation: settings.homeLocation || ''
      });
      if (settings.homeLogo) {
        setLogoPreview(settings.homeLogo);
      }
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHomeLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('homeTeamName', formData.homeTeamName);
      submitData.append('homeLocation', formData.homeLocation);
      
      if (homeLogo) {
        submitData.append('homeLogo', homeLogo);
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        body: submitData
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        onUpdate();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-dark-surface rounded-lg p-6 border border-dark-border">
        <h2 className="text-2xl font-bold text-white mb-6">Team Settings</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Home Team Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Home Team Name *
            </label>
            <input
              type="text"
              name="homeTeamName"
              value={formData.homeTeamName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your team name"
              required
            />
          </div>

          {/* Home Team Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Home Team Logo
            </label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Team logo preview"
                  className="w-20 h-20 object-contain bg-dark-bg rounded-lg p-2"
                />
              )}
              <label className="flex-1 cursor-pointer">
                <div className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-gray-400 hover:text-white transition-colors text-center">
                  <Upload className="w-5 h-5 inline mr-2" />
                  {homeLogo ? homeLogo.name : 'Upload Team Logo'}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This logo will appear on the public schedule and in game details
            </p>
          </div>

          {/* Home Location */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Home Location Address
            </label>
            <input
              type="text"
              name="homeLocation"
              value={formData.homeLocation}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter home gym address"
            />
            <p className="text-xs text-gray-500 mt-2">
              This address will be used for all home games
            </p>
          </div>

          {success && (
            <div className="text-green-400 text-sm bg-green-500/10 p-3 rounded-lg">
              Settings saved successfully!
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-dark-surface rounded-lg p-6 border border-dark-border">
        <h3 className="text-lg font-semibold text-white mb-3">Information</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>• Set your home team name to appear throughout the app</li>
          <li>• Upload a team logo to display on the schedule and game details</li>
          <li>• Configure your home location for easy directions to home games</li>
          <li>• Changes will be visible immediately on the public schedule</li>
        </ul>
      </div>
    </div>
  );
}

export default SettingsForm;
