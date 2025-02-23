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
        console.error('Error fetching user:', error);
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
      console.error('Error updating bio:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div className="loading">Yüklənir...</div>;
  }

  if (!user) {
    return <div className="not-found">İstifadəçi tapılmadı</div>;
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
              Çıxış
            </button>
          )}
        </div>
        <div className="user-info">
          <h2 className="user-name">{user.displayName}</h2>
          <div className="user-joined">
            Qoşuldu: {new Date(user.createdAt).toLocaleDateString()}
          </div>
          
          {editing ? (
            <div className="bio-edit">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio əlavə edin..."
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
                  Ləğv et
                </button>
                <button 
                  className="submit-button"
                  onClick={handleSaveBio}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saxlanılır...' : 'Saxla'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bio-section">
              <div className="user-bio">
                {user.bio || 'Bio əlavə edilməyib'}
              </div>
              {isOwnProfile && (
                <button 
                  className="edit-bio-button"
                  onClick={() => setEditing(true)}
                >
                  Bio redaktə et
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