import { createContext, useState, useEffect, useRef } from "react";
import runStream from "../configs/gemini";
import confetti from "canvas-confetti";

export const context = createContext();

const ContextProvider = (props) => {
  // Theme and Styling
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("fontSize") || "medium");

  // User Authentication & Billing
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("nobot_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [apiKeyOverride, setApiKeyOverride] = useState(() => localStorage.getItem("nobot_apiKey") || "");
  const [quotaUsed, setQuotaUsed] = useState(() => parseInt(localStorage.getItem("nobot_quota") || "0"));

  // Chat Configurations
  const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem("nobot_systemPrompt") || "");
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem("nobot_model") || "gemini-2.0-flash");
  const [temperature, setTemperature] = useState(() => parseFloat(localStorage.getItem("nobot_temp") || "1.0"));
  const [maxTokens, setMaxTokens] = useState(() => parseInt(localStorage.getItem("nobot_maxTokens") || "8192"));

  // Conversation Management
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("nobot_conversations");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeConversationId, setActiveConversationId] = useState(() => {
    return localStorage.getItem("nobot_activeConvId") || "";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all"); // 'all', 'pinned', or folder names
  const [folders, setFolders] = useState(() => {
    const saved = localStorage.getItem("nobot_folders");
    return saved ? JSON.parse(saved) : ["Work", "Study", "Personal", "Code"];
  });

  // Active Input/Response States
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [attachedFile, setAttachedFile] = useState(null); // { name, type, size, data: base64 }
  const [isSpeechSupported] = useState(() => typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  const [isSpeaking, setIsSpeaking] = useState(false);

  // References for controlling speech and stream abortion
  const synthRef = useRef(null);
  const isGenerationAborted = useRef(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    if (isDark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("nobot_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("nobot_user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("nobot_apiKey", apiKeyOverride);
  }, [apiKeyOverride]);

  useEffect(() => {
    localStorage.setItem("nobot_quota", quotaUsed.toString());
  }, [quotaUsed]);

  useEffect(() => {
    localStorage.setItem("nobot_systemPrompt", systemPrompt);
  }, [systemPrompt]);

  useEffect(() => {
    localStorage.setItem("nobot_model", selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem("nobot_temp", temperature.toString());
  }, [temperature]);

  useEffect(() => {
    localStorage.setItem("nobot_maxTokens", maxTokens.toString());
  }, [maxTokens]);

  useEffect(() => {
    localStorage.setItem("nobot_conversations", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("nobot_activeConvId", activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    localStorage.setItem("nobot_folders", JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Utility to create new conversation
  const createNewConversation = (initialTitle = "New Conversation", folder = "") => {
    const newId = `conv_${Date.now()}`;
    const newConv = {
      id: newId,
      title: initialTitle,
      messages: [],
      pinned: false,
      folder: folder || "",
      createdAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    return newId;
  };

  // Get active conversation object
  const getActiveConversation = () => {
    return conversations.find((c) => c.id === activeConversationId);
  };

  // Send message function (Streaming)
  const onSend = async (customPrompt = "") => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend && !attachedFile) return;

    // Check auth limit
    const isPro = user?.tier === "pro";
    const limit = 20;
    if (!isPro && quotaUsed >= limit && !apiKeyOverride) {
      alert("You have reached the maximum quota of 20 free messages. Upgrade to Pro in Settings or bring your own API key to continue!");
      return;
    }

    setLoading(true);
    setStreamingText("");
    isGenerationAborted.current = false;

    let currentConvId = activeConversationId;
    if (!currentConvId) {
      // Auto-create new conversation
      const autoTitle = textToSend.slice(0, 30) || "Image Analysis";
      currentConvId = createNewConversation(autoTitle);
    }

    // Prepare user message
    const userMessage = {
      id: `msg_u_${Date.now()}`,
      role: "user",
      content: textToSend,
      file: attachedFile ? { name: attachedFile.name, type: attachedFile.type, data: attachedFile.data } : null,
      createdAt: new Date().toISOString(),
    };

    // Prepare structure for model call
    const activeConv = conversations.find((c) => c.id === currentConvId);
    const updatedMessages = [...(activeConv?.messages || []), userMessage];

    // Update conversation state with user message immediately
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentConvId) {
          // Auto rename if it's the first message
          const newTitle = c.title === "New Conversation" ? textToSend.slice(0, 30) : c.title;
          return { ...c, title: newTitle, messages: updatedMessages };
        }
        return c;
      })
    );

    // Clear inputs
    setInput("");
    setAttachedFile(null);

    // Prepare system message placeholder
    const aiMessageId = `msg_a_${Date.now()}`;
    const aiMessagePlaceholder = {
      id: aiMessageId,
      role: "model",
      content: "",
      feedback: null, // 'up' or 'down' or null
      createdAt: new Date().toISOString(),
    };

    // Add empty model placeholder
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentConvId) {
          return { ...c, messages: [...updatedMessages, aiMessagePlaceholder] };
        }
        return c;
      })
    );

    try {
      // Build simplified context history
      // We pass the history up to the current point (excluding the new user message, which is passed as the prompt)
      const apiHistory = activeConv?.messages || [];

      let fileParam = null;
      if (userMessage.file) {
        // Strip data prefix (e.g. data:image/png;base64,) if present
        const match = userMessage.file.data.match(/^data:(.*);base64,(.*)$/);
        if (match) {
          fileParam = {
            mimeType: match[1],
            data: match[2],
          };
        }
      }

      await runStream({
        prompt: textToSend,
        history: apiHistory,
        modelName: selectedModel,
        temperature,
        maxOutputTokens: maxTokens,
        systemInstruction: systemPrompt,
        userApiKey: apiKeyOverride,
        fileData: fileParam,
        onChunk: (chunk, fullText) => {
          if (isGenerationAborted.current) {
            throw new Error("Generation aborted by user");
          }
          setStreamingText(fullText);
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === currentConvId) {
                return {
                  ...c,
                  messages: c.messages.map((m) => {
                    if (m.id === aiMessageId) {
                      return { ...m, content: fullText };
                    }
                    return m;
                  }),
                };
              }
              return c;
            })
          );
        },
      });

      // Increment quota count
      setQuotaUsed((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      if (err.message !== "Generation aborted by user") {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === currentConvId) {
              return {
                ...c,
                messages: c.messages.map((m) => {
                  if (m.id === aiMessageId) {
                    return {
                      ...m,
                      content: m.content || "⚠️ Error generating response. Check your configuration/network or try again.",
                      isError: true,
                    };
                  }
                  return m;
                }),
              };
            }
            return c;
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Stop current streaming generation
  const stopGeneration = () => {
    isGenerationAborted.current = true;
    setLoading(false);
  };

  // Edit and resend an existing message
  const editAndResend = async (msgId, newContent) => {
    const activeConv = getActiveConversation();
    if (!activeConv) return;

    const messageIndex = activeConv.messages.findIndex((m) => m.id === msgId);
    if (messageIndex === -1) return;

    // Truncate everything after this message
    const updatedMessages = activeConv.messages.slice(0, messageIndex);

    // Set input as the edited text to be resent
    setInput(newContent);

    // Update conversation in state
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          return { ...c, messages: updatedMessages };
        }
        return c;
      })
    );

    // Send immediately
    setTimeout(() => {
      onSend(newContent);
    }, 100);
  };

  // Message feedback thumbs up/down
  const handleFeedback = (msgId, val) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id === msgId) {
                return { ...m, feedback: m.feedback === val ? null : val };
              }
              return m;
            }),
          };
        }
        return c;
      })
    );
  };

  // TTS Read Response
  const toggleSpeechPlayback = (text) => {
    if (!synthRef.current) return;
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const cleanText = text.replace(/<[^>]*>/g, ""); // Strip potential HTML tags
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synthRef.current.speak(utterance);
    }
  };

  // Pin/Unpin, Rename, Delete thread
  const togglePinConversation = (id) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const renameConversation = (id, newTitle) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  const deleteConversation = (id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId("");
    }
  };

  const moveConversationToFolder = (id, folderName) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, folder: folderName } : c))
    );
  };

  // Mock Stripe Payment Flow
  const triggerStripeMockCheckout = () => {
    // Spark confetti, simulate Checkout redirection
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    });

    setUser((prev) => ({
      ...prev,
      tier: "pro",
    }));
    alert("🎉 Thank you for upgrading to Nobot Pro! Your limits have been removed.");
  };

  // Mock Google Authentication Flow
  const handleGoogleLogin = (mockName = "User") => {
    const email = `${mockName.toLowerCase().replace(/\s+/g, "")}@gmail.com`;
    const mockUser = {
      name: mockName,
      email: email,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${mockName}`,
      tier: "free",
    };
    setUser(mockUser);
  };

  const handleLogout = () => {
    setUser(null);
    setConversations([]);
    setActiveConversationId("");
    setQuotaUsed(0);
  };

  const contextValue = {
    isDark,
    setIsDark,
    fontSize,
    setFontSize,
    user,
    setUser,
    apiKeyOverride,
    setApiKeyOverride,
    quotaUsed,
    setQuotaUsed,
    systemPrompt,
    setSystemPrompt,
    selectedModel,
    setSelectedModel,
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId,
    searchQuery,
    setSearchQuery,
    selectedFolder,
    setSelectedFolder,
    folders,
    setFolders,
    input,
    setInput,
    loading,
    streamingText,
    attachedFile,
    setAttachedFile,
    isSpeechSupported,
    isSpeaking,
    onSend,
    stopGeneration,
    editAndResend,
    handleFeedback,
    toggleSpeechPlayback,
    createNewConversation,
    getActiveConversation,
    togglePinConversation,
    renameConversation,
    deleteConversation,
    moveConversationToFolder,
    triggerStripeMockCheckout,
    handleGoogleLogin,
    handleLogout,
  };

  return (
    <context.Provider value={contextValue}>{props.children}</context.Provider>
  );
};

export default ContextProvider;
