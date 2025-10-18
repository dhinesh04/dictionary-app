import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

export const addWord = async (word) => {
    try {
        const response = await axios.get(`${BASE_URL}/enter`, {
            params: { word }});
        return response.data;
    } catch (err) {
        console.error(err);
        return { error: "Failed to fetch word"}
    }
}

export const getWords = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/get_words`);
        return response.data
    } catch (err) {
        console.error(err);
        return [];
    }
}