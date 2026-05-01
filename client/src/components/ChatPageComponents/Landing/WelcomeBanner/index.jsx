import React from "react";
import "./WelcomeBanner.css";

const WelcomeBanner = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1>
          Welcome to <span>KaiseHo!</span> 👋
        </h1>
        <p>Your friendly place to start conversations.</p>
      </div>
    </div>
  );
};

export default WelcomeBanner;
