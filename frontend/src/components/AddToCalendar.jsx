import React, { useState } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { format, parseISO, isFuture, startOfDay, setHours, setMinutes } from 'date-fns';

function AddToCalendar({ events, settings }) {
  const [showOptions, setShowOptions] = useState(false);

  // Parse time string
  const parseTime = (timeString) => {
    if (!timeString || timeString === 'N/A') return null;
    const ampmMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1]);
      const minutes = parseInt(ampmMatch[2]);
      const period = ampmMatch[3].toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return { hours, minutes };
    }
    return null;
  };

  // Get actual game datetime
  const getGameDateTime = (event) => {
    let gameDate = parseISO(event.date);
    const time7th = parseTime(event.time7th);
    const time8th = parseTime(event.time8th);
    
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

  // Filter to only include future games (or today if not yet passed)
  const futureEvents = events.filter(event => {
    const gameDateTime = getGameDateTime(event);
    return isFuture(gameDateTime);
  });

  // Generate .ics file content
  const generateICS = () => {
    const now = new Date();
    const timestamp = format(now, "yyyyMMdd'T'HHmmss'Z'");
    
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Basketball Tracker//Season Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${settings?.homeTeamName || 'Basketball'} Season Schedule`,
      'X-WR-TIMEZONE:America/Chicago',
      // Add timezone definition for better compatibility
      'BEGIN:VTIMEZONE',
      'TZID:America/Chicago',
      'BEGIN:STANDARD',
      'DTSTART:19701101T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
      'TZOFFSETFROM:-0500',
      'TZOFFSETTO:-0600',
      'END:STANDARD',
      'BEGIN:DAYLIGHT',
      'DTSTART:19700308T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
      'TZOFFSETFROM:-0600',
      'TZOFFSETTO:-0500',
      'END:DAYLIGHT',
      'END:VTIMEZONE',
    ];

    futureEvents.forEach((event, index) => {
      const eventDate = parseISO(event.date);
      
      const time7th = parseTime(event.time7th);
      const time8th = parseTime(event.time8th);
      
      // Use earliest time or default to 7:00 PM
      let startTime = { hours: 19, minutes: 0 };
      if (time7th || time8th) {
        if (time7th && time8th) {
          const time7thMinutes = time7th.hours * 60 + time7th.minutes;
          const time8thMinutes = time8th.hours * 60 + time8th.minutes;
          startTime = time7thMinutes <= time8thMinutes ? time7th : time8th;
        } else {
          startTime = time7th || time8th;
        }
      }

      // Create start datetime
      let startDateTime = new Date(eventDate);
      startDateTime.setHours(startTime.hours, startTime.minutes, 0, 0);
      
      // Create end datetime (1 hour later)
      let endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + 1);
      
      // Format dates for iCalendar (YYYYMMDDTHHMMSS)
      const formatICSDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = '00';
        return `${year}${month}${day}T${hours}${minutes}${seconds}`;
      };

      const startDateTimeStr = formatICSDateTime(startDateTime);
      const endDateTimeStr = formatICSDateTime(endDateTime);

      const description = [
        event.time7th && event.time7th !== 'N/A' ? `7th Grade: ${event.time7th}` : null,
        event.time8th && event.time8th !== 'N/A' ? `8th Grade: ${event.time8th}` : null,
        event.notes ? `Notes: ${event.notes}` : null
      ].filter(Boolean).join('\\n');

      // Build summary with team name
      const teamName = settings?.homeTeamName || 'Team';
      const summary = event.isHome 
        ? `${teamName} vs ${event.opponentName}`
        : `${teamName} @ ${event.opponentName}`;

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:basketball-${event.id}-${timestamp}@tracker`,
        `DTSTAMP:${timestamp}`,
        `DTSTART;TZID=America/Chicago:${startDateTimeStr}`,
        `DTEND;TZID=America/Chicago:${endDateTimeStr}`,
        `SUMMARY:${summary}`,
        event.location ? `LOCATION:${event.location}` : '',
        description ? `DESCRIPTION:${description}` : '',
        `STATUS:CONFIRMED`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');
    
    return icsContent.filter(line => line).join('\r\n');
  };

  // Download .ics file
  const downloadICS = () => {
    const icsContent = generateICS();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${settings?.homeTeamName || 'Basketball'}-Schedule.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowOptions(false);
  };

  // Generate Google Calendar URL
  const addToGoogleCalendar = () => {
    // For Google Calendar, we'll add the first future event
    // Create a URL that opens Google Calendar with pre-filled event
    const firstEvent = futureEvents[0];
    if (!firstEvent) return;

    const eventDate = parseISO(firstEvent.date);
    const dateStr = format(eventDate, 'yyyyMMdd');
    
    const title = `${firstEvent.isHome ? 'vs' : '@'} ${firstEvent.opponentName}`;
    const details = [
      firstEvent.time7th && firstEvent.time7th !== 'N/A' ? `7th Grade: ${firstEvent.time7th}` : null,
      firstEvent.time8th && firstEvent.time8th !== 'N/A' ? `8th Grade: ${firstEvent.time8th}` : null,
    ].filter(Boolean).join('\n');

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(firstEvent.location || '')}&dates=${dateStr}/${dateStr}`;
    
    window.open(url, '_blank');
    setShowOptions(false);
  };

  if (futureEvents.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all font-black uppercase text-sm tracking-wider shadow-xl shadow-blue-600/30"
      >
        <Calendar className="w-5 h-5" />
        Add to Calendar
        <ChevronDown className={`w-4 h-4 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
      </button>

      {showOptions && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowOptions(false)}
          />
          
          {/* Options Menu */}
          <div className="absolute top-full mt-2 right-0 z-50 bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden min-w-[280px]">
            <div className="p-4 border-b border-dark-border">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-white text-sm">Add to Calendar</h3>
                <button
                  onClick={() => setShowOptions(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500">Export {futureEvents.length} upcoming game{futureEvents.length !== 1 ? 's' : ''} to your calendar</p>
            </div>

            <div className="p-2">
              {/* Apple Calendar / Outlook */}
              <button
                onClick={downloadICS}
                className="w-full flex items-start gap-3 p-3 hover:bg-dark-surface rounded-lg transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm mb-0.5">Apple / Outlook</div>
                  <div className="text-xs text-gray-500">Download .ics file</div>
                </div>
              </button>

              {/* Google Calendar */}
              <button
                onClick={addToGoogleCalendar}
                className="w-full flex items-start gap-3 p-3 hover:bg-dark-surface rounded-lg transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm mb-0.5">Google Calendar</div>
                  <div className="text-xs text-gray-500">Add events online</div>
                </div>
              </button>

              {/* Android (uses .ics) */}
              <button
                onClick={downloadICS}
                className="w-full flex items-start gap-3 p-3 hover:bg-dark-surface rounded-lg transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm mb-0.5">Android</div>
                  <div className="text-xs text-gray-500">Download .ics file</div>
                </div>
              </button>
            </div>

            <div className="p-3 bg-dark-surface/50 border-t border-dark-border">
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-400">Note:</strong> The .ics file works with Apple Calendar, Outlook, Android, and most calendar apps. Google Calendar opens events individually.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AddToCalendar;
