import React, { useEffect, useState } from "react";
import { Card, List, Typography, Spin, Alert } from "antd";
import { getCurrentUserInfo } from "../../auth";
import { db } from "../../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const { Title, Text } = Typography;

const ProfileCompletionCheck: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [completionStatus, setCompletionStatus] = useState<{
    writtenTestimonials: boolean;
    receivedTestimonials: boolean;
    uploadedHighlights: boolean;
    profileFieldsCompleted: boolean;
  } | null>(null);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      setLoading(true);
      try {
        const userInfo = await getCurrentUserInfo();
        if (!userInfo) {
          throw new Error("User not found");
        }

        const userDoc = await getDoc(doc(db, "users", userInfo.uid));
        console.log(userInfo.uid);
        if (!userDoc.exists()) {
          throw new Error("User document not found");
        }

        const userData = userDoc.data();

        const testimonialsQuery = query(collection(db, "testimonials"), where("writer", "==", userInfo.uid));
        const receivedTestimonialsQuery = query(collection(db, "testimonials"), where("receiver", "==", userInfo.uid));
        const highlightsQuery = query(collection(db, "highlights"), where("userId", "==", userInfo.uid));

        const testimonialsSnapshot = await getDocs(testimonialsQuery);
        const receivedTestimonialsSnapshot = await getDocs(receivedTestimonialsQuery);
        const highlightsSnapshot = await getDocs(highlightsQuery);

        const profileFieldsCompleted = [
          "favoriteSpot",
          "lifeLesson",
          "mbaLifeEmojis",
          "mbaLifeMiss",
          "mbaLifeThemeSong",
          "bestMemory",
        ].every((field) => userData[field]);

        setCompletionStatus({
          writtenTestimonials: testimonialsSnapshot.size >= 7,
          receivedTestimonials: receivedTestimonialsSnapshot.size >= 7,
          uploadedHighlights: highlightsSnapshot.size >= 4,
          profileFieldsCompleted,
        });
      } catch (error) {
        console.error("Error checking profile completion:", error);
        setCompletionStatus(null);
      } finally {
        setLoading(false);
      }
    };

    checkProfileCompletion();
  }, []);

  if (loading) {
    return <Spin size="large" />;
  }

  if (!completionStatus) {
    return <Alert message="Error loading profile completion status." type="error" />;
  }

  const checklist = [
    { label: "Written at least 7 testimonials", status: completionStatus.writtenTestimonials },
    { label: "Received at least 7 testimonials", status: completionStatus.receivedTestimonials },
    { label: "Uploaded at least 4 highlights", status: completionStatus.uploadedHighlights },
    { label: "Completed all required profile fields", status: completionStatus.profileFieldsCompleted },
  ];

  return (
    <Card title={<Title level={3}>Profile Completion Status</Title>}>
      <List
        itemLayout="horizontal"
        dataSource={checklist}
        renderItem={(item) => (
          <List.Item>
            <Text>{item.label}</Text>
            <Text style={{ color: item.status ? "green" : "red" }}>
              {item.status ? "✔" : "✘"}
            </Text>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default ProfileCompletionCheck;