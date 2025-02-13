import React from "react";
import { Button, Space, Tooltip } from "antd";

interface ReactionsComponentProps {
  reactions: { [userId: string]: string };
  handleReaction: (emoji: string) => void;
}

const emojis = ["👍", "❤️", "😂", "😮", "😢", "👏"];

const ReactionsComponent: React.FC<ReactionsComponentProps> = ({ reactions, handleReaction }) => {
  return (
    <Space wrap>
      {emojis.map((emoji) => {
        const count = Object.values(reactions).filter((reaction) => reaction === emoji).length;
        return (
          <Tooltip key={emoji} title={`React with ${emoji}`}>
            <Button
              shape="circle"
              onClick={() => handleReaction(emoji)}
              style={{
                fontSize: "18px",
                background: reactions[emoji] ? "#f0f5ff" : "#f0f2f5",
                border: reactions[emoji] ? "2px solid #0050b3" : "none",
              }}
            >
              {emoji} {count > 0 && <span style={{ fontSize: "14px", marginLeft: "5px" }}>{count}</span>}
            </Button>
          </Tooltip>
        );
      })}
    </Space>
  );
};

export default ReactionsComponent;
