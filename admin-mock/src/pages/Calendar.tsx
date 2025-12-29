import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from 'primereact/tooltip';
import HelpIcon from '../components/HelpIcon';

interface Deadline {
  id: string;
  entityId: string;
  entityName: string;
  type: 'filing' | 'extension' | 'reminder';
  dueDate: string;
  status: 'upcoming' | 'due_soon' | 'overdue' | 'filed';
  description: string;
}

const mockDeadlines: Deadline[] = [
  {
    id: '1',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    type: 'filing',
    dueDate: '2024-04-15',
    status: 'upcoming',
    description: '2023 Tax Return Filing Deadline',
  },
  {
    id: '2',
    entityId: '2',
    entityName: 'Smith Business LLC',
    type: 'extension',
    dueDate: '2024-03-15',
    status: 'due_soon',
    description: 'Extension Filing Deadline',
  },
  {
    id: '3',
    entityId: '3',
    entityName: 'Johnson Corp',
    type: 'filing',
    dueDate: '2024-03-15',
    status: 'due_soon',
    description: '2023 Corporate Tax Return',
  },
  {
    id: '4',
    entityId: '4',
    entityName: 'Williams Partnership',
    type: 'filing',
    dueDate: '2024-03-15',
    status: 'filed',
    description: '2023 Partnership Return',
  },
  {
    id: '5',
    entityId: '1',
    entityName: 'John & Jane Smith - 1040',
    type: 'reminder',
    dueDate: '2024-02-01',
    status: 'overdue',
    description: 'Document Upload Reminder',
  },
];

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'list'>('month');
  const [filter, setFilter] = useState<'all' | 'filing' | 'extension' | 'reminder'>('all');

  const filteredDeadlines = mockDeadlines.filter(d => {
    if (filter === 'all') return true;
    return d.type === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'due_soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'filed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'filing':
        return '📄';
      case 'extension':
        return '📅';
      case 'reminder':
        return '⏰';
      default:
        return '📋';
    }
  };

  // Simple calendar month view
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const getDeadlinesForDate = (date: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return filteredDeadlines.filter(d => d.dueDate === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar & Deadlines</h1>
          <p className="mt-2 text-sm text-gray-600">
            View tax deadlines, extensions, and reminders
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('filing')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'filing' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Filing Deadlines
          </button>
          <button
            onClick={() => setFilter('extension')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'extension' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Extensions
          </button>
          <button
            onClick={() => setFilter('reminder')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'reminder' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Reminders
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'month' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = i + 1;
              const dayDeadlines = getDeadlinesForDate(date);
              const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, date).toDateString();

              return (
                <div
                  key={date}
                  className={`h-24 border border-gray-200 p-1 ${
                    isToday ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                    {date}
                  </div>
                  <div className="space-y-1">
                    {dayDeadlines.slice(0, 2).map(deadline => (
                      <div
                        key={deadline.id}
                        className={`text-xs p-1 rounded truncate ${getStatusColor(deadline.status)}`}
                        title={deadline.description}
                      >
                        {getTypeIcon(deadline.type)} {deadline.entityName}
                      </div>
                    ))}
                    {dayDeadlines.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayDeadlines.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-4">
          {filteredDeadlines.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500">No deadlines found</p>
            </div>
          ) : (
            filteredDeadlines
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map((deadline) => (
                <div key={deadline.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">{getTypeIcon(deadline.type)}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {deadline.description}
                          </h3>
                          <span className={`badge ${getStatusColor(deadline.status)}`}>
                            {deadline.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {deadline.entityName}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          Due: {new Date(deadline.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Tooltip target=".calendar-view-client-link" />
                    <Link
                      to={`/clients/${deadline.entityId}`}
                      className="calendar-view-client-link btn-secondary text-sm"
                      data-pr-tooltip="View the client detail page for this entity"
                      data-pr-position="top"
                    >
                      View Client
                    </Link>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* Week View (simplified) */}
      {view === 'week' && (
        <div className="card">
          <p className="text-center text-gray-500 py-12">
            Week view coming soon
          </p>
        </div>
      )}
    </div>
  );
}

