import { useEffect, useRef, useState } from 'react';
import { useMarketStore } from '../../store/market.store';

interface LivePriceCellProps {
  symbol: string;
  fallbackPrice: string | number;
}

export default function LivePriceCell({
  symbol,
  fallbackPrice,
}: LivePriceCellProps) {
  const liveTick = useMarketStore((state) => state.livePrices[symbol]);
  const previousPriceRef = useRef<number | null>(null);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  const price = liveTick?.price ?? Number(fallbackPrice);

  useEffect(() => {
    if (previousPriceRef.current === null) {
      previousPriceRef.current = price;
      return;
    }

    if (price > previousPriceRef.current) {
      setFlash('up');
    }

    if (price < previousPriceRef.current) {
      setFlash('down');
    }

    previousPriceRef.current = price;

    const timer = setTimeout(() => {
      setFlash(null);
    }, 600);

    return () => clearTimeout(timer);
  }, [price]);

  return (
    <span
      className={`font-black transition-all duration-300 ${
        flash === 'up'
          ? 'text-green-400 bg-green-500/10 px-2 py-1 rounded-lg'
          : flash === 'down'
          ? 'text-red-400 bg-red-500/10 px-2 py-1 rounded-lg'
          : 'text-white'
      }`}
    >
      ₹
      {Number(price).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}