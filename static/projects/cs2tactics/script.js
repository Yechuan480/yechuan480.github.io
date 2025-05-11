/**
 * CS2战术推演工具
 * 用于创建和编辑CS2游戏战术图
 */

// DOM元素
const elements = {
  canvas: document.getElementById('mapCanvas'),
  cttMode: document.getElementById('cttMode'),
  propsMode: document.getElementById('propsMode'),
  freeDrawMode: document.getElementById('freeDrawMode'),
  clearCanvasButton: document.getElementById('clearCanvas'),
  saveImageButton: document.getElementById('saveImage'),
  mapSelect: document.getElementById('mapSelect')
};

const canvas = elements.canvas;
const ctx = canvas.getContext('2d');

// 应用状态
const state = {
  currentMode: 'CT/T',
  currentSubMode: 'CT',
  currentMap: 'dust2.png',
  currentMapImage: null,
  points: [],
  arrows: [],
  ellipses: [],
  paths: [],
  dragging: null, // {type, index, offsetX, offsetY}
  drawing: false,
  startX: 0,
  startY: 0,
  hovered: null // 鼠标悬停的对象 {type, index}
};

/**
 * 加载地图图像
 * @param {string} mapSrc - 地图图像的文件名
 */
function loadMap(mapSrc) {
    const mapImage = new Image();
    mapImage.src = mapSrc;
    mapImage.onload = () => {
        canvas.width = mapImage.width;
        canvas.height = mapImage.height;

        state.currentMapImage = mapImage;
        redrawCanvas();
    };
    mapImage.onerror = () => {
        canvas.width = 800;
        canvas.height = 600;
        ctx.fillStyle = '#555';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        console.error('无法加载地图图像:', mapSrc);
    };
}

