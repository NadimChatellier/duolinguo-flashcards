"use client";
import Image from "next/image";
import { fetchTranslation } from "../../api/requests";
import { useState } from "react";

const UNSPLASH_API_KEY = "WxVd3SXMasap3R5yKJW_P59SEshyqJYQixL_UHIZ_KE";

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [kanji, setKanji] = useState("");
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const speakText = (text, lang = "ja-JP") => {
    if (!text || text.toLowerCase().includes("no translation found")) return;

    if (!window.speechSynthesis) {
      alert("Sorry, your browser doesn't support speech synthesis.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const handleSearch = async () => {
    const trimmedInput = searchInput.trim();
    if (!trimmedInput) {
      setError("Please enter a word to search.");
      return;
    }

    setLoading(true);
    setError("");
    setKanji("");
    setReading("");

    setImageUrl("");

    try {
      const data = await fetchTranslation(trimmedInput);
      const first = data?.data?.[0];

      if (first) {
        const firstJap = first.japanese?.[0] || {};
        setKanji(firstJap.word || "");
        setReading(firstJap.reading || "");
      } else {
        setKanji("No translation found");
        setReading("");
      }

      const imageRes = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          trimmedInput
        )}&client_id=${UNSPLASH_API_KEY}`
      );
      const imageData = await imageRes.json();
      if (imageData.results?.length > 0) {
        setImageUrl(imageData.results[0].urls.small);
      } else {
        setImageUrl("");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6 text-center">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Flashcard Finder</h1>
          <p className="text-lg text-gray-600">
            Type a word to generate a flashcard with a Japanese translation and image.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <input
            type="text"
            placeholder="e.g. dog, school, apple"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="border border-gray-300 rounded-md px-4 py-2 w-full sm:w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Search word"
          />
          <button
            onClick={handleSearch}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            aria-label="Search"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Flashcard Result */}
        {error && <p className="text-red-500">{error}</p>}

        {!error && (kanji || reading || imageUrl) && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-4 max-w-xl mx-auto text-left">
              {imageUrl ? (
              <div className="relative w-full h-60">
                <Image
                  src={imageUrl}
                  alt={`Image related to ${searchInput}`}
                  fill
                  style={{ objectFit: "contain" }}
                  className="rounded-md"
                  priority
                />
              </div>
            ) : (
              <p className="text-gray-500 italic text-center">No image found</p>
            )}
            <h2 className="text-3xl font-bold mb-4">{searchInput}</h2>



            <div className="mb-4 space-y-2">
              {kanji && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => speakText(kanji, "ja-JP")}
                    className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                    aria-label="Listen to Kanji"
                    type="button"
                  >
                    🔊
                  </button>
                  <span className="text-4xl font-semibold text-indigo-700">{kanji}</span>
                  
                </div>
              )}

              {reading && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => speakText(reading, "ja-JP")}
                    className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                    aria-label="Listen to Reading"
                    type="button"
                  >
                    🔊
                  </button>
                  <span className="text-2xl text-gray-700">{reading}</span>
                  
                </div>
              )}
            </div>
          
          </div>
        )}
      </div>
    </main>
  );
}
