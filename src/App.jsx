import React, { useEffect, useRef, useState } from "react";

// Util: read API key from env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; // put key in .env
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Message component
function Message({ sender, text }) {
  return (
    <div className={`message ${sender}`}>
      <p>{text}</p>
    </div>
  );
}

export default function App() {
  // UI state
  const [dark, setDark] = useState(true);
  const [messages, setMessages] = useState([]); // {sender:'user'|'Vedra'|'loading', text:string}
  const [input, setInput] = useState("");
  const [toolsOpen, setToolsOpen] = useState(false);

  const chatRef = useRef(null);

  // Default to dark mode (replaces window.onload)
  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Close tools popup when clicking outside
  useEffect(() => {
    function onClick(e) {
      const tools = document.querySelector(".tools-container");
      if (tools && !tools.contains(e.target)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function handleSend() {
    const chat = input.trim();
    if (!chat) return;
    setMessages((m) => [...m, { sender: "user", text: chat }, { sender: "loading", text: "Loading..." }]);
    setInput("");

    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: chat }]}],
        }),
      });
      const data = await resp.json();

      const botRaw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Oops, no response.";
      const botText = botRaw.replace(/\*\*(.*?)\*\*/g, "$1"); // strip bold markdown

      setMessages((m) => {
        // replace last loading with bot message
        const copy = [...m];
        const idx = copy.findIndex((x) => x.sender === "loading");
        if (idx !== -1) copy.splice(idx, 1, { sender: "Vedra", text: botText });
        else copy.push({ sender: "Vedra", text: botText });
        return copy;
      });
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        const idx = copy.findIndex((x) => x.sender === "loading");
        if (idx !== -1) copy.splice(idx, 1, { sender: "Vedra", text: "Network error. Try again." });
        else copy.push({ sender: "Vedra", text: "Network error. Try again." });
        return copy;
      });
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function startNewChat() {
    if (!confirm("Start a new chat? Your current conversation will be cleared.")) return;
    setMessages([]);
    setInput("");
    setToolsOpen(false);
    // header shows again by simply having no messages
  }

  function openChatHistory() {
    alert("Chat History coming soon!");
  }

  function openLibrary() {
    alert("Library section coming soon!");
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (file) alert("File selected: " + file.name);
  }

  return (
    <div>
      {/* Floating New Chat, History & Library Buttons */}
      <div className="floating-chat-controls">
        <div className="hover-icon-button" onClick={startNewChat} title="New Chat">
          <span className="material-symbols-outlined">add</span>
          <span className="hover-text">New Chat</span>
        </div>
        <div className="hover-icon-button" onClick={openChatHistory} title="Chat History">
          <span className="material-symbols-outlined">history</span>
          <span className="hover-text">Chat History</span>
        </div>
        <div className="hover-icon-button" onClick={openLibrary} title="Photos">
          <span className="material-symbols-outlined">photo_library</span>
          <span className="hover-text">Library</span>
        </div>
      </div>

      {/* Top Bar */}
      <div className="top-bar">
        <h1 className="SrynkDev">Pulse</h1>
        <div className="top-buttons">
          <button
            id="signin-button"
            className="signin-button"
            onClick={() => alert("Google Sign-In Coming Soon!")}
          >
            Sign In
          </button>
          <div className="hover-icon-button" onClick={() => setDark((d) => !d)}>
            <span className="material-symbols-outlined" id="theme-toggle">
              {dark ? "☀️" : "🌙"}
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      {messages.length === 0 && (
        <header className="header">
          <h1 className="title">
            Meet <span className="vedra">Pulse</span>, your personal AI assistant
          </h1>
        </header>
      )}

      {/* Chat Area */}
      <div className="chat-area" id="chatArea" ref={chatRef}>
        {messages.map((m, i) =>
          m.sender === "loading" ? (
            <div key={i} className="loading Vedra" id="loading">Loading...</div>
          ) : (
            <Message key={i} sender={m.sender} text={m.text} />
          )
        )}
      </div>

      {/* Input Area */}
      <div className="typing-area">
        <form
          className="typing-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <div className="input-wrapper">
            {/* Upload Icon */}
            <label htmlFor="file-upload" className="file-upload-icon">
              <span className="material-symbols-outlined">add</span>
            </label>
            <input type="file" id="file-upload" hidden onChange={handleFileUpload} />

            {/* Tools Icon */}
            <div className="tools-container">
              <div
                className="hover-icon-button"
                onClick={() => setToolsOpen((x) => !x)}
                title="Tools"
              >
                <span className="material-symbols-outlined">apps</span>
              </div>
              {toolsOpen && (
                <div className="tools-popup" id="toolsPopup">
                  <div className="tool-option" onClick={() => alert("Brainstorming Clicked")}>ㅤBrainstorming</div>
                  <div className="tool-option" onClick={() => alert("Code Garage Clicked")}>ㅤCode Garage</div>
                  <div className="tool-option" onClick={() => alert("Explain It Clicked")}>ㅤExplain It</div>
                  <div className="tool-option" onClick={() => alert("Ideas Clicked")}>ㅤIdeas</div>
                  <div className="tool-option" onClick={() => alert("Placements Clicked")}>ㅤPlacements</div>
                </div>
              )}
            </div>

            {/* Prompt input */}
            <input
              id="text-input"
              type="text"
              placeholder="Enter a prompt here"
              className="typing-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {/* would switch icon if needed */}}
              onBlur={() => {/* reset icon if empty if needed */}}
            />

            {/* Send Button */}
            <div className="hover-icon-button send-button" onClick={handleSend} title="Send">
              <span className="material-symbols-outlined" id="send-icon">
                {input.trim() ? "send" : "graphic_eq"}
              </span>
            </div>
          </div>
        </form>
      </div>

      {/* Plain Bottom Bar */}
      <div className="bottom-bar" />
    </div>
  );
}
