const socket = io();
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let lastPos = { x: 0, y: 0 };

const colorPicker = document.getElementById('colorPicker');
const sizePicker = document.getElementById('sizePicker');

function draw(start, end, color, size, isBroadcasting = false) {
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    if (!isBroadcasting) {
        socket.emit('draw-data', { start, end, color, size });
    }
}

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    lastPos = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('mouseup', () => drawing = false);

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const currentPos = { x: e.clientX, y: e.clientY };
    draw(lastPos, currentPos, colorPicker.value, sizePicker.value);
    lastPos = currentPos;
});

socket.on('draw-data', (data) => {
    draw(data.start, data.end, data.color, data.size, true);
});

socket.on('init-history', (history) => {
    history.forEach(data => draw(data.start, data.end, data.color, data.size, true));
});

socket.on('clear-and-redraw', (history) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    history.forEach(data => draw(data.start, data.end, data.color, data.size, true));
});

document.getElementById('undoBtn').onclick = () => socket.emit('undo');