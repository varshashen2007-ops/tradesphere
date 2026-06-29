import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useMarketStore } from '../store/market.store';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface PriceTick {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  timestamp: string;
}

export function useSocket() {
  const updatePrices = useMarketStore((state) => state.updatePrices);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('market:tick', (ticks: PriceTick[]) => {
      updatePrices(ticks);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [updatePrices]);
}