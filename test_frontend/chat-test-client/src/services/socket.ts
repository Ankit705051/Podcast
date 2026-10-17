import { io, Socket } from 'socket.io-client';
import { getToken } from '../utils/auth.utils';

const SOCKET_URL = 'http://localhost:3000';

export const socket: Socket = io(SOCKET_URL, {
   autoConnect: false,
   transports: ['websocket', 'polling']
});

export const connectSocket = () => {
    const token=getToken();
    if (token) {
        socket.auth = { token };
    }
    socket.connect();
}