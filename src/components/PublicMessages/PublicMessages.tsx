import React, { useState, useEffect } from "react";
import { Layout, Card, List, Typography } from "antd";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { getUserNameFromId } from "../../utilities/GetUserName";

const { Content } = Layout;
const { Title, Text } = Typography;

const PublicMessages: React.FC<{ userId: string }> = ({ userId }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicMessages = async () => {
      try {
        const messagesCollection = collection(db, "messages");
        const currentTimestamp = Timestamp.now();
        const q = query(
          messagesCollection,
          where("receiver", "==", userId),
          where("public", "==", true),
          where("expiryTime", ">", currentTimestamp)
        );

        const messageDocs = await getDocs(q);
        console.log(messageDocs);
        const messagesWithNames = await Promise.all(
          messageDocs.docs.map(async (doc) => {
            const data = doc.data();
            return {
              ...data,
              senderName: await getUserNameFromId(data.sender),
            };
          })
        );

        setMessages(messagesWithNames);
      } catch (error) {
        console.error("Error fetching public messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicMessages();
  }, [userId]);

  return (
    <Layout style={{ padding: "20px", background: "#ffffff" }}>
      <Content>
        <Card title={<Title level={3}>Public Messages</Title>} style={{ borderRadius: "12px", background: "#f0f2f5", color: "#333" }}>
          {loading ? (
            <div>Loading messages...</div>
          ) : messages.length > 0 ? (
            <List
              dataSource={messages}
              renderItem={(item) => (
                <List.Item>
                  <Card style={{ width: "100%", background: "#ffffff", borderRadius: "10px" }}>
                    <Text><strong>From:</strong> {item.senderName}</Text>
                    <p>{item.message}</p>
                    <Text style={{ fontSize: "12px", color: "#888" }}>
                      <strong>Expires:</strong> {item.expiryTime ? item.expiryTime.toDate().toLocaleString() : "Never"}
                    </Text>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <div>No public messages found.</div>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default PublicMessages;
