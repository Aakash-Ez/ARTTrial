import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout, Typography, Card, List, Modal, Button, Tooltip } from "antd";
import { db } from "../../firebase";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { getCurrentUserInfo } from "../../auth";
import { getUserNameFromId } from "../../auth";

const { Content } = Layout;
const { Title, Text } = Typography;

const emojis = ["👍", "❤️", "😂", "😮", "😢", "👏"];

const ChallengeImages: React.FC = () => {
  const { challengeName } = useParams<{ challengeName: string }>();
  const [images, setImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfo = await getCurrentUserInfo();
        if (userInfo && userInfo.uid) {
          setUserId(userInfo.uid);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    const fetchImages = async () => {
      console.log(challengeName);
      if (!challengeName) {
        console.error("Challenge name is undefined");
        return;
      }
      try {
        const memoriesCollection = collection(db, "memories");
        const q = query(memoriesCollection, where("challenge", "==", decodeURIComponent(challengeName)));
        const memoryDocs = await getDocs(q);
        console.log(memoryDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setImages(memoryDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchUserData();
    fetchImages();
  }, [challengeName]);

  const handleEmojiReaction = async (imageId: string, emoji: string) => {
    if (!userId) return;
    try {
      const imageIndex = images.findIndex((img) => img.id === imageId);
      if (imageIndex === -1) return;
      
      const image = images[imageIndex];
      const updatedReactions = { ...image.reactions };
      
      if (!updatedReactions[userId]) {
        updatedReactions[userId] = emoji;
      } else if (updatedReactions[userId] === emoji) {
        delete updatedReactions[userId];
      } else {
        updatedReactions[userId] = emoji;
      }

      await updateDoc(doc(db, "memories", imageId), {
        reactions: updatedReactions,
      });

      setImages((prevImages) => {
        const updatedImages = [...prevImages];
        updatedImages[imageIndex] = { ...image, reactions: updatedReactions };
        return updatedImages;
      });
    } catch (error) {
      console.error("Error updating emoji reaction:", error);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", padding: "20px", background: "#f7f9fc" }}>
      <Content>
        <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>{decodeURIComponent(challengeName || "")}</Title>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={images}
          renderItem={(item) => (
            <List.Item key={item.id}>
  <Card
    hoverable
    cover={<img 
      key={item.id} // Ensure React recognizes it as unique
      alt="memory" 
      src={item.photo} 
      style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "8px" }}
      onClick={() => setSelectedImage(item)}
    />}
  >

                <Text>{item.memory}</Text>
                <div style={{ marginTop: "10px", display: "flex", gap: "5px" }}>
                  {emojis.map((emoji) => {
                    const count = Object.values(item.reactions || {}).filter(e => e === emoji).length;
                    return (
                      <Tooltip title={`React with ${emoji}`} key={emoji}>
                        <Button 
                          shape="circle" 
                          onClick={() => handleEmojiReaction(item.id, emoji)}
                          style={{
                            fontSize: "18px",
                            background: item.reactions?.[userId] === emoji ? "#f0f5ff" : "#f0f2f5",
                            border: item.reactions?.[userId] === emoji ? "2px solid #0050b3" : "none",
                          }}
                        >
                          {emoji} {count > 0 && <span style={{ fontSize: "14px", marginLeft: "5px" }}>{count}</span>}
                        </Button>
                      </Tooltip>
                    );
                  })}
                </div>
              </Card>
            </List.Item>
          )}
        />
        <Modal
          visible={!!selectedImage}
          footer={null}
          onCancel={() => setSelectedImage(null)}
          centered
        >
          <img src={selectedImage?.photo} alt="Enlarged Memory" style={{ width: "100%", borderRadius: "8px" }} />
          <Title level={4} style={{ marginTop: "10px" }}>Reactions</Title>
          {selectedImage?.reactions && Object.entries(selectedImage.reactions).map(([user, emoji]) => (
            <Text key={user as string}>{user as string}: {emoji as string}</Text>
          ))}
        </Modal>
      </Content>
    </Layout>
  );
};

export default ChallengeImages;
