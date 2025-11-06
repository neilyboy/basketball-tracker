import React from 'react';
import { Calendar, CheckCircle, Circle } from 'lucide-react';
import { parseISO, isPast } from 'date-fns';

function SeasonProgress({ events }) {
  // Include all games (conference and non-conference) for season progress
  const totalGames = events.length;
  const completedGames = events.filter(e => 
    (e.score7thHome !== null && e.score7thAway !== null) || 
    (e.score8thHome !== null && e.score8thAway !== null)
  ).length;
  
  const pastGames = events.filter(e => isPast(parseISO(e.date))).length;
  const progress = totalGames > 0 ? (completedGames / totalGames) * 100 : 0;

  if (totalGames === 0) return null;

  return (
    <div className="bg-gradient-to-br from-dark-surface to-dark-card rounded-3xl p-8 border border-dark-border/50 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-accent-primary" />
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Season Progress</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            {completedGames} of {totalGames} games completed
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-6 bg-dark-bg rounded-full overflow-hidden mb-6 border border-dark-border/50">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-primary to-accent-lightred rounded-full transition-all duration-1000 ease-out shadow-lg shadow-accent-primary/50"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-white drop-shadow-lg">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-dark-bg to-dark-surface rounded-xl p-4 border border-dark-border/50 text-center">
          <div className="text-3xl font-black text-gradient mb-2">{completedGames}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Played</div>
        </div>
        
        <div className="bg-gradient-to-br from-dark-bg to-dark-surface rounded-xl p-4 border border-dark-border/50 text-center">
          <div className="text-3xl font-black text-white mb-2">{totalGames - pastGames}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Remaining</div>
        </div>
        
        <div className="bg-gradient-to-br from-dark-bg to-dark-surface rounded-xl p-4 border border-dark-border/50 text-center">
          <div className="text-3xl font-black text-white mb-2">{totalGames}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</div>
        </div>
      </div>
    </div>
  );
}

export default SeasonProgress;
