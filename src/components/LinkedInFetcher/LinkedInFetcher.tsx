import React, { useState } from "react";

interface LinkedInProfile {
  name: string;
  headline: string;
  profilePicture: string;
  location: string;
  industry: string;
}

interface LinkedInFetcherProps {
  url: string;
}

const LinkedInFetcher: React.FC<LinkedInFetcherProps> = ({ url }) => {
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLinkedInProfile = async () => {
    if (!url) {
      setError("Please enter a LinkedIn profile URL");
      return;
    }
    setLoading(true);
    setError("");
    setProfile(null);

    try {
      const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError("Failed to fetch LinkedIn profile. LinkedIn may block automated access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Fetch LinkedIn Profile</h2>
      <button onClick={fetchLinkedInProfile} disabled={loading}>
        {loading ? "Fetching..." : "Fetch Profile"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {profile && (
        <div style={{ marginTop: "20px", border: "1px solid #ddd", padding: "10px" }}>
          <img src={profile.profilePicture} alt={profile.name} width="100" />
          <h3>{profile.name}</h3>
          <p>{profile.headline}</p>
          <p>{profile.location} - {profile.industry}</p>
        </div>
      )}
    </div>
  );
};

export default LinkedInFetcher;