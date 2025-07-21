
import './styles/App.css'
import React from 'react';
import { useState } from 'react';
import FlashCard from './components/FlashCard';

// Backend API configuration - using Vite proxy
const API_BASE_URL = '/api';

function App() {
  // returns a list of flashcards
  const [input, setInput] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddWord = async () => {
    if (!input.trim()) {
      setError('Please enter a word');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log(`Fetching word: ${input.toLowerCase()}`);
      console.log(`API URL: ${API_BASE_URL}/word/${input.toLowerCase()}`);
      
      const response = await fetch(`${API_BASE_URL}/word/${input.toLowerCase()}`);
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response ok: ${response.ok}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const wordData = await response.json();
      console.log('Received word data:', wordData);
      
      // Check if the word already exists in flashcards
      const existingWordIndex = flashcards.findIndex(
        card => card.word.toLowerCase() === wordData.word.toLowerCase()
      );

      if (existingWordIndex !== -1) {
        setError('Word already added to your flashcards');
      } else {
        setFlashcards([...flashcards, wordData]);
        setInput('');
        setError('');
      }
    } catch (err) {
      console.error('Error fetching word:', err);
      
      if (err.message.includes('Failed to fetch')) {
        setError('Cannot connect to the dictionary service. Please check if the backend server is running on port 5000.');
      } else if (err.message.includes('404')) {
        setError('Word not found in the dictionary. Please try a different word.');
      } else if (err.message.includes('500')) {
        setError('Dictionary service error. Please try again later.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddWord();
    }
  }

  const clearError = () => setError('');

  const removeFlashcard = (indexToRemove) => {
    setFlashcards(flashcards.filter((_, index) => index !== indexToRemove));
  };

  const testConnection = async () => {
    try {
      console.log('Testing connection to backend...');
      const response = await fetch(`${API_BASE_URL}/health`);
      console.log('Health check response:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Health check data:', data);
        setError('✅ Connection successful! Backend is reachable.');
      } else {
        setError('❌ Backend responded but with an error status.');
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setError('❌ Cannot connect to backend. Make sure the server is running on port 5000.');
    }
  };
  return (
    <div className='app'>
      <div className='input-section'>
        <input 
          type="text"
          placeholder='Enter your word..'
          value={input}
          // This line is used to set the state of the input in sync with the user's input
          onChange={(e) => {
            setInput(e.target.value);
            if (error) clearError();
          }}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
      </div>
      
      <button 
        onClick={handleAddWord} 
        disabled={loading || !input.trim()}
        className={loading ? 'loading' : ''}
      >
        {loading ? 'Loading...' : 'Add Word'}
      </button>
      
      <button 
        onClick={testConnection}
        style={{ marginLeft: '10px', backgroundColor: '#28a745' }}
      >
        Test Connection
      </button>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className='card-container'>
        {flashcards.map((card, index) => (
          <FlashCard 
            key={index} 
            wordData={card} 
            onRemove={removeFlashcard}
            index={index}
          />
        ))}
      </div>
      
      {flashcards.length === 0 && !loading && (
        <div className="empty-state">
          <p>No flashcards yet. Start by adding a word!</p>
        </div>
      )}
    </div>
  )
}

export default App
