import React, {useEffect, useState} from "react";
import { addWord, getWords } from "../api/api";
import "../styles/Dashboard.css";

const Dashboard = () => {
    const [input, setInput] = useState([]);
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [flipped, setFlipped] = useState({});
    
    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        if (!userId) {
            window.location.href = "/login"; // redirect if not logged in
            return;
        }
        const fetchWords = async () => {
        setLoading(true);
        try {
            const savedWords = await getWords(userId);
            setFlashcards(savedWords);
        } catch (error) {
            console.error("Failed to fetch words:", error);
        } finally {
            setLoading(false);
        }
        };
        fetchWords();
    }, [userId]);

    const handleAddWord = async () => {
        if (!input) return;

        try {
        const newWord = await addWord(input, userId);
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

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("user_id");
        window.location.href = "/login";
    };

    const toggleFlip = (index) => {
        setFlipped((prev) => ({...prev, [index]: !prev[index]}));
    }

    if (loading) return <p>Loading your words...</p>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Your saved words</h2>
                <button className="logout-btn" onClick={handleLogout}> Logout </button>
            </div>

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
                <div 
                key={index} 
                className={`flashcard ${flipped[index] ? "flipped": ""}`}
                onClick={() => toggleFlip(index)}
                >
                    <div className="flashcard-inner">
                    <div className="flashcard-front">
                        <h3>{card.word}</h3>
                        <p> Click to reveal meaning</p>
                    </div>
                    <div className="flashcard-back">
                        <p><strong>Meaning:</strong> {card.meaning}</p>
                        {card.example && (<p><strong>Example:</strong> {card.example}</p>)}
                    </div>
                    </div>
                </div>
                ))}
            </div>
        </div>
    )
}

export default Dashboard;