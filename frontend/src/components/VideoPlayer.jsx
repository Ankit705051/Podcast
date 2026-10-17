import React, { useEffect, useRef } from 'react';
import { User, CameraOff, MicOff } from 'lucide-react';

const VideoPlayer = ({ 
  participant, 
  isLocal = false, 
  isMuted = false, 
  isVideoOff = false,
  showControls = true,
  className = "",
  localVideoRef = null
}) => {
  const videoRef = useRef(null);
  const targetRef = isLocal && localVideoRef ? localVideoRef : videoRef;
  const stream = participant?.stream;

  useEffect(() => {
    // Handle WebRTC stream playback
    if (!stream || !targetRef.current) return;
    
    try {
      targetRef.current.srcObject = stream;
      targetRef.current.play().catch(console.error);
      console.log('Video stream playing:', {
        participant: participant?.uid,
        isLocal,
        isVideoOff
      });
    } catch (error) {
      console.error('Failed to play video stream:', error);
    }

    return () => {
      if (targetRef.current) {
        targetRef.current.srcObject = null;
      }
    };
  }, [stream, targetRef, isVideoOff, participant?.uid, isLocal]);

  // Early return if participant is null/undefined (after all hooks)
  if (!participant) {
    return (
      <div className={`relative bg-gray-800 rounded-lg overflow-hidden aspect-video ${className}`}>
        <div className="flex items-center justify-center w-full h-full bg-gray-900">
          <div className="text-center">
            <User className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-white text-sm">Unknown User</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = isLocal
    ? 'You' 
    : participant?.name || participant?.uid || 'Unknown User';
  const isHost = participant?.isHost || false;

  return (
    <div className={`relative bg-gray-800 rounded-lg overflow-hidden aspect-video ${className}`}>
      {/* Video Container */}
      <div className="relative w-full h-full">
        {isVideoOff || !stream ?(
          <div className="flex items-center justify-center w-full h-full bg-gray-900">
            <div className="text-center">
              <User className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p className="text-white text-sm">{displayName}</p>
              {isHost && (
                <span className="inline-block px-2 py-1 text-xs bg-blue-600 text-white rounded-full mt-1">
                  Host
                </span>
              )}
              {isLocal && (
                <span className="inline-block px-2 py-1 text-xs bg-green-600 text-white rounded-full mt-1">
                  You
                </span>
              )}
            </div>
          </div>
        ) : (
          <video 
            ref={targetRef}
            id={isLocal ? 'local-video' : `remote-player-${participant?.uid}`}
            autoPlay
            playsInline
            muted={isLocal}
            className={`w-full h-full object-cover ${isLocal ? 'transform -scale-x-100' : ''}`}
          />
        )}

        {/* Overlay Controls */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm font-medium truncate max-w-[120px]">
                  {displayName}
                </span>
                {isHost && (
                  <span className="px-1 py-0.5 text-xs bg-blue-600 text-white rounded">
                    Host
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                {isMuted && (
                  <div className="p-1 bg-red-600 rounded">
                    <MicOff className="w-3 h-3 text-white" />
                  </div>
                )}
                {isVideoOff && (
                  <div className="p-1 bg-red-600 rounded">
                    <CameraOff className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Audio Indicator */}
        {stream && !isMuted && stream.getAudioTracks().length > 0 && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
