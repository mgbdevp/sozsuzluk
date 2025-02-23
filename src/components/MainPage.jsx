import { useState, useEffect } from 'react';
import { signInWithGoogle, auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import './MainPage.css';

const MainPage = ({ user }) => {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const titlesSnapshot = await getDocs(collection(db, 'titles'));
        const titlesData = titlesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          entryCount: doc.data().entries?.length || 0,
          lastEntryTime: doc.data().entries?.length 
            ? Math.max(...doc.data().entries.map(entry => entry.createdAt))
            : 0
        }));

        // Sort by last entry time, newest first
        const sortedTitles = titlesData.sort((a, b) => b.lastEntryTime - a.lastEntryTime);
        setTitles(sortedTitles);
      } catch (error) {
        console.error('Error fetching titles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTitles();
  }, []);

  const handleAddEntry = () => {
    if (!user) {
      alert('Zəhmət olmasa əvvəlcə daxil olun');
      return;
    }
    navigate('/add-entry');
  };

  return (
    <div className="container">
      <button className="add-entry-button" onClick={handleAddEntry}>
        qaralamaca
      </button>
      
      <div className="entry-list">
        {loading ? (
          <div className="loading">başlıqlar yüklənir...</div>
        ) : titles.length > 0 ? (
          titles.map(title => (
            <Link 
              to={`/title/${title.id}`} 
              key={title.id} 
              className="entry-title"
            >
              {title.name} <span className="entry-count">({title.entryCount})</span>
            </Link>
          ))
        ) : (
          <div className="no-titles">başlıq tapılmadı</div>
        )}
      </div>
    </div>
  );
};

export default MainPage; 