import React, { useState, useEffect } from "react";
import { Card, Pagination, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../../firebase"; // Ensure firebase is configured properly

interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  featuredImage: string;
}

const RecentBlogs: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const pageSize = 6;
  const navigate = useNavigate();

  const fetchRecentBlogs = async (page: number) => {
    try {
      const blogsCollection = collection(db, "blogs");
      let q = query(blogsCollection, orderBy("date", "desc"), limit(pageSize));

      if (page > 1 && lastVisible) {
        q = query(blogsCollection, orderBy("date", "desc"), startAfter(lastVisible), limit(pageSize));
      }

      const snapshot = await getDocs(q);
      const blogsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));

      setBlogs(blogsData);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

      if (page === 1) {
        const totalSnapshot = await getDocs(collection(db, "blogs"));
        setTotal(totalSnapshot.size);
      }
    } catch (error) {
      console.error("Error fetching blogs: ", error);
    }
  };

  useEffect(() => {
    fetchRecentBlogs(currentPage);
  }, [currentPage]);

  return (
    <div style={{ padding: "20px", width: "100%", margin: "auto" }}>
      <h2>Recent Blogs</h2>
      <Row gutter={[16, 16]} style={{ width: "100%" }}>
        {blogs.map((blog) => (
          <Col xs={24} sm={12} md={8} key={blog.id} style={{ width: "100%" }}>
            <Card
              cover={<img alt={blog.title} src={blog.featuredImage || "https://via.placeholder.com/300"} style={{ width: "100%" }} />}
              hoverable
              style={{ width: "100%" }}
              onClick={() => navigate(`/blog/${blog.id}`)}
            >
              <h3>{blog.title}</h3>
              <p><strong>By:</strong> {blog.author}</p>
              <p><strong>Date:</strong> {new Date(blog.date).toDateString()}</p>
              <p>{blog.excerpt}</p>
            </Card>
          </Col>
        ))}
      </Row>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={total}
        onChange={setCurrentPage}
        style={{ textAlign: "center", marginTop: "20px", width: "100%" }}
      />
    </div>
  );
};

export default RecentBlogs;