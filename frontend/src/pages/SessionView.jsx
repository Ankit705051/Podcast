import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionAPI, chatAPI } from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import { webrtcManager } from '../utils/webrtc';
import ParticipantGrid from '../components/ParticipantGrid';
import Chat from '../components/Chat';
import Controls from '../components/Controls';
import { ArrowLeft } from 'lucide-react';

const SessionView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // WebRTC state
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [userRole, setUserRole] = useState(null);
  const [handRaisedUsers, setHandRaisedUsers] = useState([]);
  const [sessionState, setSessionState] = useState(null);
  
  // Refs for video elements
  const localVideoRef = useRef(null);
  const screenShareRef = useRef(null);

  const isHost = (session?.host_id?._id?.toString() === user?._id?.toString()) ||
                 (session?.host_id?.toString() === user?._id?.toString()) ||
                 (session?.host_id === user?._id);

  // Refresh session data (for startSession)
  const refreshSessionData = async () => {
    try {
      const response = await sessionAPI.getSessionById(sessionId);
      const fetchedSession = response.data.session;
      setSession(fetchedSession);
      return fetchedSession;
    } catch (error) {
      console.error('Error refreshing session data:', error);
    }
  };

  // ─── Effects ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to join sessions');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        const response = await Promise.race([
          sessionAPI.getSessionById(sessionId),
          timeoutPromise
        ]);
        
        const fetchedSession = response.data.session;
        setSession(fetchedSession);

        // Let useAgora handle token generation internally
        if (fetchedSession?.is_live) {
          // Tokens will be generated when joinSession is called
        }
      } catch (error) {
        console.error('Session load error:', error);
        if (error.message === 'Request timeout') {
          toast.error('Server is taking too long to respond. Please check if the backend is running.');
          navigate('/sessions');
        } else if (error.response?.status === 401) {
          toast.error('Please login to access sessions');
          navigate('/login');
        } else if (error.response?.status === 403) {
          toast.error('You do not have permission to access this session');
          navigate('/sessions');
        } else if (error.response?.status === 404) {
          toast.error('Session not found');
          navigate('/sessions');
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          toast.error('Cannot connect to server. Please ensure the backend is running on port 3000.');
          navigate('/sessions');
        } else {
          toast.error('Failed to load session: ' + (error.response?.data?.message || error.message));
          navigate('/sessions');
        }
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, navigate]);

  useEffect(() => {
    if (user && isAuthenticated) {
      const token = localStorage.getItem('token');
      if (token) socketService.connect(token);
    }
    return () => socketService.disconnect();
  }, [user, isAuthenticated]);

  // Socket room management - join only once when session loads
  useEffect(() => {
    if (sessionId && session && !socketService.joinedRooms?.includes(sessionId)) {
      socketService.joinSession(sessionId);
    }
  }, [sessionId, session]); // Only for joining, not for leaving

  // Socket room cleanup - only leave when component unmounts or sessionId changes
  useEffect(() => {
    return () => {
      if (sessionId && socketService.connected) {
        socketService.leaveSession(sessionId);
      }
      if (isJoined) {
        webrtcManager.leaveSession();
      }
    };
  }, [sessionId, isJoined]); // Cleanup on sessionId change or when joined

  // Handle incoming messages - Chat.jsx handles everything else
  useEffect(() => {
    const handleMessage = (msg) => setMessages(prev => [...prev, msg]);
    socketService.on('receive-message', handleMessage);
    return () => socketService.off('receive-message', handleMessage);
  }, []);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!sessionId) return;
    try {
      const response = await chatAPI.getMessages(sessionId);
      if (response.data.success) {
        setMessages(response.data.data?.messages || []);
      }
    } catch (error) {
      // silently fail — chat history is non-critical
    }
  }, [sessionId]);

  useEffect(() => {
    loadMessages();
  }, [sessionId, loadMessages]);

  useEffect(() => {
    if (!loading && session && !session.is_live && session?.host_id === user?._id) {
      toast.success('🎉 Session created! Click "Start Session" when you\'re ready to begin.');
    }
  }, [loading, session, user]);

  // ─── Handlers ─────────────────────────────────────────────────
  const joinSession = async () => {
    if (isJoining) return; // Prevent multiple clicks
    
    console.log('Starting WebRTC session join...');
    setIsJoining(true);
    try {
      // Initialize WebRTC manager
      await webrtcManager.initialize();
      
      // Setup WebRTC callbacks
      webrtcManager.on('local-stream', (stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      });
      
      webrtcManager.on('remote-stream', (data) => {
        setRemoteStreams(prev => new Map(prev).set(data.userId, data));
      });
      
      webrtcManager.on('user-joined', (data) => {
        console.log('User joined:', data);
      });
      
      webrtcManager.on('user-left', (data) => {
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
      });
      
      webrtcManager.on('session-state', (data) => {
        setSessionState(data);
      });
      
      webrtcManager.on('hand-raised', (data) => {
        setHandRaisedUsers(prev => [...prev, data]);
      });
      
      webrtcManager.on('hand-lowered', (data) => {
        setHandRaisedUsers(prev => prev.filter(u => u.userId !== data.userId));
      });
      
      webrtcManager.on('user-promoted-to-speaker', (data) => {
        if (data.userId === user._id) {
          setUserRole('speaker');
          toast.success('You have been promoted to speaker!');
        }
      });
      
      webrtcManager.on('audio-toggled', (data) => {
        setIsMuted(!data.enabled);
      });
      
      webrtcManager.on('video-toggled', (data) => {
        setIsVideoOff(!data.enabled);
      });
      
      webrtcManager.on('screen-share-started', () => {
        setIsScreenSharing(true);
      });
      
      webrtcManager.on('screen-share-stopped', () => {
        setIsScreenSharing(false);
      });
      
      // Join the session
      await webrtcManager.joinSession(sessionId, user, session);
      
      setUserRole(webrtcManager.getRole());
      setIsJoined(true);
      
      toast.success('Successfully joined session!');
      
    } catch (error) {
      console.error('Session join failed:', error);
      toast.error('Failed to join session: ' + error.message);
      
      // Cleanup on error
      webrtcManager.leaveSession();
    } finally {
      setIsJoining(false);
    }
  };

  const leaveSession = async () => {
    try {
      await sessionAPI.leaveSession(sessionId);
      webrtcManager.leaveSession();
      setIsJoined(false);
      navigate('/sessions');
    } catch (error) {
      toast.error('Failed to leave session');
    }
  };

  const startSession = async () => {
    if (isStarting) return;
    
    setIsStarting(true);
    try {
      console.log(' Starting session process...');
      console.log(' Session data before start:', { 
        sessionId, 
        is_live: session?.is_live, 
        isHost,
        userId: user?._id 
      });

      const response = await sessionAPI.startSession(sessionId);
      console.log(' Start session API response:', response.data);
      
      if (response.data.success) {
        toast.success('Session started!');
        
        // Refresh session data to get updated is_live status
        console.log(' Refreshing session data...');
        const updatedSession = await refreshSessionData();
        console.log(' Updated session data:', updatedSession);
        
        // Check if session is now live
        if (updatedSession?.is_live) {
          console.log(' Session is now live! UI should update.');
        } else {
          console.error(' Session still not live after start call');
          toast.error('Session started but status not updated. Please refresh.');
        }
      } else {
        toast.error(response.data.message || 'Failed to start session');
      }
    } catch (error) {
      console.error(' Start session error:', error);
      toast.error(error.response?.data?.message || 'Failed to start session');
    } finally {
      setIsStarting(false);
    }
  };

  const endSession = async () => {
    try {
      const response = await sessionAPI.endSession(sessionId);
      if (response.data.success) {
        toast.success('Session ended');
        if (isJoined) {
          await leaveSession();
        } else {
          navigate('/sessions');
        }
      }
    } catch (error) {
      toast.error('Failed to end session');
    }
  };

  const toggleRecording = async () => {
    try {
      const response = await sessionAPI.toggleRecording(sessionId, !isRecording);
      if (response.data.success) {
        setIsRecording(!isRecording);
        toast.success(`Recording ${!isRecording ? 'started' : 'stopped'}`);
      }
    } catch (error) {
      toast.error('Failed to toggle recording');
    }
  };

  const sendMessage = (message) => {
    socketService.sendMessage(sessionId, message);
  };

  // ─── Render Guards ─────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white mb-2">Loading session...</p>
          <p className="text-gray-400 text-sm">If this takes too long, please check if the backend server is running</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p>Session not found</p>
          <button
            onClick={() => navigate('/sessions')}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/sessions')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{session?.title || 'Loading...'}</h1>
              <p className="text-sm text-gray-400">
                {session?.is_live ? '🔴 Live' : '⏸️ Not started'} •{' '}
                {remoteStreams.size + 1} participants
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!session?.is_live && isHost && (
              <button
                onClick={startSession}
                disabled={isStarting}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                  isStarting 
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isStarting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Starting...</span>
                  </>
                ) : (
                  <span>Start Session</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 flex flex-col">
          {!session?.is_live ? (
            <div className="flex-1 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <p className="text-gray-400 mb-4">Session hasn't started yet</p>
                {isHost ? (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-400">🎯 Click "Start Session" to begin</p>
                    <p className="text-xs text-gray-500">Test your camera/mic before starting</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Waiting for host to start the session...</p>
                )}
              </div>
            </div>
          ) : (
            <>
              {!isJoined ? (
                <div className="flex-1 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <p className="text-gray-400 mb-4">Session is live!</p>
                    <button
                      onClick={joinSession}
                      disabled={isJoining}
                      className={`px-6 py-3 rounded-lg transition-colors ${
                        isJoining 
                          ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isJoining ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Joining...
                        </span>
                      ) : (
                        'Join Session'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <ParticipantGrid
                  localStream={localStream}
                  remoteStreams={remoteStreams}
                  user={user}
                  session={session}
                  isMuted={isMuted}
                  isVideoOff={isVideoOff}
                  localVideoRef={localVideoRef}
                />
              )}
            </>
          )}

          {/* Controls */}
          <Controls
            isJoined={isJoined}
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            isRecording={isRecording}
            isHost={isHost}
            userRole={userRole}
            handRaisedUsers={handRaisedUsers}
            onToggleMute={() => {
              const newState = !isMuted;
              webrtcManager.toggleAudio(newState);
              setIsMuted(newState);
            }}
            onToggleVideo={() => {
              const newState = !isVideoOff;
              webrtcManager.toggleVideo(newState);
              setIsVideoOff(newState);
            }}
            onToggleScreenShare={async () => {
              if (isScreenSharing) {
                webrtcManager.stopScreenShare();
              } else {
                await webrtcManager.startScreenShare();
              }
            }}
            onToggleRecording={toggleRecording}
            onEndSession={endSession}
            onLeaveSession={leaveSession}
            onRaiseHand={() => webrtcManager.raiseHand()}
            onLowerHand={() => webrtcManager.lowerHand()}
            onApproveHandRaise={(userId) => webrtcManager.approveHandRaise(userId)}
            onMuteUser={(userId, isMuted) => webrtcManager.muteUser(userId, isMuted)}
            onToggleChat={() => setShowChat(!showChat)}
            onToggleSettings={() => setShowSettings(!showSettings)}
            showChat={showChat}
            showSettings={showSettings}
          />
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 flex flex-col">
            <Chat
              sessionId={sessionId}
              messages={messages}
              user={user}
              onSendMessage={sendMessage}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Session Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Enable recording</span>
                <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Allow screen sharing</span>
                <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionView;