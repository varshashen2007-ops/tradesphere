import { useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useAuthBootstrap() {
  const token = useAuthStore((state) => state.token);
  const setUserWallet = useAuthStore((state) => state.setUserWallet);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    async function loadUser() {
      if (!token) return;

      try {
        const res = await authApi.me();
        const { user, wallet } = res.data.data;

        setUserWallet(user, wallet);
      } catch {
        logout();
      }
    }

    loadUser();
  }, [token, setUserWallet, logout]);
}