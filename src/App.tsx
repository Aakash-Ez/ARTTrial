import React, { useEffect, useState } from "react";

const App: React.FC = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f8f8f8"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          backgroundColor: "#fee2e2",
          border: "1px solid #fca5a5",
          borderRadius: "16px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          maxWidth: "300px",
          opacity: animate ? 1 : 0,
          transform: animate ? "scale(1) translateY(0)" : "scale(0.9) translateY(-10px)",
          transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out"
        }}
      >
        <div
          style={{
            marginRight: "8px",
            animation: "bounce 1s infinite alternate"
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="red"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86l-8 14A1 1 0 0 0 3 20h16a1 1 0 0 0 .86-1.48l-8-14a1 1 0 0 0-1.72 0z" />
          </svg>
        </div>
        <span style={{ color: "#b91c1c", fontWeight: "bold", fontSize: "1.125rem" }}>Removed</span>
      </div>
    </div>
  );
};

export default App;

// Add the keyframes for bounce animation
const style = document.createElement("style");
style.innerHTML = `
@keyframes bounce {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-5px);
  }
}
`;
document.head.appendChild(style);