import React, { useRef, useState, useEffect } from 'react';
import './VideoPlayer.css'; // Custom CSS for styling

const Enigma = () => {
    const videoRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [canvasContexts, setCanvasContexts] = useState([]);
    const [isEraserMode, setIsEraserMode] = useState(false); // State to toggle between draw and erase
    const [isEditable, setIsEditable] = useState(true); // State to toggle between edit and save modes

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
        if (!isEditable) return; // Prevent drawing if not in edit mode
        setIsDrawing(true);
        draw(e, index); // Start drawing or erasing immediately
    };

    const handleMouseMove = (e, index) => {
        if (!isDrawing || !isEditable) return;
        draw(e, index);
    };

    const handleMouseUp = (index) => {
        if (!isEditable) return; // Prevent drawing if not in edit mode
        setIsDrawing(false);
        if (canvasContexts[index]) {
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
        if (!isEditable) return; // Prevent drawing if not in edit mode
        e.preventDefault(); // Prevent scrolling
        setIsDrawing(true);
        drawTouch(e, index); // Start drawing or erasing immediately
    };

    const handleTouchMove = (e, index) => {
        if (!isEditable) return; // Prevent drawing if not in edit mode
        e.preventDefault(); // Prevent scrolling
        if (!isDrawing) return;
        drawTouch(e, index);
    };

    const handleTouchEnd = (index) => {
        if (!isEditable) return; // Prevent drawing if not in edit mode
        setIsDrawing(false);
        if (canvasContexts[index]) {
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

    // Function to toggle between edit and save modes
    const toggleEditMode = () => {
        setIsEditable(!isEditable);
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

            <button onClick={toggleEditMode} style={{ marginBottom: '20px' }}>
                {isEditable ? 'Save' : 'Edit'}
            </button>

            {/* Editable Table */}
            <table className="editable-table">
                <thead>
                    <tr>
                        <th>Faculty Name</th>
                        <th>Designation</th>
                        <th>Sign</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td contentEditable="true" className="editable-cell">Prof.(Dr.) Ravi K Dhar</td>
                        <td className="editable-cell">Director</td>
                        <td>
                            <canvas
                                className="sign-canvas"
                                onMouseDown={(e) => handleMouseDown(e, 0)}
                                onMouseMove={(e) => handleMouseMove(e, 0)}
                                onMouseUp={() => handleMouseUp(0)}
                                onTouchStart={(e) => handleTouchStart(e, 0)}
                                onTouchMove={(e) => handleTouchMove(e, 0)}
                                onTouchEnd={() => handleTouchEnd(0)}
                            ></canvas>
                        </td>
                    </tr>
                    {/* Repeat for other rows */}
                </tbody>
            </table>
        </div>
    );
};

export default Enigma;
