import React from "react";

const PhishingChatbotInfo = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2>Phishing Detection Chatbot</h2>
      <p>
        This feature opens an interactive anti-phishing assistant powered by Streamlit. You can chat with the bot, ask about phishing, or paste suspicious links to check their safety.
      </p>
      <ol>
        <li>Click the button below to open the chatbot in a new tab.</li>
        <li>Allow a few seconds for the app to load.</li>
        <li>Chat, ask questions, or paste links for instant analysis.</li>
      </ol>
      <a
        href="http://localhost:8501/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "inline-block", marginTop: 16 }}
      >
        <button style={{ padding: "10px 24px", fontSize: 16, background: "#4f8cff", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Open Phishing Chatbot
        </button>
      </a>
      <p style={{ marginTop: 24, color: "#888" }}>
        <b>Note:</b> The chatbot runs as a separate app. If it doesn't open, make sure to start it with <code>streamlit run tools/phishing_chatbot.py</code> in your project folder.
      </p>
    </div>
  );
};

export default PhishingChatbotInfo;
