import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const donationCompatibility = {
  "A+": ["A+", "AB+"],
  "A-": ["A+", "A-", "AB+", "AB-"],
  "B+": ["B+", "AB+"],
  "B-": ["B+", "B-", "AB+", "AB-"],
  "AB+": ["AB+"],
  "AB-": ["AB+", "AB-"],
  "O+": ["A+", "B+", "AB+", "O+"],
  "O-": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
};

const rhInheritance = {
  "+": ["+", "-"],
  "-": ["-"],
};

const bloodTypeInheritance = {
  A: { A: { A: 100, O: 0 }, B: { A: 50, B: 25, AB: 25, O: 0 }, O: { A: 50, O: 50 }, AB: { A: 50, AB: 50 } },
  B: { A: { A: 50, B: 25, AB: 25, O: 0 }, B: { B: 100, O: 0 }, O: { B: 50, O: 50 }, AB: { B: 50, AB: 50 } },
  AB: { A: { A: 50, AB: 50 }, B: { B: 50, AB: 50 }, O: { A: 50, B: 50 }, AB: { A: 25, B: 25, AB: 50 } },
  O: { A: { A: 50, O: 50 }, B: { B: 50, O: 50 }, O: { O: 100 }, AB: { A: 50, B: 50 } },
};

function splitBloodType(bloodType) {
  const group = bloodType.slice(0, -1);
  const rh = bloodType.slice(-1);
  return [group, rh];
}

function calculateRhProbabilities(motherRh, fatherRh) {
  const motherAlleles = rhInheritance[motherRh];
  const fatherAlleles = rhInheritance[fatherRh];

  const probabilities = { "+": 0, "-": 0 };
  for (const mAllele of motherAlleles) {
    for (const fAllele of fatherAlleles) {
      const childRh = mAllele === "+" || fAllele === "+" ? "+" : "-";
      probabilities[childRh] += 0.25;
    }
  }
  return probabilities;
}

function calculateBloodGroupProbabilities(motherGroup, fatherGroup) {
  const combinations = {
    A: ["A", "O"],
    B: ["B", "O"],
    AB: ["A", "B"],
    O: ["O", "O"],
  };

  const motherAlleles = combinations[motherGroup];
  const fatherAlleles = combinations[fatherGroup];

  const groupProbabilities = {
    A: 0,
    B: 0,
    AB: 0,
    O: 0,
  };

  for (const mAllele of motherAlleles) {
    for (const fAllele of fatherAlleles) {
      const childGroup =
        (mAllele === "A" && fAllele === "B") || (mAllele === "B" && fAllele === "A")
          ? "AB"
          : mAllele === fAllele
          ? mAllele
          : mAllele === "O"
          ? fAllele
          : mAllele;
      groupProbabilities[childGroup] += 0.25;
    }
  }

  // Normalize probabilities to make sure they sum to 100%
  const totalProbability = Object.values(groupProbabilities).reduce((acc, val) => acc + val, 0);
  for (const key in groupProbabilities) {
    groupProbabilities[key] = (groupProbabilities[key] / totalProbability) * 100;
  }

  return groupProbabilities;
}

function calculateProbabilities(motherType, fatherType) {
  const [motherGroup, motherRh] = splitBloodType(motherType);
  const [fatherGroup, fatherRh] = splitBloodType(fatherType);

  const groupProbabilities = calculateBloodGroupProbabilities(motherGroup, fatherGroup);
  const rhProbabilities = calculateRhProbabilities(motherRh, fatherRh);

  const combinedProbabilities = {};
  for (const group in groupProbabilities) {
    for (const rh in rhProbabilities) {
      const combinedKey = `${group}${rh}`;
      combinedProbabilities[combinedKey] =
        (groupProbabilities[group] / 100) * rhProbabilities[rh];
    }
  }

  // Final normalization to ensure total sum is exactly 100%
  const totalCombined = Object.values(combinedProbabilities).reduce((acc, val) => acc + val, 0);
  for (const key in combinedProbabilities) {
    combinedProbabilities[key] = (combinedProbabilities[key] / totalCombined) * 100;
  }

  return combinedProbabilities;
}

function generateColors(count) {
  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF", "#8B0000"];
  return colors.slice(0, count);
}

