import React, {useState} from "react";
import '../styles/FlashCard.css';

const FlashCard = ({ wordData }) => {
    const [flipped, setFlipped] = useState(false);

    if (!wordData) return null;

    return (
        <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
            <div className="front">
                <h3>{wordData.word}</h3>
            </div>
            <div className="back">
                <p><strong>Meaning:</strong> {wordData.meaning}</p>
                {wordData.example && <p><strong>Example:</strong> {wordData.example}</p>}
            </div>
        </div>
    )
}

export default FlashCard;