// Connect to the WebSocket server
const ws = new WebSocket('ws://localhost:3000');

const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');

let drawing = false;
let lastX = 0;
let lastY = 0;

// When the server sends drawing data from another user, draw it
ws.onmessage = async (event) => {
    // If the message is a Blob, convert it to text first
    const data = typeof event.data === 'string' ? event.data : await event.data.text();
    const { x0, y0, x1, y1 } = JSON.parse(data);
    drawOnCanvas(x0, y0, x1, y1, false); // false means we didn't initiate this draw
};

function drawOnCanvas(x0, y0, x1, y1, sendToServer) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();

    // Knowing you are connected (open):
    // If I initiated the drawing, send coordinates to the server
    if (sendToServer && ws.readyState === WebSocket.OPEN) {
        const messagePayload = JSON.stringify({ x0, y0, x1, y1 });
        // Speaking into the phone (sendMessage function):
        ws.send(messagePayload);
    }
}

// Event Listeners for mouse actions
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const currentX = e.offsetX;
    const currentY = e.offsetY;
    
    // Draw locally and broadcast to server
    drawOnCanvas(lastX, lastY, currentX, currentY, true);
    
    lastX = currentX;
    lastY = currentY;
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);
