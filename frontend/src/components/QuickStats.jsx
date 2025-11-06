import React from 'react';
import { TrendingUp, TrendingDown, Target, Home, Plane, Flame, Snowflake } from 'lucide-react';

function QuickStats({ events, stats }) {
  // Filter out non-conference games
  const conferenceEvents = events.filter(e => !e.isNonConference);

  // Calculate streaks
  const calculateStreak = (grade) => {
    const gradeEvents = conferenceEvents
      .filter(e => {
        if (grade === '7th') {
          return e.score7thHome !== null && e.score7thAway !== null;
        } else {
          return e.score8thHome !== null && e.score8thAway !== null;
        }
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (gradeEvents.length === 0) return { type: 'none', count: 0 };

    let streak = 0;
    let streakType = null;

    for (const event of gradeEvents) {
      const homeScore = grade === '7th' ? event.score7thHome : event.score8thHome;
      const awayScore = grade === '7th' ? event.score7thAway : event.score8thAway;
      
      // Determine our score and opponent score based on home/away
      const ourScore = event.isHome ? homeScore : awayScore;
      const oppScore = event.isHome ? awayScore : homeScore;
      const won = ourScore > oppScore;

      if (streakType === null) {
        streakType = won ? 'win' : 'loss';
        streak = 1;
      } else if ((streakType === 'win' && won) || (streakType === 'loss' && !won)) {
        streak++;
      } else {
        break;
      }
    }

    return { type: streakType, count: streak };
  };

  // Calculate scoring averages
  const calculateAverages = (grade) => {
    const scoredGames = conferenceEvents.filter(e => {
      if (grade === '7th') {
        return e.score7thHome !== null && e.score7thAway !== null;
      } else {
        return e.score8thHome !== null && e.score8thAway !== null;
      }
    });

    if (scoredGames.length === 0) return { pointsFor: 0, pointsAgainst: 0 };

    const totalFor = scoredGames.reduce((sum, e) => {
      const homeScore = grade === '7th' ? e.score7thHome : e.score8thHome;
      const awayScore = grade === '7th' ? e.score7thAway : e.score8thAway;
      const ourScore = e.isHome ? homeScore : awayScore;
      return sum + ourScore;
    }, 0);

    const totalAgainst = scoredGames.reduce((sum, e) => {
      const homeScore = grade === '7th' ? e.score7thHome : e.score8thHome;
      const awayScore = grade === '7th' ? e.score7thAway : e.score8thAway;
      const oppScore = e.isHome ? awayScore : homeScore;
      return sum + oppScore;
    }, 0);

    return {
      pointsFor: (totalFor / scoredGames.length).toFixed(1),
      pointsAgainst: (totalAgainst / scoredGames.length).toFixed(1),
      games: scoredGames.length
    };
  };

  // Calculate home/away splits
  const calculateSplits = (grade) => {
    const scoredGames = conferenceEvents.filter(e => {
      if (grade === '7th') {
        return e.score7thHome !== null && e.score7thAway !== null;
      } else {
        return e.score8thHome !== null && e.score8thAway !== null;
      }
    });

    const homeGames = scoredGames.filter(e => e.isHome);
    const awayGames = scoredGames.filter(e => !e.isHome);

    const homeWins = homeGames.filter(e => {
      const homeScore = grade === '7th' ? e.score7thHome : e.score8thHome;
      const awayScore = grade === '7th' ? e.score7thAway : e.score8thAway;
      // We are home, so our score is homeScore
      return homeScore > awayScore;
    }).length;

    const awayWins = awayGames.filter(e => {
      const homeScore = grade === '7th' ? e.score7thHome : e.score8thHome;
      const awayScore = grade === '7th' ? e.score7thAway : e.score8thAway;
      // We are away, so our score is awayScore
      return awayScore > homeScore;
    }).length;

    return {
      home: { wins: homeWins, games: homeGames.length },
      away: { wins: awayWins, games: awayGames.length }
    };
  };

  const streak7th = calculateStreak('7th');
  const streak8th = calculateStreak('8th');
  const avg7th = calculateAverages('7th');
  const avg8th = calculateAverages('8th');
  const splits7th = calculateSplits('7th');
  const splits8th = calculateSplits('8th');

  return (
    <div className="relative">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Team Insights</h2>
        <div className="h-1 w-20 bg-gradient-to-r from-accent-primary to-accent-lightred rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 7th Grade Insights */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-wider">7th Grade</h3>
          
          {/* Streak */}
          {streak7th.count > 0 && (
            <div className={`rounded-2xl p-6 border shadow-lg ${
              streak7th.type === 'win' 
                ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/30' 
                : 'bg-gradient-to-br from-red-500/20 to-orange-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {streak7th.type === 'win' ? (
                  <Flame className="w-6 h-6 text-green-400" />
                ) : (
                  <Snowflake className="w-6 h-6 text-red-400" />
                )}
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">Current Streak</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-black ${streak7th.type === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                  {streak7th.count}
                </span>
                <span className="text-xl font-bold text-white">
                  {streak7th.type === 'win' ? 'WIN' : 'LOSS'} STREAK
                </span>
              </div>
            </div>
          )}

          {/* Scoring Average */}
          {avg7th.games > 0 && (
            <div className="bg-gradient-to-br from-dark-surface to-dark-card rounded-2xl p-6 border border-dark-border/50">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-accent-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-500">Scoring Average</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-black text-gradient mb-1">{avg7th.pointsFor}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase">PPG</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white mb-1">{avg7th.pointsAgainst}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase">Opp PPG</div>
                </div>
              </div>
            </div>
          )}

          {/* Home/Away Split */}
          {(splits7th.home.games > 0 || splits7th.away.games > 0) && (
            <div className="bg-gradient-to-br from-dark-surface to-dark-card rounded-2xl p-6 border border-dark-border/50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-bold text-white">Home</span>
                  </div>
                  <span className="text-2xl font-black text-white">
                    {splits7th.home.wins}-{splits7th.home.games - splits7th.home.wins}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-accent-secondary" />
                    <span className="text-sm font-bold text-white">Away</span>
                  </div>
                  <span className="text-2xl font-black text-white">
                    {splits7th.away.wins}-{splits7th.away.games - splits7th.away.wins}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 8th Grade Insights */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-wider">8th Grade</h3>
          
          {/* Streak */}
          {streak8th.count > 0 && (
            <div className={`rounded-2xl p-6 border shadow-lg ${
              streak8th.type === 'win' 
                ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/30' 
                : 'bg-gradient-to-br from-red-500/20 to-orange-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {streak8th.type === 'win' ? (
                  <Flame className="w-6 h-6 text-green-400" />
                ) : (
                  <Snowflake className="w-6 h-6 text-red-400" />
                )}
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">Current Streak</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-black ${streak8th.type === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                  {streak8th.count}
                </span>
                <span className="text-xl font-bold text-white">
                  {streak8th.type === 'win' ? 'WIN' : 'LOSS'} STREAK
                </span>
              </div>
            </div>
          )}

          {/* Scoring Average */}
          {avg8th.games > 0 && (
            <div className="bg-gradient-to-br from-dark-surface to-dark-card rounded-2xl p-6 border border-dark-border/50">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-accent-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-500">Scoring Average</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-black text-gradient mb-1">{avg8th.pointsFor}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase">PPG</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white mb-1">{avg8th.pointsAgainst}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase">Opp PPG</div>
                </div>
              </div>
            </div>
          )}

          {/* Home/Away Split */}
          {(splits8th.home.games > 0 || splits8th.away.games > 0) && (
            <div className="bg-gradient-to-br from-dark-surface to-dark-card rounded-2xl p-6 border border-dark-border/50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-bold text-white">Home</span>
                  </div>
                  <span className="text-2xl font-black text-white">
                    {splits8th.home.wins}-{splits8th.home.games - splits8th.home.wins}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-accent-secondary" />
                    <span className="text-sm font-bold text-white">Away</span>
                  </div>
                  <span className="text-2xl font-black text-white">
                    {splits8th.away.wins}-{splits8th.away.games - splits8th.away.wins}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuickStats;
