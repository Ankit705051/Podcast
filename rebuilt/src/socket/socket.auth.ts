import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { prisma } from "../lib/prisma.js";

interface JwtPayload{
    id:string
}
const authenticateSocket = async (socket:Socket, next:(error?:Error) => void) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            },
            select: {
                id: true,
                email: true,
                name: true
            }
        });
        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }
        
        socket.data.user = user;
        next();
    } catch (error:  any) {
         console.log('Socket authentication error:', error.message);
        next(new Error('Authentication error: Invalid token'));
    }
};

export { authenticateSocket };
