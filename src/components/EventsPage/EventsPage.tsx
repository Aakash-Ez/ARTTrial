import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Spin } from "antd";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { PictureOutlined, TrophyOutlined, UserOutlined, CommentOutlined } from "@ant-design/icons";
import { db } from "../../firebase";
import { getCurrentUserInfo } from "../../auth";

const { Title, Text } = Typography;

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const currentUser = await getCurrentUserInfo();
        if (!currentUser) {
          console.error("No current user found.");
          setLoading(false);
          return;
        }

        const currentUserId = currentUser.uid;
        const eventsCollection = collection(db, "eventLogs");
        const eventsQuery = query(
          eventsCollection,
          where("userId", "==", currentUserId),
          orderBy("timestamp", "desc")
        );
        const eventsDocs = await getDocs(eventsQuery);
        const eventsList = eventsDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsList);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getIcon = (action: string) => {
    if (action.includes("memory")) return <PictureOutlined style={{ color: "#1890ff" }} />;
    if (action.includes("achievement")) return <TrophyOutlined style={{ color: "#ffc107" }} />;
    if (action.includes("comment")) return <CommentOutlined style={{ color: "#52c41a" }} />;
    return <UserOutlined style={{ color: "#ff4d4f" }} />;
  };

  return (
    <div>
      <div style={{ padding: "24px" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
          Recent Events
        </Title>
        {loading ? (
          <Spin size="large" style={{ display: "block", margin: "0 auto" }} />
        ) : (
          <Row gutter={[16, 16]} justify="center">
            {events.map((event) => (
              <Col key={event.id} xs={24} sm={12} md={8} lg={6}>
                <Card hoverable>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {getIcon(event.event)}
                    <div style={{ marginLeft: "10px" }}>
                      <Text strong style={{ display: "block", color: "#888" }}>{event.event}</Text>
                      <Text style={{ display: "block", fontSize: "12px", color: "#bbb" }}>{event.timestamp?.seconds ? new Date(event.timestamp.seconds * 1000).toLocaleString() : "No timestamp"}</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
