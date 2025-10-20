import React, {useState} from "react";
import { registerUser } from "../api/api";
import "../styles/Auth.css";
import { useNavigate } from "react-router-dom"; 

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate(); 

    const handleRegister = async (e) => {
        e.preventDefault();
        const res = await registerUser(username, email, password);
        if (res.error) {
            setError(res.error);
            setMessage("");
            } else {
            setMessage("User registered successfully");
            setError("");
            navigate("/login");
            }
        };

    return (
        <div className="auth-container">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <input 
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
            </form>
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
        </div>
    )
}

export default Register;