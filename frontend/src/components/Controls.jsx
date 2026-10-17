import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff, 
  Settings,
  MessageCircle,
  Square,
  Circle,
  Phone,
  PhoneOff,
  Loader2,
  Hand,
  HandOff,
  Users
} from 'lucide-react';

const Controls = ({
  isJoined,
  isMuted,
  isVideoOff,
  isScreenSharing,
  isRecording,
  isHost,
  userRole,
  handRaisedUsers,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRecording,
  onEndSession,
  onLeaveSession,
  onToggleChat,
  onToggleSettings,
  onRaiseHand,
  onLowerHand,
  onApproveHandRaise,
  onMuteUser,
  showChat,
  showSettings,
  className = ""
}) => {
  const [isProcessing, setIsProcessing] = useState({});

  const handleAction = async (action, actionName) => {
    if (isProcessing[actionName]) return;
    
    setIsProcessing(prev => ({ ...prev, [actionName]: true }));
    try {
      await action();
    } catch (error) {
      console.error(`Error in ${actionName}:`, error);
    } finally {
      setTimeout(() => {
        setIsProcessing(prev => ({ ...prev, [actionName]: false }));
      }, 500); // Prevent spam for 500ms
    }
  };

  return (
    <div className={`relative bg-gray-900 border-t border-gray-700 p-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 max-w-6xl mx-auto">
        {/* Left Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isJoined && (
            <>
              {/* Microphone Toggle */}
              <button
                onClick={() => handleAction(onToggleMute, 'mute')}
                disabled={isProcessing.mute}
                className={`p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isMuted 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isProcessing.mute ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />
                )}
              </button>

              {/* Camera Toggle */}
              <button
                onClick={() => handleAction(onToggleVideo, 'video')}
                disabled={isProcessing.video}
                className={`p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isVideoOff 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {isProcessing.video ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />
                )}
              </button>

              {/* Screen Share Toggle */}
              <button
                onClick={() => handleAction(onToggleScreenShare, 'screenShare')}
                disabled={isProcessing.screenShare}
                className={`p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isScreenSharing 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
              >
                {isProcessing.screenShare ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />
                )}
              </button>

              {/* Raise Hand (Listeners Only) */}
              {userRole === 'listener' && (
                <button
                  onClick={() => handleAction(onRaiseHand, 'raiseHand')}
                  disabled={isProcessing.raiseHand}
                  className={`p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    handRaisedUsers.length > 0 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title="Raise hand to speak"
                >
                  {isProcessing.raiseHand ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Hand className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* Recording Toggle (Host Only) */}
              {isHost && (
                <button
                  onClick={() => handleAction(onToggleRecording, 'recording')}
                  disabled={isProcessing.recording}
                  className={`p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  {isProcessing.recording ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    isRecording ? <Square className="w-5 h-5" /> : <Circle className="w-5 h-5" />
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* Center Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isJoined ? (
            <>
              {/* Chat Toggle */}
              <button
                onClick={onToggleChat}
                className={`p-3 rounded-full transition-all ${
                  showChat 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title="Toggle chat"
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              {/* Settings Toggle */}
              <button
                onClick={onToggleSettings}
                className={`p-3 rounded-full transition-all ${
                  showSettings 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Leave Session */}
              <button
                onClick={onLeaveSession}
                className="px-4 sm:px-6 py-2 bg-orange-600 rounded-md hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <PhoneOff className="w-4 h-4" />
                <span className="hidden sm:inline">Leave</span>
              </button>
            </>
          ) : (
            <div className="text-center text-gray-400">
              <p className="text-sm">Click "Join Session" to start</p>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* End Session (Host Only) */}
          {isHost && isJoined && (
            <button
              onClick={() => handleAction(onEndSession, 'endSession')}
              disabled={isProcessing.endSession}
              className="px-3 sm:px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing.endSession ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PhoneOff className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">End Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-white text-sm font-medium">Recording</span>
        </div>
      )}
    </div>
  );
};

export default Controls;
