import { useEffect, useRef, useState, useCallback } from 'react';
import { socket, connectSocket as connectGlobalSocket } from '../services/socket';
import { getToken } from '../utils/auth.utils';

interface UseWebRTCProps {
  sessionId: string;
}

interface WebRTCState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isCalling: boolean;
  error: string | null;
}

export const useWebRTC = ({ sessionId }: UseWebRTCProps) => {
  const [state, setState] = useState<WebRTCState>({
    localStream: null,
    remoteStream: null,
    isConnected: false,
    isCalling: false,
    error: null,
  });

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  // Socket.IO Connection
  const connectSocket = useCallback(() => {
    if (socket.connected) {
      setState(prev => ({ ...prev, isConnected: true, error: null }));
      return socket;
    }

    const token = getToken();
    if (!token) {
      const error = 'You are not logged in. Please log in again.';
      setState(prev => ({ ...prev, error }));
      return null;
    }

    try {
      socket.auth = { token };
      connectGlobalSocket();

      const handleConnect = () => {
        console.log('Socket connected:', socket.id);
        setState(prev => ({ ...prev, isConnected: true, error: null }));
      };

      const handleDisconnect = (reason: any) => {
        console.log('Socket disconnected:', reason);
        setState(prev => ({ ...prev, isConnected: false }));
      };

      const handleConnectError = (error: any) => {
        console.error('Socket connection error:', error);
        const message = error.message.includes('Authentication')
          ? 'Authentication failed. Please log in again.'
          : `Unable to connect to the video server: ${error.message}`;
        setState(prev => ({ ...prev, error: message }));
      };

      const handleUserJoined = ({ userId }: { userId: string }) => {
        console.log('User joined:', userId);
        if (!peerConnectionRef.current) {
          void createOffer();
        }
      };

      const handleUserLeft = ({ userId }: { userId: string }) => {
        console.log('User left:', userId);
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
      };

      const handleVideoOffer = async ({ offer }: { offer: string }) => {
        console.log('Received offer');
        await handleOffer(offer);
      };

      const handleVideoAnswer = async ({ answer }: { answer: string }) => {
        console.log('Received answer');
        await handleAnswer(answer);
      };

      const handleVideoIceCandidate = async ({ candidate }: { candidate: string }) => {
        console.log('Received ICE candidate');
        await handleIceCandidate(candidate);
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleConnectError);
      
      // WebRTC Events
      socket.on('user-joined', handleUserJoined);
      socket.on('user-left', handleUserLeft);
      socket.on('video:offer', handleVideoOffer);
      socket.on('video:answer', handleVideoAnswer);
      socket.on('video:ice-candidate', handleVideoIceCandidate);

      return socket;
    } catch (error) {
      console.error('Socket connection error:', error);
      setState(prev => ({ ...prev, error: 'Failed to connect to server' }));
      return null;
    }
  }, [sessionId]);

  // Get Camera + Microphone
  const getLocalStream = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera and microphone access requires HTTPS or localhost');
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (error) {
        const mediaError = error as DOMException;
        if (mediaError.name !== 'NotReadableError') {
          throw error;
        }

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
        }
      }

      localStreamRef.current = stream;
      setState(prev => ({ ...prev, localStream: stream }));
      return stream;
    } catch (error) {
      console.error('Error getting media stream:', error);
      const mediaError = error as DOMException;
      const message = mediaError.name === 'NotAllowedError'
        ? 'Camera/microphone permission was denied. Allow access and try again.'
        : mediaError.name === 'NotFoundError'
          ? 'No camera or microphone was found.'
          : mediaError.message || 'Failed to access camera/microphone.';
      setState(prev => ({ ...prev, error: message }));
      throw new Error(message);
    }
  }, []);

  // Create RTCPeerConnection
  const createPeerConnection = useCallback(() => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket.connected) {
        socket.emit('video:ice-candidate', {
          sessionId,
          candidate: JSON.stringify(event.candidate),
        });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('Received remote track');
      const remoteStream = event.streams[0];
      remoteStreamRef.current = remoteStream;
      setState(prev => ({ ...prev, remoteStream }));
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'disconnected') {
        setState(prev => ({ ...prev, isCalling: false }));
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, [sessionId]);

  // Create Offer
  const createOffer = useCallback(async () => {
    try {
      if (!peerConnectionRef.current) {
        createPeerConnection();
      }

      const peerConnection = peerConnectionRef.current!;
      const localStream = localStreamRef.current;

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
      }

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      if (socket.connected) {
        socket.emit('video:offer', {
          sessionId,
          offer: JSON.stringify(offer),
        });
      }

      setState(prev => ({ ...prev, isCalling: true }));
      console.log('Offer created and sent');
    } catch (error) {
      console.error('Error creating offer:', error);
      setState(prev => ({ ...prev, error: 'Failed to create offer' }));
    }
  }, [sessionId, createPeerConnection]);

  // Handle Incoming Offer
  const handleOffer = useCallback(async (offer: string) => {
    try {
      if (!peerConnectionRef.current) {
        createPeerConnection();
      }

      const peerConnection = peerConnectionRef.current!;
      const localStream = localStreamRef.current;

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(offer)));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (socket.connected) {
        socket.emit('video:answer', {
          sessionId,
          answer: JSON.stringify(answer),
        });
      }

      setState(prev => ({ ...prev, isCalling: true }));
      console.log('Answer created and sent');
    } catch (error) {
      console.error('Error handling offer:', error);
      setState(prev => ({ ...prev, error: 'Failed to handle offer' }));
    }
  }, [sessionId, createPeerConnection]);

  // Handle Incoming Answer
  const handleAnswer = useCallback(async (answer: string) => {
    try {
      if (!peerConnectionRef.current) {
        throw new Error('No peer connection exists');
      }

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(JSON.parse(answer))
      );
      console.log('Answer set as remote description');
    } catch (error) {
      console.error('Error handling answer:', error);
      setState(prev => ({ ...prev, error: 'Failed to handle answer' }));
    }
  }, []);

  // Handle ICE Candidates
  const handleIceCandidate = useCallback(async (candidate: string) => {
    try {
      if (!peerConnectionRef.current) {
        throw new Error('No peer connection exists');
      }

      await peerConnectionRef.current.addIceCandidate(
        new RTCIceCandidate(JSON.parse(candidate))
      );
      console.log('ICE candidate added');
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, []);

  // Join Session
  const joinSession = useCallback(async () => {
    if (!sessionId.trim()) {
      throw new Error('Enter a session ID before joining');
    }

    if (localStreamRef.current) {
      return;
    }

    const currentSocket = socket.connected ? socket : connectSocket();
    if (!currentSocket) {
      throw new Error('Unable to connect to the video server');
    }

    await getLocalStream();

    if (!currentSocket.connected) {
      await new Promise<void>((resolve, reject) => {
        const handleConnect = () => {
          cleanup();
          resolve();
        };
        const handleError = (error: Error) => {
          cleanup();
          reject(error);
        };
        const cleanup = () => {
          currentSocket.off('connect', handleConnect);
          currentSocket.off('connect_error', handleError);
        };

        currentSocket.once('connect', handleConnect);
        currentSocket.once('connect_error', handleError);
      });
    }

    currentSocket.emit('video:join', sessionId);
  }, [sessionId, connectSocket, getLocalStream]);

  // Leave Session
  const leaveSession = useCallback(() => {
    if (socket.connected && sessionId) {
      socket.emit('video:leave', sessionId);
      socket.disconnect();
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setState({
      localStream: null,
      remoteStream: null,
      isConnected: false,
      isCalling: false,
      error: null,
    });
  }, [sessionId]);

  useEffect(() => {
    return () => {
      leaveSession();
    };
  }, [leaveSession]);

  return {
    ...state,
    socket,
    connectSocket,
    getLocalStream,
    createOffer,
    joinSession,
    leaveSession,
  };
};