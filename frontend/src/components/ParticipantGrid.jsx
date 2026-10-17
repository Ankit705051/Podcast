import React from 'react';
import VideoPlayer from './VideoPlayer';
import { Users } from 'lucide-react';

const ParticipantGrid = ({ 
  localStream, 
  remoteStreams, 
  user, 
  session,
  isMuted,
  isVideoOff,
  localVideoRef,
}) => {
  // Create local participant object
  const localParticipant = localStream ? {
    uid: user?._id || 'local',
    name: user?.name || 'You',
    isHost: session?.host_id?._id?.toString() === user?._id?.toString() || 
             session?.host_id?.toString() === user?._id?.toString() || 
             session?.host_id === user?._id,
    stream: localStream,
    isLocal: true
  } : null;

  // Convert remote streams Map to array of participants
  const remoteParticipants = Array.from(remoteStreams.values()).map(data => ({
    uid: data.userId,
    name: data.userName || 'Unknown',
    stream: data.stream,
    isLocal: false
  }));

  // Combine local and remote participants
  const allParticipants = [
    ...(localParticipant ? [localParticipant] : []),
    ...remoteParticipants
  ];

  // Determine grid layout based on number of participants
  const getGridClass = (count) => {
    if (count <= 1) return 'grid-cols-1';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const gridClass = getGridClass(allParticipants.length);

  return (
    <div className="flex-1 bg-gray-900 p-4 overflow-auto relative">
      {allParticipants.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg">No participants yet</p>
            <p className="text-sm">Waiting for others to join...</p>
          </div>
        </div>
      ) : (
        <div className={`grid ${gridClass} gap-4 max-w-6xl mx-auto`}>
          {allParticipants.map((participant) => (
            <VideoPlayer
              key={participant.uid}
              participant={participant}
              isLocal={participant.isLocal}
              isMuted={participant.isLocal ? isMuted : false}
              isVideoOff={
                participant.isLocal
                  ? isVideoOff
                  : !participant.videoTrack 
              }
              showControls={true}
              className="aspect-video"
              localVideoRef={participant.isLocal ? localVideoRef : null}
            />
          ))}
        </div>
      )}

      {/* Participant Count */}
      {allParticipants.length > 0 && (
        <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
          <span className="text-white text-sm">
            {allParticipants.length} {allParticipants.length === 1 ? 'participant' : 'participants'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ParticipantGrid;