/**
 * 重绘Canvas上的所有元素
 */
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (state.currentMapImage) {
        ctx.drawImage(state.currentMapImage, 0, 0, canvas.width, canvas.height);
    }

    // 绘制所有点标记
    state.points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.type === 'Smoke' ? 20 : 10, 0, 2 * Math.PI);
        ctx.fillStyle = point.type === 'CT' ? 'blue' : (point.type === 'T' ? 'red' : 'yellow');
        ctx.fill();

        if (state.hovered && state.hovered.type === 'point' && state.hovered.index === index) {
            drawPointBoundingBox(point);
        }
    });

    // 绘制所有箭头
    state.arrows.forEach((arrow, index) => {
        ctx.beginPath();
        ctx.moveTo(arrow.startX, arrow.startY);
        ctx.lineTo(arrow.endX, arrow.endY);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.stroke();
        drawArrowHead(arrow.startX, arrow.startY, arrow.endX, arrow.endY);

        if (state.hovered && state.hovered.type === 'arrow' && state.hovered.index === index) {
            drawArrowBoundingBox(arrow);
        }
    });

    // 绘制所有椭圆
    state.ellipses.forEach((ellipse, index) => {
        ctx.beginPath();
        ctx.ellipse(ellipse.x, ellipse.y, ellipse.width / 2, ellipse.height / 2, 0, 0, 2 * Math.PI);
        ctx.strokeStyle = 'purple';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (state.hovered && state.hovered.type === 'ellipse' && state.hovered.index === index) {
            drawEllipseBoundingBox(ellipse);
        }
    });

    // 绘制所有自由路径
    state.paths.forEach(path => {
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

/**
 * 绘制点的外框和删除按钮
 * @param {Object} point - 点对象
 */
function drawPointBoundingBox(point) {
    const padding = point.type === 'Smoke' ? 25 : 15;
    const minX = point.x - padding;
    const maxX = point.x + padding;
    const minY = point.y - padding;
    const maxY = point.y + padding;

    // 绘制边框
    ctx.beginPath();
    ctx.roundRect(minX, minY, maxX - minX, maxY - minY, 5);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制删除按钮
    ctx.fillStyle = 'red';
    ctx.roundRect(maxX - 10, minY, 10, 10, 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.fillText('X', maxX - 7, minY + 8);
}

/**
 * 绘制箭头外框和删除按钮
 * @param {Object} arrow - 箭头对象
 */
function drawArrowBoundingBox(arrow) {
    const padding = 20;
    const minX = Math.min(arrow.startX, arrow.endX) - padding;
    const maxX = Math.max(arrow.startX, arrow.endX) + padding;
    const minY = Math.min(arrow.startY, arrow.endY) - padding;
    const maxY = Math.max(arrow.startY, arrow.endY) + padding;

    // 绘制边框
    ctx.beginPath();
    ctx.roundRect(minX, minY, maxX - minX, maxY - minY, 5);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制删除按钮
    ctx.fillStyle = 'red';
    ctx.roundRect(maxX - 10, minY, 10, 10, 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.fillText('X', maxX - 7, minY + 8);
}

/**
 * 绘制椭圆外框和删除按钮
 * @param {Object} ellipse - 椭圆对象
 */
function drawEllipseBoundingBox(ellipse) {
    const padding = 20;
    const minX = ellipse.x - ellipse.width / 2 - padding;
    const maxX = ellipse.x + ellipse.width / 2 + padding;
    const minY = ellipse.y - ellipse.height / 2 - padding;
    const maxY = ellipse.y + ellipse.height / 2 + padding;

    // 绘制边框
    ctx.beginPath();
    ctx.roundRect(minX, minY, maxX - minX, maxY - minY, 5);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制删除按钮
    ctx.fillStyle = 'red';
    ctx.roundRect(maxX - 10, minY, 10, 10, 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.fillText('X', maxX - 7, minY + 8);
}

/**
 * 绘制箭头头部
 * @param {number} startX - 起点X坐标
 * @param {number} startY - 起点Y坐标
 * @param {number} endX - 终点X坐标
 * @param {number} endY - 终点Y坐标
 */
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

// 地图切换
elements.mapSelect.addEventListener('change', () => {
    state.currentMap = elements.mapSelect.value;
    state.points = [];
    state.arrows = [];
    state.ellipses = [];
    state.paths = [];
    loadMap(state.currentMap);
});

// 模式切换
elements.cttMode.addEventListener('change', () => {
    state.currentMode = 'CT/T';
    state.currentSubMode = elements.cttMode.value;
});

elements.propsMode.addEventListener('change', () => {
    state.currentMode = 'Props';
    state.currentSubMode = elements.propsMode.value;
});

elements.freeDrawMode.addEventListener('change', () => {
    state.currentMode = 'FreeDraw';
    state.currentSubMode = elements.freeDrawMode.value;
});

// 鼠标事件
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (state.hovered && checkDeleteButton(x, y, state.hovered)) {
        if (state.hovered.type === 'point') {
            state.points.splice(state.hovered.index, 1);
        } else if (state.hovered.type === 'arrow') {
            state.arrows.splice(state.hovered.index, 1);
        } else if (state.hovered.type === 'ellipse') {
            state.ellipses.splice(state.hovered.index, 1);
        }
        state.hovered = null;
        redrawCanvas();
        return;
    }

    if (state.currentMode === 'CT/T' || state.currentSubMode === 'Smoke') {
        let clicked = false;
        state.points.forEach((point, index) => {
            const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
            if (distance < (point.type === 'Smoke' ? 20 : 10)) {
                state.dragging = { type: 'point', index, offsetX: x - point.x, offsetY: y - point.y };
                clicked = true;
            }
        });
        if (!clicked) {
            state.points.push({ x, y, type: state.currentSubMode });
            redrawCanvas();
        }
    } else if (state.currentSubMode === 'Arrow') {
        state.arrows.forEach((arrow, index) => {
            if (isNearLine(x, y, arrow.startX, arrow.startY, arrow.endX, arrow.endY, 5)) {
                const midX = (arrow.startX + arrow.endX) / 2;
                const midY = (arrow.startY + arrow.endY) / 2;
                state.dragging = { type: 'arrow', index, offsetX: x - midX, offsetY: y - midY };
            }
        });
        if (!state.dragging) {
            state.startX = x;
            state.startY = y;
            state.drawing = true;
        }
    } else if (state.currentSubMode === 'Ellipse') {
        state.ellipses.forEach((ellipse, index) => {
            const dx = (x - ellipse.x) / (ellipse.width / 2);
            const dy = (y - ellipse.y) / (ellipse.height / 2);
            if (dx * dx + dy * dy < 1.2) {
                state.dragging = { type: 'ellipse', index, offsetX: x - ellipse.x, offsetY: y - ellipse.y };
            }
        });
        if (!state.dragging) {
            state.startX = x;
            state.startY = y;
            state.drawing = true;
        }
    } else if (state.currentSubMode === 'Pen') {
        state.paths.push([{ x, y }]);
        state.drawing = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检测悬停
    state.hovered = null;
    state.points.forEach((point, index) => {
        const padding = point.type === 'Smoke' ? 25 : 15;
        const minX = point.x - padding;
        const maxX = point.x + padding;
        const minY = point.y - padding;
        const maxY = point.y + padding;
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            state.hovered = { type: 'point', index };
        }
    });
    if (!state.hovered) {
        state.arrows.forEach((arrow, index) => {
            const padding = 20;
            const minX = Math.min(arrow.startX, arrow.endX) - padding;
            const maxX = Math.max(arrow.startX, arrow.endX) + padding;
            const minY = Math.min(arrow.startY, arrow.endY) - padding;
            const maxY = Math.max(arrow.startY, arrow.endY) + padding;
            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                state.hovered = { type: 'arrow', index };
            }
        });
    }
    if (!state.hovered) {
        state.ellipses.forEach((ellipse, index) => {
            const padding = 20;
            const minX = ellipse.x - ellipse.width / 2 - padding;
            const maxX = ellipse.x + ellipse.width / 2 + padding;
            const minY = ellipse.y - ellipse.height / 2 - padding;
            const maxY = ellipse.y + ellipse.height / 2 + padding;
            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                state.hovered = { type: 'ellipse', index };
            }
        });
    }

    if (state.dragging) {
        if (state.dragging.type === 'point') {
            state.points[state.dragging.index].x = x - state.dragging.offsetX;
            state.points[state.dragging.index].y = y - state.dragging.offsetY;
        } else if (state.dragging.type === 'arrow') {
            const midX = (state.arrows[state.dragging.index].startX + state.arrows[state.dragging.index].endX) / 2;
            const midY = (state.arrows[state.dragging.index].startY + state.arrows[state.dragging.index].endY) / 2;
            const dx = x - midX - state.dragging.offsetX;
            const dy = y - midY - state.dragging.offsetY;
            state.arrows[state.dragging.index].startX += dx;
            state.arrows[state.dragging.index].startY += dy;
            state.arrows[state.dragging.index].endX += dx;
            state.arrows[state.dragging.index].endY += dy;
        } else if (state.dragging.type === 'ellipse') {
            state.ellipses[state.dragging.index].x = x - state.dragging.offsetX;
            state.ellipses[state.dragging.index].y = y - state.dragging.offsetY;
        }
        redrawCanvas();
    } else if (state.drawing) {
        if (state.currentSubMode === 'Arrow') {
            redrawCanvas();
            ctx.beginPath();
            ctx.moveTo(state.startX, state.startY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 2;
            ctx.stroke();
            drawArrowHead(state.startX, state.startY, x, y);
        } else if (state.currentSubMode === 'Ellipse') {
            let width = Math.abs(x - state.startX) * 2;
            let height = Math.abs(y - state.startY) * 2;
            if (e.shiftKey) height = width;
            redrawCanvas();
            ctx.beginPath();
            ctx.ellipse(state.startX, state.startY, width / 2, height / 2, 0, 0, 2 * Math.PI);
            ctx.strokeStyle = 'purple';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (state.currentSubMode === 'Pen') {
            state.paths[state.paths.length - 1].push({ x, y });
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

    if (state.drawing) {
        if (state.currentSubMode === 'Arrow') {
            state.arrows.push({ startX: state.startX, startY: state.startY, endX: x, endY: y });
        } else if (state.currentSubMode === 'Ellipse') {
            let width = Math.abs(x - state.startX) * 2;
            let height = Math.abs(y - state.startY) * 2;
            if (e.shiftKey) height = width;
            state.ellipses.push({ x: state.startX, y: state.startY, width, height });
        }
        state.drawing = false;
        redrawCanvas();
    }
    state.dragging = null;
});

/**
 * 检查是否点击删除按钮
 * @param {number} x - 鼠标X坐标
 * @param {number} y - 鼠标Y坐标
 * @param {Object} hovered - 当前悬停的对象
 * @returns {boolean} 是否点击了删除按钮
 */
function checkDeleteButton(x, y, hovered) {
    if (hovered.type === 'point') {
        const point = state.points[hovered.index];
        const padding = point.type === 'Smoke' ? 25 : 15;
        const maxX = point.x + padding;
        const minY = point.y - padding;
        return x >= maxX - 10 && x <= maxX && y >= minY && y <= minY + 10;
    } else if (hovered.type === 'arrow') {
        const arrow = state.arrows[hovered.index];
        const maxX = Math.max(arrow.startX, arrow.endX) + 20;
        const minY = Math.min(arrow.startY, arrow.endY) - 20;
        return x >= maxX - 10 && x <= maxX && y >= minY && y <= minY + 10;
    } else if (hovered.type === 'ellipse') {
        const ellipse = state.ellipses[hovered.index];
        const maxX = ellipse.x + ellipse.width / 2 + 20;
        const minY = ellipse.y - ellipse.height / 2 - 20;
        return x >= maxX - 10 && x <= maxX && y >= minY && y <= minY + 10;
    }
    return false;
}

/**
 * 判断点是否靠近线段
 * @param {number} px - 点的X坐标
 * @param {number} py - 点的Y坐标
 * @param {number} x1 - 线段起点X坐标
 * @param {number} y1 - 线段起点Y坐标
 * @param {number} x2 - 线段终点X坐标
 * @param {number} y2 - 线段终点Y坐标
 * @param {number} threshold - 判定阈值
 * @returns {boolean} 点是否靠近线段
 */
function isNearLine(px, py, x1, y1, x2, y2, threshold) {
    // 计算点到线段的距离
    const d = Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
    
    // 检查点是否在线段的矩形范围内
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    
    return d < threshold && px >= minX && px <= maxX && py >= minY && py <= maxY;
}

// 清除标记
elements.clearCanvasButton.addEventListener('click', () => {
    state.points = [];
    state.arrows = [];
    state.ellipses = [];
    state.paths = [];
    redrawCanvas();
});

// 保存图片
elements.saveImageButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'cs2_tactic_' + new Date().toISOString().slice(0,10) + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// 初始化应用
loadMap(state.currentMap);