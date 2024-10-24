import React, { useRef, useState, useEffect } from 'react';
import './VideoPlayer.css'; // Custom CSS for styling

const Enigma = () => {
    const videoRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [canvasContexts, setCanvasContexts] = useState([]);
    const [isEraserMode, setIsEraserMode] = useState(false); // State to toggle between draw and erase

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

                // Save current canvas state before resizing
                const savedImage = canvas.toDataURL();

                // Resize canvas
                canvas.width = width * devicePixelRatio;
                canvas.height = height * devicePixelRatio;
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;

                const context = canvas.getContext('2d');
                if (context) {
                    context.scale(devicePixelRatio, devicePixelRatio);

                    // Clear the canvas before restoring the saved image
                    context.clearRect(0, 0, canvas.width, canvas.height);

                    // Restore the saved drawing
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
        setIsDrawing(true);
        draw(e, index); // Start drawing or erasing immediately
    };

    const handleMouseMove = (e, index) => {
        if (!isDrawing) return;
        draw(e, index);
    };

    const handleMouseUp = (index) => {
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
        e.preventDefault(); // Prevent scrolling
        setIsDrawing(true);
        drawTouch(e, index); // Start drawing or erasing immediately
    };

    const handleTouchMove = (e, index) => {
        e.preventDefault(); // Prevent scrolling
        if (!isDrawing) return;
        drawTouch(e, index);
    };

    const handleTouchEnd = (index) => {
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
<tr>
    <td contentEditable="true" className="editable-cell">Prof.(Dr.) Meenakshi Narula</td>
    <td contentEditable="true" className="editable-cell">HOD (IT-Deptt.) &COE</td>
    <td>
        <canvas
            className="sign-canvas"
            onMouseDown={(e) => handleMouseDown(e, 1)}
            onMouseMove={(e) => handleMouseMove(e, 1)}
            onMouseUp={() => handleMouseUp(1)}
            onTouchStart={(e) => handleTouchStart(e, 1)}
            onTouchMove={(e) => handleTouchMove(e, 1)}
            onTouchEnd={() => handleTouchEnd(1)}
        ></canvas>
    </td>
</tr>
<tr>
    <td contentEditable="true" className="editable-cell">Dr. Harsha Ratnani</td>
    <td contentEditable="true" className="editable-cell">Associate Professor
    </td>
    <td>
        <canvas
            className="sign-canvas"
            onMouseDown={(e) => handleMouseDown(e, 2)}
            onMouseMove={(e) => handleMouseMove(e, 2)}
            onMouseUp={() => handleMouseUp(2)}
            onTouchStart={(e) => handleTouchStart(e, 2)}
            onTouchMove={(e) => handleTouchMove(e, 2)}
            onTouchEnd={() => handleTouchEnd(2)}
        ></canvas>
    </td>
</tr>
<tr>
    <td contentEditable="true" className="editable-cell">Mr. Deepak Sharma</td>
    <td contentEditable="true" className="editable-cell">NAAC IQAC Coordinator, Assistant Professo</td>
    <td>
        <canvas
            className="sign-canvas"
            onMouseDown={(e) => handleMouseDown(e, 3)}
            onMouseMove={(e) => handleMouseMove(e, 3)}
            onMouseUp={() => handleMouseUp(3)}
            onTouchStart={(e) => handleTouchStart(e, 3)}
            onTouchMove={(e) => handleTouchMove(e, 3)}
            onTouchEnd={() => handleTouchEnd(3)}
        ></canvas>
    </td>
</tr>
<tr>
    <td contentEditable="true" className="editable-cell">Dr. Puja Munjal</td>
    <td contentEditable="true" className="editable-cell">Associate Professor
    </td>
    <td>
        <canvas
            className="sign-canvas"
            onMouseDown={(e) => handleMouseDown(e, 4)}
            onMouseMove={(e) => handleMouseMove(e, 4)}
            onMouseUp={() => handleMouseUp(4)}
            onTouchStart={(e) => handleTouchStart(e, 4)}
            onTouchMove={(e) => handleTouchMove(e, 4)}
            onTouchEnd={() => handleTouchEnd(4)}
        ></canvas>
    </td>
</tr>
<tr>
    <td contentEditable="true" className="editable-cell">Dr. Anisha Tandon</td>
    <td contentEditable="true" className="editable-cell">Assistant Professor</td>
    <td>
        <canvas
            className="sign-canvas"
            onMouseDown={(e) => handleMouseDown(e, 5)}
            onMouseMove={(e) => handleMouseMove(e, 5)}
            onMouseUp={() => handleMouseUp(5)}
            onTouchStart={(e) => handleTouchStart(e, 5)}
            onTouchMove={(e) => handleTouchMove(e, 5)}
            onTouchEnd={() => handleTouchEnd(5)}
        ></canvas>
    </td>
</tr>
<tr>
    <td contentEditable="true" className="editable-cell">Dr. Abha Pandey</td>
    <td contentEditable="true" className="editable-cell">Assistant Professor</td>
    <td>
        <canvas
            className="sign-canvas"
            onMouseDown={(e) => handleMouseDown(e, 6)}
            onMouseMove={(e) => handleMouseMove(e, 6)}
            onMouseUp={() => handleMouseUp(6)}
            onTouchStart={(e) => handleTouchStart(e, 6)}
            onTouchMove={(e) => handleTouchMove(e, 6)}
            onTouchEnd={() => handleTouchEnd(6)}
        ></canvas>
    </td>
</tr>
<tr>
    <td contentEditable="true" className="editable-cell">Ms. Neha Chhabra</td>
    <td contentEditable="true" className="editable-cell">Assistant Professor</td>
    <td>
        <canvas
            className="sign-canvas"
            onMouseDown={(e) => handleMouseDown(e, 7)}
            onMouseMove={(e) => handleMouseMove(e, 7)}
            onMouseUp={() => handleMouseUp(7)}
            onTouchStart={(e) => handleTouchStart(e, 7)}
            onTouchMove={(e) => handleTouchMove(e, 7)}
            onTouchEnd={() => handleTouchEnd(7)}
        ></canvas>
    </td>
</tr>
<tr>
    <td contentEditable="true" className="editable-cell">Dr. Priti Sharma</td>
    <td contentEditable="true" className="editable-cell">Assistant Professor</td>
    <td>
        <canvas
            className="sign-canvas"
            onMouseDown={(e) => handleMouseDown(e, 8)}
            onMouseMove={(e) => handleMouseMove(e, 8)}
            onMouseUp={() => handleMouseUp(8)}
            onTouchStart={(e) => handleTouchStart(e, 8)}
            onTouchMove={(e) => handleTouchMove(e, 8)}
            onTouchEnd={() => handleTouchEnd(8)}
        ></canvas>
    </td>
</tr>
<tr>
    <td contentEditable="true" className="editable-cell">Mr. Kunal Anand</td>
    <td contentEditable="true" className="editable-cell">Assistant Professor</td>
    <td>
        <canvas
            className="sign-canvas"
            onMouseDown={(e) => handleMouseDown(e, 9)}
            onMouseMove={(e) => handleMouseMove(e, 9)}
            onMouseUp={() => handleMouseUp(9)}
            onTouchStart={(e) => handleTouchStart(e, 9)}
            onTouchMove={(e) => handleTouchMove(e, 9)}
            onTouchEnd={() => handleTouchEnd(9)}
        ></canvas>
    </td>
</tr>
<tr>
    <td contentEditable="true" className="editable-cell">Ms. Rahul V Anand</td>
    <td contentEditable="true" className="editable-cell">Assistant Professor</td>
    <td>
        <canvas
            className="sign-canvas"
            onMouseDown={(e) => handleMouseDown(e, 10)}
            onMouseMove={(e) => handleMouseMove(e, 10)}
            onMouseUp={() => handleMouseUp(10)}
            onTouchStart={(e) => handleTouchStart(e, 10)}
            onTouchMove={(e) => handleTouchMove(e, 10)}
            onTouchEnd={() => handleTouchEnd(10)}
        ></canvas>
    </td>
</tr>
<tr>
    <td contentEditable="true" className="editable-cell">Mr. Abhishek Gupta</td>
    <td contentEditable="true" className="editable-cell">Assistant Professor</td>
    <td>
        <canvas
            className="sign-canvas"
            onMouseDown={(e) => handleMouseDown(e, 11)}
            onMouseMove={(e) => handleMouseMove(e, 11)}
            onMouseUp={() => handleMouseUp(11)}
            onTouchStart={(e) => handleTouchStart(e, 11)}
            onTouchMove={(e) => handleTouchMove(e, 11)}
            onTouchEnd={() => handleTouchEnd(11)}
        ></canvas>
    </td>
</tr>
                </tbody>
            </table>
        </div>
    );
};

export default Enigma;
