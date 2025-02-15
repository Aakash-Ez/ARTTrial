import React, { useState, useEffect } from "react";
import { Layout, Card, Button, List, Avatar, message, Select, Input } from "antd";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getCurrentUserInfo } from "../../auth";

const { Content } = Layout;
const { Option } = Select;

const PollPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [polls, setPolls] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");

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

    const fetchPolls = async () => {
      try {
        const pollsCollection = collection(db, "polls");
        const pollsSnapshot = await getDocs(pollsCollection);
        const fetchedPolls = await Promise.all(
          pollsSnapshot.docs.map(async (pollDoc) => {
            const pollData = pollDoc.data();
            const updatedOptions = await Promise.all(
              pollData.options.map(async (option: any) => {
                const userDoc = await getDoc(doc(db, "users", option.id));
                return {
                  ...option,
                  name: userDoc.exists() ? userDoc.data().name : "Unknown",
                  photoURL: userDoc.exists() ? userDoc.data().photoURL : "https://via.placeholder.com/64",
                };
              })
            );
            return { id: pollDoc.id, ...pollData, options: updatedOptions };
          })
        );
        setPolls(fetchedPolls);
      } catch (error) {
        console.error("Error fetching polls:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const sortedUsers = usersSnapshot.docs
          .map((doc) => ({ id: doc.id, name: doc.data().name, ...doc.data() }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setUsers(sortedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
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
    if (!candidateId) {
      message.error("You must select a candidate to vote.");
      return;
    }
    console.log(pollId, candidateId);

    try {
      const pollRef = doc(db, "polls", pollId);
      const poll = polls.find((p) => p.id === pollId);
      if (!poll) return;
      console.log(poll);
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
      console.log("updated:", updatedOptions);
      await updateDoc(pollRef, { options: updatedOptions });
      refreshPage();
    } catch (error) {
      console.error("Error updating poll:", error);
      message.error("Failed to submit vote. Try again.");
    }
  };
  
  const refreshPage = () => {
    window.location.reload();
  };
  
  return (
    <Layout style={{ padding: "20px", background: "#ffffff", minHeight: "100vh" }}>
      <Content>
        <h2 style={{ textAlign: "center", color: "#333" }}>Live Polls</h2>
        <List
          dataSource={polls}
          renderItem={(poll) => {
            const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes).slice(0, 3);
            const userVotedFor = poll.options.find((opt: any) => opt.voters.includes(userId));
            const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
            return (
              <Card style={{ marginBottom: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <h3 style={{ color: "#222" }}>{poll.question}</h3>
                <h4>Top 3 Candidates:</h4>
                {sortedOptions.map((option: any) => (
                  <div key={option.id} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                    <Avatar src={option.photoURL || "https://via.placeholder.com/64"} size={50} style={{ marginRight: "10px" }} />
                    <span style={{ flex: 1 }}>{option.name}</span>
                    <span style={{ fontWeight: "bold" }}>{option.votes} votes</span>
                  </div>
                ))}
                <h4>Your Vote:</h4>
                {userVotedFor ? (
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                    <Avatar src={userVotedFor.photoURL || "https://via.placeholder.com/64"} size={50} style={{ marginRight: "10px" }} />
                    <span style={{ flex: 1 }}>{userVotedFor.name}</span>
                  </div>
                ) : (
                  <>
                          <Input 
          placeholder="Search Candidates" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: "10px", width: "100%" }}
        />
                    <Select 
                      placeholder="Vote for a candidate"
                      onChange={(value) => setSelectedCandidate(value)}
                      style={{ width: "100%" }}
                    >
                      {filteredUsers.map((option: any) => (
                        <Option key={option.id} value={option.id}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <Avatar src={option.photoURL || "https://via.placeholder.com/64"} size={30} style={{ marginRight: "10px" }} />
                            <span>{option.name}</span>
                          </div>
                        </Option>
                      ))}
                    </Select>
                    <Button type="primary" onClick={() => handleVote(poll.id, selectedCandidate)} style={{ marginTop: "10px", width: "100%", background: "#1890ff", borderColor: "#1890ff", fontWeight: "bold" }}>
                      🎉 Submit Vote!
                    </Button>
                  </>
                )}
              </Card>
            );
          }}
        />
      </Content>
    </Layout>
  );
};

export default PollPage;