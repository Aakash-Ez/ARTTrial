import React, { useState } from "react";
import { Form, Input, Button, Upload, message, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const WriteBlog: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [content, setContent] = useState("");

  const onFinish = async (values: any) => {
    if (!content) {
      message.error("Blog content cannot be empty!");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "blogs"), {
        title: values.title,
        author: values.author,
        date: Timestamp.now(),
        content: content,
        featuredImage: imageUrl || "",
      });
      message.success("Blog posted successfully!");
    } catch (error) {
      console.error("Error adding blog: ", error);
      message.error("Failed to post the blog.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (info: any) => {
    if (info.file.status === "done") {
      setImageUrl(URL.createObjectURL(info.file.originFileObj));
      message.success("Image uploaded successfully");
    } else if (info.file.status === "error") {
      message.error("Image upload failed");
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <Card style={{ boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", borderRadius: "10px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Write a New Blog</h2>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="Blog Title" rules={[{ required: true, message: "Please enter a title!" }]}>
            <Input placeholder="Enter blog title" />
          </Form.Item>
          <Form.Item name="author" label="Author Name" rules={[{ required: true, message: "Please enter author name!" }]}>
            <Input placeholder="Enter your name" />
          </Form.Item>
          <Form.Item label="Blog Content">
            <ReactQuill theme="snow" value={content} onChange={setContent} />
          </Form.Item>
          <Form.Item label="Featured Image">
            <Upload
              listType="picture"
              showUploadList={false}
              beforeUpload={() => false} 
              onChange={handleImageUpload}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
            {imageUrl && <img src={imageUrl} alt="Preview" style={{ width: "100%", marginTop: "10px", borderRadius: "8px" }} />}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {loading ? "Posting..." : "Post Blog"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default WriteBlog;
