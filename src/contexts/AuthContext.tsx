
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type UserData = {
  uid: string;
  email: string | null;
  displayName: string | null;
  username: string | null;
  photoURL: string | null;
};

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, username: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("useAuth called outside of AuthProvider");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const createUserDocument = async (user: User, displayName?: string, username?: string) => {
    try {
      console.log("AuthContext: Creating user document for:", user.uid);
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName || "Anonymous Student",
        username: username || `student_${user.uid.slice(0, 8)}`,
        photoURL: user.photoURL,
      };

      await setDoc(doc(db, "users", user.uid), userData, { merge: true });
      console.log("AuthContext: User document created successfully:", userData);
      setUserData(userData);
      return userData;
    } catch (error) {
      console.error("AuthContext: Error creating user document:", error);
      // Create fallback userData even if Firebase fails
      const fallbackUserData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName || "Anonymous Student",
        username: username || `student_${user.uid.slice(0, 8)}`,
        photoURL: user.photoURL,
      };
      setUserData(fallbackUserData);
      return fallbackUserData;
    }
  };

  const fetchUserData = async (user: User) => {
    try {
      console.log("AuthContext: Fetching user data for:", user.uid);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        console.log("AuthContext: User data fetched:", data);
        setUserData(data);
        return data;
      } else {
        console.log("AuthContext: No user data found, creating document for:", user.uid);
        return await createUserDocument(user);
      }
    } catch (error) {
      console.error("AuthContext: Error fetching user data:", error);
      // Always create fallback userData for posting to work
      return await createUserDocument(user);
    }
  };

  const refreshUserData = async () => {
    if (currentUser) {
      await fetchUserData(currentUser);
    }
  };

  useEffect(() => {
    console.log("AuthContext: Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("AuthContext: Auth state changed:", user?.uid || "No user");
      setCurrentUser(user);
      
      if (user) {
        // Always ensure we have userData when user is authenticated
        try {
          await fetchUserData(user);
        } catch (error) {
          console.error("AuthContext: Failed to fetch user data, creating fallback:", error);
          // Create minimal userData to allow posting
          const fallbackUserData: UserData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "Anonymous Student",
            username: `student_${user.uid.slice(0, 8)}`,
            photoURL: user.photoURL,
          };
          setUserData(fallbackUserData);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string, username: string) => {
    console.log("AuthContext: Creating new user account");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("AuthContext: User created, updating profile...");
    await updateProfile(user, {
      displayName: displayName
    });

    await createUserDocument(user, displayName, username);
  };

  const logIn = async (email: string, password: string) => {
    console.log("AuthContext: Logging in user");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logOut = async () => {
    console.log("AuthContext: Logging out user");
    await signOut(auth);
  };

  const value = {
    currentUser,
    userData,
    loading,
    signUp,
    logIn,
    logOut,
    refreshUserData,
  };

  console.log("AuthContext: Rendering with loading:", loading, "user:", currentUser?.uid, "userData:", userData?.username);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
