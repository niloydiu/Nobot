import { useContext, useState, useEffect, useRef } from "react";
import { context } from "../../context/Context";
import { 
  Send, Image, Mic, MicOff, Volume2, VolumeX, Square, RefreshCw, 
  Copy, Check, ThumbsUp, ThumbsDown, User, Sparkles, Settings as SettingsIcon,
  HelpCircle, AlertTriangle, Moon, Sun, Monitor, Type, X, CreditCard,
  ChevronDown, FileText, CornerDownLeft, Eye, MessageSquare, Terminal
} from "lucide-react";
import "./Main.css";

// Helper function to custom parse basic markdown to interactive HTML
const renderMarkdownCustom = (text, handleCopyCode) => {
  if (!text) return "";

  // Escape HTML tags to prevent XSS
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Parse multi-line code blocks: ```lang code ```
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let codeBlocks = [];
  let blockIndex = 0;

  html = html.replace(codeBlockRegex, (match, lang, code) => {
    const key = `__CODE_BLOCK_${blockIndex}__`;
    codeBlocks.push({
      key,
      lang: lang || "code",
      code: code.trim(),
    });
    blockIndex++;
    return key;
  });

  // Headers: # Header
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Inline code: `code`
  html = html.replace(/`(.*?)`/g, "<code class='inline-code'>$1</code>");

  // Tables
  const lines = html.split("\n");
  let inTable = false;
  let tableRows = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("|") && line.endsWith("|")) {
      inTable = true;
      const cells = line.split("|").slice(1, -1).map(c => c.trim());
      // Skip separator row: |---|---|
      if (cells.every(c => /^:-*|-*:-*|-*:$/.test(c))) {
        continue;
      }
      tableRows.push(cells);
      lines[i] = ""; // clear this line
    } else {
      if (inTable) {
        // Build table html
        let tableHtml = "<div class='table-responsive'><table><thead>";
        tableRows.forEach((row, rowIndex) => {
          if (rowIndex === 0) {
            tableHtml += "<tr>" + row.map(c => `<th>${c}</th>`).join("") + "</tr></thead><tbody>";
          } else {
            tableHtml += "<tr>" + row.map(c => `<td>${c}</td>`).join("") + "</tr>";
          }
        });
        tableHtml += "</tbody></table></div>";
        // Insert table back where it ended
        lines[i] = tableHtml + "\n" + lines[i];
        inTable = false;
        tableRows = [];
      }
    }
  }
  html = lines.join("\n");

  // Bullet points
  html = html.replace(/^\s*-\s+(.*$)/gim, "<li>$1</li>");
  html = html.replace(/<li>(.*?)<\/li>/gs, (match) => {
    return `<ul class='bullet-list'>${match}</ul>`;
  });
  // Merge consecutive <ul> tags
  html = html.replace(/<\/ul>\n<ul class='bullet-list'>/g, "");

  // Newlines to breaks (excluding code blocks placeholders)
  html = html.replace(/\n/g, "<br />");

  // Re-inject code blocks with beautiful wrappers and copy buttons
  codeBlocks.forEach((block) => {
    // Generate static markup for code block
    const escapedCode = block.code;
    const blockMarkup = `
      <div class="code-container">
        <div class="code-header">
          <span>${block.lang.toUpperCase()}</span>
          <button class="copy-code-btn" data-code="${encodeURIComponent(escapedCode)}">
            Copy
          </button>
        </div>
        <pre class="code-block"><code>${escapedCode}</code></pre>
      </div>
    `;
    html = html.replace(block.key, blockMarkup);
  });

  return html;
};

