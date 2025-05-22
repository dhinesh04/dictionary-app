
import './styles/App.css'
import React from 'react';
import { useState } from 'react';
import FlashCard from './components/FlashCard';

function App() {
  // returns a list of flashcards
  const [input, setInput] = useState('');
  const [flashcards, setFlashcards] = useState([]);

  const handleAddWord = () => {
    // Mock data for now
    if (input.trim()) {
      const mockData = {
        word: input,
        meaning: 'This is a mock meaning',
        example: 'This is a mock example sentence',
        synonyms: ['x','y','z']
      }
      setFlashcards([...flashcards, mockData])
      setInput('');
    }
  }
  return (
    <div className='app'>
      <div className='input-section'>
        <input 
        type="text"
        placeholder='Enter your word..'
        value={input}
        // This line is used to set the state of the input in sync with the user's input
        onChange={(e) => setInput(e.target.value)}/>
      </div>
      <button onClick={handleAddWord}>Add Word</button>
      <div className='card-container'>
        {flashcards.map((card, index) => (
          <FlashCard key={index} wordData={card} />
        ))}
      </div>
    </div>
  )
}

export default App
