import React, { useState, useEffect } from "react";
import { Card, Typography, Avatar, Row, Col, Divider, Space } from "antd";
import { UserOutlined, StarOutlined, BookOutlined, SmileOutlined, HeartOutlined } from "@ant-design/icons";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

const { Title, Text } = Typography;

const UserProfileSummary: React.FC<{ userId: string }> = ({ userId }) => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    };

    fetchUserData();
  }, [userId]);

  if (!userData) return <Text>Loading user details...</Text>;

  return (
    <Card
      style={{
        margin: "auto",
        textAlign: "center",
      }}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}><Space><StarOutlined /><Text strong>Favorite Spot:</Text></Space> <Text>{userData.favoriteSpot || "N/A"}</Text></Col>
        <Col span={12}><Space><BookOutlined /><Text strong>Favorite Subject:</Text></Space> <Text>{userData.favoriteSubject || "N/A"}</Text></Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
        <Col span={12}><Space><SmileOutlined /><Text strong>Best Memory:</Text></Space> <Text>{userData.bestMemory || "N/A"}</Text></Col>
        <Col span={12}><Space><HeartOutlined /><Text strong>What You'll Miss Most:</Text></Space> <Text>{userData.mbaLifeMiss || "N/A"}</Text></Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
        <Col span={12}><Space><SmileOutlined /><Text strong>MBA Life in Emojis:</Text></Space> <Text>{userData.mbaLifeEmojis || "N/A"}</Text></Col>
        <Col span={12}><Space><Text strong>Theme Song:</Text></Space> <Text>{userData.mbaLifeThemeSong || "N/A"}</Text></Col>
      </Row>
    </Card>
  );
};

export default UserProfileSummary;