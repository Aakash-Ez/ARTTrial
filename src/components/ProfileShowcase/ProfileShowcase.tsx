import React, { useState, useEffect } from "react";
import { Card, Avatar, Typography, Form, Input, Button, Row, Col, Spin, message } from "antd";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { fetchPicture } from "../../auth";

const { Title, Text } = Typography;

const ProfileShowcase: React.FC<{ userId: string; editable: boolean }> = ({ userId, editable }) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userInfo = userDoc.data();
          setUserData(userInfo);
          form.setFieldsValue(userInfo);
        } else {
          console.error("User data not found in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, form]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.setFieldsValue(userData);
  };

  const handleSave = async () => {
    const updatedData = form.getFieldsValue();
    setIsEditing(false);
    setUserData(updatedData);
    try {
      await setDoc(doc(db, "users", userId), updatedData, { merge: true });
      message.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving user data:", error);
      message.error("Failed to update profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!userData) {
    return <div>No user data available.</div>;
  }

  return (
    <Card bordered={false} style={{ margin: "0 auto", padding: "20px" }}>
      <Row gutter={[16, 16]} justify="center">
        <Col span={24} style={{ textAlign: "center" }}>
          <Avatar
            size={120}
            src={userData?.photoURL || "https://via.placeholder.com/120"}
            alt="Profile Picture"
            style={{ border: "4px solid #e2e8f0", boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)" }}
          />
        </Col>
        <Col span={24} style={{ textAlign: "center" }}>
          <Title level={3} style={{ margin: "10px 0", color: "#2d3748" }}>{userData?.name || "Your Name"}</Title>
          <Text type="secondary" style={{ fontSize: "14px", color: "#4a5568" }}>{userData?.email || "your.email@example.com"}</Text>
        </Col>
        <Col span={24}>
          <Form layout="vertical" form={form} disabled={!isEditing} style={{ textAlign: "left" }}>
            <Form.Item label="Nickname" name="nickname">
              <Input placeholder="Enter your nickname" />
            </Form.Item>
            <Form.Item label="Favorite Spot" name="favoriteSpot">
              <Input placeholder="Enter your favorite spot" />
            </Form.Item>
            <Form.Item label="Favorite Subject" name="favoriteSubject">
              <Input placeholder="Enter your favorite subject" />
            </Form.Item>
            <Form.Item label="Best Memory" name="bestMemory">
              <Input.TextArea placeholder="Share your best memory" rows={3} />
            </Form.Item>
          </Form>
        </Col>
        {editable && (
          <Col span={24} style={{ textAlign: "center" }}>
            {!isEditing ? (
              <Button type="primary" onClick={handleEdit} style={{ marginRight: "8px" }}>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button type="primary" onClick={handleSave} style={{ marginRight: "8px" }}>
                  Save Changes
                </Button>
                <Button onClick={handleCancel}>Cancel</Button>
              </>
            )}
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default ProfileShowcase;