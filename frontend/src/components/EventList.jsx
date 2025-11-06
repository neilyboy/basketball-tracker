import React from 'react';
import { format, parseISO } from 'date-fns';
import { Edit, Trash2, Calendar, MapPin } from 'lucide-react';

function EventList({ events, onEdit, onDelete }) {
  if (events.length === 0) {
    return (
      <div className="bg-dark-surface rounded-xl p-12 text-center border border-dark-border">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-card flex items-center justify-center">
          <Calendar className="w-10 h-10 text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No events yet</h3>
        <p className="text-gray-500 mb-4">
          Get started by adding your first game event
        </p>
        <p className="text-sm text-gray-600">
          Click the "Add Event" button above to create an event
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const eventDate = parseISO(event.date);
        const hasScores = event.score7thHome !== null || event.score8thHome !== null;

        return (
          <div
            key={event.id}
            className="bg-dark-surface rounded-xl p-6 border border-dark-border hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {event.opponentLogo && (
                    <img
                      src={event.opponentLogo}
                      alt={event.opponentName}
                      className="w-12 h-12 object-contain"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      vs {event.opponentName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          event.isHome
                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                            : 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/30'
                        }`}
                      >
                        {event.isHome ? 'HOME' : 'AWAY'}
                      </span>
                      {hasScores && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-accent-primary/10 text-accent-primary border border-accent-primary/30">
                          FINAL
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
                  </div>

                  {(event.location || event.isHome) && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">
                        {event.isHome ? 'Home Location' : event.location}
                      </span>
                    </div>
                  )}

                  <div className="text-gray-400">
                    <span className="font-medium">7th:</span>{' '}
                    {event.time7th || 'N/A'}
                    {event.score7thHome !== null && (
                      <span className="ml-2 text-white font-semibold">
                        ({event.score7thHome}-{event.score7thAway})
                      </span>
                    )}
                  </div>

                  <div className="text-gray-400">
                    <span className="font-medium">8th:</span>{' '}
                    {event.time8th || 'N/A'}
                    {event.score8thHome !== null && (
                      <span className="ml-2 text-white font-semibold">
                        ({event.score8thHome}-{event.score8thAway})
                      </span>
                    )}
                  </div>
                </div>

                {event.notes && (
                  <div className="mt-3 text-sm text-gray-400 border-t border-dark-border pt-3">
                    <span className="font-medium">Notes:</span> {event.notes}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(event)}
                  className="p-2.5 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border border-accent-primary/30 rounded-lg transition-all"
                  title="Edit event"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(event.id)}
                  className="p-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg transition-all"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default EventList;
