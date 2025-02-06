import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Carousel,
  Card,
  Form,
  Input,
  Button,
  message,
  List,
  Spin,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  SmileOutlined,
  BulbOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import HomeLoggedIn from "../HomeLoggedIn/HomeLoggedIn";

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

const features = [
  {
    icon: <SmileOutlined style={{ fontSize: "24px", color: "#fff" }} />,
    title: "Reconnect with Classmates",
    description: "Find your batchmates and relive cherished memories together.",
  },
  {
    icon: <BulbOutlined style={{ fontSize: "24px", color: "#fff" }} />,
    title: "Share Your Journey",
    description:
      "Post photos, testimonials, and milestones from your SOM25 experience.",
  },
  {
    icon: <TrophyOutlined style={{ fontSize: "24px", color: "#fff" }} />,
    title: "Participate in Challenges",
    description:
      "Join exciting challenges and showcase your memorable moments.",
  },
];

const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await loginUser(values.email, values.password);
      message.success("Login successful!");
      navigate("/");
    } catch (error: any) {
      console.error(error);
      message.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderCarousel = () => (
    <Carousel autoplay>
      {[1, 2, 3, 4].map((index) => (
        <div key={index}>
          <img
            src={`/homecas/image${index}.png`}
            alt={`Showcase ${index}`}
            style={{ width: "100%", height: "400px", objectFit: "cover" }}
          />
        </div>
      ))}
    </Carousel>
  );
  if (loading) {
    return (
      <Layout
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </Layout>
    );
  }
  if (user) {
    return <HomeLoggedIn userId={user.uid} userData={user} />;
  }

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #6e8efb, #a777e3)",
      }}
    >
      <Content style={{ padding: "20px" }}>
        <div style={{ marginBottom: "20px" }}>{renderCarousel()}</div>

        <div
          style={{
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <div style={{ flex: "1 1 500px", padding: "20px", color: "#fff" }}>
            <Title style={{ color: "#fff" }}>Welcome to SOM25 Yearbook</Title>
            <Text
              style={{ fontSize: "18px", lineHeight: "1.8", color: "#f0f0f0" }}
            >
              Discover memories, share your journey, and connect with
              classmates. This is your space to cherish and relive unforgettable
              moments.
            </Text>
            <List
              style={{ marginTop: "20px" }}
              dataSource={features}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    bordered={false}
                    style={{ background: "#ffffff22", width: "100%" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {item.icon}
                      <div>
                        <Title level={5} style={{ margin: 0, color: "#fff" }}>
                          {item.title}
                        </Title>
                        <Text style={{ color: "#f0f0f0" }}>
                          {item.description}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
            <Button
              type="primary"
              size="large"
              style={{ marginTop: "20px" }}
              onClick={() => navigate("/features")}
            >
              Explore Yearbook
            </Button>
          </div>

          <Card
            style={{
              width: "100%",
              padding: "40px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              textAlign: "center",
            }}
          >
            <Title level={3} style={{ marginBottom: "20px" }}>
              Log In
            </Title>
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please input your email!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter your email"
                />
              </Form.Item>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                {" "}
                Log In{" "}
              </Button>
            </Form>
            <Text
              style={{ display: "block", marginTop: "20px", color: "#aaa" }}
            >
              Don’t have an account?{" "}
              <Button type="link" onClick={() => navigate("/signup")}>
                Sign Up
              </Button>
            </Text>
          </Card>
        </div>
      </Content>
      <Footer
        style={{ textAlign: "center", color: "#f0f0f0", background: "#6e8efb" }}
      >
        {" "}
        SOM25 Yearbook ©2025 | Created to cherish and share memories | Presented
        by the Cultural Council{" "}
      </Footer>
    </Layout>
  );
};

export default HomePage;
