import React, { useState, useRef } from "react";
import axios from "axios";
import "./App.css";

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [products, setProducts] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [recommendations, setRecommendations] = useState<any>(null);
  const [userRecommendations, setUserRecommendations] = useState<any>(null);
  const [productSearch, setProductSearch] = useState<string>("");
  const [userSearch, setUserSearch] = useState<string>("");
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const productResultRef = useRef<HTMLDivElement | null>(null);
  const userResultRef = useRef<HTMLDivElement | null>(null);

  // CSV Dosyasını Yükleme
  const uploadFile = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("File uploaded successfully and analyzed!");
      console.log(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    }
  };

  // Ürün Önerileri
  const fetchRecommendations = async () => {
    try {
      const productList = products.split(",").map((p) => p.trim());
      const response = await axios.post("http://127.0.0.1:5000/recommend", {
        products: productList,
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations({ error: "Failed to fetch recommendations" });
    }
  };
  // Kullanıcı Profili Ürün Önerileri
  const fetchUserRecommendations = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/user-recommend", {
        user_id: userId,
      });
      setUserRecommendations(response.data);
    } catch (error) {
      console.error("Error fetching user recommendations:", error);
      setUserRecommendations({ error: "Failed to fetch user recommendations" });
    }
  };

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? <span key={index} className="highlight">{part}</span> : part
    );
  };

  const handleSearchEnter = (search: string, ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const highlightedElement = ref.current.querySelector(".highlight");
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const toggleGuide = () => {
    setIsGuideOpen(!isGuideOpen);
  };

  return (
    <div className="App">
      <button className="guide-button" onClick={toggleGuide}>
        Guide
      </button>

      {isGuideOpen && (
        <div className="guide-modal">
          <div className="guide-content">
            <button className="close-button" onClick={toggleGuide}>
              ✖
            </button>
            <h2>Welcome to E-commerce Analysis Tool</h2>
            <p>
              This tool allows you to:
              <ol>
                <li>Upload CSV files to analyze your data.</li>
                <li>Enter product names to get recommendations.</li>
                <li>Enter user IDs to view personalized recommendations.</li>
                <li>Search within results and navigate to specific matches.</li>
              </ol>
            </p>
          </div>
        </div>
      )}

      <div className="container">
        {/* Sol Panel */}
        <div className="left-panel">
          <h2>Input Panel</h2>
          <h3>Upload CSV File</h3>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          <button onClick={uploadFile}>Upload and Analyze</button>
          {/*
          <h3>Product Recommendations</h3>
          <input
            type="text"
            placeholder="Enter products separated by commas"
            value={products}
            onChange={(e) => setProducts(e.target.value)}
          />
          <button onClick={fetchRecommendations}>Get Recommendations</button>
          */}

          <h3>User Profile Recommendations</h3>
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button onClick={fetchUserRecommendations}>Get User Recommendations</button>
        </div>

        {/* Sağ Panel */}
        <div className="right-panel">
          {recommendations && (
            <div className="result-section">
              <h3>
                Product Recommendations:
                <input
                  type="text"
                  placeholder="Search..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchEnter(productSearch, productResultRef);
                  }}
                />
              </h3>
              <div ref={productResultRef} className="results">
                {Object.entries(recommendations).map(([key, value]) => (
                  <div key={key} className="result-item">
                    <strong>{highlightText(key, productSearch)}</strong>
                    <ul>
                      {Object.entries(value as Record<string, string>).map(([subKey, subValue]) => (
                        <li key={subKey}>{highlightText(subKey, productSearch)}: {subValue}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userRecommendations && (
            <div className="result-section">
              <h3>
                User Profile Recommendations:
                <input
                  type="text"
                  placeholder="Search..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchEnter(userSearch, userResultRef);
                  }}
                />
              </h3>
              <div ref={userResultRef} className="results">
                {Object.entries(userRecommendations).map(([key, value]) => (
                  <div key={key} className="result-item">
                    <strong>{highlightText(key, userSearch)}</strong>
                    <ul>
                      {Object.entries(value as Record<string, string>).map(([subKey, subValue]) => (
                        <li key={subKey}>{highlightText(subKey, userSearch)}: {subValue}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
