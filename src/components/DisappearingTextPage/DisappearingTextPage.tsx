import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Card, Form, Select, Button, List, message, Input, Switch, Typography } from "antd";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { getCurrentUserInfo } from "../../auth";
import { getUserNameFromId } from "../../utilities/GetUserName";
import { useNavigate } from "react-router-dom";
const { Title, Text } = Typography;

const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

const DisappearingTextPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfo = await getCurrentUserInfo();
        if (userInfo && userInfo.uid) {
          setUserId(userInfo.uid);
          setUserName(userInfo.name || "Anonymous");

          const usersCollection = collection(db, "users");
          const userDocs = await getDocs(usersCollection);
          setUsers(userDocs.docs.map((doc) => ({ id: doc.id, name: doc.data().name || "Unknown" })));

          const messagesCollection = collection(db, "messages");
          const currentTimestamp = Timestamp.now();
          const q = query(
            messagesCollection,
            where("receiver", "==", userInfo.uid),
            where("expiryTime", ">", currentTimestamp)
          );

          const messageDocs = await getDocs(q);
          setMessages(messageDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error("Error fetching user data or messages:", error);
        message.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSendMessage = async (values: any) => {
    try {
      const expiryTime = values.duration === "indefinite" ? null : Timestamp.fromDate(new Date(Date.now() + values.duration * 86400000));
      const sender = userId ? await getUserNameFromId(userId) : "snonymous";
      const newMessage = {
        sender: values.sender === "anonymous" ? "Anonymous" : sender,
        userId: userId,
        receiver: values.receiver,
        message: values.message,
        expiryTime: expiryTime,
        timestamp: Timestamp.now(),
        public: values.public
      };

      const messagesCollection = collection(db, "messages");
      await addDoc(messagesCollection, newMessage);

      message.success("Message sent successfully!");
      navigate("/profile/" + values.receiver);
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Failed to send message. Please try again.");
    }
  };

  return (
    <Layout style={{ padding: "20px", background: "#ffffff", minHeight: "100vh" }}>
      <Content>
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} md={11}>
            <Card title="Send a Secret Message" style={{ borderRadius: "12px", background: "#f0f2f5", color: "#333" }}>
              <Form onFinish={handleSendMessage} layout="vertical">
                <Form.Item name="sender" initialValue="name" rules={[{ required: true }]}> 
                  <Select>
                    <Option value="name">Use Name</Option>
                    <Option value="anonymous">Anonymous</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="receiver" rules={[{ required: true }]}> 
                  <Select placeholder="Select Receiver">
                    {users.map((user) => (
                      <Option key={user.id} value={user.id}>{user.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="message" rules={[{ required: true }]}> 
                  <TextArea rows={4} placeholder="Write your message here..." />
                </Form.Item>
                <Form.Item name="duration" rules={[{ required: true }]}> 
                  <Select placeholder="Select Duration">
                    <Option value={1}>1 Day</Option>
                    <Option value={2}>2 Days</Option>
                    <Option value={1000000}>Indefinite</Option>
                  </Select>
                </Form.Item>
                <Text>Make it Public:</Text> 
                <Form.Item name="public" initialValue={true} valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Button type="primary" htmlType="submit" block>Send Message</Button>
              </Form>
            </Card>
          </Col>
          <Col xs={24} md={11}>
            <Card title="Your Messages" style={{ borderRadius: "12px", background: "#f0f2f5", color: "#333" }}>
              {loading ? (
                <div>Loading messages...</div>
              ) : messages.length > 0 ? (
                <List
                  dataSource={messages}
                  renderItem={(item) => (
                    <List.Item>
                      <Card style={{width: "100%"}}>
                        <p><strong>From:</strong> {item.sender}</p>
                        <p>{item.message}</p>
                        <p><strong>Expires:</strong> {item.expiryTime ? item.expiryTime.toDate().toLocaleString() : "Never"}</p>
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <div>No messages found.</div>
              )}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default DisappearingTextPage;