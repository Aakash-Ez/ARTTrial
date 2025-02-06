import React from "react";
import { Layout, Typography, List, Card } from "antd";
import { SmileOutlined, BulbOutlined, TrophyOutlined, TeamOutlined, CameraOutlined } from "@ant-design/icons";

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

const featureDetails = [
  {
    icon: <SmileOutlined style={{ fontSize: "24px", color: "#6e8efb" }} />,
    title: "Reconnect with Classmates",
    description: "Find your batchmates and relive cherished memories together.",
  },
  {
    icon: <BulbOutlined style={{ fontSize: "24px", color: "#a777e3" }} />,
    title: "Share Your Journey",
    description: "Post photos, testimonials, and milestones from your SOM25 experience.",
  },
  {
    icon: <TrophyOutlined style={{ fontSize: "24px", color: "#ffcc00" }} />,
    title: "Participate in Challenges",
    description: "Join exciting challenges and showcase your memorable moments.",
  },
  {
    icon: <TeamOutlined style={{ fontSize: "24px", color: "#87d068" }} />,
    title: "Collaborate with Your Peers",
    description: "Build connections and strengthen your network within the SOM community.",
  },
  {
    icon: <CameraOutlined style={{ fontSize: "24px", color: "#ff5722" }} />,
    title: "Create Timeless Highlights",
    description: "Upload photos and create highlights to make your memories last forever.",
  },
];

const FeaturesPage: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh", background: "linear-gradient(135deg, #6e8efb, #a777e3)" }}>
      <Content style={{ padding: "20px" }}>
        <Title style={{ textAlign: "center", color: "#fff", marginBottom: "30px" }}>Key Features</Title>

        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={featureDetails}
          renderItem={(item) => (
            <List.Item>
              <Card
                bordered={false}
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  background: "#fff",
                  textAlign: "center",
                }}
              >
                <div style={{ marginBottom: "10px" }}>{item.icon}</div>
                <Title level={4} style={{ color: "#333" }}>{item.title}</Title>
                <Text style={{ fontSize: "16px", color: "#555" }}>{item.description}</Text>
              </Card>
            </List.Item>
          )}
        />
      </Content>

      <Footer style={{ textAlign: "center", color: "#f0f0f0", background: "#6e8efb" }}>
        SOM25 Yearbook ©2023 | Explore Features | Presented by the Cultural Council
      </Footer>
    </Layout>
  );
};

export default FeaturesPage;
