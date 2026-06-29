import { X } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { OrdersService } from '../../services/orders.service';
import { useNotificationStore } from '../../store/notification.store';

interface TradeModalProps {
  open: boolean;
  onClose: () => void;

  stockId: string;
  symbol: string;
  companyName: string;
  currentPrice: number;
}

export default function TradeModal({
  open,
  onClose,
  stockId,
  symbol,
  companyName,
  currentPrice,
}: TradeModalProps) {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [mode, setMode] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState('1');
  const [limitPrice, setLimitPrice] = useState<number>(currentPrice);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const cleanQuantity = Number(quantity);
  const effectivePrice = mode === 'MARKET' ? currentPrice : limitPrice;
  const estimated = cleanQuantity * effectivePrice;

  async function handlePlaceOrder() {
    if (!stockId) {
      toast.error('Stock ID missing');
      return;
    }

    if (!cleanQuantity || cleanQuantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    if (mode === 'LIMIT' && (!limitPrice || limitPrice <= 0)) {
      toast.error('Enter a valid limit price');
      return;
    }

    try {
      setLoading(true);

      const response = await OrdersService.placeOrder({
        stockId,
        orderType: side,
        orderMode: mode,
        quantity: cleanQuantity,
        limitPrice: mode === 'LIMIT' ? limitPrice : undefined,
      });

      toast.success(response.message || `${side} order placed successfully`);

      addNotification({
        id: crypto.randomUUID(),
        title: `${side} order placed`,
        message: `${cleanQuantity} ${symbol} share${
          cleanQuantity > 1 ? 's' : ''
        } ${side === 'BUY' ? 'bought' : 'sold'} at ₹${Number(
          effectivePrice
        ).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        type: side === 'BUY' ? 'success' : 'info',
        createdAt: new Date().toISOString(),
        read: false,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
        queryClient.invalidateQueries({ queryKey: ['portfolio-holdings'] }),
        queryClient.invalidateQueries({ queryKey: ['portfolio-sectors'] }),
        queryClient.invalidateQueries({ queryKey: ['wallet'] }),
      ]);

      onClose();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Order failed';

      toast.error(message);

      addNotification({
        id: crypto.randomUUID(),
        title: `${side} order failed`,
        message,
        type: 'error',
        createdAt: new Date().toISOString(),
        read: false,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleQuantityChange(value: string) {
    if (value === '') {
      setQuantity('');
      return;
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed)) return;

    if (parsed < 1) {
      setQuantity('1');
      return;
    }

    setQuantity(String(Math.floor(parsed)));
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-black">{symbol}</h2>
            <p className="text-slate-400 text-sm">{companyName}</p>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSide('BUY')}
              className={`py-3 rounded-xl font-bold transition ${
                side === 'BUY'
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              BUY
            </button>

            <button
              onClick={() => setSide('SELL')}
              className={`py-3 rounded-xl font-bold transition ${
                side === 'SELL'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              SELL
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('MARKET')}
              className={`py-2 rounded-xl text-sm font-bold transition ${
                mode === 'MARKET'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              MARKET
            </button>

            <button
              onClick={() => setMode('LIMIT')}
              className={`py-2 rounded-xl text-sm font-bold transition ${
                mode === 'LIMIT'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              LIMIT
            </button>
          </div>

          <div>
            <label className="block text-slate-400 mb-2">Quantity</label>

            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          {mode === 'LIMIT' && (
            <div>
              <label className="block text-slate-400 mb-2">Limit Price</label>

              <input
                type="number"
                min={1}
                step="0.05"
                value={limitPrice}
                onChange={(e) => setLimitPrice(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-2xl p-4">
              <p className="text-slate-400">Current Price</p>
              <p className="text-2xl font-black">
                ₹{currentPrice.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-4">
              <p className="text-slate-400">Estimated Value</p>
              <p className="text-2xl font-black">
                ₹{estimated.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black transition disabled:opacity-60 ${
              side === 'BUY'
                ? 'bg-green-600 hover:bg-green-500'
                : 'bg-red-600 hover:bg-red-500'
            }`}
          >
            {loading ? 'Placing Order...' : `Place ${side} Order`}
          </button>
        </div>
      </div>
    </div>
  );
}