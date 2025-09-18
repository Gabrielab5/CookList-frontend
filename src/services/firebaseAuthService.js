import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth } from '../config/firebase';

class FirebaseAuthService {
  constructor() {
    this.auth = auth;
    this.googleProvider = new GoogleAuthProvider();
  }

  // Register with email and password
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Update the user's display name
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
      }
      
      return {
        user: userCredential.user,
        token: await userCredential.user.getIdToken(),
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Login with email and password
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return {
        user: userCredential.user,
        token: await userCredential.user.getIdToken(),
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Login with Google
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      return {
        user: result.user,
        token: await result.user.getIdToken(),
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Send password reset email
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Update user profile
  async updateUserProfile(updates) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('No user is currently signed in');
      
      await updateProfile(user, updates);
      return user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('No user is currently signed in');

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Get current user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Get current user token
  async getCurrentUserToken() {
    const user = this.auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(this.auth, callback);
  }

  // Handle Firebase auth errors
  handleAuthError(error) {
    const errorMessages = {
      // Login errors
      'auth/user-not-found': 'לא נמצא משתמש עם כתובת האימייל הזו. אנא בדוק את כתובת האימייל או צור חשבון חדש',
      'auth/wrong-password': 'הסיסמה שגויה. אנא בדוק את הסיסמה ונסה שוב',
      'auth/invalid-credential': 'פרטי ההתחברות שגויים. אנא בדוק את כתובת האימייל והסיסמה',
      'auth/invalid-email': 'כתובת האימייל לא תקינה. אנא הזן כתובת אימייל תקינה',
      'auth/user-disabled': 'החשבון הושבת. אנא פנה לתמיכה',
      
      // Registration errors
      'auth/email-already-in-use': 'כתובת האימייל כבר בשימוש. אנא השתמש בכתובת אחרת או התחבר לחשבון הקיים',
      'auth/weak-password': 'הסיסמה חלשה מדי. אנא בחר סיסמה חזקה יותר (לפחות 6 תווים)',
      
      // General errors
      'auth/too-many-requests': 'יותר מדי ניסיונות התחברות. אנא המתן מספר דקות ונסה שוב',
      'auth/network-request-failed': 'שגיאת רשת. אנא בדוק את החיבור לאינטרנט ונסה שוב',
      'auth/operation-not-allowed': 'פעולה זו לא מותרת. אנא פנה לתמיכה',
      
      // Google auth errors
      'auth/popup-closed-by-user': 'החלון נסגר על ידי המשתמש. אנא נסה שוב',
      'auth/cancelled-popup-request': 'הבקשה בוטלה. אנא נסה שוב',
      'auth/popup-blocked': 'החלון נחסם על ידי הדפדפן. אנא אפשר חלונות קופצים ונסה שוב',
      'auth/unauthorized-domain': 'הדומיין לא מורשה. אנא פנה לתמיכה',
      
      // Password reset errors
      'auth/invalid-action-code': 'קוד הפעולה לא תקין או פג תוקף',
      'auth/expired-action-code': 'קוד הפעולה פג תוקף. אנא בקש קוד חדש',
      
      // Account linking errors
      'auth/credential-already-in-use': 'החשבון כבר קשור למשתמש אחר',
      'auth/account-exists-with-different-credential': 'קיים חשבון עם כתובת אימייל זו בשיטת התחברות אחרת',
    };

    // Get Hebrew message or fallback to English
    const message = errorMessages[error.code] || 
                   (error.message && error.message.includes('auth/') ? 
                    'שגיאת אימות. אנא בדוק את הפרטים ונסה שוב' : 
                    error.message || 'שגיאה לא ידועה. אנא נסה שוב');

    return new Error(message);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.auth.currentUser;
  }
}

export default new FirebaseAuthService();
