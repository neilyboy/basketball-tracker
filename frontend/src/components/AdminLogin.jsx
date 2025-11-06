import React, { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        onLogin();
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-surface rounded-xl p-8 border border-dark-border shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-primary to-accent-lightred rounded-2xl flex items-center justify-center shadow-lg shadow-accent-primary/30">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Admin Login
          </h1>
          <p className="text-gray-400 text-center mb-6">
            Enter your admin password to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-dark-card border border-dark-border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all"
                placeholder="Enter password"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-primary to-accent-lightred hover:from-accent-lightred hover:to-accent-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-accent-primary/30"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-400 hover:text-gray-300">
              ← Back to schedule
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
