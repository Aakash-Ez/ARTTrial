import React, { useState, useEffect } from "react";
import { Layout, Menu, Badge, Drawer, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  UserOutlined,
  CommentOutlined,
  BarChartOutlined,
  LogoutOutlined,
  EnvironmentOutlined,
  FontSizeOutlined,
  MenuOutlined,
  CalendarOutlined,
  PictureOutlined,
  TeamOutlined,
  RiseOutlined,
  AlignLeftOutlined,
} from "@ant-design/icons";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";

const { Header } = Layout;

const NavBar: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [testimonialCount, setTestimonialCount] = useState<number>(0);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchTestimonialsCount(currentUser.uid);
      } else {
        setUser(null);
        setTestimonialCount(0);
      }
    });

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const fetchTestimonialsCount = async (userId: string) => {
    try {
      const testimonialsCollection = collection(db, "testimonials");
      const testimonialsQuery = query(testimonialsCollection, where("receiver", "==", userId));
      const testimonialsSnapshot = await getDocs(testimonialsQuery);
      setTestimonialCount(testimonialsSnapshot.size);
    } catch (error) {
      console.error("Error fetching testimonials count:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleDrawer = () => {
    setIsDrawerVisible(!isDrawerVisible);
  };

  return (
    <Header style={{ background: "#fff", position: "sticky", top: 0, zIndex: 1000, padding: "0 16px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "64px" }}>
        <div style={{ color: "#000", fontSize: "24px", fontWeight: "bold", display: "flex", alignItems: "center" }}>
          <img src="/sjmsom-logo.png" alt="Left Logo" style={{ height: "40px", marginRight: "10px" }} />
        </div>
        {isMobile ? (
          <Button type="text" icon={<MenuOutlined />} onClick={toggleDrawer} style={{ fontSize: "20px", color: "#000" }} />
        ) : (
          <Menu theme="light" mode="horizontal" style={{ flex: 1, justifyContent: "center", fontSize: "16px", borderBottom: "none" }}>
            <Menu.Item key="home" icon={<HomeOutlined />}>
              <Link to="/">Home</Link>
            </Menu.Item>
            <Menu.Item key="stats" icon={<RiseOutlined />}>
              <Link to="/stats">Leaderboard</Link>
            </Menu.Item>
            {user ? (
              <>
                <Menu.Item key="profile" icon={<UserOutlined />}>
                  <Link to={`/profile/${user.uid}`}>Profile</Link>
                </Menu.Item>
                <Menu.Item key="Highlights" icon={<PictureOutlined />}>
                  <Link to="/highlights">Highlights</Link>
                </Menu.Item>
                <Menu.Item key="wall" icon={<TeamOutlined />}>
                  <Link to="/wall">Wall</Link>
                </Menu.Item>
                <Menu.Item key="memory-map" icon={<EnvironmentOutlined />}>
                  <Link to="/memory-map">Memory Map</Link>
                </Menu.Item>
                <Menu.Item key="disappearing-text" icon={<FontSizeOutlined />}>
                  <Link to="/disappearing-text">Disappearing Text</Link>
                </Menu.Item>
                <Menu.Item key="events" icon={<CalendarOutlined />}>
                  <Link to="/events">Events</Link>
                </Menu.Item>
                <Menu.Item key="testimonials" icon={<CommentOutlined />}>
                  <Badge count={testimonialCount} offset={[10, 0]}>
                    <Link to="/testimonials">Testimonials</Link>
                  </Badge>
                </Menu.Item>
                <Menu.Item key="polls" icon={<BarChartOutlined />}>
                  <Link to="/polls">Polls</Link>
                </Menu.Item>
                <Menu.Item key="forum" icon={<AlignLeftOutlined />}>
                  <Link to="/forum">Forum</Link>
                </Menu.Item>
                <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                  Log Out
                </Menu.Item>
              </>
            ) : (
              <Menu.Item key="login" icon={<UserOutlined />}>
                <Link to="/signup">Log In/Signup</Link>
              </Menu.Item>
            )}
          </Menu>
        )}
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/cult-logo.png" alt="Right Logo" style={{ height: "40px" }} />
        </div>
        <Drawer title="Menu" placement="right" closable onClose={toggleDrawer} visible={isDrawerVisible}>
        <Menu theme="light" mode="vertical" style={{ flex: 1, justifyContent: "center", fontSize: "16px", borderBottom: "none" }}>
            <Menu.Item key="home" icon={<HomeOutlined />} onClick={() => setIsDrawerVisible(false)}>
              <Link to="/">Home</Link>
            </Menu.Item>
            <Menu.Item key="stats" icon={<RiseOutlined />} onClick={() => setIsDrawerVisible(false)}>
              <Link to="/stats">Leaderboard</Link>
            </Menu.Item>
            {user ? (
              <>
                <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => setIsDrawerVisible(false)}>
                  <Link to={`/profile/${user.uid}`}>Profile</Link>
                </Menu.Item>
                <Menu.Item key="Highlights" icon={<PictureOutlined />} onClick={() => setIsDrawerVisible(false)}>
                  <Link to="/highlights">Highlights</Link>
                </Menu.Item>
                <Menu.Item key="wall" icon={<TeamOutlined />}>
                  <Link to="/wall">Wall</Link>
                </Menu.Item>
                <Menu.Item key="memory-map" icon={<EnvironmentOutlined />} onClick={() => setIsDrawerVisible(false)}>
                  <Link to="/memory-map">Memory Map</Link>
                </Menu.Item>
                <Menu.Item key="disappearing-text" icon={<FontSizeOutlined />} onClick={() => setIsDrawerVisible(false)}>
                  <Link to="/disappearing-text">Disappearing Text</Link>
                </Menu.Item>
                <Menu.Item key="events" icon={<CalendarOutlined />} onClick={() => setIsDrawerVisible(false)}>
                  <Link to="/events">Events</Link>
                </Menu.Item>
                <Menu.Item key="testimonials" icon={<CommentOutlined />} onClick={() => setIsDrawerVisible(false)}>
                  <Badge count={testimonialCount} offset={[10, 0]}>
                    <Link to="/testimonials">Testimonials</Link>
                  </Badge>
                </Menu.Item>
                <Menu.Item key="polls" icon={<BarChartOutlined />} onClick={() => setIsDrawerVisible(false)}>
                  <Link to="/polls">Polls</Link>
                </Menu.Item>
                <Menu.Item key="forum" icon={<AlignLeftOutlined />} onClick={() => setIsDrawerVisible(false)}>
                  <Link to="/forum">Forum</Link>
                </Menu.Item>
                <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                  Log Out
                </Menu.Item>
              </>
            ) : (
              <Menu.Item key="login" icon={<UserOutlined />}  onClick={() => setIsDrawerVisible(false)}>
                <Link to="/signup">Log In/Signup</Link>
              </Menu.Item>
            )}
          </Menu>
      </Drawer>
      </div>
    </Header>
  );
};

export default NavBar;
