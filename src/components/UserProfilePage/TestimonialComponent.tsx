import React, { useEffect, useState } from "react";
import { List, Card, Row, Col, Avatar, Typography, Divider, Button, Tooltip, Space } from "antd";
import { getCurrentUserInfo } from "../../auth";

const { Text } = Typography;
const emojis = ["👍", "❤️", "😂", "😮", "😢", "👏"];

interface Testimonial {
  id: string;
  testimonial: string;
  writer: string;
  writerName?: string;
  writerPhoto?: string;
  receiver: string;
  approved: boolean;
  rank: number;
  reactions?: { [reactorId: string]: string };
}

const TestimonialComponent: React.FC<{ userId: string; testimonials: Testimonial[]; handleEmojiReaction: (testimonialId: string, emoji: string) => void }> = ({ userId, testimonials, handleEmojiReaction }) => {
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await getCurrentUserInfo();
      if (userInfo) {
        setLoggedInUserId(userInfo.uid);
      }
    };
    fetchUserInfo();
  }, []);

  return (
    <>
      <Divider>Testimonials</Divider>
      {testimonials.length > 0 ? (
        <List
          dataSource={testimonials}
          renderItem={(testimonial) => (
            <List.Item>
              <Card
                style={{
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  width: "100%",
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "linear-gradient(135deg, #fdfbfb, #ebedee)",
                  padding: "20px",
                }}
              >
                <Row align="middle" gutter={[24, 24]}>
                  <Col flex="none">
                    <Avatar
                      src={testimonial.writerPhoto}
                      size={80}
                      style={{ marginRight: 16, objectFit: "cover", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
                    />
                  </Col>
                  <Col flex="auto">
                    <Text style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>{testimonial.writerName}</Text>
                    <Text type="secondary" style={{ display: "block", marginTop: "10px", fontSize: "18px", color: "#666" }}>
                      {testimonial.testimonial}
                    </Text>
                  </Col>
                </Row>
                <Divider style={{ margin: "20px 0" }} />
                <Row justify="start" align="middle" gutter={[16, 16]}>
                  <Space>
                    {emojis.map((emoji) => {
                      const reactionCount = Object.values(testimonial.reactions || {}).filter((e) => e === emoji).length;
                      const isSelected = loggedInUserId && testimonial.reactions?.[loggedInUserId] === emoji;
                      return (
                        <Tooltip title={`React with ${emoji}`} key={emoji}>
                          <Button
                            shape="circle"
                            onClick={() => handleEmojiReaction(testimonial.id, emoji)}
                            style={{
                              fontSize: "18px",
                              padding: "10px",
                              background: isSelected ? "#f0f5ff" : "#fff",
                              border: isSelected ? "2px solid #0050b3" : "1px solid #d9d9d9",
                              transition: "all 0.3s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {emoji} {reactionCount > 0 && <span style={{ fontSize: "14px", marginLeft: "5px" }}>{reactionCount}</span>}
                          </Button>
                        </Tooltip>
                      );
                    })}
                  </Space>
                </Row>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Text>No testimonials available.</Text>
      )}
    </>
  );
};

export default TestimonialComponent;
