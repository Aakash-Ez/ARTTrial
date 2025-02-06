import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Avatar, Row, Col } from "antd";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import NavBar from "../NavBar/NavBar";

const { Title, Text } = Typography;

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async (uid: string) => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));

        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.error("No user data found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Text>No user data available. Please log in.</Text>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div style={{ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f5f5" }}>
        <Card style={{ width: 600, padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          <Row justify="center">
            <Avatar
              size={120}
              src={userData.photoURL || "https://via.placeholder.com/120"}
              alt="User Profile Picture"
              style={{ marginBottom: 20 }}
            />
          </Row>
          <Title level={3} style={{ textAlign: "center" }}>{userData.name}</Title>
          <Text type="secondary" style={{ textAlign: "center", display: "", marginBottom: 20 }}>{userData.email}</Text>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card bordered={false} style={{ textAlign: "center" }}>
                <Text strong>Nickname</Text>
                <Text >{userData.nickname || "N/A"}</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false} style={{ textAlign: "center" }}>
                <Text strong>Favorite Spot</Text>
                <Text >{userData.favoriteSpot || "N/A"}</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false} style={{ textAlign: "center" }}>
                <Text strong>Favorite Subject</Text>
                <Text >{userData.favoriteSubject || "N/A"}</Text>
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false} style={{ textAlign: "center" }}>
                <Text strong>My Gang</Text>
                <Text >{userData.myGang || "N/A"}</Text>
              </Card>
            </Col>
            <Col span={24}>
              <Card bordered={false} style={{ textAlign: "center" }}>
                <Text strong>Best Memory</Text>
                <Text >{userData.bestMemory || "N/A"}</Text>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
