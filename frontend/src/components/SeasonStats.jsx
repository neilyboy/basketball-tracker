import React from 'react';
import { Trophy } from 'lucide-react';

function SeasonStats({ stats, settings }) {
  const hasStats = (stats['7th'].wins + stats['7th'].losses > 0) || 
                   (stats['8th'].wins + stats['8th'].losses > 0);

  if (!hasStats) {
    return null;
  }

  return (
    <div className="relative">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Season Record</h2>
        <div className="h-1 w-20 bg-gradient-to-r from-accent-primary to-accent-lightred rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 7th Grade Stats */}
        <div className="bg-gradient-to-br from-dark-surface to-dark-card rounded-3xl p-8 border border-dark-border/50 shadow-2xl hover:border-accent-primary/50 transition-all">
          <div className="flex items-center gap-4 mb-6">
            {settings?.homeLogo && (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dark-bg to-dark-surface p-3 border-2 border-dark-border shadow-xl">
                <img 
                  src={settings.homeLogo} 
                  alt={settings.homeTeamName}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
            )}
            <div>
              <div className="text-xs text-gray-500 font-black uppercase tracking-wider mb-1">7th Grade</div>
              <div className="text-xl font-black text-white tracking-tight">
                {settings?.homeTeamName || 'Team'}
              </div>
            </div>
          </div>
          <div className="text-center py-6 bg-gradient-to-br from-dark-bg to-dark-surface rounded-2xl border border-dark-border/50">
            <div className="text-6xl font-black text-gradient mb-2">
              {stats['7th'].wins}-{stats['7th'].losses}
            </div>
            <div className="text-xs text-gray-500 font-black uppercase tracking-widest">Wins - Losses</div>
          </div>
        </div>

        {/* 8th Grade Stats */}
        <div className="bg-gradient-to-br from-dark-surface to-dark-card rounded-3xl p-8 border border-dark-border/50 shadow-2xl hover:border-accent-primary/50 transition-all">
          <div className="flex items-center gap-4 mb-6">
            {settings?.homeLogo && (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dark-bg to-dark-surface p-3 border-2 border-dark-border shadow-xl">
                <img 
                  src={settings.homeLogo} 
                  alt={settings.homeTeamName}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
            )}
            <div>
              <div className="text-xs text-gray-500 font-black uppercase tracking-wider mb-1">8th Grade</div>
              <div className="text-xl font-black text-white tracking-tight">
                {settings?.homeTeamName || 'Team'}
              </div>
            </div>
          </div>
          <div className="text-center py-6 bg-gradient-to-br from-dark-bg to-dark-surface rounded-2xl border border-dark-border/50">
            <div className="text-6xl font-black text-gradient mb-2">
              {stats['8th'].wins}-{stats['8th'].losses}
            </div>
            <div className="text-xs text-gray-500 font-black uppercase tracking-widest">Wins - Losses</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeasonStats;
