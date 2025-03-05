import React, { useState, useEffect } from "react";
import { List, Card, Button, Typography, Avatar, message, Row, Col, Space, Tooltip, Divider } from "antd";
import { collection, getDocs, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getCurrentUserInfo } from "../../auth";
import { createEventLog } from "../../utilities/CreateEventLog";
import { ArrowUpOutlined, ArrowDownOutlined, CheckOutlined, CloseOutlined, SmileOutlined, EditOutlined, ToTopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

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
  reactions?: { [userId: string]: string };
}

const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
    const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfo = await getCurrentUserInfo();
        if (userInfo && userInfo.uid) {
          setUserId(userInfo.uid);
          setUserName(userInfo.name || "Unknown");

          const testimonialsCollection = collection(db, "testimonials");
          const testimonialDocs = await getDocs(testimonialsCollection);

          const testimonialsWithWriterInfo: Testimonial[] = await Promise.all(
            testimonialDocs.docs
              .map((doc) => ({ id: doc.id, ...doc.data() } as Testimonial))
              .filter((testimonial) => testimonial.receiver === userInfo.uid)
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
        } else {
          message.error("Failed to identify current user.");
        }
      } catch (error) {
        console.error("Error fetching user or testimonials:", error);
        message.error("Failed to load testimonials.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const pushToTop = async (index: number) => {
    const newTestimonials = [...testimonials];
  
    // Get the testimonial to move to the top
    const testimonialToMove = newTestimonials[index];
  
    // Shift the rank of all testimonials before the selected index by 1
    for (let i = 0; i < index; i++) {
      newTestimonials[i].rank += 1;
    }
  
    // Set the rank of the selected testimonial to 0 (top)
    testimonialToMove.rank = 0;
  
    // Move the testimonial to the top of the array
    newTestimonials.splice(index, 1);
    newTestimonials.unshift(testimonialToMove);
  
    setTestimonials(newTestimonials);
  
    try {
      // Update the ranks in the database
      for (let i = 0; i < newTestimonials.length; i++) {
        await updateDoc(doc(db, "testimonials", newTestimonials[i].id), { rank: i });
      }
      message.success("Testimonial pushed to the top successfully!");
    } catch (error) {
      console.error("Error updating testimonial order:", error);
      message.error("Failed to update order. Please try again.");
    }
  };
  

  const moveTestimonial = async (index: number, direction: "up" | "down") => {
    const newTestimonials = [...testimonials];

    if ((direction === "up" && index === 0) || (direction === "down" && index === newTestimonials.length - 1)) {
      return;
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newTestimonials[index], newTestimonials[swapIndex]] = [newTestimonials[swapIndex], newTestimonials[index]];

    setTestimonials(newTestimonials);

    try {
      await updateDoc(doc(db, "testimonials", newTestimonials[index].id), { rank: index });
      await updateDoc(doc(db, "testimonials", newTestimonials[swapIndex].id), { rank: swapIndex });
      message.success("Testimonials reordered successfully!");
    } catch (error) {
      console.error("Error updating testimonial order:", error);
      message.error("Failed to update order. Please try again.");
    }
  };

  const editTestimonial = async (index: number) => {
    const newTestimonials = [...testimonials];

    console.log("Editing testimonial:", newTestimonials[index]);
    navigate("/edit-testimonial", { state: { testimonial: newTestimonials[index] } });
  };

  const handleApproval = async (id: string, approve: boolean) => {
    try {
      const testimonialRef = doc(db, "testimonials", id);
      const testimonial = testimonials.find((t) => t.id === id);
      if (!testimonial) {
        message.error("Testimonial not found.");
        return;
      }

      if (approve) {
        await updateDoc(testimonialRef, { approved: approve });

        // Log events
        await createEventLog(userId!, `You approved a testimonial from ${testimonial.writerName}`);
        await createEventLog(testimonial.writer, `${userName} approved your testimonial`);

        // Update local state to reflect approval
        setTestimonials((prev) =>
          prev.map((item) => (item.id === id ? { ...item, approved: true } : item))
        );
        message.success("Testimonial approved!");
      } else {
        await deleteDoc(testimonialRef);

        // Log events
        await createEventLog(userId!, `You declined a testimonial from ${testimonial.writerName}`);
        await createEventLog(testimonial.writer, `${userName} declined your testimonial`);

        setTestimonials((prev) => prev.filter((testimonial) => testimonial.id !== id));
        message.success("Testimonial declined and removed.");
      }
    } catch (error) {
      console.error("Error updating approval status:", error);
      message.error("Failed to update testimonial. Please try again.");
    }
  };

  const handleEmojiReaction = async (testimonialId: string, emoji: string) => {
    try {
      const testimonial = testimonials.find((t) => t.id === testimonialId);
      if (!testimonial) {
        message.error("Testimonial not found.");
        return;
      }

      const currentUserReaction = testimonial.reactions?.[userId!];
      const updatedReactions = { ...testimonial.reactions };

      if (currentUserReaction === emoji) {
        delete updatedReactions[userId!];
      } else {
        updatedReactions[userId!] = emoji;
      }

      await updateDoc(doc(db, "testimonials", testimonialId), {
        reactions: updatedReactions,
      });

      setTestimonials((prev) =>
        prev.map((item) =>
          item.id === testimonialId ? { ...item, reactions: updatedReactions } : item
        )
      );

      const reactorName = userName || "Someone";
      const reacteeName = testimonial.writerName || "Unknown";

      await createEventLog(userId!, `You reacted with ${emoji} to ${reacteeName}'s testimonial.`);
      await createEventLog(testimonial.writer, `${reactorName} reacted with ${emoji} to your testimonial.`);

      message.success(currentUserReaction === emoji ? "Reaction removed!" : `Reacted with ${emoji}!`);
    } catch (error) {
      console.error("Error adding emoji reaction:", error);
      message.error("Failed to add reaction. Please try again.");
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "20px", fontSize: "18px", color: "#555" }}>Loading testimonials...</div>;
  }

  return (
    <div style={{ padding: "40px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: "20px" }}>
        <Col>
          <Title level={3} style={{ color: "#2a9d8f" }}>My Testimonials</Title>
        </Col>
        <Col>
          <SmileOutlined style={{ fontSize: "36px", color: "#264653" }} />
        </Col>
      </Row>

      <List
        dataSource={testimonials}
        renderItem={(item, index) => (
          <Card
            style={{
              marginBottom: "16px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              padding: "20px",
              backgroundColor: "#ffffff",
              transition: "transform 0.3s",
              cursor: "pointer",
            }}
            hoverable
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Row align="middle" style={{ marginBottom: "10px" }}>
              <Col>
                <Avatar
                  src={item.writerPhoto || "https://via.placeholder.com/64"}
                  size={64}
                  style={{ border: "2px solid #2a9d8f", marginRight: "20px"}}
                />
              </Col>
              <Col>
                <Text style={{ fontSize: "16px", fontWeight: "bold", color: "#264653" }}>{item.writerName}</Text>
              </Col>
            </Row>

            <Text style={{ fontSize: "16px", fontStyle: "italic", color: "#264653" }}>{`"${item.testimonial}"`}</Text>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <Button
                  icon={<ArrowUpOutlined />}
                  disabled={index === 0}
                  onClick={() => moveTestimonial(index, "up")}
                  style={{ marginRight: "8px" }}
                />
                <Button
                  icon={<ArrowDownOutlined />}
                  disabled={index === testimonials.length - 1}
                  onClick={() => moveTestimonial(index, "down")}
                />
                <Button
                  icon={<EditOutlined />}
                  style={{ marginLeft: "8px" }}
                  onClick={() => editTestimonial(index)}
                />
                <Button
                  icon={<ToTopOutlined />}
                  onClick={() => pushToTop(index)}
                  style={{ marginLeft: "8px" }} 
                />
              </div>

              {!item.approved && (
                <div>
                  <Button
                    icon={<CheckOutlined />}
                    type="primary"
                    onClick={() => handleApproval(item.id, true)}
                    style={{ marginRight: "8px" }}
                  />
                  <Button
                    icon={<CloseOutlined />}
                    type="default"
                    danger
                    onClick={() => handleApproval(item.id, false)}
                  />
                </div>
              )}
            </div>

            <Divider />
            <Row justify="start" align="middle">
              <Space>
                {emojis.map((emoji) => {
                  const count = Object.values(item.reactions || {}).filter(e => e === emoji).length;
                  return (
                    <Tooltip title={`React with ${emoji}`} key={emoji}>
                      <Button shape="circle" style={{ fontSize: "24px", padding: "10px" }} onClick={() => handleEmojiReaction(item.id, emoji)}>
                        {emoji} {count > 0 && <span style={{ fontSize: "14px", marginLeft: "5px" }}>{count}</span>}
                      </Button>
                    </Tooltip>
                  );
                })}
              </Space>
            </Row>
          </Card>
        )}
      />
    </div>
  );
};

export default TestimonialsPage;
