import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Zap } from 'lucide-react';
import { parseISO, differenceInDays, differenceInHours, differenceInMinutes, isFuture, isToday as isTodayFn, setHours, setMinutes } from 'date-fns';

function GameCountdown({ nextEvent }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [isGameToday, setIsGameToday] = useState(false);

  // Parse time string (e.g., "10:00" or "10:00 AM") and return hours and minutes
  const parseGameTime = (timeString) => {
    if (!timeString || timeString === 'N/A') return null;
    
    // Handle AM/PM format
    const ampmMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1]);
      const minutes = parseInt(ampmMatch[2]);
      const period = ampmMatch[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return { hours, minutes };
    }
    
    // Handle 24-hour format
    const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      return { hours: parseInt(match[1]), minutes: parseInt(match[2]) };
    }
    
    return null;
  };

  useEffect(() => {
    if (!nextEvent) return;

    const calculateTimeLeft = () => {
      let eventDate = parseISO(nextEvent.date);
      const now = new Date();

      // Try to get the earliest game time
      const time7th = parseGameTime(nextEvent.time7th);
      const time8th = parseGameTime(nextEvent.time8th);
      
      // Use the earliest game time if available
      if (time7th || time8th) {
        let earliestTime = time7th;
        
        // If both times exist, use the earlier one
        if (time7th && time8th) {
          const time7thMinutes = time7th.hours * 60 + time7th.minutes;
          const time8thMinutes = time8th.hours * 60 + time8th.minutes;
          earliestTime = time7thMinutes <= time8thMinutes ? time7th : time8th;
        } else if (time8th) {
          earliestTime = time8th;
        }
        
        // Set the event date to include the game time
        if (earliestTime) {
          eventDate = setHours(eventDate, earliestTime.hours);
          eventDate = setMinutes(eventDate, earliestTime.minutes);
        }
      }

      // Check if the game is actually today (same calendar day)
      setIsGameToday(isTodayFn(eventDate));

      if (!isFuture(eventDate)) return;

      const days = differenceInDays(eventDate, now);
      const hours = differenceInHours(eventDate, now) % 24;
      const minutes = differenceInMinutes(eventDate, now) % 60;

      setTimeLeft({ days, hours, minutes });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [nextEvent]);

  if (!nextEvent) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-accent-primary via-accent-lightred to-accent-secondary rounded-3xl p-8 shadow-2xl shadow-accent-primary/30 border border-accent-coral/50">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          {isGameToday ? (
            <Zap className="w-8 h-8 text-white animate-pulse" />
          ) : (
            <Clock className="w-8 h-8 text-white" />
          )}
          <div>
            <h3 className="text-sm font-black text-white/90 uppercase tracking-widest">
              {isGameToday ? '🔥 Game Day!' : 'Next Game In'}
            </h3>
          </div>
        </div>

        {!isGameToday && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Days */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
              <div className="text-5xl font-black text-white mb-1">{timeLeft.days}</div>
              <div className="text-xs font-bold text-white/80 uppercase tracking-wider">Days</div>
            </div>

            {/* Hours */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
              <div className="text-5xl font-black text-white mb-1">{timeLeft.hours}</div>
              <div className="text-xs font-bold text-white/80 uppercase tracking-wider">Hours</div>
            </div>

            {/* Minutes */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
              <div className="text-5xl font-black text-white mb-1">{timeLeft.minutes}</div>
              <div className="text-xs font-bold text-white/80 uppercase tracking-wider">Mins</div>
            </div>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white/80 mb-2 uppercase tracking-wider">
                {nextEvent.isHome ? '🏠 Home vs' : '✈️ Away at'}
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {nextEvent.opponentName}
              </div>
            </div>
            {nextEvent.opponentLogo && (
              <div className="w-16 h-16 rounded-xl bg-white/20 p-2">
                <img
                  src={nextEvent.opponentLogo}
                  alt={nextEvent.opponentName}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameCountdown;
