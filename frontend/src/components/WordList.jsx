import React from "react";
import FlashCard from "./FlashCard";

const WordList = ({ words }) => {
    return (
        <div style={{display: "flex", flexWrap: "wrpa"}}>
            {words.map((w) => (
                <FlashCard key={w.id} wordData={w} />
            ))}
        </div>
    )
}

export default WordList;