import React, { useState, useEffect, useRef } from "react";
import { Layout, Card, Input, Button, List, Avatar, Switch, message } from "antd";
import { collection, addDoc, query, orderBy, Timestamp, onSnapshot, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { getCurrentUserInfo } from "../../auth";

const { Content } = Layout;
const { TextArea } = Input;

const ForumPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [anonymousMode, setAnonymousMode] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfo = await getCurrentUserInfo();
        if (userInfo && userInfo.uid) {
          setUserId(userInfo.uid);
          setUserName(userInfo.name || "Anonymous");
          setUserPhoto(userInfo.photoURL || "https://via.placeholder.com/40");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const messagesCollection = collection(db, "forumMessages");
    const messagesQuery = query(messagesCollection, orderBy("timestamp", "desc"), limit(50));

    onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).reverse();
      setMessages(fetchedMessages);
      scrollToBottom();
    });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) {
      message.error("Message cannot be empty.");
      return;
    }
    try {
      const newMessage = {
        userId: anonymousMode ? "anonymous" : userId,
        userName: anonymousMode ? "Anonymous" : userName,
        userPhoto: anonymousMode ? "https://via.placeholder.com/40" : userPhoto,
        message: messageInput,
        timestamp: Timestamp.now(),
        sender: userName
      };
      await addDoc(collection(db, "forumMessages"), newMessage);
      setMessageInput("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Failed to send message. Please try again.");
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <Layout style={{ background: "#ffffff", height: '120vh', maxWidth: '100%', display: "flex", flexDirection: "column" }}>
      <Content style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column-reverse", width: "100%" }}>
        <Card title="Forum Chat" style={{ borderRadius: "12px", width: "100%", margin: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", flex: 1, overflowY: "auto" }}>
          <List
            dataSource={messages}
            renderItem={(item) => (
              <List.Item style={{ display: "flex", alignItems: "center" }}>
                <Avatar src={item.userPhoto} size={40} style={{ marginRight: "10px" }} />
                <Card style={{ width: "100%", background: "#f0f2f5", borderRadius: "10px" }}>
                  <p><strong>{item.userName}</strong></p>
                  <p>{item.message}</p>
                  <p style={{ fontSize: "12px", color: "#888" }}>
                    {item.timestamp?.toDate().toLocaleString()}
                  </p>
                </Card>
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
        </Card>
      </Content>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", background: "#fff", position: "sticky", bottom: 0, width: "100%", boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)", padding: "10px" }}>
        <Switch checked={anonymousMode} onChange={() => setAnonymousMode(!anonymousMode)} />
        <Avatar src={anonymousMode ? "https://via.placeholder.com/40" : userPhoto} size={40} />
        <TextArea
          rows={2}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type your message..."
          style={{ borderRadius: "10px", flex: 1 }}
        />
        <Button type="primary" onClick={handleSendMessage} style={{ borderRadius: "10px" }}>Send</Button>
      </div>
    </Layout>
  );
};

export default ForumPage;