import { auth } from '../lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  setPersistence, 
  browserSessionPersistence
} from 'firebase/auth';

// Ensure strict multi-tab isolation using Session Persistence
setPersistence(auth, browserSessionPersistence).catch(console.error);

export const authService = {
  loginWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    // In Login.tsx we will catch 'auth/multi-factor-auth-required'
    const result = await signInWithPopup(auth, provider);
    return result.user;
  },
  
  loginWithEmail: async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  },

  registerWithEmail: async (email: string, pass: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return result.user;
  },

  logout: async () => {
    await signOut(auth);
    sessionStorage.removeItem('dfns_auth'); // clear our custom session storage key
  }
};
