import { create } from 'zustand';
import type { User, Wallet } from '../types';

interface AuthState {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, token: string, wallet: Wallet) => void;
  setUserWallet: (user: User, wallet: Wallet) => void;
  setWallet: (wallet: Wallet) => void;
  logout: () => void;
}

const savedToken = localStorage.getItem('ts_token');
const savedUser = localStorage.getItem('ts_user');
const savedWallet = localStorage.getItem('ts_wallet');

export const useAuthStore = create<AuthState>((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  wallet: savedWallet ? JSON.parse(savedWallet) : null,
  token: savedToken,
  isAuthenticated: Boolean(savedToken),

  setAuth: (user, token, wallet) => {
    localStorage.setItem('ts_token', token);
    localStorage.setItem('ts_user', JSON.stringify(user));
    localStorage.setItem('ts_wallet', JSON.stringify(wallet));

    set({ user, token, wallet, isAuthenticated: true });
  },

  setUserWallet: (user, wallet) => {
    localStorage.setItem('ts_user', JSON.stringify(user));
    localStorage.setItem('ts_wallet', JSON.stringify(wallet));

    set({ user, wallet, isAuthenticated: true });
  },

  setWallet: (wallet) => {
    localStorage.setItem('ts_wallet', JSON.stringify(wallet));
    set({ wallet });
  },

  logout: () => {
    localStorage.removeItem('ts_token');
    localStorage.removeItem('ts_user');
    localStorage.removeItem('ts_wallet');

    set({
      user: null,
      wallet: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));