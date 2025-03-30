// 获取元素
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const cttMode = document.getElementById('cttMode');
const propsMode = document.getElementById('propsMode');
const freeDrawMode = document.getElementById('freeDrawMode');
const clearCanvasButton = document.getElementById('clearCanvas');
const saveImageButton = document.getElementById('saveImage');
const mapSelect = document.getElementById('mapSelect');

// 当前状态
let currentMode = 'CT/T';
let currentSubMode = 'CT';
let currentMap = 'dust2.png';
let currentMapImage = null;
let points = [];
let arrows = [];
let ellipses = [];
let paths = [];
let dragging = null; // {type, index, offsetX, offsetY}
let drawing = false;
let startX, startY;
let hovered = null; // 鼠标悬停的对象 {type, index}

// 加载地图，使用原始尺寸
function loadMap(mapSrc) {
    const mapImage = new Image();
    mapImage.src = mapSrc;
    mapImage.onload = () => {
        canvas.width = mapImage.width;
        canvas.height = mapImage.height;

        currentMapImage = mapImage;
        redrawCanvas();
    };
    mapImage.onerror = () => {
        canvas.width = 800;
        canvas.height = 600;
        ctx.fillStyle = '#555';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
}

// 重绘Canvas
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (currentMapImage) {
        ctx.drawImage(currentMapImage, 0, 0, canvas.width, canvas.height);
    }

    points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.type === 'Smoke' ? 20 : 10, 0, 2 * Math.PI);
        ctx.fillStyle = point.type === 'CT' ? 'blue' : (point.type === 'T' ? 'red' : 'yellow');
        ctx.fill();

        if (hovered && hovered.type === 'point' && hovered.index === index) {
            drawPointBoundingBox(point);
        }
    });

    arrows.forEach((arrow, index) => {
        ctx.beginPath();
        ctx.moveTo(arrow.startX, arrow.startY);
        ctx.lineTo(arrow.endX, arrow.endY);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.stroke();
        drawArrowHead(arrow.startX, arrow.startY, arrow.endX, arrow.endY);

        if (hovered && hovered.type === 'arrow' && hovered.index === index) {
            drawArrowBoundingBox(arrow);
        }
    });

    ellipses.forEach((ellipse, index) => {
        ctx.beginPath();
        ctx.ellipse(ellipse.x, ellipse.y, ellipse.width / 2, ellipse.height / 2, 0, 0, 2 * Math.PI);
        ctx.strokeStyle = 'purple';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (hovered && hovered.type === 'ellipse' && hovered.index === index) {
            drawEllipseBoundingBox(ellipse);
        }
    });

    paths.forEach(path => {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

// 绘制点的外框和删除按钮
function drawPointBoundingBox(point) {
    const padding = point.type === 'Smoke' ? 25 : 15;
    const minX = point.x - padding;
    const maxX = point.x + padding;
    const minY = point.y - padding;
    const maxY = point.y + padding;

    ctx.beginPath();
    ctx.roundRect(minX, minY, maxX - minX, maxY - minY, 5);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'red';
    ctx.roundRect(maxX - 10, minY, 10, 10, 2); // 缩小删除按钮
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial'; // 调整字体大小
    ctx.fillText('X', maxX - 7, minY + 8);
}

// 绘制箭头外框和删除按钮
function drawArrowBoundingBox(arrow) {
    const padding = 20;
    const minX = Math.min(arrow.startX, arrow.endX) - padding;
    const maxX = Math.max(arrow.startX, arrow.endX) + padding;
    const minY = Math.min(arrow.startY, arrow.endY) - padding;
    const maxY = Math.max(arrow.startY, arrow.endY) + padding;

    ctx.beginPath();
    ctx.roundRect(minX, minY, maxX - minX, maxY - minY, 5);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'red';
    ctx.roundRect(maxX - 10, minY, 10, 10, 2); // 缩小删除按钮
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.fillText('X', maxX - 7, minY + 8);
}

// 绘制椭圆外框和删除按钮
function drawEllipseBoundingBox(ellipse) {
    const padding = 20;
    const minX = ellipse.x - ellipse.width / 2 - padding;
    const maxX = ellipse.x + ellipse.width / 2 + padding;
    const minY = ellipse.y - ellipse.height / 2 - padding;
    const maxY = ellipse.y + ellipse.height / 2 + padding;

    ctx.beginPath();
    ctx.roundRect(minX, minY, maxX - minX, maxY - minY, 5);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'red';
    ctx.roundRect(maxX - 10, minY, 10, 10, 2); // 缩小删除按钮
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.fillText('X', maxX - 7, minY + 8);
}

// 绘制箭头头部
function drawArrowHead(startX, startY, endX, endY) {
    const angle = Math.atan2(endY - startY, endX - startX);
    const headLength = 10;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// 初始化
loadMap(currentMap);

// 地图切换
mapSelect.addEventListener('change', () => {
    currentMap = mapSelect.value;
    points = [];
    arrows = [];
    ellipses = [];
    paths = [];
    loadMap(currentMap);
});

// 模式切换
cttMode.addEventListener('change', () => {
    currentMode = 'CT/T';
    currentSubMode = cttMode.value;
});

propsMode.addEventListener('change', () => {
    currentMode = 'Props';
    currentSubMode = propsMode.value;
});

freeDrawMode.addEventListener('change', () => {
    currentMode = 'FreeDraw';
    currentSubMode = freeDrawMode.value;
});

// 鼠标事件
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (hovered && checkDeleteButton(x, y, hovered)) {
        if (hovered.type === 'point') {
            points.splice(hovered.index, 1);
        } else if (hovered.type === 'arrow') {
            arrows.splice(hovered.index, 1);
        } else if (hovered.type === 'ellipse') {
            ellipses.splice(hovered.index, 1);
        }
        hovered = null;
        redrawCanvas();
        return;
    }

    if (currentMode === 'CT/T' || currentSubMode === 'Smoke') {
        let clicked = false;
        points.forEach((point, index) => {
            const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
            if (distance < (point.type === 'Smoke' ? 20 : 10)) {
                dragging = { type: 'point', index, offsetX: x - point.x, offsetY: y - point.y };
                clicked = true;
            }
        });
        if (!clicked) {
            points.push({ x, y, type: currentSubMode });
            redrawCanvas();
        }
    } else if (currentSubMode === 'Arrow') {
        arrows.forEach((arrow, index) => {
            if (isNearLine(x, y, arrow.startX, arrow.startY, arrow.endX, arrow.endY, 5)) {
                const midX = (arrow.startX + arrow.endX) / 2;
                const midY = (arrow.startY + arrow.endY) / 2;
                dragging = { type: 'arrow', index, offsetX: x - midX, offsetY: y - midY };
            }
        });
        if (!dragging) {
            startX = x;
            startY = y;
            drawing = true;
        }
    } else if (currentSubMode === 'Ellipse') {
        ellipses.forEach((ellipse, index) => {
            const dx = (x - ellipse.x) / (ellipse.width / 2);
            const dy = (y - ellipse.y) / (ellipse.height / 2);
            if (dx * dx + dy * dy < 1.2) {
                dragging = { type: 'ellipse', index, offsetX: x - ellipse.x, offsetY: y - ellipse.y };
            }
        });
        if (!dragging) {
            startX = x;
            startY = y;
            drawing = true;
        }
    } else if (currentSubMode === 'Pen') {
        paths.push([{ x, y }]);
        drawing = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检测悬停
    hovered = null;
    points.forEach((point, index) => {
        const padding = point.type === 'Smoke' ? 25 : 15;
        const minX = point.x - padding;
        const maxX = point.x + padding;
        const minY = point.y - padding;
        const maxY = point.y + padding;
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            hovered = { type: 'point', index };
        }
    });
    if (!hovered) {
        arrows.forEach((arrow, index) => {
            const padding = 20;
            const minX = Math.min(arrow.startX, arrow.endX) - padding;
            const maxX = Math.max(arrow.startX, arrow.endX) + padding;
            const minY = Math.min(arrow.startY, arrow.endY) - padding;
            const maxY = Math.max(arrow.startY, arrow.endY) + padding;
            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                hovered = { type: 'arrow', index };
            }
        });
    }
    if (!hovered) {
        ellipses.forEach((ellipse, index) => {
            const padding = 20;
            const minX = ellipse.x - ellipse.width / 2 - padding;
            const maxX = ellipse.x + ellipse.width / 2 + padding;
            const minY = ellipse.y - ellipse.height / 2 - padding;
            const maxY = ellipse.y + ellipse.height / 2 + padding;
            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                hovered = { type: 'ellipse', index };
            }
        });
    }

    if (dragging) {
        if (dragging.type === 'point') {
            points[dragging.index].x = x - dragging.offsetX;
            points[dragging.index].y = y - dragging.offsetY;
        } else if (dragging.type === 'arrow') {
            const midX = (arrows[dragging.index].startX + arrows[dragging.index].endX) / 2;
            const midY = (arrows[dragging.index].startY + arrows[dragging.index].endY) / 2;
            const dx = x - midX - dragging.offsetX;
            const dy = y - midY - dragging.offsetY;
            arrows[dragging.index].startX += dx;
            arrows[dragging.index].startY += dy;
            arrows[dragging.index].endX += dx;
            arrows[dragging.index].endY += dy;
        } else if (dragging.type === 'ellipse') {
            ellipses[dragging.index].x = x - dragging.offsetX;
            ellipses[dragging.index].y = y - dragging.offsetY;
        }
        redrawCanvas();
    } else if (drawing) {
        if (currentSubMode === 'Arrow') {
            redrawCanvas();
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 2;
            ctx.stroke();
            drawArrowHead(startX, startY, x, y);
        } else if (currentSubMode === 'Ellipse') {
            let width = Math.abs(x - startX) * 2;
            let height = Math.abs(y - startY) * 2;
            if (e.shiftKey) height = width;
            redrawCanvas();
            ctx.beginPath();
            ctx.ellipse(startX, startY, width / 2, height / 2, 0, 0, 2 * Math.PI);
            ctx.strokeStyle = 'purple';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (currentSubMode === 'Pen') {
            paths[paths.length - 1].push({ x, y });
            redrawCanvas();
        }
    } else {
        redrawCanvas();
    }
});