const Main = () => {
  const {
    onSend,
    loading,
    streamingText,
    input,
    setInput,
    createNewConversation,
    getActiveConversation,
    isSpeechSupported,
    isSpeaking,
    toggleSpeechPlayback,
    stopGeneration,
    editAndResend,
    handleFeedback,
    user,
    quotaUsed,
    apiKeyOverride,
    setApiKeyOverride,
    systemPrompt,
    setSystemPrompt,
    selectedModel,
    setSelectedModel,
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    isDark,
    setIsDark,
    fontSize,
    setFontSize,
    triggerStripeMockCheckout,
    handleGoogleLogin,
    extended,
    setExtended,
    attachedFile,
    setAttachedFile
  } = useContext(context);

  // UI Panels
  const [showSettings, setShowSettings] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  
  // Drag and Drop files visual state
  const [isDragging, setIsDragging] = useState(false);
  
  // Edit previous message state
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  // Slash commands visual search state
  const [slashQuery, setSlashQuery] = useState("");
  const [showSlashSuggestions, setShowSlashSuggestions] = useState(false);

  // References
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const activeConv = getActiveConversation();
  const messages = activeConv?.messages || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // Set font size class on body
  useEffect(() => {
    document.body.classList.remove("font-small", "font-medium", "font-large");
    document.body.classList.add(`font-${fontSize}`);
  }, [fontSize]);

  // Handle Event Delegations for code block Copy Buttons
  useEffect(() => {
    const handleCodeCopyClick = (e) => {
      if (e.target && e.target.classList.contains("copy-code-btn")) {
        const encodedCode = e.target.getAttribute("data-code");
        if (encodedCode) {
          const code = decodeURIComponent(encodedCode);
          navigator.clipboard.writeText(code);
          e.target.textContent = "✓ Copied";
          setTimeout(() => {
            e.target.textContent = "Copy";
          }, 2000);
        }
      }
    };

    document.addEventListener("click", handleCodeCopyClick);
    return () => document.removeEventListener("click", handleCodeCopyClick);
  }, []);

  // Keyboard Shortcuts (Ctrl+Enter to Send, Esc to Close Settings, Ctrl+K for Search)
  useEffect(() => {
    const handleShortcuts = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (input.trim() || attachedFile) {
          onSend();
        }
      }
      if (e.key === "Escape") {
        setShowSettings(false);
        setShowBilling(false);
        setShowTemplates(false);
        setEditingMessageId(null);
      }
    };
    window.addEventListener("keydown", handleShortcuts);
    return () => window.removeEventListener("keydown", handleShortcuts);
  }, [input, attachedFile, onSend]);

  // Speech Recognition hook setup
  useEffect(() => {
    if (isSpeechSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInput((prev) => prev + " " + text);
      };

      recognition.onerror = (e) => {
        console.error("Speech recognition error", e);
      };

      recognitionRef.current = recognition;
    }
  }, [isSpeechSupported, setInput]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch {
      recognitionRef.current.stop();
    }
  };

  // Convert uploaded file to base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Limits: Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Maximum file upload size is 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedFile({
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFile({
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // General clipboard copy for full AI text responses
  const handleCopyMessage = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Slash commands and Prompt templates
  const slashCommands = [
    { cmd: "/help", desc: "Show prompt help & guidelines" },
    { cmd: "/clear", desc: "Clear active conversation log" },
    { cmd: "/theme", desc: "Toggle between Dark and Light mode" },
    { cmd: "/system", desc: "Open Custom System instructions panel" },
    { cmd: "/pro", desc: "View subscription pricing portal" }
  ];

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.startsWith("/")) {
      setSlashQuery(val.toLowerCase());
      setShowSlashSuggestions(true);
    } else {
      setShowSlashSuggestions(false);
    }
  };

  const executeSlashCommand = (cmd) => {
    setShowSlashSuggestions(false);
    if (cmd === "/clear") {
      createNewConversation();
    } else if (cmd === "/theme") {
      setIsDark(!isDark);
    } else if (cmd === "/system") {
      setShowSettings(true);
    } else if (cmd === "/pro") {
      setShowBilling(true);
    } else if (cmd === "/help") {
      setInput("Please explain the keyboard shortcuts and productivity slash commands inside Nobot.");
    }
  };

  const promptTemplates = [
    { title: "Review Code", prompt: "Perform a review of this code. Suggest improvements for readability, edge cases, and performance:\n\n```\n\n```" },
    { title: "Fix Bugs", prompt: "Identify and resolve any potential bugs or syntax errors in this code segment:\n\n```\n\n```" },
    { title: "Refactor Styles", prompt: "Suggest modern glassmorphic css styling overrides for this page section." },
    { title: "Explain Algorithm", prompt: "Walk through this algorithm step-by-step and write a brief analysis of its time and space complexity." }
  ];

  return (
    <div className="main-viewport glass-panel" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {/* Visual drag indicators */}
      {isDragging && (
        <div className="drag-indicator">
          <div className="drag-box">
            <Image size={40} className="bounce-animation" />
            <p>Drop image, text, or PDF here to reference</p>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <header className="main-nav glass-panel">
        <div className="nav-left">
          <button 
            className="menu-toggle-btn"
            onClick={() => setExtended(!extended)}
          >
            <MessageSquare size={18} />
          </button>
          
          <div className="nav-brand" onClick={() => createNewConversation()}>
            <Sparkles className="logo-spark" />
            <span>Nobot v2.0</span>
          </div>

          {/* Model Selector dropdown */}
          <div className="model-selector-wrapper">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-select-dropdown"
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Smart)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Expert)</option>
            </select>
          </div>
        </div>

        <div className="nav-right">
          <button className="billing-badge-btn" onClick={() => setShowBilling(true)}>
            <CreditCard size={15} />
            <span>{user?.tier === "pro" ? "Pro Subscription" : "Upgrade to Pro"}</span>
          </button>

          <button className="settings-toggle-btn" onClick={() => setShowSettings(true)}>
            <SettingsIcon size={18} />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="chat-area">
        {messages.length === 0 ? (
          <div className="welcome-container">
            <div className="hero-section">
              <h1 className="glowing-gradient-title">Hello, how can I help?</h1>
              <p className="welcome-subtitle">Ask questions, design components, review code or upload resources.</p>
            </div>

            {/* Quick Templates Grid */}
            <div className="suggestions-grid">
              {promptTemplates.map((item, idx) => (
                <div 
                  key={idx}
                  className="suggestion-card glass-panel"
                  onClick={() => setInput(item.prompt)}
                >
                  <h4>{item.title}</h4>
                  <p>{item.prompt.slice(0, 70)}...</p>
                  <div className="suggestion-arrow">
                    <CornerDownLeft size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="conversation-container">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const isEditing = editingMessageId === msg.id;

              return (
                <div key={msg.id} className={`chat-message-row ${isUser ? "user-row" : "bot-row"}`}>
                  <div className="message-header-details">
                    <div className={`avatar-box ${isUser ? "user-avatar-bg" : "bot-avatar-bg"}`}>
                      {isUser ? <User size={14} /> : <Sparkles size={14} />}
                    </div>
                    <span className="author-lbl">{isUser ? "You" : "Nobot"}</span>
                  </div>

                  <div className="message-content-wrapper">
                    {/* File Attachment preview */}
                    {msg.file && (
                      <div className="file-attachment-card">
                        <FileText size={16} />
                        <div className="file-info">
                          <span className="file-name">{msg.file.name}</span>
                          <span className="file-type">{msg.file.type}</span>
                        </div>
                        {msg.file.type.startsWith("image/") && (
                          <div className="attached-img-preview-mini">
                            <img src={msg.file.data} alt="uploaded" />
                          </div>
                        )}
                      </div>
                    )}

                    {isEditing ? (
                      <div className="edit-message-box">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                        />
                        <div className="edit-box-actions">
                          <button className="cancel-edit-btn" onClick={() => setEditingMessageId(null)}>Cancel</button>
                          <button className="save-edit-btn" onClick={() => {
                            editAndResend(msg.id, editingContent);
                            setEditingMessageId(null);
                          }}>Regenerate</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div 
                          className={`rendered-response ${msg.isError ? "error-text" : ""}`}
                          dangerouslySetInnerHTML={{ __html: renderMarkdownCustom(msg.content) }}
                        ></div>

                        {/* Interactive Message Actions */}
                        <div className="message-hover-actions">
                          {isUser ? (
                            <button className="msg-action" onClick={() => {
                              setEditingMessageId(msg.id);
                              setEditingContent(msg.content);
                            }}>Edit</button>
                          ) : (
                            <>
                              <button className="msg-action" onClick={() => handleCopyMessage(msg.id, msg.content)}>
                                {copiedMsgId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                                <span>{copiedMsgId === msg.id ? "Copied" : "Copy"}</span>
                              </button>

                              <button className="msg-action" onClick={() => toggleSpeechPlayback(msg.content)}>
                                {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                <span>Speak</span>
                              </button>

                              <button 
                                className={`msg-action feedback-btn ${msg.feedback === "up" ? "liked" : ""}`}
                                onClick={() => handleFeedback(msg.id, "up")}
                              >
                                <ThumbsUp size={12} />
                              </button>

                              <button 
                                className={`msg-action feedback-btn ${msg.feedback === "down" ? "disliked" : ""}`}
                                onClick={() => handleFeedback(msg.id, "down")}
                              >
                                <ThumbsDown size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Stream indicator */}
            {loading && !streamingText && (
              <div className="chat-message-row bot-row loading-shimmer-row">
                <div className="message-header-details">
                  <div className="avatar-box bot-avatar-bg shimmer-spin">
                    <Sparkles size={14} />
                  </div>
                  <span className="author-lbl">Nobot thinking...</span>
                </div>
                <div className="message-content-wrapper">
                  <div className="loading-shimmer-line line-1"></div>
                  <div className="loading-shimmer-line line-2"></div>
                  <div className="loading-shimmer-line line-3"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </main>

      {/* Input controls footer */}
      <footer className="input-section glass-panel">
        <div className="input-wrapper">
          {/* Autocomplete slash suggestions menu */}
          {showSlashSuggestions && (
            <div className="slash-menu glass-panel">
              <div className="slash-menu-header">
                <Terminal size={14} />
                <span>Slash Commands</span>
              </div>
              {slashCommands.filter(c => c.cmd.includes(slashQuery)).map((c, i) => (
                <button key={i} onClick={() => executeSlashCommand(c.cmd)}>
                  <strong>{c.cmd}</strong>
                  <span>{c.desc}</span>
                </button>
              ))}
            </div>
          )}

          {/* Prompt shortcuts floating toolbar */}
          <div className="input-shortcuts-row">
            <button className="shortcut-toggle" onClick={() => setShowTemplates(!showTemplates)}>
              Prompt Templates
            </button>
            {showTemplates && (
              <div className="prompt-templates-popup glass-panel">
                {promptTemplates.map((t, idx) => (
                  <button key={idx} onClick={() => {
                    setInput(t.prompt);
                    setShowTemplates(false);
                  }}>{t.title}</button>
                ))}
              </div>
            )}
            
            {/* Attached file badge */}
            {attachedFile && (
              <div className="attached-badge">
                <span>📎 {attachedFile.name.slice(0, 15)}...</span>
                <button onClick={() => setAttachedFile(null)}><X size={12} /></button>
              </div>
            )}
          </div>

          <div className="search-bar-container">
            {/* Attachment paperclip trigger */}
            <label className="attachment-lbl" title="Attach file (Images, PDF, TXT)">
              <Image size={18} />
              <input type="file" onChange={handleFileChange} accept="image/*,application/pdf,text/*" style={{ display: "none" }} />
            </label>

            <textarea
              className="chat-input"
              placeholder="Type message, use / for commands, or drop files here..."
              rows="1"
              value={input}
              onChange={handleInputChange}
            />

            <div className="input-buttons">
              {/* Stop streaming button */}
              {loading && (
                <button className="stop-btn" onClick={stopGeneration} title="Stop Response generation">
                  <Square size={14} fill="currentColor" />
                </button>
              )}

              {/* Speech-to-text recognition */}
              {isSpeechSupported && (
                <button className="voice-btn" onClick={toggleVoiceInput} title="Voice input (Speech to Text)">
                  <Mic size={18} />
                </button>
              )}

              {/* Send message button */}
              <button 
                className="send-btn" 
                onClick={() => onSend()}
                disabled={!input.trim() && !attachedFile}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          
          <div className="disclaimer-bar">
            <span>Nobot can make mistakes. Verify critical facts. Built with Gemini and Stripe secure dummy payments.</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal Dashboard */}
      {showSettings && (
        <div className="modal-settings-overlay">
          <div className="settings-panel glass-panel">
            <div className="settings-header">
              <h2>Settings & Customization</h2>
              <button onClick={() => setShowSettings(false)}><X size={20} /></button>
            </div>

            <div className="settings-body">
              {/* System Prompt Custom Instructions */}
              <div className="setting-control-group">
                <label>System Instructions (Prompt Persona)</label>
                <textarea
                  placeholder="Tell the AI how it should behave (e.g. 'Speak in bullet points only', 'Be a concise coding assistant')"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                />
              </div>

              {/* Temperature Slider */}
              <div className="setting-control-group">
                <div className="lbl-row">
                  <label>Temperature (Creativity)</label>
                  <span>{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
              </div>

              {/* Max tokens length */}
              <div className="setting-control-group">
                <div className="lbl-row">
                  <label>Response Length (Max Tokens)</label>
                  <span>{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="8192"
                  step="100"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                />
              </div>

              {/* API Key management */}
              <div className="setting-control-group">
                <label>Bring Your Own API Key</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyOverride}
                  onChange={(e) => setApiKeyOverride(e.target.value)}
                />
                <span className="info-sub">Overrides the default quota limits. Keys are stored locally on your device.</span>
              </div>

              {/* Font Size controls */}
              <div className="setting-control-group">
                <label>Chat Font Size</label>
                <div className="toggle-font-buttons">
                  {["small", "medium", "large"].map((size) => (
                    <button
                      key={size}
                      className={fontSize === size ? "active" : ""}
                      onClick={() => setFontSize(size)}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme toggles */}
              <div className="setting-control-group">
                <label>Color Theme</label>
                <div className="theme-buttons-row">
                  <button className={!isDark ? "active" : ""} onClick={() => setIsDark(false)}>
                    <Sun size={16} />
                    <span>Light</span>
                  </button>
                  <button className={isDark ? "active" : ""} onClick={() => setIsDark(true)}>
                    <Moon size={16} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Quota Progress meter */}
              <div className="setting-control-group quota-indicator-group">
                <div className="lbl-row">
                  <label>Usage Quota (Free Tier)</label>
                  <span>{quotaUsed} / 20 Messages</span>
                </div>
                <div className="quota-bar-bg">
                  <div className="quota-bar-fill" style={{ width: `${Math.min((quotaUsed / 20) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Pricing Billing Modal */}
      {showBilling && (
        <div className="modal-settings-overlay">
          <div className="billing-panel glass-panel">
            <div className="settings-header">
              <h2>Pricing Plans & Billing</h2>
              <button onClick={() => setShowBilling(false)}><X size={20} /></button>
            </div>

            <div className="billing-plans-grid">
              <div className="plan-card glass-panel">
                <h3>Free Tier</h3>
                <div className="price-lbl">$0</div>
                <ul className="plan-perks">
                  <li>20 message limit per month</li>
                  <li>Gemini 2.0 Flash access</li>
                  <li>Save conversation logs</li>
                </ul>
                <button className="plan-action-btn" disabled>Active</button>
              </div>

              <div className="plan-card glass-panel pro-card">
                <div className="popular-badge">POPULAR</div>
                <h3>Pro Tier</h3>
                <div className="price-lbl">$10<span>/month</span></div>
                <ul className="plan-perks">
                  <li>Unlimited message prompts</li>
                  <li>Gemini 2.5 Pro access</li>
                  <li>Priority speed, vision uploads</li>
                  <li>Advanced parameters controls</li>
                </ul>
                <button className="plan-action-btn upgrade-pro-stripe-btn" onClick={() => {
                  triggerStripeMockCheckout();
                  setShowBilling(false);
                }}>Upgrade to Pro</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
