import React, { useRef, useState, useEffect } from 'react';
import './VideoPlayer.css'; // Custom CSS for styling

const Enigma = () => {
    const videoRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [canvasContexts, setCanvasContexts] = useState([]);
    const [isEraserMode, setIsEraserMode] = useState(false);

    useEffect(() => {
        const canvases = document.querySelectorAll('.sign-canvas');
        const contexts = Array.from(canvases).map(canvas => canvas.getContext('2d'));
        setCanvasContexts(contexts);

        const devicePixelRatio = window.devicePixelRatio || 1;

        const resizeCanvas = () => {
            if (videoRef.current) {
                canvases.forEach((canvas, index) => {
                    const width = videoRef.current.offsetWidth;
                    const height = 100;

                    canvas.width = width * devicePixelRatio;
                    canvas.height = height * devicePixelRatio;
                    canvas.style.width = `${width}px`;
                    canvas.style.height = `${height}px`;

                    const context = canvas.getContext('2d');
                    if (context) {
                        context.scale(devicePixelRatio, devicePixelRatio);
                    }

                    // Restore drawing from localStorage
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

        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const saveCanvas = (index) => {
        const canvas = document.querySelectorAll('.sign-canvas')[index];
        const dataURL = canvas.toDataURL();
        localStorage.setItem(`canvas${index}`, dataURL);
    };

    const handleMouseDown = (e, index) => {
        setIsDrawing(true);
        draw(e, index);
    };

    const handleMouseMove = (e, index) => {
        if (!isDrawing) return;
        draw(e, index);
    };

    const handleMouseUp = (index) => {
        setIsDrawing(false);
        if (canvasContexts[index]) {
            canvasContexts[index].beginPath();
            saveCanvas(index);
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

        if (isEraserMode) {
            context.globalCompositeOperation = 'destination-out';
            context.lineWidth = 10;
        } else {
            context.globalCompositeOperation = 'source-over';
            context.strokeStyle = 'red';
        }

        context.lineTo(offsetX, offsetY);
        context.stroke();
        context.beginPath();
        context.moveTo(offsetX, offsetY);
    };

    const handleTouchStart = (e, index) => {
        e.preventDefault();
        setIsDrawing(true);
        drawTouch(e, index);
    };

    const handleTouchMove = (e, index) => {
        e.preventDefault();
        if (!isDrawing) return;
        drawTouch(e, index);
    };

    const handleTouchEnd = (index) => {
        setIsDrawing(false);
        if (canvasContexts[index]) {
            canvasContexts[index].beginPath();
            saveCanvas(index);
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
            context.globalCompositeOperation = 'destination-out';
            context.lineWidth = 10;
        } else {
            context.globalCompositeOperation = 'source-over';
            context.strokeStyle = 'red';
        }

        context.lineTo(offsetX, offsetY);
        context.stroke();
        context.beginPath();
        context.moveTo(offsetX, offsetY);
    };

    return (
        <div className="video-container">
            <video ref={videoRef} className="video-player" controls>
                <source src="/typo invite_1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <div className="tools" style={{ margin: '20px 0' }}>
                <button onClick={() => setIsEraserMode(false)} style={{ marginRight: '10px' }}>Pen</button>
                <button onClick={() => setIsEraserMode(true)}>Eraser</button>
            </div>

            <table className="editable-table">
                <thead>
                    <tr>
                        <th>Faculty Name</th>
                        <th>Designation</th>
                        <th>Sign</th>
                    </tr>
                </thead>
                <tbody>
                    {['Prof.(Dr.) Ravi K Dhar', 'Prof.(Dr.) Meenakshi Narula', 'Dr. Harsha Ratnani', 'Mr. Deepak Sharma', 'Dr. Puja Munjal', 'Dr. Anisha Tandon', 'Dr. Abha Pandey', 'Ms. Neha Chhabra', 'Dr. Priti Sharma'].map((name, index) => (
                        <tr key={index}>
                            <td contentEditable="true" className="editable-cell">{name}</td>
                            <td contentEditable="true" className="editable-cell">Designation {index + 1}</td>
                            <td>
                                <canvas
                                    className="sign-canvas"
                                    onMouseDown={(e) => handleMouseDown(e, index)}
                                    onMouseMove={(e) => handleMouseMove(e, index)}
                                    onMouseUp={() => handleMouseUp(index)}
                                    onTouchStart={(e) => handleTouchStart(e, index)}
                                    onTouchMove={(e) => handleTouchMove(e, index)}
                                    onTouchEnd={() => handleTouchEnd(index)}
                                ></canvas>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Enigma;
