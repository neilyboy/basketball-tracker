import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { MapPin, Clock, Home as HomeIcon, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function EventDetails({ event, settings }) {
  const [mapError, setMapError] = useState(false);
  
  const location = event.isHome ? settings?.homeLocation : event.location;
  const eventDate = parseISO(event.date);

  // Helper function to format time with AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    // If already has AM/PM, return as is
    if (/AM|PM/i.test(timeString)) return timeString;
    
    // Parse time (handles formats like "10:00" or "14:30")
    const match = timeString.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return timeString;
    
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12 || 12;
    
    return `${hours}:${minutes} ${ampm}`;
  };

  const openInMaps = () => {
    if (!location) return;
    
    const encodedAddress = encodeURIComponent(location);
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Detect iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      window.open(`maps://maps.apple.com/?q=${encodedAddress}`, '_blank');
    } else {
      // Android and others - use Google Maps
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  const hasScores = event.score7thHome !== null || event.score8thHome !== null;

  return (
    <div className="bg-gradient-to-br from-dark-surface to-dark-card rounded-3xl overflow-hidden border border-dark-border/50 shadow-2xl">
      {/* Header */}
      <div className="p-8 border-b border-dark-border/30">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`
              px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg
              ${event.isHome ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-accent-primary to-accent-lightred text-white'}
            `}>
              {event.isHome ? '🏠 Home Game' : '✈️ Away Game'}
            </span>
            {event.isNonConference && (
              <span className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                🤝 Friendly Game
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 font-bold uppercase tracking-wide">
            {format(eventDate, 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-start justify-center gap-4 md:gap-8">
          {/* Home Team */}
          <div className="flex flex-col items-center" style={{ width: '140px' }}>
            {settings?.homeLogo && (
              <div className="w-24 h-24 md:w-28 md:h-28 mb-3 md:mb-4 bg-gradient-to-br from-dark-bg to-dark-surface rounded-2xl p-3 md:p-4 border-2 border-dark-border shadow-xl">
                <img 
                  src={settings.homeLogo} 
                  alt={settings.homeTeamName}
                  className="w-full h-full object-contain"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' }}
                />
              </div>
            )}
            <h3 className="text-base md:text-xl font-black text-white tracking-tight text-center leading-tight min-h-[2.5rem] flex items-center justify-center">{settings?.homeTeamName || 'Home'}</h3>
          </div>

          <div className="text-2xl md:text-3xl font-black text-gradient flex-shrink-0 pt-10 md:pt-12">VS</div>

          {/* Away Team */}
          <div className="flex flex-col items-center" style={{ width: '140px' }}>
            {event.opponentLogo && (
              <div className="w-24 h-24 md:w-28 md:h-28 mb-3 md:mb-4 bg-gradient-to-br from-dark-bg to-dark-surface rounded-2xl p-3 md:p-4 border-2 border-dark-border shadow-xl">
                <img 
                  src={event.opponentLogo} 
                  alt={event.opponentName}
                  className="w-full h-full object-contain"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' }}
                />
              </div>
            )}
            <h3 className="text-base md:text-xl font-black text-white tracking-tight text-center leading-tight min-h-[2.5rem] flex items-center justify-center">{event.opponentName}</h3>
          </div>
        </div>
      </div>

      {/* Game Times */}
      <div className="p-8 border-b border-dark-border/30 space-y-4">
        <div className="flex items-center gap-2 text-gray-400 mb-6">
          <Clock className="w-5 h-5" />
          <span className="font-black text-white uppercase tracking-wider">Game Times</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-dark-bg to-dark-surface rounded-2xl p-6 border border-dark-border/50 hover:border-accent-primary/50 transition-all">
            <div className="text-xs text-gray-500 mb-3 font-bold uppercase tracking-wider">7th Grade</div>
            <div className="text-3xl font-black text-white">
              {formatTime(event.time7th)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-dark-bg to-dark-surface rounded-2xl p-6 border border-dark-border/50 hover:border-accent-primary/50 transition-all">
            <div className="text-xs text-gray-500 mb-3 font-bold uppercase tracking-wider">8th Grade</div>
            <div className="text-3xl font-black text-white">
              {formatTime(event.time8th)}
            </div>
          </div>
        </div>
      </div>

      {/* Scores (if available) */}
      {hasScores && (
        <div className="p-8 border-b border-dark-border/30">
          <div className="flex items-center gap-2 text-gray-400 mb-6">
            <span className="font-black text-white uppercase tracking-wider">Final Scores</span>
          </div>
          
          <div className="space-y-4">
            {(event.score7thHome !== null && event.score7thAway !== null) && (
              <div className="bg-gradient-to-br from-dark-bg to-dark-surface rounded-2xl p-6 border border-dark-border/50">
                <div className="text-xs text-gray-500 mb-4 font-bold uppercase tracking-wider">7th Grade</div>
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-sm flex-1">{settings?.homeTeamName || 'Home'}</span>
                  <span className="text-5xl font-black text-white mx-4">{event.score7thHome}</span>
                  <span className="text-gray-600 text-2xl font-black">-</span>
                  <span className="text-5xl font-black text-white mx-4">{event.score7thAway}</span>
                  <span className="text-white font-bold text-sm flex-1 text-right">{event.opponentName}</span>
                </div>
              </div>
            )}
            
            {(event.score8thHome !== null && event.score8thAway !== null) && (
              <div className="bg-gradient-to-br from-dark-bg to-dark-surface rounded-2xl p-6 border border-dark-border/50">
                <div className="text-xs text-gray-500 mb-4 font-bold uppercase tracking-wider">8th Grade</div>
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-sm flex-1">{settings?.homeTeamName || 'Home'}</span>
                  <span className="text-5xl font-black text-white mx-4">{event.score8thHome}</span>
                  <span className="text-gray-600 text-2xl font-black">-</span>
                  <span className="text-5xl font-black text-white mx-4">{event.score8thAway}</span>
                  <span className="text-white font-bold text-sm flex-1 text-right">{event.opponentName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location */}
      {location && (
        <div className="p-6 md:p-8 border-b border-dark-border/30">
          <div className="flex items-center gap-2 text-gray-400 mb-4 md:mb-6">
            <MapPin className="w-5 h-5" />
            <span className="font-black text-white uppercase tracking-wider">Location</span>
          </div>
          
          <div className="bg-gradient-to-br from-dark-bg to-dark-surface rounded-2xl p-5 md:p-6 border border-dark-border/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
              <div className="flex items-start gap-3 md:gap-4 flex-1">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-lightred flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent-primary/30">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1 md:mb-2 font-bold uppercase tracking-wider">Address</p>
                  <p className="text-white font-bold leading-relaxed text-sm md:text-base break-words">{location}</p>
                </div>
              </div>
              <button
                onClick={openInMaps}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-lightred hover:from-accent-lightred hover:to-accent-primary text-white rounded-xl transition-all font-black uppercase text-sm tracking-wider shadow-xl shadow-accent-primary/30 w-full md:w-auto md:whitespace-nowrap"
              >
                <Navigation className="w-5 h-5" />
                Get Directions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {event.notes && (
        <div className="p-8">
          <div className="text-xs font-black text-gray-500 mb-4 uppercase tracking-wider">Notes</div>
          <div className="bg-gradient-to-br from-dark-bg to-dark-surface rounded-2xl p-6 border border-dark-border/50">
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{event.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetails;
