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
  } = useContext(context);
  const handleCopy = (text) => {
    const tempEl = document.createElement("div");
    tempEl.innerHTML = text;
    const plainText = tempEl.textContent || tempEl.innerText || "";
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  return (
    <>
      <div className="main">
        <div className="nav">
          <p onClick={() => newChat()}>
            <img id="company" src={assets.nlogo} alt="logo" />
            obot
          </p>

          <a href="https://niloykm.vercel.app/" target="_blank">
            <span>
              <img src={assets.user_icon} width={40} height={40} alt="" />
              <span>User</span>
            </span>
          </a>
        </div>
        <div className="main-container">
          {!showResult ? (
            <>
              <div className="greet">
                <p>
                  <span>Hello, Buddy</span>
                  <p>How can I help you you today?</p>
                </p>
              </div>
              {/* <div className="cards">
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
              </div> */}
            </>
          ) : (
            <div className="result">
              <div className="result-title">
                <img src={assets.user_icon} alt="user_icon" />
                <p>{recentPrompt}</p>
              </div>
              <div className="result-data">
                <img
                  id="company_response"
                  src={assets.nlogo}
                  width={20}
                  height={20}
                  alt="logo icon"
                />
                {loading ? (
                  <div className="loader">
                    <hr />
                    <hr />
                    <hr />
                  </div>
                ) : (
                  <>
                    <p dangerouslySetInnerHTML={{ __html: resultData }}></p>
                    <button
                      className="copy-btn"
                      onClick={() => handleCopy(resultData)}
                    >
                      {copied ? "Copied" : "Copy Response"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="main-bottom">
            <div className="search-box">
              <input
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSend();
                  }
                }}
                type="text"
                value={input}
                placeholder="What do you wanna know?"
                id=""
              />
              <div>
                {/* <img src={assets.gallery_icon} alt="gallery_icon" />
                <img src={assets.mic_icon} alt="mic_icon" /> */}
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
              Nobot may display inacurate information, including people, so
              cross-check it&apos;s responses. |{" "}
              <a
                id="copywright"
                href="https://niloykm.vercel.app/"
                target="_blank"
              >
                &copy;niloy
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Main;