canvas.addEventListener('mouseup', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawing) {
        if (currentSubMode === 'Arrow') {
            arrows.push({ startX, startY, endX: x, endY: y });
        } else if (currentSubMode === 'Ellipse') {
            let width = Math.abs(x - startX) * 2;
            let height = Math.abs(y - startY) * 2;
            if (e.shiftKey) height = width;
            ellipses.push({ x: startX, y: startY, width, height });
        }
        drawing = false;
        redrawCanvas();
    }
    dragging = null;
});

// 检查是否点击删除按钮
function checkDeleteButton(x, y, hovered) {
    if (hovered.type === 'point') {
        const point = points[hovered.index];
        const padding = point.type === 'Smoke' ? 25 : 15;
        const maxX = point.x + padding;
        const minY = point.y - padding;
        return x >= maxX - 10 && x <= maxX && y >= minY && y <= minY + 10; // 调整检测范围
    } else if (hovered.type === 'arrow') {
        const arrow = arrows[hovered.index];
        const maxX = Math.max(arrow.startX, arrow.endX) + 20;
        const minY = Math.min(arrow.startY, arrow.endY) - 20;
        return x >= maxX - 10 && x <= maxX && y >= minY && y <= minY + 10;
    } else if (hovered.type === 'ellipse') {
        const ellipse = ellipses[hovered.index];
        const maxX = ellipse.x + ellipse.width / 2 + 20;
        const minY = ellipse.y - ellipse.height / 2 - 20;
        return x >= maxX - 10 && x <= maxX && y >= minY && y <= minY + 10;
    }
    return false;
}

// 判断点是否靠近线段
function isNearLine(px, py, x1, y1, x2, y2, threshold) {
    const d = Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return d < threshold && px >= minX && px <= maxX && py >= minY && py <= maxY;
}

// 清除标记
clearCanvasButton.addEventListener('click', () => {
    points = [];
    arrows = [];
    ellipses = [];
    paths = [];
    redrawCanvas();
});

// 保存图片
saveImageButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'cs2_tactic.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});