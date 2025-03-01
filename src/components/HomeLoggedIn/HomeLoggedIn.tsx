import React, { useState, useEffect } from "react";
import { Input, Row, Col, Card, Avatar, Button, Typography, Divider, List, Layout } from "antd";
import { EditOutlined, MessageOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, getDocs, query, orderBy, limit, doc, getDoc, where } from "firebase/firestore";
import ForumPage from "../ForumPage/ForumPage";
import ProfileCompletionCheck from "../ProfileCompletionCheck/ProfileCompletionCheck";
import usersBatch from "./users_with_batch.json";
const { Title, Text } = Typography;
const { Search } = Input;
const { Content, Sider } = Layout;

const getUserNameFromId = async (userId: string) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data().name || "Unknown" : "Unknown";
  } catch (error) {
    console.error("Error fetching user name:", error);
    return "Unknown";
  }
};

const HomeLoggedIn: React.FC<{ userData: any; userId: string }> = ({ userData, userId }) => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [randomTestimonials, setRandomTestimonials] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchProfiles = async (searchValue: string = "") => {
      try {
        let allProfiles = usersBatch;
        console.log("All profiles:", allProfiles);
        console.log("Search Term:", searchValue);
        setProfiles(allProfiles.filter(profile => (profile.name?.toLowerCase().includes(searchValue.toLowerCase()) || profile.email?.toLowerCase().includes(searchValue.toLowerCase()))).sort(() => 0.5 - Math.random()).slice(0, 4)); // Select 4 random profiles
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };
    const fetchLatestTestimonials = async () => {
  try {
    const testimonialsCollection = collection(db, "testimonials");
    const testimonialQuery = query(
      testimonialsCollection,
      where("show", "==", true), // Only fetch testimonials where show is true
      orderBy("timestamp", "desc"),
      limit(3) // Fetch only the latest 3 testimonials
    );
    
    const testimonialDocs = await getDocs(testimonialQuery);
    const testimonialsWithNames = await Promise.all(
      testimonialDocs.docs.map(async (doc) => {
        const data = doc.data();
        return {
          ...data,
          writerName: await getUserNameFromId(data.writer),
          receiverName: await getUserNameFromId(data.receiver),
        };
      })
    );

    setRandomTestimonials(testimonialsWithNames);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
  }
};

  

    useEffect(() => {
      fetchProfiles();
      fetchLatestTestimonials();
    }, []);

  return (
    <Layout style={{ minHeight: "100vh", background: "#eaf0f6" }}>
      <Content style={{ padding: "20px" }}>
        <Title level={2} style={{ color: "#333" }}>Welcome, {userData.name || "Friend"}</Title>
        <div style={{ marginBottom: 20 }}>
          <Title level={3} style={{ color: "#333" }}>Profiles</Title>
          <Search
            placeholder="Search profiles by name or email"
            allowClear
            enterButton="Search"
            size="large"
            onSearch={(value) => fetchProfiles(value)}
            style={{ marginBottom: 20 }}
          />
          <Row gutter={[16, 16]}>
            {profiles.map((profile) => (
              <Col key={profile.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  bordered={false}
                  hoverable
                  onClick={() => navigate(`/profile/${profile.id}`)}
                  style={{
                    marginBottom: 20,
                    borderRadius: 16,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    padding: "20px",
                    textAlign: "center",
                    background: "#f7f9fc",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  <Avatar
                    size={80}
                    src={profile?.photoURL || "https://via.placeholder.com/80"}
                    style={{ marginBottom: 16, border: "2px solid #6e8efb" }}
                  />
                  <Title level={5} style={{ color: "#333" }}>{profile?.name || "Anonymous"}</Title>
                  <Text type="secondary" style={{ fontSize: "14px", color: "#555" }}>{profile?.nickname || "No email provided"}</Text>
                  <Divider style={{ margin: "16px 0" }} />
                  <Button
                icon={<EditOutlined />}
                type="primary"
                block
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/write-testimonial`, { state: { receiverId: profile?.id } });
                }}
                style={{ marginTop: "10px" }}
              >
                Write Testimonial
              </Button>
              <Button
                icon={<MessageOutlined />}
                type="default"
                block
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/disappearing-text`);
                }}
                style={{ marginTop: "10px" }}
              >
                Send Message
              </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div>
          <Divider>Random Testimonials</Divider>
          {randomTestimonials.map((testimonial) => (
            <Card key={testimonial.id} hoverable onClick={() => navigate(`/profile/${testimonial.receiver}`)} style={{ width: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", background: "#ffffff", borderRadius: "8px", marginBottom: "10px" }}>
              <Text style={{ fontWeight: "bold", color: "#6e8efb" }}>{testimonial.testimonial}</Text>
              <Text type="secondary" style={{ display: "block", marginTop: "10px", fontSize: "12px", color: "#888" }}>
                - {testimonial.writerName} to {testimonial.receiverName}
              </Text>
            </Card>
          ))}
        </div>
      </Content>
    </Layout>
  );
};

export default HomeLoggedIn;
