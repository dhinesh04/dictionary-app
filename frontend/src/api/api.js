import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

// Dictionary addWord api
export const addWord = async (word, userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/enter`, {
            params: { word: word.toLowerCase(), user_id: userId }});
        return response.data;
    } catch (err) {
        console.error(err);
        return { error: "Failed to fetch word"}
    }
}

// Dictionary getWords api
export const getWords = async (userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/get_words/${userId}`);
        return response.data
    } catch (err) {
        console.error(err);
        return [];
    }
}

// Login api
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    return response.data;
  } catch (err) {
    console.error(err);
    return { error: err.response?.data?.detail || "Login failed" };
  }
};

// Register api
export const registerUser = async (username, email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, { username, email, password });
    return response.data;
  } catch (err) {
    console.error(err);
    return { error: err.response?.data?.detail || "Registration failed" };
  }
};