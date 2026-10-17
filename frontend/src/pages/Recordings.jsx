import React, { useState, useEffect } from 'react';
import { recordingAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Download, 
  Play, 
  Eye, 
  Trash2, 
  Calendar, 
  Clock, 
  Video,
  FileVideo,
  Search,
  Wifi,
  WifiOff
} from 'lucide-react';

const Recordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [downloading, setDownloading] = useState({});
  const [offlineRecordings, setOfflineRecordings] = useState([]);

  useEffect(() => {
    fetchRecordings();
    loadOfflineRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const response = await recordingAPI.getUserRecordings();
      setRecordings(response.data.recordings || []);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      toast.error('Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  const loadOfflineRecordings = () => {
    const stored = localStorage.getItem('offlineRecordings');
    if (stored) {
      setOfflineRecordings(JSON.parse(stored));
    }
  };

  const downloadRecording = async (recording) => {
    try {
      setDownloading(prev => ({ ...prev, [recording._id]: true }));
      
      // Get download URL
      const response = await recordingAPI.downloadRecording(recording._id);
      const { downloadUrl, fileName } = response.data;
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Add to offline recordings
      const offlineRecording = {
        ...recording,
        downloadedAt: new Date().toISOString(),
        localPath: fileName,
        isOffline: true
      };
      
      const updatedOffline = [...offlineRecordings, offlineRecording];
      setOfflineRecordings(updatedOffline);
      localStorage.setItem('offlineRecordings', JSON.stringify(updatedOffline));
      
      toast.success('Recording downloaded successfully');
    } catch (error) {
      console.error('Error downloading recording:', error);
      toast.error('Failed to download recording');
    } finally {
      setDownloading(prev => ({ ...prev, [recording._id]: false }));
    }
  };

  const deleteRecording = async (recordingId) => {
    if (!window.confirm('Are you sure you want to delete this recording?')) {
      return;
    }
    
    try {
      await recordingAPI.deleteRecording(recordingId);
      setRecordings(prev => prev.filter(r => r._id !== recordingId));
      toast.success('Recording deleted successfully');
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error('Failed to delete recording');
    }
  };

  const removeOfflineRecording = (recordingId) => {
    const updated = offlineRecordings.filter(r => r._id !== recordingId);
    setOfflineRecordings(updated);
    localStorage.setItem('offlineRecordings', JSON.stringify(updated));
    toast.success('Recording removed from offline storage');
  };

  const viewRecording = (recording) => {
    if (recording.isOffline) {
      // View offline recording
      window.open(recording.fileUrl, '_blank');
    } else {
      // View online recording
      window.open(recording.fileUrl, '_blank');
    }
  };

  const filteredRecordings = recordings.filter(recording => {
    const matchesSearch = recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recording.sessionId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || recording.processingStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recordings</h1>
          <p className="text-gray-600 mt-2">Manage and download your session recordings</p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search recordings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>

            <div className="flex items-center text-sm text-gray-600">
              <Video className="h-4 w-4 mr-2" />
              {filteredRecordings.length} recordings
            </div>
          </div>
        </div>

        {/* Online Recordings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Wifi className="h-5 w-5 mr-2" />
            Online Recordings
          </h2>
          
          {filteredRecordings.length === 0 ? (
            <div className="card text-center py-12">
              <FileVideo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recordings found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecordings.map((recording) => (
                <div key={recording._id} className="card">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {recording.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {recording.sessionId?.title || 'Session Recording'}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(recording.createdAt).toLocaleDateString()}
                    </div>
                    
                    {recording.duration && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatDuration(recording.duration)}
                      </div>
                    )}
                    
                    {recording.fileSize && (
                      <div className="flex items-center">
                        <FileVideo className="h-4 w-4 mr-2" />
                        {formatFileSize(recording.fileSize)}
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        recording.processingStatus === 'completed' ? 'bg-green-500' :
                        recording.processingStatus === 'processing' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      {recording.processingStatus}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <button
                      onClick={() => viewRecording(recording)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Play
                    </button>
                    
                    {recording.processingStatus === 'completed' && (
                      <button
                        onClick={() => downloadRecording(recording)}
                        disabled={downloading[recording._id]}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {downloading[recording._id] ? 'Downloading...' : 'Download'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteRecording(recording._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Offline Recordings */}
        {offlineRecordings.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <WifiOff className="h-5 w-5 mr-2" />
              Offline Recordings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offlineRecordings.map((recording) => (
                <div key={recording._id} className="card border-green-200">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <Video className="h-12 w-12 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {recording.title}
                    </h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Offline
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Downloaded: {new Date(recording.downloadedAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => viewRecording(recording)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Offline
                    </button>
                    
                    <button
                      onClick={() => removeOfflineRecording(recording._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recordings;
