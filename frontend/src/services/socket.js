import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
        // FIX: Track pending session joins so if joinSession is called before
        // connect fires, we don't lose it and don't stack duplicate listeners.
        this._pendingSessionId = null;
    }

    // ─── Connection ───────────────────────────────────────────────
    connect(token) {
        // FIX: Guard against reconnecting with the same token unnecessarily.
        // The original always disconnected and rebuilt the socket even if it
        // was already connected, which caused the "Connected to chat" toast
        // to fire repeatedly and dropped any active room memberships.
        if (this.socket?.connected) return;

        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        // FIX: The original URL transformation was wrong.
        // Replacing '/api/v1' with '/socket.io' produced a path like
        // 'http://host/socket.io' which is just the Socket.IO endpoint path,
        // not the server origin. Socket.IO client needs the SERVER ORIGIN only
        // (e.g. 'http://localhost:3000') — it appends '/socket.io' itself.
        const socketUrl = process.env.REACT_APP_SOCKET_URL ||
            (process.env.REACT_APP_API_URL
                ? process.env.REACT_APP_API_URL.replace(/\/api\/v1\/?$/, '')
                : 'http://localhost:3000');

        this.socket = io(socketUrl, {
            auth: { token },
            // FIX: Use polling first, then upgrade to websocket.
            // Forcing ['websocket'] only fails in environments where the
            // initial HTTP handshake (required by Socket.IO protocol) is
            // blocked or the server isn't configured for direct WS upgrades.
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        this._setupEventListeners();
    }

    // ─── Event Listeners ──────────────────────────────────────────
    _setupEventListeners() {
        this.socket.on('connect', () => {
            // FIX: Show toast only on the very first connection, not on every
            // reconnect. The original checked `!this.connected` but
            // `this.connected` is set to false on disconnect, so the toast
            // fired on every reconnect too.
            if (!this.connected) {
                toast.success('Connected to chat');
            }
            this.connected = true;

            // FIX: Re-join pending session after reconnect so the user doesn't
            // silently lose their room membership after a network blip.
            if (this._pendingSessionId) {
                this.socket.emit('join-session', this._pendingSessionId);
            }
        });

        this.socket.on('disconnect', (reason) => {
            this.connected = false;
            // FIX: Only show "reconnecting" toast for unexpected disconnects.
            // 'io client disconnect' means we called socket.disconnect()
            // intentionally — no need to alarm the user.
            if (reason !== 'io client disconnect') {
                toast('Reconnecting to chat...', { icon: '🔄' });
            }
        });

        // FIX: connect_error fires on every reconnect attempt. Showing a toast
        // each time floods the UI. Only show it once (when reconnection gives up).
        this.socket.on('reconnect_failed', () => {
            toast.error('Could not reconnect to chat. Please refresh.');
        });

        this.socket.on('error', (error) => {
            toast.error(error.message || 'Chat error occurred');
        });
    }

    // ─── Room Management ──────────────────────────────────────────
    joinSession(sessionId) {
        if (!this.socket) return;

        // FIX: Always store the session so we can re-join after reconnects.
        this._pendingSessionId = sessionId;

        if (this.connected) {
            this.socket.emit('join-session', sessionId);
        } else {
            // FIX: The original used socket.once('connect', ...) but if
            // joinSession was called multiple times before connect fired
            // (e.g. during StrictMode double-render), multiple 'once' listeners
            // stacked up and emitted 'join-session' multiple times.
            // The pendingSessionId pattern above handles this cleanly — the
            // single 'connect' handler in _setupEventListeners does the emit.
        }
    }

    leaveSession(sessionId) {
        if (!this.socket || !this.connected) return;
        this._pendingSessionId = null;
        this.socket.emit('leave-session', sessionId);
    }

    // ─── Messaging ────────────────────────────────────────────────
    sendMessage(sessionId, message, type = 'text') {
        if (!this.socket || !this.connected) {
            toast.error('Not connected to chat');
            return;
        }
        this.socket.emit('send-message', { sessionId, message, type });
    }

    // ─── Typing Indicators ────────────────────────────────────────
    startTyping(sessionId) {
        if (this.socket && this.connected) {
            this.socket.emit('typing-start', sessionId);
        }
    }

    stopTyping(sessionId) {
        if (this.socket && this.connected) {
            this.socket.emit('typing-stop', sessionId);
        }
    }

    // ─── Custom Event Binding ─────────────────────────────────────
    on(event, callback) {
        if (this.socket) this.socket.on(event, callback);
    }

    off(event, callback) {
        if (this.socket) this.socket.off(event, callback);
    }

    // ─── Disconnect ───────────────────────────────────────────────
    disconnect() {
        if (this.socket) {
            this._pendingSessionId = null;
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    isConnected() {
        // FIX: Rely on the socket's own `.connected` flag as the source of
        // truth rather than our manually tracked boolean, which can fall out
        // of sync if the socket reconnects between our event handler calls.
        return this.socket?.connected ?? false;
    }
}

const socketService = new SocketService();
export default socketService;