import React, { useState } from "react";
import { Input, Button, Typography, message, Avatar, Card } from "antd";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useLocation } from "react-router-dom";

const { Title, Text } = Typography;

const EditTestimonialPage: React.FC = () => {
  const location = useLocation();
  const testimonial = location.state?.testimonial;
  const [editedText, setEditedText] = useState(testimonial?.testimonial || "");

  if (!testimonial) {
    return <div style={{ textAlign: "center", padding: "20px", fontSize: "18px", color: "#555" }}>No testimonial data found.</div>;
  }

  const handleUpdate = async () => {
    try {
      const testimonialRef = doc(db, "testimonials", testimonial.id);
      await updateDoc(testimonialRef, { 
        testimonial: editedText, 
        previousTestimonial: testimonial.testimonial, 
        editedAt: serverTimestamp()
      });
      message.success("Testimonial updated successfully!");
    } catch (error) {
      console.error("Error updating testimonial:", error);
      message.error("Failed to update testimonial.");
    }
  };

  return (
    <div style={{ padding: "40px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
      <Card style={{ padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
        <Title level={3} style={{ color: "#2a9d8f" }}>Edit Testimonial</Title>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <Avatar src={testimonial.writerPhoto || "https://via.placeholder.com/64"} size={64} style={{ border: "2px solid #2a9d8f", marginRight: "20px" }} />
          <Text style={{ fontSize: "16px", fontWeight: "bold", color: "#264653" }}>{testimonial.writerName}</Text>
        </div>
        <Input.TextArea
          rows={6}
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          style={{ fontSize: "16px", marginBottom: "20px" }}
        />
        <Button type="primary" onClick={handleUpdate}>Update</Button>
      </Card>
    </div>
  );
};

export default EditTestimonialPage;
