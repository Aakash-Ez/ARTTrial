import React, { useState, useEffect } from "react";
import { Layout, Card, Button, List, Avatar, Progress, message, Input } from "antd";
import { collection, getDocs, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { getCurrentUserInfo } from "../../auth";

const { Content } = Layout;
const { Search } = Input;

const PollPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [polls, setPolls] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfo = await getCurrentUserInfo();
        if (userInfo && userInfo.uid) {
          setUserId(userInfo.uid);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchPolls = () => {
      const pollsCollection = collection(db, "polls");
      onSnapshot(pollsCollection, (snapshot) => {
        setPolls(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
    };

    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const allUsers = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(allUsers);
      setFilteredUsers(allUsers.sort(() => 0.5 - Math.random()).slice(0, 3)); // Show 3 random users initially
    };

    fetchUserData();
    fetchPolls();
    fetchUsers();
  }, []);

  const handleVote = async (pollId: string, candidateId: string) => {
    if (!userId) {
      message.error("You must be logged in to vote.");
      return;
    }

    try {
      const pollRef = doc(db, "polls", pollId);
      const poll = polls.find((p) => p.id === pollId);
      if (!poll) return;

      let updatedOptions = poll.options || [];
      const existingCandidate = updatedOptions.find((option: any) => option.id === candidateId);

      if (existingCandidate) {
        if (!existingCandidate.voters.includes(userId)) {
          existingCandidate.votes += 1;
          existingCandidate.voters.push(userId);
        } else {
          existingCandidate.votes -= 1;
          existingCandidate.voters = existingCandidate.voters.filter((voter: string) => voter !== userId);
        }
      } else {
        updatedOptions.push({ id: candidateId, votes: 1, voters: [userId] });
      }

      await updateDoc(pollRef, { options: updatedOptions });
    } catch (error) {
      console.error("Error updating poll:", error);
      message.error("Failed to submit vote. Try again.");
    }
  };

  const handleSearch = (value: string) => {
    if (!value) {
      setFilteredUsers(users.sort(() => 0.5 - Math.random()).slice(0, 3));
    } else {
      setFilteredUsers(users.filter((user) => user.name.toLowerCase().includes(value.toLowerCase())));
    }
  };

  return (
    <Layout style={{ padding: "20px", background: "#ffffff", minHeight: "100vh" }}>
      <Content>
        <h2 style={{ textAlign: "center", color: "#333" }}>Live Polls</h2>
        <Search placeholder="Search Candidates" onSearch={handleSearch} style={{ marginBottom: 20 }} />
        <List
          dataSource={polls}
          renderItem={(poll) => (
            <Card style={{ marginBottom: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <h3 style={{ color: "#222" }}>{poll.question}</h3>
              <p style={{ fontSize: "12px", color: "#888" }}>
                Deadline: {new Date(poll.deadline.toDate()).toLocaleString()}
              </p>
              {filteredUsers.map((user) => {
                const pollOption = poll.options?.find((opt: any) => opt.id === user.id) || { votes: 0, voters: [] };
                const totalVotes = poll.options?.reduce((sum: number, o: any) => sum + o.votes, 0) || 1;
                const votePercentage = ((pollOption.votes / totalVotes) * 100).toFixed(1);
                const hasVoted = pollOption.voters.includes(userId);
                return (
                  <div key={user.id} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                    <Avatar src={user.photoURL} size={50} style={{ marginRight: "10px" }} />
                    <span style={{ flex: 1 }}>{user.name}</span>
                    <Progress percent={parseFloat(votePercentage)} style={{ flex: 2 }} />
                    <Button
                      type={hasVoted ? "primary" : "default"}
                      onClick={() => handleVote(poll.id, user.id)}
                      style={{ marginLeft: "10px" }}
                    >
                      {hasVoted ? "Unvote" : "Vote"}
                    </Button>
                  </div>
                );
              })}
            </Card>
          )}
        />
      </Content>
    </Layout>
  );
};

export default PollPage;
