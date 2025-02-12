import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import "./ThemeToggle.css";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  useEffect(() => {
    if (isDark) {
      document.body.style.backgroundColor = "#333";
      document.body.style.color = "#fff";
    } else {
      document.body.style.backgroundColor = "#fff";
      document.body.style.color = "#000";
    }
  }, [isDark]);

  return (
    <div className="theme-toggle" onClick={toggleTheme}>
      <img
        src={isDark ? assets.sun_icon : assets.moon_icon}
        alt={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="theme-icon"
      />
    </div>
  );
};

export default ThemeToggle;
