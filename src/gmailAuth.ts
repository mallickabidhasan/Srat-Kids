import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

const provider = new GoogleAuthProvider();
// Add Gmail scopes
provider.addScope('https://mail.google.com/');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.compose');
provider.addScope('https://www.googleapis.com/auth/gmail.modify');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initGmailAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignInForGmail = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain access token from Google Auth.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Gmail Google Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGmailAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setGmailAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const gmailLogout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