const Navbar = () => {
  return (
    <nav style={{ backgroundColor: "purple", padding: "10px", color: "white", width: "100%", position: "fixed", top: 0, left: 0, zIndex: 1000 }}>
      <ul style={{ display: "flex", listStyleType: "none", margin: 0, padding: 0, justifyContent: "center" }}>
        <li style={{ marginRight: "20px" }}>
          <Link to="/" style={{ color: "white", textDecoration: "none", fontFamily: "roboto", fontWeight: "bold" }}>Home</Link>
        </li>
        <li style={{ marginRight: "20px" }}>
          <Link to="/about" style={{ color: "white", textDecoration: "none", fontFamily: "roboto", fontWeight: "bold" }}>About Blud</Link>
        </li>
      </ul>
    </nav>
  );
};

const AboutBlud = () => {
  return (
    <div style={{ margin: "100px 50px 50px 50px" }}>
      <h1 style={{ textAlign: "center" }}>About Blood Types</h1>
      <p>
        Blood types are categorized based on the presence or absence of specific antigens on the surface of red blood cells. The four main blood groups are A, B, AB, and O. Each of these groups is further classified by the Rhesus (Rh) factor into positive (+) and negative (-).
      </p>
      <p>
        For example:
        <ul>
          <li><strong>A+:</strong> Contains A antigen and Rh factor.</li>
          <li><strong>O-:</strong> Lacks all antigens and is considered the universal donor for red blood cells.</li>
          <li><strong>AB+:</strong> Has both A and B antigens, and is the universal plasma recipient.</li>
        </ul>
      </p>
      <p>Knowing your blood type is critical for safe blood transfusions and organ transplants.</p>
    </div>
  );
};

const BloodTypeCalculator = () => {
  const [motherType, setMotherType] = useState("A+");
  const [fatherType, setFatherType] = useState("A+");
  const [probabilities, setProbabilities] = useState({});
  const [donorType, setDonorType] = useState("A+");
  const [compatibleTypes, setCompatibleTypes] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleCalculate = () => {
    const results = calculateProbabilities(motherType, fatherType);
    setProbabilities(results);
  };

  const handleDonorTypeChange = (type) => {
    setDonorType(type);
    setCompatibleTypes(donationCompatibility[type] || []);
  };

  const data = {
    labels: Object.keys(probabilities),
    datasets: [
      {
        data: Object.values(probabilities),
        backgroundColor: generateColors(Object.keys(probabilities).length),
      },
    ],
  };

  const handleOpenPopup = () => {
    setIsPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <div>
      <div style={{ margin: "100px 50px 50px 50px" }}>
        <h1 style={{ textAlign: "center" }}>Blood Type Calculator</h1>
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Probability Calculator Section */}
          <div style={{ flex: 1, minWidth: "300px" }}>
            <label>Mother's Blood Type</label>
            <select value={motherType} onChange={(e) => setMotherType(e.target.value)} style={{ marginBottom: "10px" }}>
              {bloodTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <br />
            <label>Father's Blood Type</label>
            <select value={fatherType} onChange={(e) => setFatherType(e.target.value)} style={{ marginBottom: "10px" }}>
              {bloodTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <br />
            <button onClick={handleCalculate} style={{ marginTop: "10px" }}>Calculate</button>

            {Object.keys(probabilities).length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h2 style={{ textAlign: "left" }}>Results</h2>
                {Object.entries(probabilities).map(([key, value]) => (
  <p key={key}>{key}: {(value).toFixed(2)}%</p> // Removed an extra *100 here
))}
              </div>
            )}
          </div>

          {/* Pie Chart Section */}
          {Object.keys(probabilities).length > 0 && (
            <div style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h2 style={{ textAlign: "center" }}>Probability Distribution</h2>
              <Pie data={data} style={{ maxHeight: "300px", marginTop: "10px" }} />
            </div>
          )}
        </div>

        {/* Donation Compatibility Section Button */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button onClick={handleOpenPopup} style={{ padding: "10px 20px", backgroundColor: "purple", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Open Donation Compatibility
          </button>
        </div>

        {isPopupVisible && (
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "white", padding: "20px", boxShadow: "0px 4px 6px rgba(0,0,0,0.1)", zIndex: 1000 }}>
            <h2 style={{ textAlign: "center" }}>Compatible Blood Types</h2>
            <label>Select Donor Blood Type</label>
            <select value={donorType} onChange={(e) => handleDonorTypeChange(e.target.value)} style={{ marginBottom: "10px", width: "100%" }}>
              {bloodTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div style={{ marginTop: "20px" }}>
              {compatibleTypes.map((type) => (
                <p key={type}>{type}</p>
              ))}
            </div>
            <button onClick={handleClosePopup} style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "purple", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<BloodTypeCalculator />} />
        <Route path="/about" element={<AboutBlud />} />
      </Routes>
    </Router>
  );
};

export default App;
