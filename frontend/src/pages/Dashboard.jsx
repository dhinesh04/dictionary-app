import React, {useEffect, useState} from "react";
import { addWord, getWords } from "../api/api";
import "../styles/Dashboard.css";
import FlashCard from "../components/FlashCard";

const Dashboard = () => {
    const [input, setInput] = useState("");
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    
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
        const lowerInput = input.toLowerCase();
        const alreadyExists = flashcards.some(card => card.word.toLowerCase() === lowerInput);
        if (alreadyExists) {
            alert(`"${lowerInput}" is already saved!`);
            setInput("");
            return;
        }
        try {
        const newWord = await addWord(input.toLowerCase(), userId);
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

    if (loading) return <p>Loading your words...</p>;

    const groupedByMonth = flashcards.reduce((acc, card) => {
        const monthYear = new Date(card.date_added).toLocaleString("default", { month: "long", year: "numeric" });
        if (!acc[monthYear]) acc[monthYear] = [];
        acc[monthYear].push(card);
        return acc;
    }, {});

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
                {Object.keys(groupedByMonth).map((month) => (
                    <div key={month}>
                        <h3>{month}</h3>
                        <div className="month-flashcards">
                            {groupedByMonth[month].map((card, index) => (
                                <FlashCard key={index} wordData={card}/>
                        ))}
                        </div>
                    </div>
            ))}
            </div>
    </div>
)}

export default Dashboard;