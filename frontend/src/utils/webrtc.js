import { io } from 'socket.io-client';

// WebRTC configuration
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};

class WebRTCManager {
  constructor() {
    this.socket = null;
    this.localStream = null;
    this.screenStream = null;
    this.peerConnections = new Map();
    this.remoteStreams = new Map();
    // ICE candidates that arrive before setRemoteDescription completes
    this.pendingIceCandidates = new Map();
    this.currentSession = null;
    this.currentUser = null;
    this.userRole = null;
    this.callbacks = {};
  }

  // Initialize Socket.io connection
  async initialize() {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = localStorage.getItem('token');
    const socketUrl = process.env.REACT_APP_SOCKET_URL ||
      (process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL.replace(/\/api\/v1\/?$/, '')
        : 'http://localhost:3000');
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['polling', 'websocket']
    });

    this.setupSocketListeners();
    return this.socket;
  }

  // Setup socket event listeners
  setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.triggerCallback('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      this.triggerCallback('disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.triggerCallback('error', error);
    });

    // WebRTC signaling events
    this.socket.on('webrtc-offer', async (data) => {
      await this.handleOffer(data);
    });

    this.socket.on('webrtc-answer', async (data) => {
      await this.handleAnswer(data);
    });

    this.socket.on('webrtc-ice-candidate', async (data) => {
      await this.handleIceCandidate(data);
    });

    // Session events
    this.socket.on('user-joined', (data) => {
      console.log('User joined:', data);
      this.triggerCallback('user-joined', data);
      
      // Deterministic offerer: the peer with the smaller user id offers.
      // This prevents both sides creating offers at the same time (glare).
      if (this.shouldOffer(data.userId)) {
        this.createPeerConnection(data.userId, data.userName);
        this.createAndSendOffer(data.userId);
      } else {
        this.createPeerConnection(data.userId, data.userName);
      }
    });

    this.socket.on('user-left', (data) => {
      console.log('User left:', data);
      this.triggerCallback('user-left', data);
      this.closePeerConnection(data.userId);
    });

    this.socket.on('session-state', (data) => {
      console.log('Session state:', data);
      this.sessionState = data;
      this.triggerCallback('session-state', data);
      this.connectToAllPeers();
    });

    // Hand raise events
    this.socket.on('hand-raised', (data) => {
      console.log('Hand raised:', data);
      this.triggerCallback('hand-raised', data);
    });

    this.socket.on('hand-lowered', (data) => {
      console.log('Hand lowered:', data);
      this.triggerCallback('hand-lowered', data);
    });

    this.socket.on('user-promoted-to-speaker', (data) => {
      console.log('User promoted to speaker:', data);
      this.triggerCallback('user-promoted-to-speaker', data);
      
      // If we were promoted, start publishing
      if (data.userId === this.currentUser?._id) {
        this.userRole = 'speaker';
        this.connectToAllPeers();
      }
    });

    // Mute events
    this.socket.on('user-muted', (data) => {
      console.log('User muted:', data);
      this.triggerCallback('user-muted', data);
    });

    // Screen share events
    this.socket.on('screen-share-started', (data) => {
      console.log('Screen share started:', data);
      this.triggerCallback('screen-share-started', data);
    });

    this.socket.on('screen-share-stopped', (data) => {
      console.log('Screen share stopped:', data);
      this.triggerCallback('screen-share-stopped', data);
    });
  }

  // Join a session
  async joinSession(sessionId, user, session) {
    try {
      this.currentSession = session;
      this.currentUser = user;
      
      // Determine user role
      const isHost = session.host_id?._id?.toString() === user._id?.toString() ||
                     session.host_id?.toString() === user._id?.toString();
      this.userRole = isHost ? 'host' : 'listener';

      console.log(`Joining session ${sessionId} as ${this.userRole}`);

      // Get local media BEFORE joining so peer connections are created with
      // tracks already attached (single negotiation, no glare).
      try {
        await this.getLocalMedia();
      } catch (mediaError) {
        // Camera/mic denied — continue as view-only participant.
        console.warn('Could not get local media, joining without camera:', mediaError);
      }

      // Join via socket (role hint lets the server assign speaker/moderator)
      this.socket.emit('join-session', {
        sessionId,
        role: this.userRole,
        token: localStorage.getItem('token')
      });

      return true;
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  }

  // Get local media stream
  async getLocalMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      
      this.localStream = stream;
      this.triggerCallback('local-stream', stream);

      // Attach local tracks to any peer connections created before the
      // media stream was ready, then renegotiate (only the deterministic
      // offerer initiates; the answerer picks up tracks in its next answer).
      this.peerConnections.forEach((pc, userId) => {
        this.localStream.getTracks().forEach((track) => {
          if (!pc.getSenders().some((sender) => sender.track === track)) {
            pc.addTrack(track, this.localStream);
          }
        });
        if (this.shouldOffer(userId)) {
          this.createAndSendOffer(userId);
        }
      });

      return stream;
    } catch (error) {
      console.error('Error getting local media:', error);
      throw error;
    }
  }

  // Create peer connection
  createPeerConnection(remoteUserId, remoteUserName) {
    try {
      console.log(`Creating peer connection with ${remoteUserName}`);
      
      const pc = new RTCPeerConnection(RTC_CONFIG);
      
      // Add local tracks if we have them
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          pc.addTrack(track, this.localStream);
        });
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('webrtc-ice-candidate', {
            sessionId: this.currentSession._id,
            targetUserId: remoteUserId,
            candidate: event.candidate
          });
        }
      };

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log(`Received track from ${remoteUserName}`);
        const remoteStream = event.streams[0];
        this.remoteStreams.set(remoteUserId, remoteStream);
        this.triggerCallback('remote-stream', {
          userId: remoteUserId,
          userName: remoteUserName,
          stream: remoteStream
        });
      };

      // Handle connection state
      pc.onconnectionstatechange = () => {
        console.log(`Connection state with ${remoteUserName}:`, pc.connectionState);
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          this.closePeerConnection(remoteUserId);
        }
      };

      this.peerConnections.set(remoteUserId, pc);
      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  }

  // Create an SDP offer and send it to the remote peer
  async createAndSendOffer(remoteUserId) {
    try {
      const pc = this.peerConnections.get(remoteUserId);
      if (!pc || !this.currentSession?._id) return;
      if (pc.signalingState !== 'stable') return;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.socket.emit('webrtc-offer', {
        sessionId: this.currentSession._id,
        targetUserId: remoteUserId,
        offer
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  // Connect to all peers in session (full mesh, all roles publish media)
  async connectToAllPeers() {
    const state = this.sessionState;
    if (!state) return;

    const selfId = this.currentUser?._id?.toString();
    const peerIds = [
      ...(state.speakers || []),
      ...(state.listeners || []),
      ...(state.moderators || []),
    ].filter((id) => id && id.toString() !== selfId);

    for (const userId of peerIds) {
      if (!this.peerConnections.has(userId)) {
        this.createPeerConnection(userId, userId);
      }
      if (this.shouldOffer(userId)) {
        await this.createAndSendOffer(userId);
      }
    }
  }

  // Deterministic glare-avoidance: lower user id is the offerer.
  shouldOffer(remoteUserId) {
    const selfId = this.currentUser?._id?.toString();
    if (!selfId) return false;
    return selfId < remoteUserId.toString();
  }

  // Handle WebRTC offer
  async handleOffer(data) {
    try {
      const { fromUserId, fromUserName, offer } = data;

      let pc = this.peerConnections.get(fromUserId);
      if (!pc) {
        pc = this.createPeerConnection(fromUserId, fromUserName);
      }
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      this.flushIceCandidates(fromUserId, pc);
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      this.socket.emit('webrtc-answer', {
        sessionId: this.currentSession._id,
        targetUserId: fromUserId,
        answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  // Handle WebRTC answer
  async handleAnswer(data) {
    try {
      const { fromUserId, answer } = data;
      const pc = this.peerConnections.get(fromUserId);
      
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        this.flushIceCandidates(fromUserId, pc);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  // Handle ICE candidate — queue until the remote description is set,
  // otherwise addIceCandidate throws and the candidate is lost.
  async handleIceCandidate(data) {
    try {
      const { fromUserId, candidate } = data;
      const pc = this.peerConnections.get(fromUserId);

      if (!pc) return;

      if (!pc.remoteDescription) {
        const queue = this.pendingIceCandidates.get(fromUserId) || [];
        queue.push(candidate);
        this.pendingIceCandidates.set(fromUserId, queue);
        return;
      }

      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  // Add any ICE candidates that arrived before setRemoteDescription
  async flushIceCandidates(userId, pc) {
    const queue = this.pendingIceCandidates.get(userId);
    if (!queue || queue.length === 0) return;
    this.pendingIceCandidates.delete(userId);
    for (const candidate of queue) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error flushing ICE candidate:', error);
      }
    }
  }

  // Close peer connection
  closePeerConnection(userId) {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(userId);
      this.remoteStreams.delete(userId);
      this.pendingIceCandidates.delete(userId);
      this.triggerCallback('peer-disconnected', { userId });
    }
  }

  // Toggle audio
  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      this.triggerCallback('audio-toggled', { enabled });
    }
  }

  // Toggle video
  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      this.triggerCallback('video-toggled', { enabled });
    }
  }

  // Start screen share
  async startScreenShare() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      this.screenStream = stream;
      
      // Replace video track in all peer connections
      this.peerConnections.forEach((pc, userId) => {
        const videoTrack = stream.getVideoTracks()[0];
        const sender = pc.getSenders().find(s => s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });
      
      this.socket.emit('start-screen-share', {
        sessionId: this.currentSession._id
      });
      
      this.triggerCallback('screen-share-started', { stream });
      
      // Handle user stopping screen share
      stream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };
      
      return stream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  // Stop screen share
  stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      
      // Restore camera video track
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        this.peerConnections.forEach((pc, userId) => {
          const sender = pc.getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
      }
      
      this.screenStream = null;
      
      this.socket.emit('stop-screen-share', {
        sessionId: this.currentSession._id
      });
      
      this.triggerCallback('screen-share-stopped');
    }
  }

  // Raise hand
  raiseHand() {
    this.socket.emit('raise-hand', {
      sessionId: this.currentSession._id
    });
  }

  // Lower hand
  lowerHand() {
    this.socket.emit('lower-hand', {
      sessionId: this.currentSession._id
    });
  }

  // Approve hand raise (host only)
  approveHandRaise(userId) {
    this.socket.emit('approve-hand-raise', {
      sessionId: this.currentSession._id,
      userId
    });
  }

  // Mute user (host only)
  muteUser(userId, isMuted) {
    this.socket.emit('toggle-mute', {
      sessionId: this.currentSession._id,
      targetUserId: userId,
      isMuted
    });
  }

  // Leave session
  leaveSession() {
    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
    }
    
    // Close all peer connections
    this.peerConnections.forEach((pc, userId) => {
      pc.close();
    });
    
    this.peerConnections.clear();
    this.remoteStreams.clear();
    this.pendingIceCandidates.clear();
    
    // Leave socket room
    this.socket.emit('leave-session', {
      sessionId: this.currentSession._id
    });
    
    this.triggerCallback('session-left');
  }

  // Register callback
  on(event, callback) {
    this.callbacks[event] = callback;
  }

  // Trigger callback
  triggerCallback(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event](data);
    }
  }

  // Get current role
  getRole() {
    return this.userRole;
  }

  // Get remote stream
  getRemoteStream(userId) {
    return this.remoteStreams.get(userId);
  }

  // Get all remote streams
  getAllRemoteStreams() {
    return this.remoteStreams;
  }
}

// Export singleton instance
export const webrtcManager = new WebRTCManager();
export default webrtcManager;
