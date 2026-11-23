import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CountdownBadge from './CountdownBadge';
import { Button } from '../components/Layout/Button';

import toast from 'react-hot-toast';
import {
  Calendar, Users, Play, Square, Video, Mic, Eye,
  Globe, Lock, UserCheck, Share2, Download, Trash2
} from 'lucide-react';

export default function SessionCard({ session, user, onJoin, onLeave, onStart, onEnd, onDelete }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second to trigger re-render
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!user) {
    return (
      <div className="glass-card rounded-2xl p-8 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Please login to view sessions
        </p>
      </div>
    );
  }

  const isHost = (session.host_id?._id?.toString() === user._id?.toString()) ||
               (session.host_id?.toString() === user._id?.toString()) ||
               (session.host_id === user._id);

  // Admins can moderate any session, not just their own
  const isAdminUser = user?.role === 'admin';
  const canModerate = isHost || isAdminUser;
  
  // Debug: Check host ID comparison
  console.log('Host ID Debug:', {
    sessionHostId: session.host_id,
    sessionHostIdType: typeof session.host_id,
    sessionHostIdString: session.host_id?.toString(),
    userId: user._id,
    userIdType: typeof user._id,
    userIdString: user._id?.toString(),
    isHost,
    sessionData: session
  });
  
  const isParticipant = session.participants?.some(
    (p) => {
      const participantId = typeof p === 'object' ? p.user_id?.toString() : p?.toString();
      return participantId === user._id?.toString();
    }
  );

  const now = currentTime;
  const start = new Date(session.scheduled_start);
  const end = new Date(session.scheduled_end);

  // Corrected session status logic with time window validation
  const isScheduled = !session.is_live && !session.is_cancelled && !session.actual_end_time && now < start;
  const isEnded = !!session.actual_end_time;
  const isLive = session.is_live;
  const isOverdue = !session.is_live && !session.is_cancelled && !session.actual_end_time && now > end;
  const isInTimeWindow = now >= start && now <= end; // Session is within scheduled time window
  const canStart = canModerate
  && !session.is_live
  && !session.is_cancelled
  && !session.actual_end_time
  && (isAdminUser || now >= start);

  // Debug: Check why start button not showing
  console.log('SessionCard Debug:', {
    sessionId: session._id,
    isHost,
    isLive: session.is_live,
    isCancelled: session.is_cancelled,
    hasEndTime: !!session.actual_end_time,
    now: now.toISOString(),
    start: start.toISOString(),
    nowGreaterEqualStart: now >= start,
    canStart
  });

  const canJoin = !isHost 
    && !isParticipant 
    && isLive;
  const canPreJoin = !isHost 
    && !isParticipant 
    && !session.is_live 
    && !session.is_cancelled
    && !session.actual_end_time
    && now >= start 
    && now <= end;

  const handleShare = () => {
    const url = `${window.location.origin}/session/${session._id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  };

  const statusMeta = (() => {
    if (session.is_cancelled)
      return { label: 'Cancelled', cls: 'bg-muted text-muted-foreground line-through' };

    if (isLive)
      return { label: 'Live', cls: 'bg-red-500/20 text-red-400 border border-red-400/30' };

    if (isEnded)
      return { label: 'Ended', cls: 'bg-muted text-muted-foreground border border-border' };

    if (isOverdue)
      return { label: 'Overdue', cls: 'bg-orange-500/20 text-orange-400 border border-orange-400/30' };

    if (isScheduled)
      return { label: 'Scheduled', cls: 'bg-blue-500/20 text-blue-400 border border-blue-400/30' };

    return { label: 'Ready', cls: 'bg-green-500/20 text-green-400 border border-green-400/30' };
  })();

  const platformEmoji = {
    youtube: '📺',
    twitch: '🎮',
    discord: '💬',
    zoom: '📹',
    teams: '💼',
  };

  const categoryIcons = {
    podcast: <Mic size={12} />,
    interview: <Video size={12} />,
    panel: <Users size={12} />,
    workshop: <Eye size={12} />,
    qna: <Users size={12} />,
  };

  return (
    <div className="group relative">
      {/* Glow effect on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 animate-tilt" />
      
      {/* Main card */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-2xl rounded-3xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(168,85,247,0.25)] hover:-translate-y-3">

        {/* Thumbnail with advanced effects */}
        <div className="relative h-56 overflow-hidden">
          {session.thumbnail_url ? (
            <>
              <img
                src={session.thumbnail_url}
                alt={session.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              {/* Advanced gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black">
              <div className="relative">
                <Video size={64} className="text-gray-600 opacity-50" />
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
              </div>
            </div>
          )}

          {/* Animated live indicator */}
          {session.is_live && (
            <div className="absolute top-4 left-4">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full blur-lg animate-pulse" />
                <div className="relative bg-red-500 text-white text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl border border-red-400/30">
                  <span className="relative">
                    <span className="w-3 h-3 bg-white rounded-full block" />
                    <span className="absolute inset-0 bg-white rounded-full animate-ping" />
                  </span>
                  <span className="font-bold tracking-wide">LIVE NOW</span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced status badge */}
          <span className={`absolute top-4 right-4 text-sm px-4 py-2 rounded-full font-semibold backdrop-blur-md border transition-all duration-300 ${statusMeta.cls}`}>
            {statusMeta.label}
          </span>

          {/* Platform tag with glass effect */}
          <div className="absolute bottom-4 left-4">
            <div className="relative">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-lg rounded-xl border border-white/10" />
              <div className="relative flex items-center gap-2 text-white text-sm px-3 py-2">
                <span className="text-lg">{platformEmoji[session.stream_platform] || '📡'}</span>
                <span className="capitalize font-medium">{session.stream_platform}</span>
              </div>
            </div>
          </div>

          {/* Floating particles effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 right-10 w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500 animate-bounce" />
            <div className="absolute top-20 left-20 w-1 h-1 bg-pink-400 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 animate-bounce delay-100" />
            <div className="absolute bottom-20 right-20 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-600 animate-bounce delay-200" />
          </div>
        </div>

        {/* Enhanced body section */}
        <div className="p-6 flex flex-col gap-5 flex-1 relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl" />

          {/* Meta tags with improved design */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 rounded-lg blur-sm" />
                <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-purple-500/30">
                  {categoryIcons[session.category] || <Video size={12} />}
                  <span className="text-xs font-medium capitalize text-purple-300">{session.category}</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-sm" />
              <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-blue-500/30">
                <Users size={12} className="text-blue-400" />
                <span className="text-xs font-medium text-blue-300">{session.participants?.length || 0}/{session.max_participants}</span>
              </div>
            </div>
          </div>

          {/* Access level badge */}
          <div className="flex items-center">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg blur-sm" />
              <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-green-500/30">
                {session.access_level === 'public' && <><Globe size={10} className="text-green-400" /><span className="text-xs font-medium text-green-300">Public</span></>}
                {session.access_level === 'private' && <><Lock size={10} className="text-yellow-400" /><span className="text-xs font-medium text-yellow-300">Private</span></>}
                {session.access_level === 'invite_only' && <><UserCheck size={10} className="text-purple-400" /><span className="text-xs font-medium text-purple-300">Invite Only</span></>}
              </div>
            </div>
          </div>

          {/* Enhanced title and description */}
          <div className="flex-1 relative z-10">
            <h3 className="font-bold text-xl text-white mb-3 line-clamp-2 leading-tight group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
              {session.title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
              {session.description}
            </p>
          </div>

          {/* Enhanced date/time section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur-md" />
            <div className="relative flex items-center gap-3 text-xs text-gray-300 px-4 py-3 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-indigo-500/20">
              <div className="relative">
                <Calendar size={16} className="text-indigo-400" />
                <div className="absolute inset-0 bg-indigo-400 rounded-full blur-sm animate-pulse opacity-50" />
              </div>
              <span className="font-medium">
                {new Date(session.scheduled_start).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })} at{' '}
                {new Date(session.scheduled_start).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Countdown with enhanced styling */}
          {isScheduled && (
            <div className="flex justify-center">
              <CountdownBadge startDate={session.scheduled_start} />
            </div>
          )}

          {/* Premium action buttons */}
          <div className="flex gap-3 mt-auto relative z-10">

            {/* HOST: Start Session */}
            {canStart && (
              <div className="relative flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <Button 
                  onClick={() => onStart(session._id)} 
                  className="relative w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl border border-purple-500/30 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                  variant="primary"
                >
                  <Play size={18} className="mr-2" /> Start Session
                </Button>
              </div>
            )}

            {/* HOST/ADMIN: End Session */}
            {canModerate && session.is_live && (
              <div className="relative flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <Button 
                  onClick={() => onEnd(session._id)} 
                  className="relative w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-xl border border-red-500/30 shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
                  variant="danger"
                >
                  <Square size={18} className="mr-2" /> End Session
                </Button>
              </div>
            )}

            {/* HOST/ADMIN: Navigate to Live Session */}
            {canModerate && session.is_live && (
              <div className="relative flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <Button 
                  onClick={() => navigate(`/session/${session._id}`)} 
                  className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl border border-blue-500/30 shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                  variant="secondary"
                >
                  <Play size={18} className="mr-2" /> View Session
                </Button>
              </div>
            )}

            {/* USER: Join/Pre-Join Session - Conditional rendering */}
            {canJoin ? (
              <div className="relative flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <Button 
                  onClick={() => onJoin(session._id)} 
                  className="relative w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl border border-green-500/30 shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-105"
                  variant="primary"
                >
                  <Play size={18} className="mr-2" /> Join Session
                </Button>
              </div>
            ) : canPreJoin ? (
              <div className="relative flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <Button 
                  onClick={() => onJoin(session._id)} 
                  className="relative w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-xl border border-yellow-500/30 shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105"
                  variant="primary"
                >
                  <Play size={18} className="mr-2" /> Pre-Join Session
                </Button>
              </div>
            ) : null}

            {/* USER: Re-join Session */}
            {!isHost && isParticipant && isLive && (
              <div className="relative flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <Button 
                  onClick={() => navigate(`/session/${session._id}`)} 
                  className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl border border-blue-500/30 shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                  variant="secondary"
                >
                  <Play size={18} className="mr-2" /> Re-join
                </Button>
              </div>
            )}

            {/* USER: Leave Session */}
            {!isHost && isParticipant && !isLive && !isEnded && (
              <div className="relative flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <Button 
                  onClick={() => onLeave(session._id)}
                  className="relative w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-xl border border-red-500/30 shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
                  variant="primary"
                >
                  <Square size={18} className="mr-2" /> Leave Session
                </Button>
              </div>
            )}

            {/* BOTH: Play Recording (for ended sessions) */}
            {isEnded && (
              <div className="relative flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <Button 
                  onClick={() => navigate(`/session/${session._id}`)} 
                  className="relative w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl border border-purple-500/30 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                  variant="primary"
                >
                  <Play size={18} className="mr-2" /> Play Recording
                </Button>
              </div>
            )} 

            {/* Enhanced Share button */}
            <div className="relative">
              <div className="absolute inset-0 bg-gray-600/20 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <Button 
                onClick={handleShare} 
                className="relative bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600 hover:border-gray-500 py-3 px-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-110"
                variant="ghost"
              >
                <Share2 size={18} />
              </Button>
            </div>

            {/* ADMIN: Cancel/Delete session (moderation) */}
            {isAdminUser && !session.is_cancelled && onDelete && (
              <div className="relative">
                <div className="absolute inset-0 bg-red-900/30 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <Button
                  onClick={() => onDelete(session._id)}
                  className="relative bg-red-900/40 hover:bg-red-800/60 text-red-300 border border-red-700/50 py-3 px-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-110"
                  variant="ghost"
                  title="Cancel session"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
