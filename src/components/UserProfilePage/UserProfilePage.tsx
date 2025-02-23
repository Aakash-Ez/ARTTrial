import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Card, Typography, Avatar, Divider, Carousel, List, Button, message, Space, Tooltip } from "antd";
import { db } from "../../firebase";
import { doc, getDoc, collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import { createEventLog } from "../../utilities/CreateEventLog"; // Assuming the file path for eventLogger
import { getUserNameFromId } from "../../utilities/GetUserName";
import TestimonialComponent from "./TestimonialComponent";
import UserProfileDetails from "./UserProfileDetails";
import PublicMessages from "../PublicMessages/PublicMessages";
import UserProfileSummary from "./UserProfileSummary";
import { getCurrentUserInfo } from "../../auth";
import AvatarEditor from "./AvatarEditor";
import ProfileCompletionCheck from "../ProfileCompletionCheck/ProfileCompletionCheck";

const { Title, Text } = Typography;
const { Content } = Layout;

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
  reactions?: { [userId: string]: string }; // Stores user-specific emoji reactions
}

const UserProfilePage: React.FC<{ userId: string }> = ({ userId }) => {
  const [userData, setUserData] = useState<any>(null);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const currentUser = await getCurrentUserInfo();
      setCurrentUserId(currentUser?.uid || null);
      setCurrentUserName(currentUser?.name || null);
    };

    fetchCurrentUser();
  }, []);
  
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("");

  useEffect(() => {
    console.log("Fetching profile for userId:", userId);

    const fetchUserProfile = async () => {
      try {
        // Fetch user data using the document ID directly
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.error("User data not found");
        }

        // Fetch highlights
        const highlightsSnapshot = await getDocs(
          query(collection(db, "highlights"), where("tags", "array-contains", userId))
        );
        const highlightsData = await Promise.all(
          highlightsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const userNames = await Promise.all(
              data.tags.map(async (tagId: string) => await getUserNameFromId(tagId))
            );
            return { id: doc.id, ...data, tags: userNames };
          })
        );
        setHighlights(highlightsData);

        // Fetch testimonials
        const testimonialsCollection = collection(db, "testimonials");
        const testimonialDocs = await getDocs(testimonialsCollection);
        const testimonialsWithWriterInfo: Testimonial[] = await Promise.all(
          testimonialDocs.docs
            .map((doc) => ({ id: doc.id, ...doc.data() } as Testimonial))
            .filter((testimonial) => testimonial.receiver === userId)
            .sort((a, b) => a.rank - b.rank)
            .map(async (testimonial) => {
              try {
                const writerDoc = await getDoc(doc(db, "users", testimonial.writer));
                const writerData = writerDoc.exists() ? writerDoc.data() : {};
                return {
                  ...testimonial,
                  writerName: writerData?.name || "Unknown",
                  writerPhoto: writerData?.photoURL || null,
                };
              } catch (error) {
                console.error("Error fetching writer info:", error);
                return { ...testimonial, writerName: "Unknown", writerPhoto: null };
              }
            })
        );
        setTestimonials(testimonialsWithWriterInfo);
      } catch (error) {
        console.error("Error fetching user profile data:", error);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleEmojiReaction = async (testimonialId: string, emoji: string) => {
    try {
      const testimonialIndex = testimonials.findIndex((t) => t.id === testimonialId);
      if (testimonialIndex === -1) {
        message.error("Testimonial not found.");
        return;
      }
      
      const testimonial = testimonials[testimonialIndex];
      const updatedReactions = { ...testimonial.reactions };
      
      if (!updatedReactions[currentUserId]) {
        updatedReactions[currentUserId] = emoji;
      } else if (updatedReactions[currentUserId] === emoji) {
        delete updatedReactions[currentUserId];
      } else {
        updatedReactions[currentUserId] = emoji;
      }
  
      await updateDoc(doc(db, "testimonials", testimonialId), {
        reactions: updatedReactions,
      });
  
      setTestimonials((prev) => {
        const updatedTestimonials = [...prev];
        updatedTestimonials[testimonialIndex] = { ...testimonial, reactions: updatedReactions };
        return updatedTestimonials;
      });
  
      const reactorName = currentUserName || "Someone";
      const reacteeName = testimonial.writerName || "Unknown";
      const testimonialName = userData?.name || "Unknown";
  
      await createEventLog(currentUserId, `You reacted with ${emoji} to ${reacteeName}'s testimonial.`);
      await createEventLog(testimonial.writer, `${reactorName} reacted with ${emoji} to your testimonial.`);
      await createEventLog(testimonial.receiver, `${reactorName} reacted with ${emoji} to your testimonial.`);

  
      message.success(updatedReactions[currentUserId] === emoji ? `Reacted with ${emoji}!` : "Reaction removed!");
    } catch (error) {
      console.error("Error updating emoji reaction:", error);
      message.error("Failed to update reaction. Please try again.");
    }
  };
  

  return (
    <Layout style={{ padding: "20px", background: "#f7f9fc", minHeight: "100vh" }}>
      <Content>
        {userData ? (
          <div>
            {/* User Information */}
            <Row gutter={[16, 16]} justify="center" style={{ marginBottom: 40 }}>
              <Col>
              {userId === currentUserId ? (
              <AvatarEditor userData={userData} />
            ) : (
              <Avatar
                  size={120}
                  src={userData.photoURL || "https://via.placeholder.com/120"}
                  style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", objectFit: "cover" }}
                />
            )}
              </Col>
              <Col>
                <Title level={2}>{userData.name || "Anonymous"}</Title>
                <Text type="secondary">{userData.email || "No email provided"}</Text>
              </Col>
            </Row>
            
            {/* Profile Completion Check */}
            
            
            {userId === currentUserId && (
              <>
                <ProfileCompletionCheck />
              </>
            )}
      
            <Divider>Highlights</Divider>
            {highlights.length > 0 ? (
              <Carousel autoplay>
                {highlights.map((highlight) => (
                  <Card
                    key={highlight.id}
                    style={{
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      textAlign: "center",
                      display: "inline-block",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                    cover={<img alt="highlight" src={highlight.image} style={{ maxHeight: 400, objectFit: "contain" }} />}
                  >
                    <Text>{highlight.caption}</Text>
                    <Divider />
                    <Text type="secondary">Tags: {highlight.tags?.join(", ") || "None"}</Text>
                  </Card>
                ))}
              </Carousel>
            ) : (
              <Text>No highlights available.</Text>
            )}

            {/* Profile Highlights */}
            <Divider>Profile Highlights</Divider>
            
            {userId === currentUserId ? (
              <UserProfileDetails userId={userId} />
            ) : (
              <UserProfileSummary userId={userId} />
            )}

            {/* Public Messages */}
            <Divider>Messages</Divider>
            <PublicMessages userId={userId} />


            {/* Testimonials Section */}
            {testimonials.length > 0 ? (
              <TestimonialComponent
              userId={userId}
                testimonials={testimonials}
                handleEmojiReaction={handleEmojiReaction}></TestimonialComponent>
            ) : (
              <Text>No testimonials available.</Text>
            )}
          </div>
        ) : (
          <Text>Loading user profile...</Text>
        )}
      </Content>
    </Layout>
  );
};

export default UserProfilePage;