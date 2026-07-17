import { useContext, useState } from "react";
import { context } from "../../context/Context";
import { 
  Plus, MessageSquare, Search, Pin, FolderPlus, Folder, Trash, Edit2, 
  Settings, Check, X, ShieldAlert, Sparkles, LogOut, Star, HelpCircle, 
  Download, Moon, Sun, Menu
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    searchQuery,
    setSearchQuery,
    selectedFolder,
    setSelectedFolder,
    folders,
    setFolders,
    createNewConversation,
    togglePinConversation,
    renameConversation,
    deleteConversation,
    moveConversationToFolder,
    extended,
    setExtended,
    user,
    handleGoogleLogin,
    handleLogout,
    isDark,
    setIsDark
  } = useContext(context);

  const [newFolderName, setNewFolderName] = useState("");
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingConvId, setEditingConvId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);

  const filteredConversations = conversations.filter((c) => {
    if (searchQuery.trim()) {
      const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchSearch) return false;
    }
    if (selectedFolder === "pinned") {
      return c.pinned;
    } else if (selectedFolder !== "all") {
      return c.folder === selectedFolder;
    }
    return true;
  });

  const handleCreateFolder = () => {
    if (newFolderName.trim() && !folders.includes(newFolderName.trim())) {
      setFolders((prev) => [...prev, newFolderName.trim()]);
      setNewFolderName("");
      setShowFolderModal(false);
    }
  };

  const handleStartRename = (conv, e) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditTitle(conv.title);
    setActiveMenuId(null);
  };

  const handleSaveRename = (id, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim());
    }
    setEditingConvId(null);
  };

  const handleExportChat = (conv, format, e) => {
    e.stopPropagation();
    let text = "";
    if (format === "txt" || format === "md") {
      text = `# ${conv.title}\n\n`;
      conv.messages.forEach(m => {
        text += `**${m.role === 'user' ? 'User' : 'Nobot'}**: ${m.content}\n\n`;
      });
    }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${conv.title.toLowerCase().replace(/\s+/g, "_")}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
    setActiveMenuId(null);
  };

  return (
    <>
      {/* Mobile background overlay when sidebar is open */}
      {extended && <div className="sidebar-overlay" onClick={() => setExtended(false)}></div>}

      <div className={`sidebar ${extended ? "extended" : "collapsed"}`}>
        {/* Toggle button always visible inside sidebar */}
        <div className="sidebar-toggle-header">
          <button className="toggle-sidebar-btn" onClick={() => setExtended(!extended)} title="Toggle Sidebar">
            <Menu size={20} />
          </button>
          {extended && <span className="sidebar-brand-name">Nobot Workspace</span>}
        </div>

        {/* New Chat Button */}
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={() => {
            createNewConversation();
            // Auto close drawer on mobile after creating new chat
            if (window.innerWidth <= 768) setExtended(false);
          }}>
            <Plus size={18} />
            {extended && <span>New Chat</span>}
          </button>
        </div>

        {/* User Card */}
        {extended && (
          <div className="sidebar-user-section">
            {user ? (
              <div className="user-card">
                <img src={user.avatar} alt="avatar" />
                <div className="user-info">
                  <h4>{user.name}</h4>
                  <span className={user.tier === "pro" ? "tier-pro" : "tier-free"}>
                    {user.tier === "pro" ? "Pro Mode" : "Free Mode"}
                  </span>
                </div>
                <button title="Log Out" onClick={handleLogout} className="logout-btn">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button className="google-sign-in-btn" onClick={() => handleGoogleLogin("Niloy")}>
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png" alt="Google" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        )}

        {/* Search Box */}
        {extended && (
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Folders & Categories */}
        {extended && (
          <div className="folders-section">
            <div className="section-title">
              <span>Categories</span>
              <button className="add-folder-btn" onClick={() => setShowFolderModal(true)} title="Add Folder">
                <FolderPlus size={14} />
              </button>
            </div>

            <div className="folder-list">
              <button 
                className={`folder-item ${selectedFolder === "all" ? "active" : ""}`}
                onClick={() => setSelectedFolder("all")}
              >
                <MessageSquare size={14} />
                <span>All Chats</span>
              </button>

              <button 
                className={`folder-item ${selectedFolder === "pinned" ? "active" : ""}`}
                onClick={() => setSelectedFolder("pinned")}
              >
                <Star size={14} className="star-pinned-icon" />
                <span>Pinned</span>
              </button>

              {folders.map((f, idx) => (
                <button
                  key={idx}
                  className={`folder-item ${selectedFolder === f ? "active" : ""}`}
                  onClick={() => setSelectedFolder(f)}
                >
                  <Folder size={14} />
                  <span>{f}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="conv-history-list">
          {extended && <p className="history-title">Conversations</p>}
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isEditing = editingConvId === conv.id;
              const isActive = activeConversationId === conv.id;

              return (
                <div 
                  key={conv.id} 
                  className={`history-item ${isActive ? "active" : ""} ${conv.pinned ? "pinned" : ""}`}
                  onClick={() => {
                    if (!isEditing) {
                      setActiveConversationId(conv.id);
                      if (window.innerWidth <= 768) setExtended(false); // Auto close drawer on mobile
                    }
                  }}
                  title={conv.title}
                >
                  <MessageSquare size={16} className="msg-icon" />
                  
                  {isEditing ? (
                    <div className="rename-input-wrapper">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveRename(conv.id, e)}
                        autoFocus
                      />
                      <button onClick={(e) => handleSaveRename(conv.id, e)}>
                        <Check size={12} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingConvId(null); }}>
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      {extended && <span className="conv-title">{conv.title}</span>}
                      
                      {extended && (
                        <div className="item-actions">
                          <button 
                            className={`pin-btn ${conv.pinned ? "is-pinned" : ""}`} 
                            onClick={(e) => { e.stopPropagation(); togglePinConversation(conv.id); }}
                            title={conv.pinned ? "Unpin" : "Pin"}
                          >
                            <Pin size={12} />
                          </button>
                          
                          <div className="menu-dropdown-wrapper">
                            <button 
                              className="more-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === conv.id ? null : conv.id);
                              }}
                            >
                              <MoreVertical size={12} />
                            </button>

                            {activeMenuId === conv.id && (
                              <div className="dropdown-menu glass-panel">
                                <button onClick={(e) => handleStartRename(conv, e)}>
                                  <Edit2 size={12} />
                                  <span>Rename</span>
                                </button>
                                <div className="dropdown-submenu">
                                  <span className="sub-header">Move to:</span>
                                  <button onClick={(e) => { e.stopPropagation(); moveConversationToFolder(conv.id, ""); setActiveMenuId(null); }}>
                                    <span>Uncategorized</span>
                                  </button>
                                  {folders.map((f, i) => (
                                    <button key={i} onClick={(e) => { e.stopPropagation(); moveConversationToFolder(conv.id, f); setActiveMenuId(null); }}>
                                      <span>{f}</span>
                                    </button>
                                  ))}
                                </div>
                                <button onClick={(e) => handleExportChat(conv, "md", e)}>
                                  <Download size={12} />
                                  <span>Export MD</span>
                                </button>
                                <button onClick={(e) => handleExportChat(conv, "txt", e)}>
                                  <Download size={12} />
                                  <span>Export TXT</span>
                                </button>
                                <button 
                                  className="delete" 
                                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); setActiveMenuId(null); }}
                                >
                                  <Trash size={12} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          ) : (
            extended && <p className="no-convs">No conversations</p>
          )}
        </div>

        {/* Bottom Utility Items */}
        <div className="sidebar-bottom-utilities">
          <button 
            className="bottom-utility-btn" 
            onClick={() => setIsDark(!isDark)}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {extended && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          
          <button 
            className="bottom-utility-btn"
            onClick={() => {
              createNewConversation("Productivity Help");
              setActiveConversationId(conversations[0]?.id || "");
              if (window.innerWidth <= 768) setExtended(false);
            }}
            title="Help & Support"
          >
            <HelpCircle size={16} />
            {extended && <span>Help & Support</span>}
          </button>
        </div>

        {/* Folder creation Modal */}
        {showFolderModal && (
          <div className="folder-modal-overlay">
            <div className="folder-modal glass-panel">
              <h3>Create New Category</h3>
              <input
                type="text"
                placeholder="Category name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowFolderModal(false)}>Cancel</button>
                <button className="confirm-btn" onClick={handleCreateFolder}>Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
