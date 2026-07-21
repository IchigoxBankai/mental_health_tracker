import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import FloatingStar from "../components/FloatingStar";

const JournalPage = () => {
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [entries, setEntries] = useState([]);

  const [search, setSearch] = useState("");
  const [filterMood, setFilterMood] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showStar, setShowStar] = useState(false);

  // Load entries
  useEffect(() => {
    const q = query(
      collection(db, "journalEntries"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(list);
    });

    return () => unsubscribe();
  }, []);

  // Save Entry
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      await addDoc(collection(db, "journalEntries"), {
        title,
        content,
        mood,
        image: image ? URL.createObjectURL(image) : null,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setMood("");
      setContent("");
      setImage(null);

      setShowStar(true);
      setTimeout(() => setShowStar(false), 5000);
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  // Delete Entry
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteDoc(doc(db, "journalEntries", deleteTarget));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // Mood colors
  const moodColors = {
    Happy: "bg-green-400",
    Neutral: "bg-gray-500",
    Sad: "bg-blue-400",
    Angry: "bg-red-400",
    Stressed: "bg-orange-400",
  };

  // Filter logic
  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.content?.toLowerCase().includes(search.toLowerCase());

    const matchesMood = filterMood ? e.mood === filterMood : true;

    return matchesSearch && matchesMood;
  });

  return (
    <div className="p-5 relative font-[Shantell Sans]">
      {showStar && <FloatingStar />}

      {/* Page Title */}
      <motion.h2
        className="text-3xl mb-4 text-purple-900 font-[Caveat]"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        My Journal
      </motion.h2>

      {/* Create Entry Box */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-purple-100 p-5 rounded-2xl shadow-md border border-purple-200"
      >
        <h3 className="text-xl font-[Caveat] mb-2 text-purple-900">
          Create New Entry
        </h3>

        {/* Title */}
        <input
          type="text"
          placeholder="Entry Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-xl border border-purple-300 mb-3 bg-purple-50"
        />

        {/* Mood Selector */}
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full p-3 rounded-xl border border-purple-300 mb-3 bg-purple-50"
        >
          <option value="">Select Mood</option>
          <option value="Happy">😊 Happy</option>
          <option value="Neutral">😐 Neutral</option>
          <option value="Sad">😔 Sad</option>
          <option value="Angry">😡 Angry</option>
          <option value="Stressed">😣 Stressed</option>
        </select>

        {/* Content */}
        <textarea
          rows={4}
          placeholder="Write your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 rounded-xl border border-purple-300 mb-3 bg-purple-50"
        />

        {/* Image */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="mb-3"
        />

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full bg-purple-700 text-white p-3 rounded-xl mt-2 hover:bg-purple-800 transition"
        >
          Save Entry
        </button>
      </motion.div>

      {/* Search + Mood Filter */}
      <div className="flex gap-3 mt-6 mb-2">
        <input
          type="text"
          placeholder="Search entries..."
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-3 rounded-xl border border-purple-300 bg-purple-50"
        />

        <select
          value={filterMood}
          onChange={(e) => setFilterMood(e.target.value)}
          className="p-3 rounded-xl border border-purple-300 bg-purple-50"
        >
          <option value="">All</option>
          <option value="Happy">Happy</option>
          <option value="Neutral">Neutral</option>
          <option value="Sad">Sad</option>
          <option value="Angry">Angry</option>
          <option value="Stressed">Stressed</option>
        </select>
      </div>

      {/* Entries Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5 mt-4">
        <AnimatePresence>
          {filteredEntries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-purple-50 border border-purple-200 p-4 rounded-2xl shadow-md notebook-card"
            >
              {/* Mood Tag */}
              {entry.mood && (
                <span
                  className={`px-3 py-1 text-xs text-white rounded-full ${moodColors[entry.mood]} `}
                >
                  {entry.mood}
                </span>
              )}

              <h3 className="mt-2 text-xl font-[Caveat] text-purple-900">
                {entry.title}
              </h3>

              <p className="text-sm mt-1 text-purple-700">{entry.content}</p>

              {entry.image && (
                <img
                  src={entry.image}
                  alt="uploaded"
                  className="w-full h-40 object-cover rounded-xl mt-3"
                />
              )}

              <button
                onClick={() => setDeleteTarget(entry.id)}
                className="w-full bg-red-500 text-white mt-3 p-2 rounded-xl hover:bg-red-600 transition"
              >
                Delete
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-purple-100 p-6 rounded-2xl shadow-lg border border-purple-300 text-center"
          >
            <h3 className="text-xl font-[Caveat] mb-2">Delete Entry?</h3>
            <p className="text-purple-800 mb-4">This action cannot be undone.</p>

            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-6 py-2 rounded-xl mr-2"
            >
              Delete
            </button>

            <button
              onClick={() => setDeleteTarget(null)}
              className="bg-purple-600 text-white px-6 py-2 rounded-xl"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default JournalPage;
