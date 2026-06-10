import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (
  room: string | null,
  onUpdate?: (data: unknown) => void,
) => {
  const ref = useRef<Socket | null>(null);

  useEffect(() => {
    if (!room) return;
    const socket = io(SOCKET_URL);
    ref.current = socket;

    if (room === 'ops') socket.emit('join:ops');
    else socket.emit('join:store', room);

    if (onUpdate) socket.on('attendance:update', onUpdate);

    return () => { socket.disconnect(); };
  }, [room, onUpdate]);

  return ref.current;
};
