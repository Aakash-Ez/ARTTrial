import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { Card, Row, Col } from "antd";
import RecentBlogs from "../RecentBlogs/RecentBlogs";

interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  featuredImage: string;
}

const BlogView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "blogs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBlog({ id: docSnap.id, ...docSnap.data() } as BlogPost);
        }
      } catch (error) {
        console.error("Error fetching blog: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      {loading ? (
        <p>Loading...</p>
      ) : blog ? (
        <Card cover={<img alt={blog.title} src={blog.featuredImage || "https://via.placeholder.com/800"} />}>
          <h1>{blog.title}</h1>
          <p><strong>By:</strong> {blog.author}</p>
          <p><strong>Date:</strong> {new Date(blog.date).toDateString()}</p>
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </Card>
      ) : (
        <p>Blog not found.</p>
      )}
      <h2 style={{ marginTop: "40px" }}>Recent Blogs</h2>
      <RecentBlogs />
    </div>
  );
};

export default BlogView;