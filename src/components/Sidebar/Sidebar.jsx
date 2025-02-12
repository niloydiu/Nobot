import { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { context } from "../../context/Context";
import "./Sidebar.css";

const Sidebar = () => {
  const [extended, setExtended] = useState(false);
  const { onSend, previousPrompt, setRecentPrompt, newChat } =
    useContext(context);
  const loadPrompt = async (prompt) => {
    setRecentPrompt(prompt);
    await onSend(prompt);
  };
  return (
    <div className="sidebar ">
      <div className="top">
        <img
          onClick={() => setExtended((prev) => !prev)}
          className="menu "
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
            {previousPrompt.map((item, index) => {
              return (
                <div
                  className="recent-entry"
                  key={index}
                  onClick={() => loadPrompt(item)}
                >
                  <img src={assets.message_icon} alt="message_icon" />
                  <p>{item.slice(0, 20)}</p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
      <div className="bottom">
        <div className="bottom-item recent-entry">
          <img src={assets.question_icon} alt="question_icon" />
          {extended ? <p>Help</p> : null}
        </div>
        <div className="bottom-item recent-entry">
          <img src={assets.history_icon} alt="history_icon" />
          {extended ? <p>Activity</p> : null}
        </div>
        <div className="bottom-item recent-entry">
          <img src={assets.setting_icon} alt="setting_icon" />
          {extended ? <p>Settings</p> : null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
