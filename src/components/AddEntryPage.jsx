import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { addEntry } from '../firebase/operations';
import { generateContent } from '../geminigenerated';
import './AddEntryPage.css';

const AddEntryPage = ({ user }) => {
  const [title, setTitle] = useState('');
  const [entry, setEntry] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateInputs = () => {
    if (!title.trim()) {
      setError('Başlıq tələb olunur');
      return false;
    }
    if (!entry.trim()) {
      setError('Entry tələb olunur');
      return false;
    }
    if (title.length < 2) {
      setError('Başlıq ən az 2 simvol olmalıdır');
      return false;
    }
    if (entry.length < 2) {
      setError('Entry ən az 2 simvol olmalıdır');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateInputs()) return;

    setIsSubmitting(true);
    try {
      await addEntry(title, entry, user);
      if(entry.includes('@gemini')){
        generateContent(entry, title);
        setTimeout(() => navigate('/title/'+title), 1500);
      }
      else navigate('/title/'+title);
    } catch (error) {
      setError('Error adding entry: ' + error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-entry-container">
      <p>ipucu: @gemini yazaraq gemini-ı oyada bilərsən..</p>
      <form onSubmit={handleSubmit} className="add-entry-form">
        <div className="form-group">
          <label htmlFor="title">başlıq</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="başlıq daxil edin"
          />
        </div>

        <div className="form-group">
          <label htmlFor="entry">entry</label>
          <textarea
            id="entry"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="entry daxil edin"
            rows="6"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/')} className="cancel-button">
            ləğv et
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'əlavə edilir...' : 'əlavə et'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEntryPage; 