import React from "react";
import '../styles/FlashCard.css';

const FlashCard = ({ wordData }) => {
    if (!wordData) return null;

    return (
        <div className="panel">
            <h2 className="word-title">{wordData.word}</h2>
            <p><strong>Meaning:</strong> {wordData.meaning}</p>
            <p><strong>Example:</strong> {wordData.example}</p>
            <p><strong>Synonyms:</strong> {wordData.synonyms.join(', ') || 'None'}</p>
        </div>
    )
}

export default FlashCard;