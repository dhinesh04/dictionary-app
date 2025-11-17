import React from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, signInWithPopup } from "../firebase";
import { googleLogin } from "../api/api";

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      // 1. Sign in with Google in Firebase (frontend)
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 2. Get Firebase ID token
      const idToken = await user.getIdToken();

      // (Optional) store some profile info locally if you like
      localStorage.setItem("user_email", user.email || "");
      localStorage.setItem("user_name", user.displayName || "");

      // 3. Send ID token to your backend to create/find user + issue JWT
      const res = await googleLogin(idToken);

      if (res.error) {
        alert(res.error);
        return;
      }

      // 4. Backend already stored access_token & user_id in googleLogin()
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google login failed. Check console for details.");
    }
  };

  return (
    <button className="home-btn google-btn" onClick={handleGoogleLogin}>
      Continue with Google
    </button>
  );
};

export default GoogleLoginButton;
