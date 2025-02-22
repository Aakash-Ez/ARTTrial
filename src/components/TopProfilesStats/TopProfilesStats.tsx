import React, { useState, useEffect } from "react";
import { Layout, Typography, Card, List, Avatar, Spin } from "antd";
import { db } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import {getUserNameFromId } from "../../utilities/GetUserName";

const { Content } = Layout;
const { Title, Text } = Typography;

const TopProfilesStats: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [topWriters, setTopWriters] = useState<any[]>([]);
  const [topReceivers, setTopReceivers] = useState<any[]>([]);
  const [topUploaders, setTopUploaders] = useState<any[]>([]);
  const [topReactors, setTopReactors] = useState<any[]>([]);
  const [pollResults, setPollResults] = useState<any[]>([]);
  const [testimonials, setTestimonialText] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const testimonialsCollection = collection(db, "testimonials");
        const testimonialsSnapshot = await getDocs(testimonialsCollection);
        const testimonials = testimonialsSnapshot.docs.map(doc => doc.data());

        await Promise.all(testimonials.map(async (t) => {
          t['writerName'] = await getUserNameFromId(t.writer); // Replace user ID with name 
          t['receiverName'] = await getUserNameFromId(t.receiver); // Replace user ID with name
        }));

        const highlightsCollection = collection(db, "highlights");
        const highlightsSnapshot = await getDocs(highlightsCollection);
        const highlights = highlightsSnapshot.docs.map(doc => doc.data());

        const pollsCollection = collection(db, "polls");
        const pollsSnapshot = await getDocs(pollsCollection);
        const polls = pollsSnapshot.docs.map(doc => ({ ...doc.data() }));

        const writerCounts: Record<string, number> = {};
        const receiverCounts: Record<string, number> = {};
        const uploaderCounts: Record<string, number> = {};
        const reactorCounts: Record<string, number> = {};
        
        testimonials.forEach((t) => {
          writerCounts[t.writer] = (writerCounts[t.writer] || 0) + 1;
          receiverCounts[t.receiver] = (receiverCounts[t.receiver] || 0) + 1;
          if (t.reactions) {
            Object.keys(t.reactions).forEach((user) => {
              reactorCounts[user] = (reactorCounts[user] || 0) + 1;
            });
          }
        });

        highlights.forEach((h) => {
          uploaderCounts[h.userId] = (uploaderCounts[h.userId] || 0) + 1;
        });

        const fetchUserData = async (userId: string) => {
          const userDoc = await getDoc(doc(db, "users", userId));
          return userDoc.exists() ? userDoc.data() : { name: "Unknown", photoURL: "https://via.placeholder.com/64" };
        };

        const getTopProfiles = async (counts: Record<string, number>) => {
          return await Promise.all(
            Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(async ([id, count]) => {
                const userData = await fetchUserData(id);
                return { id, count, ...userData };
              })
          );
        };

        setTopWriters(await getTopProfiles(writerCounts));
        setTopReceivers(await getTopProfiles(receiverCounts));
        setTopUploaders(await getTopProfiles(uploaderCounts));
        setTopReactors(await getTopProfiles(reactorCounts));
        setTestimonialText(testimonials);
        const sortedPolls = polls.map(poll => ({
          ...poll,
          options: Array.isArray(poll.options) 
            ? [...poll.options].sort((a, b) => b.votes - a.votes).slice(0, 3)
            : []
        }));
        setPollResults(sortedPolls);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" />
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", padding: "20px", background: "#f7f9fc" }}>
      <Content>
        <Title level={3} style={{ textAlign: "center", marginBottom: "20px" }}>Leaderboard & Gamification</Title>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
          <StatCard title="Top Writers" data={topWriters} />
          <StatCard title="Top Receivers" data={topReceivers} />
          <StatCard title="Top Uploaders" data={topUploaders} />
          <StatCard title="Top Reactors" data={topReactors} />
        </div>
        <Title level={4} style={{ textAlign: "center", margin: "40px 0" }}>All Testimonials</Title>
        <List
          itemLayout="horizontal"
          dataSource={testimonials}
          renderItem={(testimonial) => (
            <List.Item>
              <List.Item.Meta
                title={<Text strong>{testimonial.receiverName}</Text>}
                description={`From: ${testimonial.writerName} - "${testimonial.testimonial}"`}
              />
            </List.Item>
          )}
        />
      </Content>
    </Layout>
  );
};

const StatCard: React.FC<{ title: string; data: any[] }> = ({ title, data }) => (
  <Card title={title} style={{ width: "350px", textAlign: "center", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
    <List
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item, index) => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar src={item.photoURL} />}
            title={<Text strong>{item.name}</Text>}
            description={`Contributions: ${item.count}`}
          />
        </List.Item>
      )}
    />
  </Card>
);

export default TopProfilesStats;
