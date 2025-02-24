import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from './config';

export const addEntry = async (title, entry, user, isAI = false) => {
  const titleRef = doc(db, 'titles', title.toLowerCase());
  const titleDoc = await getDoc(titleRef);
  
  const newEntry = {
    content: entry,
    createdAt: Date.now(),
    createdBy: user.displayName,
    authorName: user.displayName,
    isAI: isAI
  };

  if (!titleDoc.exists()) {
    // Create new title document with first entry
    await setDoc(titleRef, {
      name: title.toLowerCase(),
      createdAt: Date.now(),
      createdBy: user.displayName,
      entries: [newEntry]
    });
  } else {
    // Add new entry to existing title document
    await setDoc(titleRef, {
      entries: arrayUnion(newEntry)
    }, { merge: true });
  }
  return newEntry;
}; 