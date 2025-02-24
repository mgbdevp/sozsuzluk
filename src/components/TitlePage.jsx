import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { auth, db, signInWithGoogle } from '../firebase/config';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './TitlePage.css';
import { addEntry } from '../firebase/operations';
import { generateContent } from '../geminigenerated';

const TitlePage = ({ user }) => {
  const { titleId } = useParams();
  const [title, setTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const titleDoc = await getDoc(doc(db, 'titles', titleId));
        if (titleDoc.exists()) {
          setTitle({ id: titleDoc.id, ...titleDoc.data() });
        }
      } catch (error) {
        console.error('error fetching title:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTitle();
  }, [titleId]);

  const validateEntry = () => {
    if (!entry.trim()) {
      setError('entry tələb olunur');
      return false;
    }
    if (entry.length < 2) {
      setError('entry ən az 2 simvol olmalıdır'); 
      return false;
    }
    return true;
  };

  const handleAddEntry = async () => {
    if (!user) {
      alert('zəhmət olmasa əvvəlcə daxil olun');
      return;
    }

    setError('');
    if (!validateEntry()) return;

    setIsSubmitting(true);
    try {
      await addEntry(titleId, entry, user);
      if(entry.includes('@gemini')){
        generateContent(entry, titleId);
        setTimeout(() => navigate(0), 1500);
      }
      else navigate(0)
    } catch (error) {
      setError('error adding entry: ' + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="title-container">
      {loading ? (
        <div className="loading">yüklənir...</div>
      ) : !title ? (
        <div className="not-found">başlıq tapılmadı</div>
      ) : (
        <>
          <h2 className="title-name">{title.name}</h2>
          
          <div className="entries-list">
            {title.entries?.map((entry, index) => (
              <div key={index} className="entry-card">
                <div className="entry-content">{entry.content}</div>
                <div className="entry-meta">
                  <div className="entry-author-info">
                    <div className="entry-author">
                      {entry.isAI ? <span className="ai-badge">AI</span> : (
                        <Link to={`/user/${entry.authorName}`} className="author-link">
                          {entry.authorName}
                        </Link>
                      )}
                    </div>
                    <div className="entry-date">
                      {new Date(entry.createdAt).toLocaleDateString()} {new Date(entry.createdAt).toLocaleTimeString().slice(0,-3)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="add-entry-section">
            <textarea
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="entry daxil edin"
              rows="4"
              className="entry-input"
            />
            {error && <div className="error-message">{error}</div>}
            <button 
              className="add-entry-button"
              onClick={handleAddEntry}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'əlavə edilir...' : 'entry əlavə et'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TitlePage; 