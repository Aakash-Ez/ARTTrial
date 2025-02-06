import React, { useState, useEffect } from "react";
import { Layout, Typography, Card, Avatar, List, Divider, Button } from "antd";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { getCurrentUserInfo } from "../../auth";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title, Text } = Typography;

const TestimonialsOverview: React.FC = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

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

    const fetchProfiles = async () => {
      try {
        const profilesCollection = collection(db, "users");
        const profileDocs = await getDocs(profilesCollection);
        setProfiles(profileDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter(profile => profile.id !== userId));
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };

    const fetchTestimonials = async () => {
      try {
        const testimonialsCollection = collection(db, "testimonials");
        const testimonialDocs = await getDocs(testimonialsCollection);
        setTestimonials(testimonialDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };

    fetchUserData();
    fetchProfiles();
    fetchTestimonials();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh", padding: "20px", background: "#f7f9fc" }}>
      <Content>
        <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>Testimonials Overview</Title>
        {['No Testimonials Yet', 'They Wrote for Me', 'I Wrote for Them', 'Mutual Appreciation'].map((category) => (
          <div key={category}>
            <Divider>{category}</Divider>
            <List
              grid={{ gutter: 16, column: 1, xs: 1, sm: 2, md: 3, lg: 4 }}
              dataSource={profiles.filter(profile => {
                const hasWritten = testimonials.some(t => t.writer === userId && t.receiver === profile.id);
                const hasReceived = testimonials.some(t => t.receiver === userId && t.writer === profile.id);
                if (category === 'No Testimonials Yet') return !hasWritten && !hasReceived;
                if (category === 'They Wrote for Me') return hasReceived && !hasWritten;
                if (category === 'I Wrote for Them') return hasWritten && !hasReceived;
                if (category === 'Mutual Appreciation') return hasWritten && hasReceived;
                return false;
              })}
              renderItem={(profile) => {
                const writtenTestimonials = testimonials.filter(t => t.writer === userId && t.receiver === profile.id);
                return (
                  <List.Item>
                    <Card
                      style={{
                        backgroundColor: writtenTestimonials.length ? "#eaffea" : "#ffeaea",
                        borderRadius: "12px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        padding: "16px",
                        textAlign: "center",
                      }}
                    >
                      <Avatar size={64} src={profile.photoURL || "https://via.placeholder.com/64"} style={{ marginBottom: "10px" }} />
                      <Title level={5} style={{ marginBottom: "5px" }}>{profile.name}</Title>
                      <Text type="secondary">{profile.nickname}</Text><br></br>
                      {writtenTestimonials.length > 0 ? (
                        <List
                          size="small"
                          dataSource={writtenTestimonials}
                          renderItem={(testimonial) => (
                            <List.Item>
                              <Text italic>{testimonial.testimonial}</Text>
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Button
                          type="primary"
                          style={{ marginTop: "10px" }}
                          onClick={() => navigate(`/write-testimonial`, { state: { receiverId: profile.id } })}
                        >
                          Write Testimonial
                        </Button>
                      )}
                    </Card>
                  </List.Item>
                );
              }}
            />
          </div>
        ))}
      </Content>
    </Layout>
  );
};

export default TestimonialsOverview;