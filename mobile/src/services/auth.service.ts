import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { apiConfig, getAuthHeaders } from '../config/api';
import { User } from '../types';

const API_BASE_URL = apiConfig.baseURL;

export class AuthService {
  static async register(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // backend'de user oluştur
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: await getAuthHeaders(idToken),
      });

      if (!response.ok) {
        throw new Error('Failed to create user in backend');
      }

      return await response.json();
    } catch (error: any) {
      // hack: firebase error'ları bazen düzgün gelmiyor, type guard lazım
      const authError = error as AuthError;
      throw this.handleAuthError(authError);
    }
  }

  static async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // backend'den user'ı al veya oluştur
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: await getAuthHeaders(idToken),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user from backend');
      }

      return await response.json();
    } catch (error) {
      // hack: error type'ı bazen belirsiz oluyor, kontrol etmek lazım
      if (error && typeof error === 'object' && 'code' in error) {
        const authError = error as AuthError;
        throw this.handleAuthError(authError);
      }
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      // logout hata verirse de throw et, kullanıcı bilgilendirilmeli
      throw new Error('Failed to sign out');
    }
  }

  static async getIdToken(): Promise<string | null> {
    // hack: firebase bazen null döndürüyor, kontrol etmek lazım
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    return user.getIdToken();
  }

  // auth state değişikliklerini dinle
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // firebase error kodlarını kullanıcı dostu mesajlara çevir
  private static handleAuthError(error: AuthError): Error {
    const code = error.code;
    
    switch (code) {
      case 'auth/email-already-in-use':
        return new Error('This email is already registered. Please use a different email or sign in.');
      case 'auth/invalid-email':
        return new Error('Invalid email address. Please check your email format.');
      case 'auth/weak-password':
        return new Error('Password is too weak. Please use at least 6 characters.');
      case 'auth/user-not-found':
        return new Error('No account found with this email. Please sign up first.');
      case 'auth/wrong-password':
        return new Error('Incorrect password. Please try again.');
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later.');
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your internet connection.');
      default:
        return new Error(error.message || 'An authentication error occurred. Please try again.');
    }
  }

  // password validation - basit ama yeterli
  static validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters' };
    }
    if (password.length > 128) {
      return { isValid: false, message: 'Password must be less than 128 characters' };
    }
    return { isValid: true };
  }

  // email validation - regex basit ama çoğu durumda yeterli
  static validateEmail(email: string): { isValid: boolean; message?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    return { isValid: true };
  }
}

