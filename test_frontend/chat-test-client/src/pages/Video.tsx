import { useRef, useEffect, useState } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import type { ChatMessage } from '../types/chat.types';
import './Video.css';

const Video = () => {
  const [sessionId, setSessionId] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    localStream,
    remoteStream,
    isConnected,
    isCalling,
    error,
    socket,
    joinSession,
    leaveSession,
    createOffer,
  } = useWebRTC({
    sessionId,
  });

  // Attach local stream to video element
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle chat events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (chat: ChatMessage) => {
      console.log('New message:', chat);
      setMessages((prev) => [...prev, chat]);
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket]);

  const handleJoin = async () => {
    if (!sessionId.trim() || isJoining) {
      if (!sessionId.trim()) {
        alert('Please enter a session ID');
      }
      return;
    }
    
    setIsJoining(true);
    console.log('Joining session:', sessionId);
    
    try {
      await joinSession();
      // Emit chat join event as well
      if (socket) {
        socket.emit('join-session', sessionId);
      }
      setIsJoined(true);
      
      // Clear old messages and add system message
      setMessages([]);
    } catch (error) {
      console.error('Unable to join video session:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = () => {
    if (socket) {
      socket.emit('leave-session', sessionId);
    }
    leaveSession();
    setIsJoined(false);
    setMessages([]);
  };

  const handleStartCall = async () => {
    await createOffer();
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOff;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !sessionId || !socket) {
      return;
    }

    socket.emit('send-message', {
      sessionId,
      message: newMessage,
      type: 'TEXT',
    });

    setNewMessage('');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get current user id to determine own messages (assuming user id is available in socket or we can just check if user?.name is ours)
  // But wait, the backend sends chat.user with name. 
  // Let's assume we can't easily tell who is own by ID here without extra state, so we check if chat.userId === socket.id
  // Actually, wait, backend `createChat` saves it with real DB userId, not socket id.
  // The backend uses `const userId=socket.data.user.id;`. 
  // We can just rely on the layout to show the username.
  
  return (
    <div className="podcast-session">
      <div className="session-header">
        <h1>🎙️ Podcast Session</h1>
        <div className="connection-badge">
          <span className={`badge ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Live' : '○ Offline'}
          </span>
        </div>
      </div>

      {!isJoined ? (
        <div className="join-screen">
          <div className="join-card">
            <h2>Join a Session</h2>
            <div className="input-group">
              <label>Session ID</label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID"
              />
            </div>
            <button onClick={handleJoin} className="btn btn-primary" disabled={isJoining}>
              {isJoining ? 'Connecting...' : 'Join Session'}
            </button>
          </div>
        </div>
      ) : (
        <div className="session-layout">
          {/* Video Section */}
          <div className="video-section">
            <div className="section-label">🎥 Video</div>
            <div className="remote-video-container">
              <h3>Remote Video</h3>
              <div className="remote-video">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="main-video"
                />
                {!remoteStream && (
                  <div className="video-placeholder">
                    <span className="placeholder-icon">🎥</span>
                    <p>Waiting for remote stream...</p>
                  </div>
                )}
              </div>

              {/* Local Video (Picture-in-Picture) */}
              <div className="local-video-pip">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="pip-video"
                />
                <div className="pip-label">Your Video</div>
              </div>
            </div>

            {/* Control Bar */}
            <div className="control-bar">
              <button
                onClick={toggleMute}
                className={`control-btn ${isMuted ? 'muted' : ''}`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? '🔇' : '🎤'}
              </button>
              <button
                onClick={toggleVideo}
                className={`control-btn ${isVideoOff ? 'video-off' : ''}`}
                title={isVideoOff ? 'Turn on video' : 'Turn off video'}
              >
                {isVideoOff ? '📹' : '📷'}
              </button>
              <button
                onClick={handleStartCall}
                disabled={isCalling}
                className="control-btn call-btn"
                title="Start call"
              >
                {isCalling ? '📞' : '📞'}
              </button>
              <button
                onClick={handleLeave}
                className="control-btn leave-btn"
                title="Leave session"
              >
                ❌
              </button>
            </div>
          </div>

          {/* Chat Section */}
          <div className="chat-section">
            <div className="section-label">💬 Chat</div>
            <div className="chat-header">
              <h3>💬 Chat</h3>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className="message"
                  >
                    <div className="message-header">
                      <span className="message-user">{message.user?.name || message.userId}</span>
                      <span className="message-time">{formatTime(message.createdAt)}</span>
                    </div>
                    <div className="message-text">{message.message}</div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="chat-input"
              />
              <button
                onClick={handleSendMessage}
                className="send-btn"
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default Video;