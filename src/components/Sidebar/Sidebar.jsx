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
  const [isDark, setIsDark] = useState(false);
  const [extended, setExtended] = useState(false);
  const { onSend, previousPrompt, setRecentPrompt, newChat } =
    useContext(context);

  const loadPrompt = async (prompt) => {
    setRecentPrompt(prompt);
    await onSend(prompt);
  };

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (isDark) {
      document.body.style.backgroundColor = "#333"; // Dark body background
      document.body.style.color = "#fff"; // Light body text
      document.body.classList.add("dark"); // Add dark class globally
      if (sidebar) {
        sidebar.style.backgroundColor = "#2c2c2c"; // Dark sidebar background
        sidebar.style.color = "#fff";
        sidebar.classList.add("dark");
      }
    } else {
      document.body.style.backgroundColor = "#fff"; // Light body background
      document.body.style.color = "#000"; // Dark body text
      document.body.classList.remove("dark");
      if (sidebar) {
        sidebar.style.backgroundColor = "#f0f4f9"; // Light sidebar background
        sidebar.style.color = "#000";
        sidebar.classList.remove("dark");
      }
    }
  }, [isDark]);

  return (
    <div className="sidebar">
      <div className="top">
        <img
          onClick={() => setExtended((prev) => !prev)}
          className="menu"
          src={assets.menu_icon}
          alt="menu_icon"
        />
        <div onClick={() => newChat()} className="new-chat">
          <img src={assets.plus_icon} alt="plus_icon" />
          {extended ? <p>New Chat</p> : null}
        </div>
        {extended ? (
          <div className="recent">
            <p className="recent-title">Recent</p>
            {previousPrompt.map((item, index) => (
              <div
                className="recent-entry"
                key={index}
                onClick={() => loadPrompt(item)}
              >
                <img src={assets.message_icon} alt="message_icon" />
                <p>{item.slice(0, 20)}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="bottom">
        {/* When clicked, the settings area toggles the theme */}
        <div
          className="bottom-item recent-entry theme-switch"
          onClick={toggleTheme}
        >
          {isDark ? <p>Light</p> : <p>Dark</p>}
        </div>
        <div id="logo" className="bottom-item recent-entry">
          <a href="https://portfolio-nu-ten-59.vercel.app/" target="_blank">
            <img src={assets.nlogo} alt="logo" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
