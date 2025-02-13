import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, message, Row, Col } from "antd";
import ProfileShowcase from "../ProfileShowcase/ProfileShowcase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { getCurrentUserInfo } from "../../auth";
import { createEventLog } from "../../utilities/CreateEventLog";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;
const { Title, Text } = Typography;

const WriteTestimonialPage: React.FC = () => {
  const location = useLocation();
  const receiverId = location.state?.receiverId;
  const [receiverData, setReceiverData] = useState<any>(null);
  const [writerData, setWriterData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReceiverData = async () => {
      try {
        const receiverDoc = await getDoc(doc(db, "users", receiverId));
        if (receiverDoc.exists()) {
          setReceiverData(receiverDoc.data());
        } else {
          console.error("Receiver data not found in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching receiver data:", error);
      }
    };

    const fetchWriterData = async () => {
      try {
        const writerInfo = await getCurrentUserInfo();
        if (writerInfo) {
          setWriterData(writerInfo);
        } else {
          console.error("Writer data not found or user is not logged in.");
        }
      } catch (error) {
        console.error("Error fetching writer data:", error);
      }
    };

    if (receiverId) fetchReceiverData();
    fetchWriterData();
  }, [receiverId]);

  const handleSubmit = async (values: { testimonial: string }) => {
    if (!receiverId || !writerData) {
      message.error("Invalid receiver or writer information.");
      return;
    }

    setLoading(true);
    try {
      const testimonialData = {
        testimonial: values.testimonial,
        writer: writerData.uid,
        receiver: receiverId,
        approved: false,
        rank: -1,
        timestamp: Timestamp.now(),
      };

      await addDoc(collection(db, "testimonials"), testimonialData);
      await createEventLog(writerData.uid, `You wrote a testimonial for ${receiverData?.name || "Unknown User"}`);

      message.success("Testimonial submitted successfully!");
      navigate("/profile/" + receiverId);
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      message.error("Failed to submit the testimonial. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!receiverId) {
    return <div>No receiver specified.</div>;
  }

  return (
    <div style={{ padding: "20px", background: "#f7fafc" }}>
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={24} md={10} lg={8} xl={6}>
          <Card bordered={false} style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
            {receiverData ? (
              <ProfileShowcase userId={receiverId} editable={false} />
            ) : (
              <div>Loading receiver data...</div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={24} md={14} lg={12} xl={10}>
          <Card bordered={false} style={{ textAlign: "center", background: "#edf2f7", padding: "20px" }}>
            <Title level={3} style={{ color: "#2d3748", marginBottom: "20px" }}>Write a Testimonial</Title>
            <Text style={{ color: "#4a5568", marginBottom: "10px", display: "block" }}>
              Share your thoughts and make it memorable for {receiverData?.name || "this person"}.
            </Text>
            <Form layout="vertical" onFinish={handleSubmit} style={{ marginTop: "20px" }}>
              <Form.Item
                name="testimonial"
                label={<Text style={{ color: "#2d3748" }}>Your Testimonial</Text>}
                rules={[{ required: true, message: "Please write your testimonial!" }]}
              >
                <TextArea rows={6} placeholder="Share your thoughts about this individual" maxLength={1000} style={{ borderRadius: "8px" }} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block style={{ borderRadius: "8px" }}>
                  Submit Testimonial
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WriteTestimonialPage;