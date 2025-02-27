import React from "react";
import { Layout, Typography } from "antd";
import HighlightComponent from "../HomeLoggedIn/HighlightComponent";
import { getCurrentUserInfo } from "../../auth";

const { Content } = Layout;
const { Title } = Typography;

const HighlightsPage: React.FC = () => {
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const userInfo = await getCurrentUserInfo();
      if (userInfo && userInfo.uid) {
        setUserId(userInfo.uid);
      }
    };
    fetchUser();
  }, []);

  if (!userId) return <Title>Loading...</Title>;

  return (
    <Layout style={{ minHeight: "100vh", padding: "20px", background: "#f7f9fc" }}>
      <Content>
        <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>Your Highlights</Title>
      </Content>
    </Layout>
  );
};

export default HighlightsPage;
