import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  classLevel: string;
  createdAt?: string;
  rewardPoints?: number;
  isAdmin?: boolean;
  photoURL?: string;
  authProvider?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, data: Omit<UserProfile, "id" | "email">) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch custom user profile from Firestore
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef).catch((err) => {
            console.error("Firestore getDoc error:", err);
            return null; // Return null instead of throwing to continue gracefully
          });
          
          // Check if user is an admin by querying the 'admins' collection with their email
          let isAdmin = false;
          if (firebaseUser.email) {
            const adminDocRef = doc(db, "admins", firebaseUser.email);
            const adminDocSnap = await getDoc(adminDocRef).catch((err) => {
              console.error("Firestore getDoc error (admins):", err);
              return null;
            });
            if (adminDocSnap && adminDocSnap.exists()) {
              isAdmin = true;
            }
          }

          if (docSnap && docSnap.exists()) {
            const data = docSnap.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              fullName: data.fullName || "",
              phone: data.phone || "",
              classLevel: data.classLevel || "",
              createdAt: data.createdAt || "",
              rewardPoints: data.rewardPoints || 0,
              isAdmin,
            });
          } else {
            // Profile doesn't exist in Firestore (or we got a permission error).
            // Let's attempt to self-heal and create a default profile.
            const defaultUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              fullName: firebaseUser.displayName || "Student",
              phone: "",
              classLevel: "6", // Default class
              rewardPoints: 0,
              isAdmin,
            };
            
            setUser(defaultUser);
            
            // Try to create the missing document automatically
            try {
              await setDoc(docRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                fullName: defaultUser.fullName,
                phone: defaultUser.phone,
                classLevel: defaultUser.classLevel,
                createdAt: new Date().toISOString(),
                rewardPoints: 0,
              });
              console.log("Automatically created missing Firestore profile");
            } catch (createErr) {
              console.error("Could not create missing profile (likely Firestore Rules):", createErr);
            }
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        setUser(null);
      } finally {
        setLoading(false); // ALWAYS release the loading state
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUp = async (email: string, pass: string, data: Omit<UserProfile, "id" | "email">) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;
    
    // Store extra profile info in Firestore
    const userDoc = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      fullName: data.fullName,
      phone: data.phone,
      classLevel: data.classLevel,
      createdAt: new Date().toISOString(),
      rewardPoints: 0,
    };
    
    await setDoc(doc(db, "users", firebaseUser.uid), userDoc);
    
    // Check if user is an admin
    let isAdmin = false;
    if (firebaseUser.email) {
      const adminDocRef = doc(db, "admins", firebaseUser.email);
      const adminDocSnap = await getDoc(adminDocRef).catch(() => null);
      if (adminDocSnap && adminDocSnap.exists()) {
        isAdmin = true;
      }
    }

    // Optimistically set the user state
    setUser({
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      ...data,
      createdAt: userDoc.createdAt,
      isAdmin,
    });
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    const docRef = doc(db, "users", firebaseUser.uid);
    const docSnap = await getDoc(docRef).catch(() => null);

    if (!docSnap || !docSnap.exists()) {
      // Create user document for new Google sign-ins
      const userDoc = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        fullName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || "",
        authProvider: "google",
        classLevel: "6", // Default class level
        phone: firebaseUser.phoneNumber || "",
        createdAt: new Date().toISOString(),
        rewardPoints: 0,
      };
      await setDoc(docRef, userDoc).catch(console.error);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error("You must be logged in to change your password.");
    }
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPass);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPass);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
