import React from 'react';
import { Trophy, Target, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

function GameResults({ events, settings }) {
  // Filter events that have scores
  const completedGames = events.filter(e => 
    (e.score7thHome !== null && e.score7thAway !== null) || 
    (e.score8thHome !== null && e.score8thAway !== null)
  ).sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first

  if (completedGames.length === 0) {
    return null;
  }

  // Determine if a grade won, lost, or tied
  const getResult = (ourScore, opponentScore) => {
    if (ourScore > opponentScore) return 'W';
    if (ourScore < opponentScore) return 'L';
    return 'T';
  };

  return (
    <div className="relative">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Game Results</h2>
        <div className="h-1 w-20 bg-gradient-to-r from-accent-primary to-accent-lightred rounded-full"></div>
      </div>

      {/* Scrollable container with fixed height */}
      <div className="relative bg-gradient-to-br from-dark-surface/50 to-dark-card/50 rounded-2xl border border-dark-border/30 overflow-hidden">
        <div 
          className="overflow-y-auto space-y-4 p-4 scrollbar-thin scrollbar-thumb-accent-primary/50 scrollbar-track-dark-bg/30"
          style={{ maxHeight: '600px' }}
        >
          {completedGames.map((game) => {
          const gameDate = parseISO(game.date);
          const has7thScore = game.score7thHome !== null && game.score7thAway !== null;
          const has8thScore = game.score8thHome !== null && game.score8thAway !== null;

          // Calculate our scores and opponent scores
          const our7thScore = game.isHome ? game.score7thHome : game.score7thAway;
          const opp7thScore = game.isHome ? game.score7thAway : game.score7thHome;
          const our8thScore = game.isHome ? game.score8thHome : game.score8thAway;
          const opp8thScore = game.isHome ? game.score8thAway : game.score8thHome;

          const result7th = has7thScore ? getResult(our7thScore, opp7thScore) : null;
          const result8th = has8thScore ? getResult(our8thScore, opp8thScore) : null;

          return (
            <div 
              key={game.id}
              className="bg-gradient-to-br from-dark-surface to-dark-card rounded-xl p-4 border border-dark-border/50 shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Game Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {game.opponentLogo && (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-dark-bg to-dark-surface p-1.5 border border-dark-border">
                      <img 
                        src={game.opponentLogo} 
                        alt={game.opponentName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                        game.isHome 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-accent-secondary/20 text-accent-secondary'
                      }`}>
                        {game.isHome ? 'HOME' : 'AWAY'}
                      </span>
                      {game.isNonConference && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider bg-amber-500/20 text-amber-400">
                          FRIENDLY
                        </span>
                      )}
                      <p className="text-xs text-gray-500 font-medium">{format(gameDate, 'MMM d')}</p>
                    </div>
                    <h3 className="text-base font-black text-white">vs {game.opponentName}</h3>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 7th Grade */}
                {has7thScore && (
                  <div className={`rounded-lg p-3 border ${
                    result7th === 'W' 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : result7th === 'L'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-gray-500/10 border-gray-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">7th Grade</span>
                      <span className={`text-xs font-black px-2 py-0.5 rounded ${
                        result7th === 'W'
                          ? 'bg-green-500 text-white'
                          : result7th === 'L'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {result7th === 'W' ? 'W' : result7th === 'L' ? 'L' : 'T'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <p className="text-[10px] text-gray-500 mb-0.5 font-bold truncate">
                          {settings?.homeTeamName || 'Us'}
                        </p>
                        <p className="text-2xl font-black text-white">{our7thScore}</p>
                      </div>
                      <div className="text-lg font-black text-gray-600 px-2">-</div>
                      <div className="text-center flex-1">
                        <p className="text-[10px] text-gray-500 mb-0.5 font-bold truncate">{game.opponentName}</p>
                        <p className="text-2xl font-black text-white">{opp7thScore}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8th Grade */}
                {has8thScore && (
                  <div className={`rounded-lg p-3 border ${
                    result8th === 'W' 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : result8th === 'L'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-gray-500/10 border-gray-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">8th Grade</span>
                      <span className={`text-xs font-black px-2 py-0.5 rounded ${
                        result8th === 'W'
                          ? 'bg-green-500 text-white'
                          : result8th === 'L'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {result8th === 'W' ? 'W' : result8th === 'L' ? 'L' : 'T'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <p className="text-[10px] text-gray-500 mb-0.5 font-bold truncate">
                          {settings?.homeTeamName || 'Us'}
                        </p>
                        <p className="text-2xl font-black text-white">{our8thScore}</p>
                      </div>
                      <div className="text-lg font-black text-gray-600 px-2">-</div>
                      <div className="text-center flex-1">
                        <p className="text-[10px] text-gray-500 mb-0.5 font-bold truncate">{game.opponentName}</p>
                        <p className="text-2xl font-black text-white">{opp8thScore}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

export default GameResults;
