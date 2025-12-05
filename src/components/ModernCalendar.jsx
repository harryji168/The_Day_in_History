import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, Settings, Calendar, Link as LinkIcon } from 'lucide-react';

export default function ModernCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loadedDays, setLoadedDays] = useState(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState({
    urlPattern: './days/day-{n}/index.html',
    startDate: new Date(new Date().getFullYear(), 0, 1),
    isDemo: true
  });
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };
  
  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setLoadedDays(new Set());
  };
  
  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };
  
  const getDayNumber = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const start = new Date(config.startDate);
    start.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const diffTime = date - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };
  
  const getDayUrl = (day) => {
    const dayNum = getDayNumber(day);
    return config.urlPattern.replace('{n}', dayNum);
  };
  
  const days = getDaysInMonth(currentDate);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Project Calendar</h1>
                <p className="text-sm text-gray-600">Track your daily progress</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all shadow-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 mb-6 animate-fadeIn">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Configuration
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <LinkIcon className="w-4 h-4 inline mr-1" />
                    URL Pattern
                  </label>
                  <input
                    type="text"
                    value={config.urlPattern}
                    onChange={(e) => setConfig({...config, urlPattern: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="./days/day-{n}/index.html"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use {'{n}'} for day number</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={config.startDate.toISOString().split('T')[0]}
                    onChange={(e) => setConfig({...config, startDate: new Date(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">First day of challenge</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode
                  </label>
                  <select
                    value={config.isDemo ? 'demo' : 'live'}
                    onChange={(e) => setConfig({...config, isDemo: e.target.value === 'demo'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  >
                    <option value="demo">Demo Mode</option>
                    <option value="live">Live Mode</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Demo simulates content</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowSettings(false);
                  setLoadedDays(new Set());
                }}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md"
              >
                Apply Changes
              </button>
            </div>
          )}
          
          {/* Month Navigation */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <h2 className="text-xl font-bold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <button
                onClick={() => changeMonth(1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 md:p-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
            {daysOfWeek.map(day => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {days.map((day, index) => (
              <DayCell
                key={index}
                day={day}
                dayNumber={day ? getDayNumber(day) : null}
                dayUrl={day ? getDayUrl(day) : null}
                isToday={day ? isToday(day) : false}
                loadedDays={loadedDays}
                setLoadedDays={setLoadedDays}
                config={config}
              />
            ))}
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>✨ Thumbnails load as you scroll • Click any day to view full page</p>
        </div>
      </div>
    </div>
  );
}

function DayCell({ day, dayNumber, dayUrl, isToday, loadedDays, setLoadedDays, config }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const cellRef = useRef(null);
  
  useEffect(() => {
    if (!day || !cellRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loadedDays.has(day)) {
            setIsVisible(true);
            setLoadedDays(prev => new Set([...prev, day]));
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );
    
    observer.observe(cellRef.current);
    
    return () => observer.disconnect();
  }, [day, loadedDays, setLoadedDays]);
  
  if (!day) {
    return <div className="aspect-[4/3]"></div>;
  }
  
  const handleClick = () => {
    if (config.isDemo) {
      alert(`Demo mode: Would open ${dayUrl}`);
    } else {
      window.open(dayUrl, '_blank');
    }
  };
  
  const isFuture = dayNumber < 1;
  
  return (
    <div ref={cellRef} className="aspect-[4/3]">
      <div
        onClick={!isFuture ? handleClick : undefined}
        className={`
          group relative w-full h-full flex flex-col rounded-xl
          overflow-hidden transition-all duration-300
          ${isFuture 
            ? 'bg-gray-50 border-2 border-gray-200 cursor-default opacity-60' 
            : 'bg-white border-2 border-gray-200 cursor-pointer hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1'
          }
          ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
        `}
      >
        {/* Header */}
        <div className="p-2 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 z-10">
          <span className={`text-lg font-bold ${isToday ? 'text-indigo-600' : 'text-gray-900'}`}>
            {day}
          </span>
          {dayNumber > 0 && (
            <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
              Day {dayNumber}
            </span>
          )}
        </div>
        
        {/* Preview Area */}
        <div className="flex-1 relative bg-gradient-to-br from-indigo-50 to-purple-50">
          {!isFuture && (
            <>
              {!isVisible && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                </div>
              )}
              
              {isVisible && config.isDemo && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">{dayNumber}</div>
                  <div className="text-sm text-gray-600">Demo Content</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mt-3"></div>
                </div>
              )}
              
              {isVisible && !config.isDemo && (
                <>
                  <iframe 
                    src={dayUrl}
                    title={`Day ${day} preview`}
                    className="absolute inset-0 w-full h-full pointer-events-none scale-[0.25] origin-top-left"
                    style={{ 
                      width: '400%', 
                      height: '400%',
                      opacity: isLoading ? 0 : 1
                    }}
                    scrolling="no"
                    onLoad={() => setIsLoading(false)}
                  />
                  
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                    </div>
                  )}
                </>
              )}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                <div className="flex items-center gap-1 text-white text-xs font-medium bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <ExternalLink className="w-3 h-3" />
                  View Full Page
                </div>
              </div>
            </>
          )}
          
          {isFuture && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 text-xs">
              <span>Not Yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}