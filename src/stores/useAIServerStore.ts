import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AIServerState {
  serverIp: string;
  serverPort: string;
  setServerIp: (serverIp: string) => void;
  setServerPort: (serverPort: string) => void;
}

export const useAIServerStore = create<AIServerState>()(
  persist(
    (set: any, get: any) => ({
      serverIp: 'ws://157.66.100.182',
      serverPort: '8000',

      setServerIp: (serverIp: string) => set({ serverIp }),
      setServerPort: (serverPort: string) => set({ serverPort }),

      getServerUrl: () => `${get().serverIp}:${get().serverPort}`,
    }),
    {
      name: 'cv_ai_server',
    },
  ),
);
