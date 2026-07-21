import { db, auth } from "./firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export const getMoodHistory = async () => {
  const user = auth.currentUser;

  if (!user) return [];

  const q = query(
    collection(db, "moods"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => doc.data());
};
