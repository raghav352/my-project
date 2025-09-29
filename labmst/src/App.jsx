import React, { useState } from "react";

const App = () => {
  // 🎶 Sample song data
  const songs = [
    { title: "Blinding Lights", artist: "The Weeknd", playlist: "Pop Hits" },
    { title: "Shape of You", artist: "Ed Sheeran", playlist: "Top 100" },
    { title: "Levitating", artist: "Dua Lipa", playlist: "Dance Mix" },
    { title: "Someone Like You", artist: "Adele", playlist: "Love Songs" },
    { title: "Bad Guy", artist: "Billie Eilish", playlist: "Pop Mix" },
    { title: "Peaches", artist: "Justin Bieber", playlist: "Chill Vibes" },
  ];

  const [searchTerm, setSearchTerm] = useState("");

  // 🔍 Filter logic
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.playlist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🎧 Music Playlist</h1>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search songs, artist, or playlist..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.input}
      />

      {/* Song List */}
      <div style={styles.songList}>
        {filteredSongs.map((song, index) => (
          <div key={index} style={styles.songCard}>
            <h3>{song.title}</h3>
            <p>🎤 {song.artist}</p>
            <p>📁 {song.playlist}</p>
          </div>
        ))}

        {filteredSongs.length === 0 && (
          <p style={{ textAlign: "center", color: "#666" }}>No songs found.</p>
        )}
      </div>
    </div>
  );
};

// 🎨 CSS styles
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    padding: "30px",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
  },
  heading: {
    fontSize: "2em",
    color: "#333",
    marginBottom: "20px",
  },
  input: {
    width: "60%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "25px",
  },
  songList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    justifyContent: "center",
  },
  songCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    padding: "15px",
  },
};

export default App;
