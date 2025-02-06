import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Typography } from "antd";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartTitle);

const { Title } = Typography;

const TestimonialsVisualization: React.FC<{ userId: string }> = ({ userId }) => {
  const [receivedTestimonials, setReceivedTestimonials] = useState<number>(0);
  const [givenTestimonials, setGivenTestimonials] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const testimonialsCollection = collection(db, "testimonials");

        // Fetch received testimonials
        const receivedQuery = query(testimonialsCollection, where("receiver", "==", userId));
        const receivedDocs = await getDocs(receivedQuery);
        setReceivedTestimonials(receivedDocs.size);

        // Fetch given testimonials
        const givenQuery = query(testimonialsCollection, where("writer", "==", userId));
        const givenDocs = await getDocs(givenQuery);
        setGivenTestimonials(givenDocs.size);
      } catch (error) {
        console.error("Error fetching testimonial data:", error);
      }
    };

    fetchData();
  }, [userId]);

  const pieData = {
    labels: ["Received", "Given"],
    datasets: [
      {
        label: "Testimonials",
        data: [receivedTestimonials, givenTestimonials],
        backgroundColor: ["#74183f", "#edda45"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
        <Pie data={pieData} />
    </div>
  );
};

export default TestimonialsVisualization;
