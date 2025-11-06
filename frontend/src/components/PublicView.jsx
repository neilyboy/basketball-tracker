import React, { useState, useEffect } from 'react';
import { format, parseISO, isFuture, setHours, setMinutes } from 'date-fns';
import { Home as HomeIcon, MapPin, Calendar, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import EventCalendar from './EventCalendar';
import EventDetails from './EventDetails';
import SeasonStats from './SeasonStats';
import GameCountdown from './GameCountdown';
import QuickStats from './QuickStats';
import SeasonProgress from './SeasonProgress';
import ShareButton from './ShareButton';
import GameResults from './GameResults';
import AddToCalendar from './AddToCalendar';

function PublicView() {
  const [events, setEvents] = useState([]);
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Parse time string and return hours/minutes
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

  // Get the actual datetime of when a game starts (earliest of 7th/8th grade)
  const getGameDateTime = (event) => {
    let gameDate = parseISO(event.date);
    
    const time7th = parseGameTime(event.time7th);
    const time8th = parseGameTime(event.time8th);
    
    if (time7th || time8th) {
      let earliestTime = time7th;
      
      if (time7th && time8th) {
        const time7thMinutes = time7th.hours * 60 + time7th.minutes;
        const time8thMinutes = time8th.hours * 60 + time8th.minutes;
        earliestTime = time7thMinutes <= time8thMinutes ? time7th : time8th;
      } else if (time8th) {
        earliestTime = time8th;
      }
      
      if (earliestTime) {
        gameDate = setHours(gameDate, earliestTime.hours);
        gameDate = setMinutes(gameDate, earliestTime.minutes);
      }
    }
    
    return gameDate;
  };

  useEffect(() => {
    loadData();
    // Refresh data every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [eventsRes, settingsRes, statsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/settings'),
        fetch('/api/stats')
      ]);

      const eventsData = await eventsRes.json();
      const settingsData = await settingsRes.json();
      const statsData = await statsRes.json();

      setEvents(eventsData);
      setSettings(settingsData);
      setStats(statsData);

      // Auto-select next or current event (considering actual game time)
      const now = new Date();
      const upcomingEvent = eventsData.find(e => {
        const gameDateTime = getGameDateTime(e);
        return gameDateTime >= now;
      }) || eventsData[eventsData.length - 1];
      
      if (upcomingEvent && !selectedEvent) {
        setSelectedEvent(upcomingEvent);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-white text-xl">Loading schedule...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      {/* Header */}
      <header className="bg-gradient-to-b from-dark-surface to-dark-bg border-b border-dark-border/50 sticky top-0 z-10 backdrop-blur-xl bg-opacity-80">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {settings?.homeLogo && (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dark-card to-dark-surface p-2 shadow-2xl border border-dark-border/50">
                  <img 
                    src={settings.homeLogo} 
                    alt={settings.homeTeamName}
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {settings?.homeTeamName || 'Basketball Team'}
                </h1>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Season Schedule</p>
              </div>
            </div>
            <a 
              href="/admin/login"
              className="text-xs font-semibold text-gray-600 hover:text-accent-primary transition-all"
            >
              Admin
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Calendar */}
        {events.length > 0 ? (
          <>
            {/* Countdown and Action Buttons */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2">
                <GameCountdown nextEvent={events.find(e => {
                  const gameDateTime = getGameDateTime(e);
                  return isFuture(gameDateTime);
                })} />
              </div>
              <div className="flex flex-col items-stretch justify-center gap-3">
                <AddToCalendar events={events} settings={settings} />
                <ShareButton />
              </div>
            </div>

            {/* Season Progress */}
            <div className="animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <SeasonProgress events={events} />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <EventCalendar 
                events={events}
                selectedEvent={selectedEvent}
                onSelectEvent={setSelectedEvent}
              />
            </div>

            {/* Event Details */}
            {selectedEvent && (
              <div className="animate-fade-in">
                <EventDetails event={selectedEvent} settings={settings} />
              </div>
            )}

            {/* Quick Stats / Team Insights */}
            {stats && (
              <div className="animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <QuickStats events={events} stats={stats} />
              </div>
            )}

            {/* Game Results */}
            <div className="animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              <GameResults events={events} settings={settings} />
            </div>

            {/* Season Stats */}
            {stats && (
              <div className="animate-slide-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                <SeasonStats stats={stats} settings={settings} />
              </div>
            )}
          </>
        ) : (
          <div className="bg-gradient-to-br from-dark-surface to-dark-card rounded-3xl p-16 text-center border border-dark-border/50 shadow-2xl">
            <Calendar className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">No Games Scheduled</h2>
            <p className="text-gray-500 font-medium">Check back soon for upcoming games!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicView;
