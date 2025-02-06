import React, { useState, useEffect } from "react";
import { Carousel, Card, Typography, Divider, Form, Upload, Button, message, Input, Select } from "antd";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { db } from "../../firebase";
import { getUserNameFromId, uploadPhotoToStorage } from "../../auth";
import { collection, getDocs, addDoc, query, where, getDoc, doc, deleteDoc } from "firebase/firestore";
import { createEventLog } from "../../utilities/CreateEventLog";

const { Text } = Typography;
const { Option } = Select;

const HighlightComponent: React.FC<{ userId: string }> = ({ userId }) => {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [userOptions, setUserOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const highlightsCollection = collection(db, "highlights");
        const highlightsQuery = query(highlightsCollection, where("tags", "array-contains", userId));
        const highlightsSnapshot = await getDocs(highlightsQuery);

        const highlightsWithNames = await Promise.all(
          highlightsSnapshot.docs.map(async (highlightDoc) => {
            const highlightData = highlightDoc.data();
            const tagNames = await Promise.all(
              highlightData.tags.map(async (tagId: string) => {
                const tagDoc = await getDoc(doc(db, "users", tagId));
                return tagDoc.exists() ? tagDoc.data()?.name || "Unknown" : "Unknown";
              })
            );
            return { ...highlightData, tags: tagNames, id: highlightDoc.id };
          })
        );

        setHighlights(highlightsWithNames);
      } catch (error) {
        console.error("Error fetching highlights:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((userDoc) => ({
          value: userDoc.id,
          label: userDoc.data().name,
        }));
        setUserOptions(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    

    fetchHighlights();
    fetchUsers();
  }, [userId]);

  const handleUpload = async (values: any) => {
    try {
      setUploading(true);
      const reader = new FileReader();
      const timestamp = new Date().toISOString();
  
      reader.onload = async () => {
        const base64Image = reader.result;
        const imageURL = await uploadPhotoToStorage(base64Image, userId + timestamp, "highlights");
        const highlightData = {
          userId,
          image: imageURL,
          caption: values.caption,
          tags: [...values.tags, userId],
          timestamp,
        };
  
        await addDoc(collection(db, "highlights"), highlightData);
        message.success("Highlight uploaded successfully!");

        const username = await getUserNameFromId(userId);
  
        // Log events for each tagged user
        for (const taggedUser of values.tags) {
          await createEventLog(taggedUser, `You were tagged in a new highlight by ${username}.`);
        }
  
        setHighlights((prev: any) => [
          {
            ...highlightData,
            tags: userOptions.filter((opt) => highlightData.tags.includes(opt.value)).map((opt) => opt.label),
          },
          ...prev,
        ]);
      };
      reader.readAsDataURL(values.image.file);
    } catch (error) {
      console.error("Error uploading highlight:", error);
      message.error("Failed to upload highlight. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (highlightId: string) => {
    try {
      await deleteDoc(doc(db, "highlights", highlightId));
      message.success("Highlight deleted successfully!");
      setHighlights((prev: any) => prev.filter((highlight: any) => highlight.id !== highlightId));
    } catch (error) {
      console.error("Error deleting highlight:", error);
      message.error("Failed to delete highlight. Please try again.");
    }
  };
  
  return (
    <div>
      <Divider>Highlights</Divider>
      <Form onFinish={handleUpload} layout="vertical" style={{ marginBottom: "20px" }}>
        <Form.Item
          name="image"
          label="Upload Image"
          rules={[{ required: true, message: "Please upload an image!" }]}
        >
          <Upload maxCount={1} beforeUpload={() => false} listType="picture">
            <Button icon={<UploadOutlined />}>Choose Image</Button>
          </Upload>
        </Form.Item>

        <Form.Item name="caption" label="Caption">
          <Input placeholder="Write a caption..." />
        </Form.Item>

        <Form.Item name="tags" label="Tag Users">
          <Select
            mode="multiple"
            placeholder="Select users to tag"
            options={userOptions}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={uploading} block>
            Upload Highlight
          </Button>
        </Form.Item>
      </Form>

      <Divider>Your Highlights</Divider>
      <Carousel autoplay dots={true} infinite style={{ width: "100%" }}>
      {highlights.map((highlight) => (
        <Card
          key={highlight.id}
          style={{
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
            overflow: "hidden",
            margin: "10px 0",
            textAlign: "center",
          }}
          cover={<img alt="highlight" src={highlight.image} style={{ maxHeight: 400, width: "100%", objectFit: "contain", borderRadius: "12px 12px 0 0" }} />}
        >
          <Text style={{ fontWeight: "bold", fontSize: "16px" }}>{highlight.caption}</Text>
          <Divider style={{ margin: "10px 0" }} />
          <Text type="secondary" style={{ color: "#6e8efb" }}>Tags: {highlight.tags?.join(", ") || "None"}</Text>
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: "red" }} />}
            onClick={() => handleDelete(highlight.id)}
            style={{ marginTop: "10px" }}
          >
            Delete
          </Button>
        </Card>
      ))}
    </Carousel>
    </div>
  );
};

export default HighlightComponent;
