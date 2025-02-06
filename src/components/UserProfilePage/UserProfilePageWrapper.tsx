import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCurrentUserInfo } from "../../auth";
import UserProfilePage from "../UserProfilePage/UserProfilePage";

const UserProfilePageWrapper: React.FC = () => {
  const { userId: urlUserId } = useParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        if (urlUserId) {
          setUserId(urlUserId);
        } else {
          const currentUser = await getCurrentUserInfo();
          if (currentUser?.uid) {
            setUserId(currentUser.uid);
          } else {
            throw new Error("No user information available.");
          }
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, [urlUserId]);

  if (loading) {
    return <div>Loading user profile...</div>;
  }

  if (!userId) {
    return <div>No user information available.</div>;
  }

  return <UserProfilePage userId={userId} />;
};

export default UserProfilePageWrapper;
