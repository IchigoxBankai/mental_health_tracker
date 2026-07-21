import { db, auth } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const saveChatMessage = async (message, sender) => {

  const user = auth.currentUser;
  if (!user) return;

  await addDoc(collection(db, "chatMessages"), {
    userId: user.uid,
    message,
    sender,
    timestamp: serverTimestamp()
  });
};
