import { create } from './lib/zustand';
import { User } from 'firebase/auth';
import { Usuario } from './firebase/firebaseInterfaces';

interface AppState {
  firebaseUser: User | null;
  appUsuario: Usuario | null;
  userGlobalLevel: string | null;
  checkingLevel: boolean;
  setFirebaseUser: (user: User | null) => void;
  setAppUsuario: (usuario: Usuario | null) => void;
  setUserGlobalLevel: (level: string | null) => void;
  setCheckingLevel: (checking: boolean) => void;
}

const useStore = create<AppState>((set) => ({
  firebaseUser: null,
  appUsuario: null,
  userGlobalLevel: null,
  checkingLevel: true,
  setFirebaseUser: (user) => set({ firebaseUser: user }),
  setAppUsuario: (usuario) => set({ appUsuario: usuario }),
  setUserGlobalLevel: (level) => set({ userGlobalLevel: level }),
  setCheckingLevel: (checking) => set({ checkingLevel: checking }),
}));

export default useStore;
