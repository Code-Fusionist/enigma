import React, { useRef, useState, useEffect } from 'react';
import './VideoPlayer.css'; // Custom CSS for styling

const Enigma = () => {
    const videoRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [canvasContexts, setCanvasContexts] = useState([]);
    const [isEraserMode, setIsEraserMode] = useState(false); // State to toggle between draw and erase
    const [isEditable, setIsEditable] = useState(Array(9).fill(false)); // State to control canvas editability

    useEffect(() => {
        const canvases = document.querySelectorAll('.sign-canvas');
        const contexts = Array.from(canvases).map(canvas => canvas.getContext('2d'));
        setCanvasContexts(contexts);

        const devicePixelRatio = window.devicePixelRatio || 1;

        // Resize canvas and restore drawing from localStorage
        const resizeCanvas = () => {
            if (videoRef.current) {
                canvases.forEach((canvas, index) => {
                    const width = videoRef.current.offsetWidth;
                    const height = 100; // Height of the signature area

                    canvas.width = width * devicePixelRatio;
                    canvas.height = height * devicePixelRatio;
                    canvas.style.width = `${width}px`;
                    canvas.style.height = `${height}px`;

                    const context = canvas.getContext('2d');
                    if (context) {
                        context.scale(devicePixelRatio, devicePixelRatio);
                    }

                    // Restore the drawing from localStorage if available
                    const savedImage = localStorage.getItem(`canvas${index}`);
                    if (savedImage) {
                        const img = new Image();
                        img.src = savedImage;
                        img.onload = () => {
                            context.drawImage(img, 0, 0);
                        };
                    }
                });
            }
        };

        resizeCanvas();

        // Listen for window resize to adjust the canvas size dynamically
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const saveCanvas = (index) => {
        const canvas = document.querySelectorAll('.sign-canvas')[index];
        const dataURL = canvas.toDataURL();
        localStorage.setItem(`canvas${index}`, dataURL); // Save the drawing as an image in localStorage
    };

    const handleMouseDown = (e, index) => {
        if (!isEditable[index]) return;
        setIsDrawing(true);
        draw(e, index); // Start drawing or erasing immediately
    };

    const handleMouseMove = (e, index) => {
        if (!isDrawing || !isEditable[index]) return;
        draw(e, index);
    };

    const handleMouseUp = (index) => {
        setIsDrawing(false);
        if (canvasContexts[index] && isEditable[index]) {
            canvasContexts[index].beginPath(); // Stop drawing
            saveCanvas(index); // Save the canvas drawing to local storage
        }
    };

    const draw = (e, index) => {
        const canvas = document.querySelectorAll('.sign-canvas')[index];
        const context = canvasContexts[index];
        const rect = canvas.getBoundingClientRect();

        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        if (!context) return;

        context.lineWidth = 3;
        context.lineCap = 'round';

        // Use red color for drawing and white (eraser) to clear
        if (isEraserMode) {
            context.globalCompositeOperation = 'destination-out'; // Use "destination-out" for erasing
            context.lineWidth = 10; // Eraser width (larger than pen)
        } else {
            context.globalCompositeOperation = 'source-over'; // Use normal draw mode
            context.strokeStyle = 'red'; // Pen color
        }

        context.lineTo(offsetX, offsetY);
        context.stroke();
        context.beginPath();
        context.moveTo(offsetX, offsetY);
    };

    const handleTouchStart = (e, index) => {
        if (!isEditable[index]) return;
        e.preventDefault(); // Prevent scrolling
        setIsDrawing(true);
        drawTouch(e, index); // Start drawing or erasing immediately
    };

    const handleTouchMove = (e, index) => {
        if (!isDrawing || !isEditable[index]) return;
        e.preventDefault(); // Prevent scrolling
        drawTouch(e, index);
    };

    const handleTouchEnd = (index) => {
        setIsDrawing(false);
        if (canvasContexts[index] && isEditable[index]) {
            canvasContexts[index].beginPath(); // Stop drawing
            saveCanvas(index); // Save the canvas drawing to local storage
        }
    };

    const drawTouch = (e, index) => {
        const canvas = document.querySelectorAll('.sign-canvas')[index];
        const context = canvasContexts[index];
        const rect = canvas.getBoundingClientRect();

        const touch = e.touches[0];
        const offsetX = touch.clientX - rect.left;
        const offsetY = touch.clientY - rect.top;

        if (!context) return;

        context.lineWidth = 3;
        context.lineCap = 'round';

        if (isEraserMode) {
            context.globalCompositeOperation = 'destination-out'; // Erasing mode
            context.lineWidth = 10; // Eraser width
        } else {
            context.globalCompositeOperation = 'source-over'; // Drawing mode
            context.strokeStyle = 'red'; // Pen color
        }

        context.lineTo(offsetX, offsetY);
        context.stroke();
        context.beginPath();
        context.moveTo(offsetX, offsetY);
    };

    const toggleEditable = (index) => {
        const newEditState = [...isEditable];
        newEditState[index] = !newEditState[index];
        setIsEditable(newEditState);
    };

    return (
        <div className="video-container">
            <video ref={videoRef} className="video-player" controls>
                <source src="/typo invite_1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Tools for pen and eraser */}
            <div className="tools" style={{ margin: '20px 0' }}>
                <button onClick={() => setIsEraserMode(false)} style={{ marginRight: '10px' }}>Pen</button>
                <button onClick={() => setIsEraserMode(true)}>Eraser</button>
            </div>

            {/* Editable Table */}
            <table className="editable-table">
                <thead>
                    <tr>
                        <th>Faculty Name</th>
                        <th>Designation</th>
                        <th>Sign</th>
                        <th>Edit/Save</th>
                    </tr>
                </thead>
                <tbody>
                    {["Prof.(Dr.) Ravi K Dhar", "Prof.(Dr.) Meenakshi Narula", "Dr. Harsha Ratnani", "Mr. Deepak Sharma", "Dr. Puja Munjal", "Dr. Anisha Tandon", "Dr. Abha Pandey", "Ms. Neha Chhabra", "Dr. Priti Sharma"].map((name, i) => (
                        <tr key={i}>
                            <td contentEditable="true" className="editable-cell">{name}</td>
                            <td className="editable-cell">Designation {i + 1}</td>
                            <td>
                                <canvas
                                    className="sign-canvas"
                                    onMouseDown={(e) => handleMouseDown(e, i)}
                                    onMouseMove={(e) => handleMouseMove(e, i)}
                                    onMouseUp={() => handleMouseUp(i)}
                                    onTouchStart={(e) => handleTouchStart(e, i)}
                                    onTouchMove={(e) => handleTouchMove(e, i)}
                                    onTouchEnd={() => handleTouchEnd(i)}
                                ></canvas>
                            </td>
                            <td>
                                <button onClick={() => toggleEditable(i)}>
                                    {isEditable[i] ? "Save" : "Edit"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Enigma;
