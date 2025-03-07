import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Card, Typography, Avatar, Divider, Carousel, List, Button, message, Space } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
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

import { openDB } from "idb"; // Import IndexedDB wrapper

// Open or create IndexedDB
const getDB = async () => {
  return openDB("image-cache", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images");
      }
    },
  });
};

// Store image in IndexedDB
const storeImage = async (imageUrl: string, base64: string) => {
  const db = await getDB();
  const tx = db.transaction("images", "readwrite");
  tx.objectStore("images").put(base64, imageUrl);
  await tx.done;
};

// Retrieve image from IndexedDB
const getCachedImage = async (imageUrl: string) => {
  const db = await getDB();
  return db.transaction("images").objectStore("images").get(imageUrl);
};

// Fetch, Convert & Cache Image in IndexedDB
const fetchAndCacheImage = async (imageUrl: string) => {
  const cachedImage = await getCachedImage(imageUrl);
  if (cachedImage) {
    console.log("Returning Cached Image from IndexedDB...");
    return cachedImage; // Return cached image from IndexedDB
  }

  try {
    console.log("Fetching new image from Firebase Storage...");

    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Failed to fetch image");

    const blob = await response.blob();
    
    // Convert Blob to Base64
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        await storeImage(imageUrl, base64data); // Store in IndexedDB
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob); // Convert Blob to Base64
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return imageUrl; // Fallback to original URL
  }
};


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
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("");

  // Fetch the current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const currentUser = await getCurrentUserInfo();
      setCurrentUserId(currentUser?.uid || "");
      setCurrentUserName(currentUser?.name || "");
    };

    fetchCurrentUser();
  }, []);

  // Fetch user profile, highlights, and testimonials
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch user data using the userId
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);
          console.log("User data:", userData);

          // Now that userData is fetched, fetch highlights and testimonials
          fetchHighlights(userData);
          fetchTestimonials(userData);
        } else {
          console.error("User data not found");
        }
      } catch (error) {
        console.error("Error fetching user profile data:", error);
      }
    };

    // Only fetch user data if the userId is available
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // Fetch highlights and mark them as important if needed
  const fetchHighlights = async (userData: any) => {
    try {
      const highlightsSnapshot = await getDocs(
        query(collection(db, "highlights"), where("tags", "array-contains", userId))
      );

      const highlightsData = await Promise.all(
        highlightsSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          var cachedImageUrl = data.image
          // Cache and replace image URL
          if(data.directlink) {
            cachedImageUrl = data.directlink;
          }
          
          const userNames = await Promise.all(
            data.tags.map(async (tagId: string) => await getUserNameFromId(tagId))
          );

          // Check if the highlight is marked as important
          const isImportant = userData?.ImportantHighlights?.includes(doc.id) || false;
          console.log("Highlight is important:", isImportant);

          return { id: doc.id, ...data, tags: userNames, imageUrl: cachedImageUrl, isImportant };
        })
      );

      setHighlights(highlightsData);
    } catch (error) {
      console.error("Error fetching highlights:", error);
    }
  };

  // Fetch testimonials and associate writer info
  const fetchTestimonials = async (userData: any) => {
    try {
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
      console.error("Error fetching testimonials:", error);
    }
  };

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

      await createEventLog(currentUserId, `You reacted with ${emoji} to ${reacteeName}'s testimonial.`);
      await createEventLog(testimonial.writer, `${reactorName} reacted with ${emoji} to your testimonial.`);
      await createEventLog(testimonial.receiver, `${reactorName} reacted with ${emoji} to your testimonial.`);

      message.success(updatedReactions[currentUserId] === emoji ? `Reacted with ${emoji}!` : "Reaction removed!");
    } catch (error) {
      console.error("Error updating emoji reaction:", error);
      message.error("Failed to update reaction. Please try again.");
    }
  };
  
  const markImportantHighlight = async (highlightId: string) => {
    try {
      // Reference to the current user's document in Firestore
      const userRef = doc(db, "users", currentUserId);  // Ensure currentUserId is set and available
      const userDoc = await getDoc(userRef);
  
      if (!userDoc.exists()) {
        message.error("User not found.");
        return;
      }
  
      const userData = userDoc.data();
      const importantHighlights = userData?.ImportantHighlights || [];
  
      // Check if the highlight is already marked as important
      if (importantHighlights.includes(highlightId)) {
        message.info("This highlight is already marked as important.");
        return;
      }
  
      // Add the highlightId to the ImportantHighlights array
      importantHighlights.push(highlightId);
  
      // Update the user's ImportantHighlights field in Firestore
      await updateDoc(userRef, {
        ImportantHighlights: importantHighlights,
      });
  
      // Update the local highlights state to reflect the change
      setHighlights((prevHighlights) => 
        prevHighlights.map((highlight) =>
          highlight.id === highlightId
            ? { ...highlight, isImportant: true } // Mark as important
            : highlight
        )
      );
  
      message.success("Highlight marked as important!");
    } catch (error) {
      console.error("Error marking highlight as important:", error);
      message.error("Failed to mark highlight as important.");
    }
  };
  
  const markUnimportantHighlight = async (highlightId: string) => {
    try {
      // Reference to the current user's document in Firestore
      const userRef = doc(db, "users", currentUserId);  // Ensure currentUserId is set and available
      const userDoc = await getDoc(userRef);
  
      if (!userDoc.exists()) {
        message.error("User not found.");
        return;
      }
  
      const userData = userDoc.data();
      const importantHighlights = userData?.ImportantHighlights || [];
  
      // Check if the highlight is already marked as important
      if (!importantHighlights.includes(highlightId)) {
        message.info("This highlight is not marked as important.");
        return;
      }
  
      // Remove the highlightId from the ImportantHighlights array
      const updatedHighlights = importantHighlights.filter((id: string) => id !== highlightId);
  
      // Update the user's ImportantHighlights field in Firestore
      await updateDoc(userRef, {
        ImportantHighlights: updatedHighlights,
      });
  
      // Update the local highlights state to reflect the change
      setHighlights((prevHighlights) =>
        prevHighlights.map((highlight) =>
          highlight.id === highlightId
            ? { ...highlight, isImportant: false } // Unmark as important
            : highlight
        )
      );
  
      message.success("Highlight unmarked as important!");
    } catch (error) {
      console.error("Error unmarking highlight as important:", error);
      message.error("Failed to unmark highlight as important.");
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

            <Divider>Highlights</Divider>
{highlights.length > 0 ? (
  <Row gutter={[16, 16]} justify="center">
    {highlights.map((highlight) => (
      <Col key={highlight.id} xs={24} sm={12} md={8} lg={6} xl={4}>
        <Card
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            textAlign: "center",
            borderRadius: "12px",
            overflow: "hidden",
          }}
          cover={
            <img
              alt="highlight"
              src={highlight.imageUrl}
              style={{ maxHeight: 250, objectFit: "cover", width: "100%" }}
            />
          }
        >
          <Text strong>{highlight.caption}</Text>
          <Divider />
          <Text type="secondary">Tags: {highlight.tags?.join(", ") || "None"}</Text>
          <Divider />
          {/* Conditional Button rendering */}
          <Button
            icon={highlight.isImportant ? <MinusOutlined /> : <PlusOutlined />}
            onClick={() => highlight.isImportant ? markUnimportantHighlight(highlight.id) : markImportantHighlight(highlight.id)}
            type="primary"
            block
          >
            {highlight.isImportant ? "Unmark as Important" : "Mark as Important"}
          </Button>
        </Card>
      </Col>
    ))}
  </Row>
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