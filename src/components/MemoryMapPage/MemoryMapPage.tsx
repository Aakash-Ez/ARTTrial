import React, { useState, useEffect } from "react";
import { Layout, Typography, Card, Progress, Button, Modal, Form, Input, Select, Upload, List } from "antd";
import { db } from "../../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./MemoryMapPage.css";
import { uploadPhotoToStorage } from "../../auth";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const MemoryMapPage: React.FC = () => {
  const [memories, setMemories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memoryText, setMemoryText] = useState("");
  const [challenge, setChallenge] = useState<string | undefined>(undefined);
  const [photo, setPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const memoriesCollection = collection(db, "memories");
        const memoryDocs = await getDocs(memoriesCollection);
        setMemories(memoryDocs.docs.map((doc) => doc.data()));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchMemories();
  }, []);

  const challenges = [
    { title: "100 Photos of H14", goal: 100 },
    { title: "100 Photos of H17", goal: 100 },
    { title: "50 Photos of H15", goal: 50 },
    { title: "70 Nights to Remember", goal: 70 },
    { title: "70 Functions and Parties", goal: 70 },
  ];

  const calculateProgress = (challengeTitle: string) => {
    const count = memories.filter((memory) => memory.challenge === challengeTitle).length;
    const goal = challenges.find((c) => c.title === challengeTitle)?.goal || 0;
    return Math.min((count / goal) * 100, 100);
  };

  const handleAddMemory = async () => {
    if (!memoryText || !challenge) {
      return;
    }

    setLoading(true);

    try {
      const base64Photo = photo
        ? await new Promise<string | ArrayBuffer | null>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Error reading file"));
            reader.readAsDataURL(photo);
          })
        : null;
      
      const photoURL = await uploadPhotoToStorage(base64Photo, "memory", "memories");
      
      const newMemory = {
        memory: memoryText,
        challenge,
        photo: photoURL,
        date: new Date().toISOString(),
      };

      await addDoc(collection(db, "memories"), newMemory);
      setMemories((prev) => [newMemory, ...prev]);
      setMemoryText("");
      setPhoto(null);
      setChallenge(undefined);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding memory:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", display: "flex", background: "#f7f9fc" }}>
      {/* Right Side: Challenges */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Title level={3} style={{ marginBottom: "20px" }}>Community Challenges</Title>
        {challenges.map((challenge) => (
          <Card
            key={challenge.title}
            style={{ marginBottom: "16px", borderRadius: "12px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
          >
            <Title level={4}>{challenge.title}</Title>
            <Progress
              percent={parseFloat(parseFloat(calculateProgress(challenge.title).toFixed(2)).toFixed(2))}
              strokeColor={{ from: "#108ee9", to: "#87d068" }}
              showInfo
            />
            <Text type="secondary">
              {Math.min(
                memories.filter((memory) => memory.challenge === challenge.title).length,
                challenge.goal
              )} / {challenge.goal} memories added
            </Text>

            <Button
              type="default"
              style={{ marginTop: "10px", width: "100%" }}
              onClick={() => navigate(`/challenge/${challenge.title}`)}
            >
              View Current Photos
            </Button>
          </Card>
        ))}

        <Button
          type="primary"
          style={{ marginTop: "20px", width: "100%" }}
          onClick={() => setIsModalOpen(true)}
        >
          Upload Memory
        </Button>
      </div>

      {/* Upload Memory Modal */}
      <Modal
        title="Upload Memory"
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAddMemory}
        confirmLoading={loading}
      >
        <Form layout="vertical">
          <Form.Item
            label="Memory"
            rules={[{ required: true, message: "Please enter a memory!" }]}
          >
            <Input.TextArea
              rows={4}
              value={memoryText}
              onChange={(e) => setMemoryText(e.target.value)}
              placeholder="Share your memory..."
            />
          </Form.Item>
          <Form.Item
            label="Challenge"
            rules={[{ required: true, message: "Please select a challenge!" }]}
          >
            <Select
              placeholder="Select a challenge"
              value={challenge}
              onChange={(value) => setChallenge(value)}
            >
              {challenges.map((c) => (
                <Option key={c.title} value={c.title}>
                  {c.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Photo"
            rules={[{ required: true, message: "Please upload a photo!" }]}
          >
            <Upload
              maxCount={1}
              beforeUpload={(file) => {
                setPhoto(file);
                return false;
              }}
              listType="picture"
            >
              <Button>Upload Photo</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default MemoryMapPage;
