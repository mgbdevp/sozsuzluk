import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const UserPage = ({ currentUser }) => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() };
          setUser(userData);
          setBio(userData.bio || '');
        }
      } catch (error) {
        console.error('error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleSaveBio = async () => {
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        bio: bio
      });
      setUser(prev => ({ ...prev, bio }));
      setEditing(false);
    } catch (error) {
      console.error('error updating bio:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('error signing out:', error);
    }
  };

  if (loading) {
    return <div className="loading">yüklənir...</div>;
  }

  if (!user) {
    return <div className="not-found">istifadəçi tapılmadı</div>;
  }

  const isOwnProfile = currentUser?.displayName === userId;

  return (
    <div className="user-container">
      <div className="user-profile">
        <div className="user-avatar-section">
          <div className="user-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} />
            ) : (
              <div className="avatar-placeholder">
                {user.displayName?.charAt(0)}
              </div>
            )}
          </div>
          {isOwnProfile && (
            <button 
              className="logout-button"
              onClick={handleLogout}
            >
              çıxış
            </button>
          )}
        </div>
        <div className="user-info">
          <h2 className="user-name">{user.displayName}</h2>
          <div className="user-joined">
            qoşuldu: {new Date(user.createdAt).toLocaleDateString()}
          </div>
          
          {editing ? (
            <div className="bio-edit">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="bio əlavə edin..."
                rows="3"
                className="bio-input"
              />
              <div className="bio-actions">
                <button 
                  className="cancel-button"
                  onClick={() => {
                    setEditing(false);
                    setBio(user.bio || '');
                  }}
                >
                  ləğv et
                </button>
                <button 
                  className="submit-button"
                  onClick={handleSaveBio}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'saxlanılır...' : 'saxla'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bio-section">
              <div className="user-bio">
                {user.bio || 'bio əlavə edilməyib'}
              </div>
              {isOwnProfile && (
                <button 
                  className="edit-bio-button"
                  onClick={() => setEditing(true)}
                >
                  bio edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage; 