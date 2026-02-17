const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const completionOverlay = document.getElementById('completionOverlay');

// Heart shape coordinates (normalized to canvas size)
const heartPoints = [
    { x: 300, y: 200 }, // Top center
    { x: 250, y: 150 }, // Top left
    { x: 200, y: 180 }, // Left curve
    { x: 180, y: 220 }, // Left middle
    { x: 200, y: 260 }, // Left bottom curve
    { x: 250, y: 300 }, // Left bottom
    { x: 300, y: 350 }, // Bottom center
    { x: 350, y: 300 }, // Right bottom
    { x: 400, y: 260 }, // Right bottom curve
    { x: 420, y: 220 }, // Right middle
    { x: 400, y: 180 }, // Right curve
    { x: 350, y: 150 }, // Top right
];

const dotRadius = 12;
const lineWidth = 4;
const connectionRadius = 25;
let connectedDots = [];
let isDrawing = false;
let currentDotIndex = -1;
let gameComplete = false;

// Colors
const dotColor = '#8B4A6B'; // Pink
const connectedDotColor = '#DB7093'; // Light pink
const lineColor = '#A0826D'; // Earthy brown
const backgroundColor = '#F5F5DC'; // Beige

function initGame() {
    connectedDots = [];
    isDrawing = false;
    currentDotIndex = -1;
    gameComplete = false;
    completionOverlay.classList.remove('show');
    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw lines between connected dots
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < connectedDots.length - 1; i++) {
        const start = heartPoints[connectedDots[i]];
        const end = heartPoints[connectedDots[i + 1]];
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    // Draw dots
    heartPoints.forEach((point, index) => {
        const isConnected = connectedDots.includes(index);
        const isCurrent = index === currentDotIndex;

        // Draw dot
        ctx.beginPath();
        ctx.arc(point.x, point.y, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = isConnected ? connectedDotColor : dotColor;
        ctx.fill();
        
        // Draw dot border
        ctx.strokeStyle = '#5C3A2A';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw dot number
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((index + 1).toString(), point.x, point.y);
    });

    // Draw current connection line (if dragging)
    if (isDrawing && currentDotIndex >= 0) {
        const startPoint = heartPoints[currentDotIndex];
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(canvas.mouseX || startPoint.x, canvas.mouseY || startPoint.y);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function getDotAtPosition(x, y) {
    for (let i = 0; i < heartPoints.length; i++) {
        const point = heartPoints[i];
        const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
        if (distance <= connectionRadius) {
            return i;
        }
    }
    return -1;
}

function checkCompletion() {
    if (connectedDots.length === heartPoints.length) {
        // Check if all dots are connected in order
        let allConnected = true;
        for (let i = 0; i < heartPoints.length; i++) {
            if (!connectedDots.includes(i)) {
                allConnected = false;
                break;
            }
        }

        if (allConnected) {
            gameComplete = true;
            setTimeout(() => {
                completionOverlay.classList.add('show');
            }, 500);
        }
    }
}

canvas.addEventListener('mousedown', (e) => {
    if (gameComplete) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dotIndex = getDotAtPosition(x, y);
    
    if (dotIndex === 0 || (connectedDots.length > 0 && dotIndex === connectedDots[connectedDots.length - 1] + 1)) {
        if (dotIndex === 0 && connectedDots.length === 0) {
            // Start from first dot
            connectedDots.push(0);
            currentDotIndex = 0;
            isDrawing = true;
        } else if (dotIndex === connectedDots[connectedDots.length - 1] + 1) {
            // Connect to next dot
            connectedDots.push(dotIndex);
            currentDotIndex = dotIndex;
            checkCompletion();
        }
        draw();
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing || gameComplete) return;

    const rect = canvas.getBoundingClientRect();
    canvas.mouseX = e.clientX - rect.left;
    canvas.mouseY = e.clientY - rect.top;
    draw();
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    draw();
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
    draw();
});

function restartGame() {
    initGame();
}

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
