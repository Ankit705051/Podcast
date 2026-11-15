import React, { useState, useEffect, useRef } from 'react';
import socketService from '../services/socket';
import './Chat.css';

const Chat = ({ sessionId, messages: propMessages = [], onSendMessage, onClose, user }) => {
    const [newMessage, setNewMessage] = useState('');
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

  useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [propMessages]);
    useEffect(() => {
        if (!sessionId) return;
 
        const handleTyping = (data) => {
            setTypingUsers((prev) => {
                const without = prev.filter(u => u.userId !== data.userId);
                if (data.isTyping) return [...without, data];
                return without;
            });
        };
 
        // 'user-typing' fires for both start and stop (isTyping flag);
        // 'typing-start' alone would leave stale typing indicators.
        socketService.on('user-typing', handleTyping);
        socketService.on('typing-start', handleTyping);

        return () => {
            socketService.off('user-typing', handleTyping);
            socketService.off('typing-start', handleTyping);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [sessionId]);
    const handleTyping = (value) => {
        setNewMessage(value);
        if (value.trim()) {
            socketService.startTyping(sessionId);
        }
 
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketService.stopTyping(sessionId);
        }, 1000);
    };
 
    const handleSendMessage = (e) => {
        e.preventDefault();
        const trimmed = newMessage.trim();
        if (!trimmed || !onSendMessage || !socketService.isConnected()) return;
 
        onSendMessage(trimmed);
        setNewMessage('');
        clearTimeout(typingTimeoutRef.current);
        socketService.stopTyping(sessionId);
    };
    return (
        <div className="chat-container">
            {/* Header */}
            <div className="chat-header">
                <h3>Session Chat</h3>
                <span className={socketService.isConnected() ? 'connected' : 'disconnected'}>
                    {socketService.isConnected() ? '🟢 Connected' : '🔴 Disconnected'}
                </span>
                <button onClick={onClose}>×</button>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {propMessages.map((msg) => {
                    // Socket payloads send userId as an object; history sends
                    // it as a string id — handle both.
                    const senderId = typeof msg.userId === 'object'
                        ? (msg.userId?._id || msg.userId?.id)
                        : msg.userId;
                    return (
                    <div key={msg._id || msg.id} className={`message ${senderId === user?._id ? 'own' : 'other'}`}>
                        <div className="message-info">
                            <span className="username">{msg.userId?.name || msg.userName || msg.name || 'Unknown'}</span>
                            <span className="time">{new Date(msg.timestamp || msg.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                    </div>
                    );
                })}

                {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                        {typingUsers.map((typingUser, index) => (
                            <span key={typingUser.userId}>
                                {typingUser.userName} {index === typingUsers.length - 1 ? 'is typing...' : ', '}
                            </span>
                        ))}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="chat-input-form">
                <div className="input-container">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => handleTyping(e.target.value)}
                        placeholder="Type a message..."
                        className="chat-input"
                        disabled={!socketService.isConnected()}
                    />
                    <button 
                        type="submit" 
                        className="send-button"
                        disabled={!newMessage.trim() || !socketService.isConnected()}
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat;
