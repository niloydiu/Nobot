import { useContext } from "react";
import { assets } from "../../assets/assets";
import { context } from "../../context/Context";
import "./Main.css";

const Main = () => {
  const {
    onSend,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
  } = useContext(context);
  return (
    <>
      <div className="main">
        <div className="nav">
          <p>Gemini</p>
          <img src={assets.user_icon} width={40} height={40} alt="" />
        </div>
        <div className="main-container">
          {!showResult ? (
            <>
              <div className="greet">
                <p>
                  <span>Hello, {"Name"}</span>
                  <p>How can I help you you today?</p>
                </p>
              </div>
              <div className="cards">
                <div className="card">
                  <p>
                    Suggest beautiful places to see on an upcoming road trip.
                  </p>
                  <img src={assets.compass_icon} alt="compass_icon" />
                </div>
                <div className="card">
                  <p>
                    Suggest beautiful places to see on an upcoming road trip.
                  </p>
                  <img src={assets.bulb_icon} alt="bulb_icon" />
                </div>
                <div className="card">
                  <p>
                    Suggest beautiful places to see on an upcoming road trip.
                  </p>
                  <img src={assets.message_icon} alt="message_icon" />
                </div>
                <div className="card">
                  <p>
                    Suggest beautiful places to see on an upcoming road trip.
                  </p>
                  <img src={assets.code_icon} alt="code_icon" />
                </div>
              </div>
            </>
          ) : (
            <div className="result">
              <div className="result-title">
                <img src={assets.user_icon} alt="user_icon" />
                <p>{recentPrompt}</p>
              </div>
              <div className="result-data">
                <img src={assets.gemini_icon} alt="gemini_icon" />
                {loading ? (
                  <div className="loader">
                    <hr />
                    <hr />
                    <hr />
                  </div>
                ) : (
                  <p dangerouslySetInnerHTML={{ __html: resultData }}></p>
                )}
              </div>
            </div>
          )}

          <div className="main-bottom">
            <div className="search-box">
              <input
                onChange={(e) => setInput(e.target.value)}
                type="text"
                value={input}
                placeholder="Enter a prompt here"
                id=""
              />
              <div>
                <img src={assets.gallery_icon} alt="gallery_icon" />
                <img src={assets.mic_icon} alt="mic_icon" />
                {input ? (
                  <img
                    onClick={() => onSend()}
                    src={assets.send_icon}
                    alt="send_icon"
                  />
                ) : null}
              </div>
            </div>
            <p className=" bottom-info">
              Gemini may display inacurate information, including people, so
              cross-check it&apos;s responses.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Main;
