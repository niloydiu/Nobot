// import { useContext, useEffect, useState } from "react";
// import { assets } from "../../assets/assets";
// import { context } from "../../context/Context";
// import "./Sidebar.css";

// const Sidebar = () => {
//   const [showThemeToggle, setShowThemeToggle] = useState(false);
//   const [isDark, setIsDark] = useState(false);
//   const [extended, setExtended] = useState(false);
//   const { onSend, previousPrompt, setRecentPrompt, newChat } =
//     useContext(context);
//   const loadPrompt = async (prompt) => {
//     setRecentPrompt(prompt);
//     await onSend(prompt);
//   };
//   const toggleThemeUI = () => {
//     setShowThemeToggle((prev) => !prev);
//   };

//   const toggleTheme = () => {
//     setIsDark((prev) => !prev);
//   };
//   useEffect(() => {
//     const sidebar = document.querySelector(".sidebar");
//     if (isDark) {
//       document.body.style.backgroundColor = "#333"; // Dark background
//       document.body.style.color = "#fff"; // Light text
//       if (sidebar) sidebar.style.backgroundColor = "#2c2c2c"; // Dark sidebar background
//     } else {
//       document.body.style.backgroundColor = "#fff"; // Light background
//       document.body.style.color = "#000"; // Dark text
//       if (sidebar) sidebar.style.backgroundColor = "#f0f4f9"; // Light sidebar background
//     }
//   }, [isDark]);
//   return (
//     <div className="sidebar ">
//       <div className="top">
//         <img
//           onClick={() => setExtended((prev) => !prev)}
//           className="menu "
//           src={assets.menu_icon}
//           alt="menu_icon"
//         />
//         <div onClick={() => newChat()} className="new-chat">
//           <img src={assets.plus_icon} alt="plus_icon" />
//           {extended ? <p>New Chat</p> : null}
//         </div>
//         {extended ? (
//           <div className="recent">
//             <p className="recent-title">Recent</p>
//             {previousPrompt.map((item, index) => {
//               return (
//                 <div
//                   className="recent-entry"
//                   key={index}
//                   onClick={() => loadPrompt(item)}
//                 >
//                   <img src={assets.message_icon} alt="message_icon" />
//                   <p>{item.slice(0, 20)}</p>
//                 </div>
//               );
//             })}
//           </div>
//         ) : null}
//       </div>
//       {/* <div className="bottom">
//         <div className="bottom-item recent-entry">
//           <img src={assets.setting_icon} alt="setting_icon" />
//           {extended ? <p>Settings</p> : null}
//         </div>
//         <div id="logo" className="bottom-item recent-entry">
//           <img src={assets.nlogo} alt="question_icon" />
//         </div>
//       </div> */}

//       <div className="bottom">
//         {/* When clicking settings, we toggle the theme UI */}
//         <div className="bottom-item recent-entry" onClick={toggleThemeUI}>
//           {extended ? <p>Dark</p> : <p>Light</p>}
//         </div>
//         {/* Theme Toggle Mini UI */}
//         {showThemeToggle && (
//           <div className="theme-toggle-container">
//             <button onClick={toggleTheme} className="theme-toggle-btn">
//               {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
//             </button>
//           </div>
//         )}
//         <div id="logo" className="bottom-item recent-entry">
//           <img src={assets.nlogo} alt="question_icon" />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

import { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { context } from "../../context/Context";
import "./Sidebar.css";

const Sidebar = () => {
  const [isDark, setIsDark] = useState(() => {
    // Persist theme preference
    return localStorage.getItem("theme") === "dark";
  });
  
  const { onSend, previousPrompt, setRecentPrompt, newChat, extended, setExtended } =
    useContext(context);

  const loadPrompt = async (prompt) => {
    setRecentPrompt(prompt);
    await onSend(prompt);
  };

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newVal = !prev;
      localStorage.setItem("theme", newVal ? "dark" : "light");
      return newVal;
    });
  };

  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className={`sidebar ${extended ? "extended" : "collapsed"} ${isDark ? "dark" : ""}`}>
      <div className="top">
        <div className="menu-container">
          <img
            onClick={() => setExtended((prev) => !prev)}
            className="menu"
            src={assets.menu_icon}
            alt="menu_icon"
          />
        </div>
        
        <div onClick={() => newChat()} className="new-chat">
          <img src={assets.plus_icon} alt="plus_icon" />
          {extended ? <p>New Chat</p> : null}
        </div>

        {extended && (
          <div className="recent">
            <p className="recent-title">Recent Conversations</p>
            <div className="recent-list">
              {previousPrompt.length > 0 ? (
                previousPrompt.slice().reverse().map((item, index) => (
                  <div
                    className="recent-entry"
                    key={index}
                    onClick={() => loadPrompt(item)}
                    title={item}
                  >
                    <img src={assets.message_icon} alt="message_icon" />
                    <p>{item}</p>
                  </div>
                ))
              ) : (
                <p className="no-recent">No recent chats</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bottom">
        <div className="bottom-item recent-entry" onClick={toggleTheme}>
          <img src={isDark ? assets.bulb_icon : assets.setting_icon} alt="theme_icon" />
          {extended ? <p>{isDark ? "Light Mode" : "Dark Mode"}</p> : null}
        </div>
        
        <div className="bottom-item recent-entry">
          <img src={assets.question_icon} alt="help_icon" />
          {extended ? <p>Help & Support</p> : null}
        </div>

        <div className="sidebar-footer">
          <div id="logo" className="logo-container">
            <a href="https://niloykm.vercel.app/" target="_blank" rel="noopener noreferrer">
              <img src={assets.nlogo} alt="logo" />
              {extended && <span className="logo-text">Nobot v2.0</span>}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
