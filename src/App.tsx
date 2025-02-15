import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import SignUp from "./components/SignUp/SignUp";
import NavBar from "./components/NavBar/NavBar";
import HomePage from "./components/HomePage/HomePage";
import WriteTestimonialPage from "./components/WriteTestimonialPage/WriteTestimonialPage";
import { getCurrentUserInfo } from "./auth";
import TestimonialsPage from "./components/TestimonialsPage/TestimonialsPage";
import UserProfilePageWrapper from "./components/UserProfilePage/UserProfilePageWrapper";
import MemoryMapPage from "./components/MemoryMapPage/MemoryMapPage";
import FeaturesPage from "./components/FeaturesPage/FeaturesPage";
import EventsPage from "./components/EventsPage/EventsPage";
import DisappearingTextPage from "./components/DisappearingTextPage/DisappearingTextPage";
import ChallengeImages from "./components/ChallengeImages/ChallengeImages";
import ForumPage from "./components/ForumPage/ForumPage";
import PollPage from "./components/PollPage/PollPage";
import TestimonialsOverview from "./components/TestimonialsOverview/TestimonialsOverview";
import HighlightsPage from "./components/HighlightsPage/HighlightsPage";
import TopProfilesStats from "./components/TopProfilesStats/TopProfilesStats";

const App: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <h1>Removed</h1>
  </div>
  );
};

const WriteTestimonialWrapper: React.FC = () => {
  const location = useLocation();
  const receiverId = location.state?.receiverId;
  const [writerData, setWriterData] = useState<any>(null);

  useEffect(() => {
    const fetchWriterData = async () => {
      try {
        const userInfo = await getCurrentUserInfo();
        setWriterData(userInfo);
      } catch (error) {
        console.error("Error fetching writer data:", error);
      }
    };

    fetchWriterData();
  }, []);

  if (!receiverId) {
    return <div>No receiver specified.</div>;
  }

  if (!writerData) {
    return <div>Loading writer information...</div>;
  }

  return <WriteTestimonialPage />;
};

export default App;
