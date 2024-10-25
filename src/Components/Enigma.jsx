import React, { useRef, useState, useEffect, useMemo } from "react";
import SignatureCanvas from "react-signature-canvas";
import "./VideoPlayer.css";

const App = () => {
  const sigCanvasRefs = useRef([]);
  const [selectedTool, setSelectedTool] = useState("pen");
  const [eraserSize, setEraserSize] = useState(30); // Increased initial eraser size

  const clearSignature = (index) => {
    sigCanvasRefs.current[index].clear();
    localStorage.removeItem(`signature_${index}`); // Clear the specific signature from local storage
  };

  // Save each signature as base64 in localStorage
  const saveSignature = (index) => {
    const dataURL = sigCanvasRefs.current[index].toDataURL();
    localStorage.setItem(`signature_${index}`, dataURL);
  };

  // Wrap people initialization in useMemo to avoid dependency issues
  const people = useMemo(() => [
    { name: "Prof.(Dr.) Ravi K Dhar", designation: "HOD (IT-Deptt.) & COE" },
    { name: "Prof.(Dr.) Meenakshi Narula", designation: "HOD (IT-Deptt.) & COE" },
    { name: "Dr. Harsha Ratnani", designation: "Associate Professor" },
    { name: "Mr. Deepak Sharma", designation: "NAAC IQAC Coordinator, Assistant Professor" },
    { name: "Dr. Puja Munjal", designation: "Associate Professor" },
    { name: "Dr. Anisha Tandon", designation: "Assistant Professor" },
    { name: "Dr. Abha Pandey", designation: "Assistant Professor" },
    { name: "Ms. Neha Chhabra", designation: "Assistant Professor" },
    { name: "Dr. Priti Sharma", designation: "Assistant Professor" },
    { name: "Mr. Kunal Anand", designation: "Assistant Professor" },
    { name: "Ms. Rahul V Anand", designation: "Assistant Professor" },
    { name: "Mr. Abhishek Gupta", designation: "Assistant Professor" },
  ], []); // Empty dependency array means this will only be created once

  // Load signatures from localStorage on component mount
  useEffect(() => {
    people.forEach((_, index) => {
      const canvas = sigCanvasRefs.current[index];
      if (canvas) {
        const pixelRatio = window.devicePixelRatio || 1;
        const canvasElement = canvas.getCanvas();
        
        canvasElement.width = canvasElement.offsetWidth * pixelRatio;
        canvasElement.height = canvasElement.offsetHeight * pixelRatio;
        canvasElement.getContext("2d").scale(pixelRatio, pixelRatio);
        
        // Load saved signature if available
        const savedSignature = localStorage.getItem(`signature_${index}`);
        if (savedSignature) {
          canvas.fromDataURL(savedSignature);
        }
      }
    });
  }, [people]); // Dependency is fine here as 'people' is memoized

  return (
    <div className="container">
      <div className="video-container">
        <video controls className="video">
          <source src="\typo invite_1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="tool-selection">
        <button onClick={() => setSelectedTool("pen")} className={selectedTool === "pen" ? "active" : ""}>
          Pen
        </button>
        <button onClick={() => setSelectedTool("eraser")} className={selectedTool === "eraser" ? "active" : ""}>
          Eraser
        </button>
      </div>

      {/* Eraser Size Control */}
      {selectedTool === "eraser" && (
        <div className="eraser-size-control">
          <label htmlFor="eraser-size">Eraser Size: {eraserSize}px</label>
          <input
            type="range"
            id="eraser-size"
            min="10"  // Minimum size set to 10
            max="100" // Increased maximum size to 100
            value={eraserSize}
            onChange={(e) => setEraserSize(parseInt(e.target.value))}
          />
        </div>
      )}

      <div className="table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Signature</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person, index) => (
              <tr key={index}>
                <td>{person.name}</td>
                <td>{person.designation}</td>
                <td>
                  <div className="signature-container">
                    <SignatureCanvas
                      ref={(el) => (sigCanvasRefs.current[index] = el)}
                      onEnd={() => saveSignature(index)} // Save signature to local storage on each drawing end
                      penColor={selectedTool === "pen" ? "black" : "rgba(255,255,255,1)"}
                      canvasProps={{
                        width: 250,
                        height: 100,
                        className: "signature-pad",
                      }}
                      // Adjust the brush size based on the selected tool
                      brushSize={selectedTool === "eraser" ? eraserSize : 2}
                    />
                    <button className="clear-btn" onClick={() => clearSignature(index)}>
                      Clear
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
