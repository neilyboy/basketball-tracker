import React, { useState, useEffect } from 'react';
import { X, Upload, Save } from 'lucide-react';

function EventForm({ event, settings, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    date: '',
    opponentName: '',
    isHome: true,
    location: '',
    time7th: '',
    time8th: '',
    score7thHome: '',
    score7thAway: '',
    score8thHome: '',
    score8thAway: '',
    notes: '',
    isNonConference: false
  });
  const [opponentLogo, setOpponentLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (event) {
      setFormData({
        date: event.date,
        opponentName: event.opponentName,
        isHome: !!event.isHome,
        location: event.location || '',
        time7th: event.time7th || '',
        time8th: event.time8th || '',
        score7thHome: event.score7thHome ?? '',
        score7thAway: event.score7thAway ?? '',
        score8thHome: event.score8thHome ?? '',
        score8thAway: event.score8thAway ?? '',
        notes: event.notes || '',
        isNonConference: !!event.isNonConference
      });
      if (event.opponentLogo) {
        setLogoPreview(event.opponentLogo);
      }
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOpponentLogo(file);
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
    setLoading(true);

    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        // Always send isHome, location, and isNonConference, even if empty/false
        if (key === 'isHome') {
          submitData.append(key, value);
        } else if (key === 'location') {
          submitData.append(key, value || '');
        } else if (key === 'isNonConference') {
          submitData.append(key, value ? '1' : '0');
        } else if (value !== '' && value !== null) {
          submitData.append(key, value);
        }
      });

      if (opponentLogo) {
        submitData.append('opponentLogo', opponentLogo);
      } else if (event?.opponentLogo) {
        submitData.append('existingLogo', event.opponentLogo);
      }

      const url = event ? `/api/events/${event.id}` : '/api/events';
      const method = event ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: submitData
      });

      if (response.ok) {
        onSubmit();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save event');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-surface rounded-lg p-6 border border-dark-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {event ? 'Edit Event' : 'Add New Event'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Game Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Opponent Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Opponent Team Name *
            </label>
            <input
              type="text"
              name="opponentName"
              value={formData.opponentName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter team name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Opponent Logo
            </label>
            <div className="flex items-center gap-3">
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Preview"
                  className="w-12 h-12 object-contain bg-dark-bg rounded"
                />
              )}
              <label className="flex-1 cursor-pointer">
                <div className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-400 hover:text-white transition-colors text-center">
                  <Upload className="w-4 h-4 inline mr-2" />
                  {opponentLogo ? opponentLogo.name : 'Upload Logo'}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Home/Away */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Game Location Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isHome"
                checked={formData.isHome}
                onChange={() => setFormData(prev => ({ ...prev, isHome: true }))}
                className="w-4 h-4"
              />
              <span className="text-white">Home</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isHome"
                checked={!formData.isHome}
                onChange={() => setFormData(prev => ({ ...prev, isHome: false }))}
                className="w-4 h-4"
              />
              <span className="text-white">Away</span>
            </label>
          </div>
        </div>

        {/* Non-Conference Game */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isNonConference"
              checked={formData.isNonConference}
              onChange={(e) => setFormData(prev => ({ ...prev, isNonConference: e.target.checked }))}
              className="w-5 h-5 rounded border-amber-500 text-amber-500 focus:ring-amber-500"
            />
            <div>
              <span className="text-white font-bold">Non-Conference / Friendly Game</span>
              <p className="text-xs text-gray-400 mt-1">
                Check this box if this is a non-conference or friendly game. Scores will be tracked but won't count towards season statistics.
              </p>
            </div>
          </label>
        </div>

        {/* Location (if away) */}
        {!formData.isHome && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Away Location Address
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full address"
            />
          </div>
        )}

        {/* Game Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              7th Grade Start Time
            </label>
            <input
              type="time"
              name="time7th"
              value={formData.time7th}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for N/A</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              8th Grade Start Time
            </label>
            <input
              type="time"
              name="time8th"
              value={formData.time8th}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for N/A</p>
          </div>
        </div>

        {/* Scores */}
        <div className="border-t border-dark-border pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Game Scores (Optional)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                7th Grade Score
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Show fields in team perspective order */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-semibold">
                    {settings?.homeTeamName || 'Our Team'}
                  </label>
                  <input
                    type="number"
                    name={formData.isHome ? "score7thHome" : "score7thAway"}
                    value={formData.isHome ? formData.score7thHome : formData.score7thAway}
                    onChange={handleChange}
                    placeholder="Our score"
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-semibold">
                    {formData.opponentName || 'Opponent'}
                  </label>
                  <input
                    type="number"
                    name={formData.isHome ? "score7thAway" : "score7thHome"}
                    value={formData.isHome ? formData.score7thAway : formData.score7thHome}
                    onChange={handleChange}
                    placeholder="Opponent score"
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                8th Grade Score
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Show fields in team perspective order */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-semibold">
                    {settings?.homeTeamName || 'Our Team'}
                  </label>
                  <input
                    type="number"
                    name={formData.isHome ? "score8thHome" : "score8thAway"}
                    value={formData.isHome ? formData.score8thHome : formData.score8thAway}
                    onChange={handleChange}
                    placeholder="Our score"
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-semibold">
                    {formData.opponentName || 'Opponent'}
                  </label>
                  <input
                    type="number"
                    name={formData.isHome ? "score8thAway" : "score8thHome"}
                    value={formData.isHome ? formData.score8thAway : formData.score8thHome}
                    onChange={handleChange}
                    placeholder="Opponent score"
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Add any additional information..."
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-dark-bg hover:bg-dark-hover text-white font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventForm;
