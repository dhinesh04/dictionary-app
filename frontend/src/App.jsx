import {BrowserRouter as Router, Routes, Route, Navigate, Link} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";
import "./styles/App.css"; // import the CSS file


function Home() {
  const userId = localStorage.getItem("user_id");

  if (userId) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="home-container">
      <h1>Welcome to Dictionary App</h1>
      <div className="home-buttons">
        <Link to="/login">
          <button className="home-btn">Login</button>
        </Link>
        <Link to="/register">
          <button className="home-btn">Register</button>
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
