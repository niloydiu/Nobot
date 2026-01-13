import { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { context } from "../../context/Context";
import "./Main.css";

const Main = () => {
  const [copied, setCopied] = useState(false);
  const {
    onSend,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    newChat,
    extended,
    setExtended,
  } = useContext(context);

  const handleCopy = (text) => {
    const tempEl = document.createElement("div");
    tempEl.innerHTML = text;
    const plainText = tempEl.textContent || tempEl.innerText || "";
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) onSend();
    }
  };

  const suggestions = [
    { text: "Suggest beautiful places for a road trip", icon: assets.compass_icon },
    { text: "Briefly summarize city planning concepts", icon: assets.bulb_icon },
    { text: "Brainstorm bonding activities for a team", icon: assets.message_icon },
    { text: "Improve readability of my coding project", icon: assets.code_icon }
  ];

  return (
    <div className="main-viewport">
      <header className="main-nav">
        <div className="nav-left">
          <img 
            className="mobile-menu-toggle" 
            src={assets.menu_icon} 
            alt="menu" 
            onClick={() => setExtended(!extended)}
          />
          <div className="brand-group" onClick={newChat}>
            <img className="nav-logo" src={assets.nlogo} alt="logo" />
            <span className="brand-name">Nobot</span>
          </div>
        </div>
        <div className="nav-right">
          <a href="https://niloykm.vercel.app/" target="_blank" rel="noopener noreferrer" className="user-profile">
            <img src={assets.user_icon} alt="User" />
            <span className="user-label">Niloy</span>
          </a>
        </div>
      </header>

      <main className="chat-area">
        {!showResult ? (
          <div className="welcome-container">
            <div className="hero-text">
              <h1 className="gradient-text">Hello, how can I help?</h1>
              <p className="subtitle">Your personal AI assistant for everything creative and productive.</p>
            </div>
            
            <div className="suggestions-grid">
              {suggestions.map((item, index) => (
                <div 
                  key={index} 
                  className="suggestion-card" 
                  onClick={() => {
                    setInput(item.text);
                    // Optionally auto-send: onSend(item.text);
                  }}
                >
                  <p>{item.text}</p>
                  <div className="icon-wrapper">
                    <img src={item.icon} alt="icon" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="conversation-container">
            <div className="user-message">
              <div className="message-header">
                <img src={assets.user_icon} alt="User" />
                <span className="author-name">You</span>
              </div>
              <div className="message-content">
                <p>{recentPrompt}</p>
              </div>
            </div>

            <div className="ai-message">
              <div className="message-header">
                <img src={assets.nlogo} alt="Nobot" className="bot-avatar" />
                <span className="author-name">Nobot</span>
              </div>
              <div className="message-content">
                {loading ? (
                  <div className="skeleton-loader">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                  </div>
                ) : (
                  <>
                    <div className="formatted-response" dangerouslySetInnerHTML={{ __html: resultData }}></div>
                    <div className="message-actions">
                      <button 
                        className={`action-btn ${copied ? "copied" : ""}`} 
                        onClick={() => handleCopy(resultData)}
                      >
                        {copied ? "✓ Copied" : "Copy Response"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="input-section">
        <div className="input-wrapper">
          <div className="search-bar-container">
            <textarea
              className="chat-input"
              placeholder="Ask Nobot anything..."
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            ></textarea>
            <div className="input-buttons">
              {input.trim() && (
                <button className="send-btn" onClick={() => onSend()}>
                  <img src={assets.send_icon} alt="Send" />
                </button>
              )}
            </div>
          </div>
          <p className="disclaimer">
            Nobot can make mistakes, check important info. Built with Gemini 2.0.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Main;
