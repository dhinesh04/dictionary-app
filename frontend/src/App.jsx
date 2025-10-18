import React, { useState, useEffect } from "react";
import { addWord, getWords } from "./api/dictionary";
import "./styles/App.css"; // import the CSS file

function App() {
  const [input, setInput] = useState("");
  const [flashcards, setFlashcards] = useState([]);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const savedWords = await getWords();
        setFlashcards(savedWords);
      } catch (error) {
        console.error("Failed to fetch words:", error);
      }
    };
    fetchWords();
  }, []);

  const handleAddWord = async () => {
    if (!input) return;

    try {
      const newWord = await addWord(input);
      if (!newWord.error) {
        setFlashcards([newWord, ...flashcards]);
        setInput("");
      } else {
        alert(newWord.error);
      }
    } catch (error) {
      console.error("Error adding word:", error);
      alert("Failed to add word");
    }
  };

  return (
    <div className="app-container">
      <h1>Dictionary Flashcards</h1>

      {/* Input Section */}
      <div className="input-section">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a word"
          className="word-input"
        />
        <button onClick={handleAddWord} className="add-button">
          Add Word
        </button>
      </div>

      {/* Flashcards Section */}
      <div className="flashcards-container">
        {flashcards.map((card, index) => (
          <div key={index} className="flashcard">
            <h3>{card.word}</h3>
            <p><strong>Meaning:</strong> {card.meaning}</p>
            {card.example && <p><strong>Example:</strong> {card.example}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
