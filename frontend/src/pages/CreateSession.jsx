import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Mic, 
  Users, 
  Play, 
  Square, 
  Video, 
  Settings,
  Plus,
  Clock,
  Globe,
  Lock,
  ArrowLeft,
  Radio,
  GraduationCap,
  MessageCircle
} from 'lucide-react';

const CreateSession = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  // Set default dates (current time + 1 hour for start, + 2 hours for end)
  const getDefaultStart = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  const getDefaultEnd = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    return now.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_start: getDefaultStart(),
    scheduled_end: getDefaultEnd(),
    stream_platform: 'other',
    stream_url: '',
    thumbnail_url: '',
    category: '',
    tags: '',
    access_level: 'public',
    max_participants: 100,
    requires_registration: false
  });

  // Update default values when type is selected
  useEffect(() => {
    if (selectedType) {
      const type = sessionTypes.find(t => t.id === selectedType);
      if (type) {
        setFormData(prev => ({
          ...prev,
          category: type.defaultCategory,
          tags: type.defaultTags.join(', '),
          stream_url: prev.stream_url || `http://localhost:3000/live/${selectedType}_${Date.now()}`,
          thumbnail_url: prev.thumbnail_url || `https://picsum.photos/seed/${selectedType}_${Date.now()}/400/300.jpg`
        }));
      }
    }
  }, [selectedType]);

  const sessionTypes = [
    {
      id: 'podcast',
      name: 'Podcast',
      icon: Mic,
      description: 'Host a podcast episode with multiple speakers',
      color: 'bg-purple-500',
      defaultCategory: 'podcast',
      defaultTags: ['podcast', 'audio', 'discussion']
    },
    {
      id: 'interview',
      name: 'Interview',
      icon: Users,
      description: 'Conduct one-on-one or group interviews',
      color: 'bg-blue-500',
      defaultCategory: 'interview',
      defaultTags: ['interview', 'conversation', 'guest']
    },
    {
      id: 'live_event',
      name: 'Live Event',
      icon: Radio,
      description: 'Broadcast live events to a large audience',
      color: 'bg-red-500',
      defaultCategory: 'event',
      defaultTags: ['live', 'event', 'broadcast']
    },
    {
      id: 'webinar',
      name: 'Webinar',
      icon: GraduationCap,
      description: 'Educational sessions with presentations',
      color: 'bg-green-500',
      defaultCategory: 'education',
      defaultTags: ['webinar', 'education', 'learning']
    },
    {
      id: 'qa_session',
      name: 'Q&A Session',
      icon: MessageCircle,
      description: 'Interactive question and answer sessions',
      color: 'bg-yellow-500',
      defaultCategory: 'qna',
      defaultTags: ['qa', 'questions', 'interactive']
    }
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type.id);
    setFormData(prev => ({
      ...prev,
      category: type.defaultCategory,
      tags: type.defaultTags.join(', ')
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedType) {
      toast.error('Please select a session type');
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.description || !formData.scheduled_start || !formData.scheduled_end) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Prepare session data
    const sessionData = {
      title: formData.title,
      description: formData.description,
      scheduled_start: new Date(formData.scheduled_start).toISOString(),
      scheduled_end: new Date(formData.scheduled_end).toISOString(),
      stream_platform: formData.stream_platform,
      stream_url: formData.stream_url || `http://localhost:3000/live/${selectedType}_${Date.now()}`,
      thumbnail_url: formData.thumbnail_url || `https://picsum.photos/seed/${selectedType}_${Date.now()}/400/300.jpg`,
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      access_level: formData.access_level,
      max_participants: formData.max_participants,
      requires_registration: formData.requires_registration
    };

    try {
      setLoading(true);

      // Debug: Check current user before creating session
      console.log('Frontend - Current user before session creation:', {
        user: user,
        userId: user?._id,
        userIdType: typeof user?._id,
        isAuthenticated: isAuthenticated
      });

      const response = await sessionAPI.createSession(sessionData);
      toast.success('Session created successfully!');
      
      // Navigate to sessions page to see and start the session
      navigate('/sessions');
      
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error(error.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/sessions')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sessions
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Session</h1>
          <p className="text-gray-600 mt-2">Choose a session type and configure your live stream</p>
        </div>

        {/* Session Type Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Session Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.id}
                  onClick={() => handleTypeSelect(type)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedType === type.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg ${type.color} bg-opacity-10`}>
                      <Icon className={`h-6 w-6 ${type.color.replace('bg-', 'text-')}`} />
                    </div>
                    <h3 className="ml-3 font-semibold text-gray-900">{type.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session Configuration Form */}
        {selectedType && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter session title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="podcast">Podcast</option>
                    <option value="interview">Interview</option>
                    <option value="event">Event</option>
                    <option value="education">Education</option>
                    <option value="qa">Q&A</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe your session"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_start"
                    value={formData.scheduled_start}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_end"
                    value={formData.scheduled_end}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Access Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <Settings className="h-5 w-5 inline mr-2" />
                Access Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Level
                  </label>
                  <select
                    name="access_level"
                    value={formData.access_level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="public">
                      <Globe className="h-4 w-4 inline mr-1" />
                      Public
                    </option>
                    <option value="private">
                      <Lock className="h-4 w-4 inline mr-1" />
                      Private
                    </option>
                    <option value="invite_only">Invite Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                    min="1"
                    max="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="requires_registration"
                    checked={formData.requires_registration}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Require registration to join</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/sessions')}
                className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateSession;
