import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../auth/firebaseConfig';

const db = getFirestore(app);

export async function saveFreelancerProfile(uid, data) {
  const ref = doc(db, 'freelancers', uid);
  const payload = {
    role: 'freelancer',
    createdAt: serverTimestamp(),
    ...data
  };
  await setDoc(ref, payload, { merge: true });
}
