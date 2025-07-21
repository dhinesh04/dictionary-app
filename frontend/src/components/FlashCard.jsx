import React from "react";
import '../styles/FlashCard.css';

const FlashCard = ({ wordData, onRemove, index }) => {
    if (!wordData) return null;

    return (
        <div className="panel">
            <div className="card-header">
                <h2 className="word-title">{wordData.word}</h2>
                {onRemove && (
                    <button 
                        className="remove-btn"
                        onClick={() => onRemove(index)}
                        title="Remove this flashcard"
                    >
                        ✕
                    </button>
                )}
            </div>
            <p><strong>Meaning:</strong> {wordData.meaning}</p>
            <p><strong>Example:</strong> {wordData.example}</p>
            <p><strong>Synonyms:</strong> {wordData.synonyms && wordData.synonyms.length > 0 ? wordData.synonyms.join(', ') : 'None'}</p>
        </div>
    )
}

export default FlashCard;