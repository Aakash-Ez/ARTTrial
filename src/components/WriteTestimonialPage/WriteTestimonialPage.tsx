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
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env['REACT_APP_OPENAI_API_KEY'],
  dangerouslyAllowBrowser: true
});
const { TextArea } = Input;
const { Title, Text } = Typography;

const WriteTestimonialPage: React.FC = () => {
  const location = useLocation();
  const receiverId = location.state?.receiverId;
  const [receiverData, setReceiverData] = useState<any>(null);
  const [writerData, setWriterData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [testimonialText, setTestimonialText] = useState("");
  const [form] = Form.useForm();
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

  const handleOptimize = async () => {
    if (!testimonialText) {
      message.error("Please write a testimonial first.");
      return;
    }
    setOptimizing(true);
    try {
      let response = "";
      const command = "Improve the following testimonial without changing its core meaning. Just the testimonial. Keep it fun. Note this is for Yearbook Testimonial amongst batchmates:\n\n" + testimonialText;
      const stream = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: command }],
        stream: true,
      });
      for await (const chunk of stream) {
        if(chunk.choices[0]?.delta?.content !== undefined) {
          response += chunk.choices[0]?.delta?.content;
        }
      }
      setTestimonialText(response);
      form.setFieldsValue({ testimonial: response });
      message.success("Testimonial optimized successfully!");
    } catch (error) {
      console.error("Error optimizing testimonial:", error);
      message.error("Failed to optimize the testimonial. Please try again.");
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div style={{ padding: "20px", background: "#f7fafc" }}>
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={24} md={10} lg={8} xl={6}>
          <Card bordered={false}>
            {receiverData ? (
              <ProfileShowcase userId={receiverId} editable={false} />
            ) : (
              <div>Loading receiver data...</div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={24} md={14} lg={12} xl={10}>
          <Card bordered={false}>
            <Title level={3}>Write a Testimonial</Title>
            <Form layout="vertical" form={form} onFinish={handleSubmit}>
              <Form.Item
                name="testimonial"
                label={<Text>Your Testimonial</Text>}
                rules={[{ required: true, message: "Please write your testimonial!" }]}
              >
                <TextArea
                  rows={6}
                  value={testimonialText}
                  onChange={(e) => setTestimonialText(e.target.value)}
                />
              </Form.Item>
              <Button onClick={handleOptimize} loading={optimizing} block>
                AI Optimize
              </Button>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
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