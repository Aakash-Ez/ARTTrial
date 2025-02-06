import React, { useState, useEffect } from "react";
import { Card, Typography, Avatar, Button, Form, Input, Row, Col } from "antd";
import { getCurrentUserInfo } from "../../auth";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const { Title, Text } = Typography;

const UserProfileDetails: React.FC<{ userId: string }> = ({ userId }) => {
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
        form.setFieldsValue(userDoc.data());
      }
    };

    const fetchCurrentUser = async () => {
      const userInfo = await getCurrentUserInfo();
      if (userInfo) {
        setCurrentUser(userInfo.uid);
      }
    };

    fetchUserData();
    fetchCurrentUser();
  }, [userId, form]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    form.setFieldsValue(userData);
  };

  const handleSave = async () => {
    try {
      const updatedData = form.getFieldsValue();
      await updateDoc(doc(db, "users", userId), updatedData);
      setUserData(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (!userData) return <Text>Loading user details...</Text>;

  return (
    <Card
      style={{ margin: "auto", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
    >
      <Form layout="vertical" form={form} disabled={!isEditing} style={{ marginTop: "30px" }}>
        <Row gutter={16}>
          <Col span={12}><Form.Item name="nickname" label="Nickname"><Input /></Form.Item></Col>
          <Col span={12}><Form.Item name="favoriteSpot" label="Favorite Spot"><Input /></Form.Item></Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}><Form.Item name="favoriteSubject" label="Favorite Subject"><Input /></Form.Item></Col>
          <Col span={12}><Form.Item name="bestMemory" label="Best Memory"><Input /></Form.Item></Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}><Form.Item name="lifeLesson" label="Life Lesson"><Input /></Form.Item></Col>
          <Col span={12}><Form.Item name="mbaLifeEmojis" label="MBA Life in Emojis"><Input /></Form.Item></Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}><Form.Item name="mbaLifeMiss" label="What You'll Miss Most"><Input /></Form.Item></Col>
          <Col span={12}><Form.Item name="mbaLifeThemeSong" label="MBA Life Theme Song"><Input /></Form.Item></Col>
        </Row>
      </Form>
      {currentUser === userId && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          {isEditing ? (
            <>
              <Button type="primary" onClick={handleSave} style={{ marginRight: "10px" }}>
                Save
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </>
          ) : (
            <Button type="primary" onClick={handleEdit}>
              Edit Profile
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default UserProfileDetails;