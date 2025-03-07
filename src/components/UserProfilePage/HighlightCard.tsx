import React, { useEffect, useState } from "react";
import { Card, Spin, message } from "antd";
import { getFirestore, collection, getDocs } from "firebase/firestore";

interface Highlight {
  id: string;
  image: string;
  caption: string;
  tags: string[];
}

interface HighlightCardProps {
  userId: string;
}

const HighlightCard: React.FC<HighlightCardProps> = ({ userId }) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const db = getFirestore();
        const highlightsCollection = collection(db, "highlights");
        const querySnapshot = await getDocs(highlightsCollection);
        let filteredHighlights: Highlight[] = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data() as Highlight;
          if (data.tags.includes(userId) && data.image) {
            filteredHighlights.push(data);
          }
        }

        setHighlights(filteredHighlights);
      } catch (error) {
        message.error("Failed to fetch highlights");
        console.log(error)
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, [userId]);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", padding: "16px" }}>
      {loading ? (
        <Spin size="large" />
      ) : (
        highlights.map((highlight) => (
          <Card
            key={highlight.id}
            hoverable
            cover={<img alt="highlight" src={highlight.image} />}
            style={{ width: 240 }}
          >
            <Card.Meta title={highlight.caption} />
          </Card>
        ))
      )}
    </div>
  );
};

export default HighlightCard;