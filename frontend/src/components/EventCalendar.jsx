import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function EventCalendar({ events, selectedEvent, onSelectEvent }) {
  const scrollRef = useRef(null);
  const selectedRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    checkScroll();
  }, [events]);

  // Auto-scroll to center the selected event
  useEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const selected = selectedRef.current;
      
      // Calculate position to center the selected item
      const containerWidth = container.clientWidth;
      const selectedWidth = selected.clientWidth;
      const selectedLeft = selected.offsetLeft;
      
      const scrollTo = selectedLeft - (containerWidth / 2) + (selectedWidth / 2);
      
      container.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
      
      setTimeout(checkScroll, 300);
    }
  }, [selectedEvent]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="relative">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Upcoming Games</h2>
        <div className="h-1 w-20 bg-gradient-to-r from-accent-primary to-accent-lightred rounded-full"></div>
      </div>
      
      <div className="relative">
        {/* Scroll buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-accent-primary to-accent-lightred p-3 rounded-xl text-white hover:scale-110 transition-all shadow-2xl shadow-accent-primary/30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-accent-primary to-accent-lightred p-3 rounded-xl text-white hover:scale-110 transition-all shadow-2xl shadow-accent-primary/30"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Scrollable calendar */}
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide py-6 px-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {events.map((event) => {
            const eventDate = parseISO(event.date);
            const isSelected = selectedEvent?.id === event.id;
            
            return (
              <button
                key={event.id}
                ref={isSelected ? selectedRef : null}
                onClick={() => onSelectEvent(event)}
                className={`
                  flex-shrink-0 w-40 p-5 rounded-2xl transition-all cursor-pointer
                  ${isSelected 
                    ? 'bg-dark-card shadow-2xl scale-105 border-2 border-accent-primary ring-2 ring-accent-primary/50' 
                    : 'bg-gradient-to-br from-dark-card to-dark-surface border border-dark-border hover:border-accent-primary/50 hover:scale-105 hover:shadow-xl'
                  }
                `}
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="text-center">
                  <div className={`text-xs font-bold mb-2 uppercase tracking-widest ${isSelected ? 'text-accent-coral' : 'text-gray-500'}`}>
                    {format(eventDate, 'EEE')}
                  </div>
                  <div className={`text-4xl font-black mb-2 text-white`}>
                    {format(eventDate, 'd')}
                  </div>
                  <div className={`text-xs font-semibold mb-3 uppercase tracking-wide ${isSelected ? 'text-accent-coral' : 'text-gray-500'}`}>
                    {format(eventDate, 'MMM')}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {event.opponentLogo && (
                      <div className={`w-10 h-10 rounded-lg p-1.5 ${isSelected ? 'bg-white/10' : 'bg-dark-surface'}`}>
                        <img 
                          src={event.opponentLogo} 
                          alt={event.opponentName}
                          className="w-full h-full object-contain drop-shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                  <div className={`text-xs font-bold truncate mb-3 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                    {event.opponentName}
                  </div>
                  <div className={`
                    text-[10px] px-3 py-1.5 rounded-lg font-black uppercase tracking-wider
                    ${event.isHome 
                      ? isSelected ? 'bg-green-500/90 text-white shadow-lg' : 'bg-green-500/20 text-green-400'
                      : isSelected ? 'bg-accent-secondary/90 text-white shadow-lg' : 'bg-accent-secondary/20 text-accent-secondary'
                    }
                  `}>
                    {event.isHome ? 'HOME' : 'AWAY'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EventCalendar;
