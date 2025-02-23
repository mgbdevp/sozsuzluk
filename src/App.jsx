import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, signInWithGoogle } from './firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import MainPage from './components/MainPage';
import AddEntryPage from './components/AddEntryPage';
import TitlePage from './components/TitlePage';
import UserPage from './components/UserPage';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        };

        // Check if user document exists using displayName
        const userRef = doc(db, 'users', user.displayName);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // Create new user document with displayName as ID
          await setDoc(userRef, {
            ...userData,
            createdAt: Date.now(),
            bio: ''
          });
        }

        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        // Only reload if there was a previous user (logout)
        const hadUser = localStorage.getItem('user');
        localStorage.removeItem('user');
        setUser(null);
        if (hadUser) {
          window.location.reload();
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <BrowserRouter>
      <div className="header">
        <Link to="/" className="dictionary-name">
          <img src="/logo-no-background.svg" alt="Sozsuzluk" />
        </Link>
        {user ? (
          <Link to={`/user/${user.displayName}`} className="account-name">
            {user.displayName}
          </Link>
        ) : (
          <button className="login-button" onClick={signInWithGoogle}>
            Google ilə daxil ol
          </button>
        )}
      </div>

      <Routes>
        <Route path="/" element={<MainPage user={user} />} />
        <Route path="/add-entry" element={<AddEntryPage user={user} />} />
        <Route path="/title/:titleId" element={<TitlePage user={user} />} />
        <Route path="/user/:userId" element={<UserPage currentUser={user} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
