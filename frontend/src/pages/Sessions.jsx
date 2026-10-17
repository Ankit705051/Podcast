import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionAPI } from '../services/api';
import SessionCard from './SessionCard';
import { Button } from '../components/Layout/Button';
import { Plus, Search, ChevronDown, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Sessions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch sessions from backend
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await sessionAPI.getAllSessions();
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast.error('Failed to load sessions');
      // Fallback to empty array
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if(user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  // Handle join session
  const handleJoin = async (id) => {
    try {
      if (!user?._id) {
        toast.error('Please login to join sessions');
        return;
      }
      
      await sessionAPI.joinSession(id);
      toast.success('Joined! Taking you to session...');
      await fetchSessions();
      navigate(`/session/${id}`);
    } catch (error) {
      console.error('Join error:', error);
      if (error.response?.status === 500) {
        toast.error('You may already be in this session');
      } else {
        toast.error(error.response?.data?.message || 'Failed to join session');
      }
    }
  };

  // Handle leave session
  const handleLeave = async (id) => {
    try {
      if (!user?._id) {
        toast.error('Please login to leave sessions');
        return;
      }
      
      await sessionAPI.leaveSession(id);
      toast.success('Left session successfully');
      await fetchSessions();
    } catch (error) {
      console.error('Leave error:', error);
      toast.error(error.response?.data?.message || 'Failed to leave session');
    }
  };

  // Handle start session (host only)
  const handleStart = async (id) => {
    try {
      if (!user?._id) {
        toast.error('Please login to start sessions');
        return;
      }
      
      console.log('Starting session with ID:', id);
      const response = await sessionAPI.startSession(id);
      console.log('Start session API response:', response);
      
      toast.success('Session started! Going live...');
      await fetchSessions(); // Refresh sessions list
      console.log('Sessions refreshed, navigating to live session...');
      navigate(`/session/${id}`);
    } catch (error) {
      console.error('Start error:', error);
      console.error('Start error response:', error.response);
      console.error('Start error data:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to start session');
    }
  };

  // Handle end session (host only)
  const handleEnd = async (id) => {
    try {
      if (!user?._id) {
        toast.error('Please login to end sessions');
        return;
      }
      
      await sessionAPI.endSession(id);
      toast.success('Session ended and saved!');
      fetchSessions();
    } catch (error) {
      console.error('End error:', error);
      toast.error(error.response?.data?.message || 'Failed to end session');
    }
  };

  // Filter sessions - Single efficient filter
  const filtered = sessions.filter(s => {
    const q = searchTerm.toLowerCase();
    const matchSearch = (s.title || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
    const matchCat = filterCategory === 'all' || s.category === filterCategory;
    const now = new Date();
    const start = new Date(s.scheduled_start);
    const end = new Date(s.scheduled_end);
    
    // Consistent time logic with SessionCard
    const isScheduled = !s.is_live && !s.is_cancelled && !s.actual_end_time && now < start;
    const isLive = s.is_live;
    const isEnded = !!s.actual_end_time;
    const isOverdue = !s.is_live && !s.is_cancelled && !s.actual_end_time && now > end;
    
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'live' && isLive) ||
      (filterStatus === 'scheduled' && isScheduled) ||
      (filterStatus === 'ended' && isEnded) ||
      (filterStatus === 'cancelled' && s.is_cancelled) ||
      (filterStatus === 'overdue' && isOverdue);
    
    return matchSearch && matchCat && matchStatus;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground">Join live streams or host your own</p>
        </div>
        
        {user?.role === 'host' && (
          <Button onClick={() => navigate('/create-session')} className="flex items-center gap-2">
            <Plus size={16} /> New Session
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sessions..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Categories</option>
          <option value="podcast">Podcast</option>
          <option value="interview">Interview</option>
          <option value="panel">Panel</option>
          <option value="workshop">Workshop</option>
          <option value="qna">Q&A</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Status</option>
          <option value="live">Live</option>
          <option value="scheduled">Scheduled</option>
          <option value="ended">Ended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
        <span>{filtered.length} session{filtered.length !== 1 ? 's' : ''}</span>
        {sessions.filter(s => s.is_live).length > 0 && (
          <span className="flex items-center gap-1 text-red-500">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {sessions.filter(s => s.is_live).length} live now
          </span>
        )}
      </div>

      {/* Sessions Grid */}
      {filtered.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map(s => (
            <SessionCard
              key={s._id}
              session={s}
              user={user}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onStart={handleStart}
              onEnd={handleEnd}
            />
          ))}
        </div>
      ) : (
        <div className="text-center mt-20 py-20">
          <Calendar size={40} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
          <p className="text-muted-foreground">
            {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Create the first session to get started'}
          </p>
        </div>
      )}
    </div>
  );
}
