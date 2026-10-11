// Константы и состояние
const SQUARE_SIZE = 50;
const SQUARE_COLOR_DEFAULT = '#000';
const SQUARE_BORDER = '2px solid #f00';

let currentColor = SQUARE_COLOR_DEFAULT;
let squaresList = [];

// Находим рабочую зону один раз при старте
const workspace = document.getElementById('workspace');

function createSquare(x, y) {
    const square = document.createElement('div');
    square.classList.add('square');
    
    square.style.width = `${SQUARE_SIZE}px`;
    square.style.height = `${SQUARE_SIZE}px`;
    square.style.backgroundColor = currentColor;
    square.style.border = SQUARE_BORDER;

    const offset = SQUARE_SIZE / 2;
    
    // Координаты теперь относительны рабочей зоны
    const rect = workspace.getBoundingClientRect();
    const safeX = Math.max(rect.left, Math.min(x, rect.right));
    const safeY = Math.max(rect.top, Math.min(y, rect.bottom));

    square.style.left = `${safeX - rect.left - offset}px`;
    square.style.top = `${safeY - rect.top - offset}px`;

    workspace.appendChild(square);

    squaresList.push({
        element: square,
        id: Date.now() + Math.random(),
        x: safeX - rect.left - offset,
        y: safeY - rect.top - offset,
        size: SQUARE_SIZE,
        color: currentColor,
        createdAt: new Date().toISOString()
    });
}

function setCurrentColor(color) {
    currentColor = color;
}

function initControlPanel() {
    const panel = document.createElement('div');
    panel.classList.add('control-panel');

    [
        { hex: '#ff0000', label: 'Красный' },
        { hex: '#00ff00', label: 'Зелёный' },
        { hex: '#0000ff', label: 'Синий' }
    ].forEach(item => {
        const btn = document.createElement('button');
        btn.textContent = item.label;
        btn.style.cssText = `
            width: 80px;
            height: 40px;
            border-radius: 6px;
            background-color: ${item.hex};
            cursor: pointer;
            font-weight: bold;
            color: white;
            transition: transform 0.1s ease-in-out;
            border: none;
        `;
        
        btn.onmousedown = () => btn.style.transform = 'scale(0.97)';
        btn.onmouseup = () => btn.style.transform = '';
        btn.addEventListener('click', () => setCurrentColor(item.hex));

        panel.appendChild(btn);
    });

    document.body.append(panel);
}

// Обработчик кликов теперь висит на всем документе, 
// но срабатывает только для рабочей зоны
document.addEventListener('click', function(event) {
    // Проверяем, что клик был именно внутри #workspace
    if (workspace.contains(event.target)) {
        const rect = workspace.getBoundingClientRect();
        createSquare(event.clientX, event.clientY);
    }
});

// Динамическая смена курсора (на случай, если CSS не справится)
document.addEventListener('mousemove', function(event) {
    if (workspace.contains(event.target)) {
        document.body.style.cursor = 'crosshair';
    } else {
        document.body.style.cursor = 'default';
    }
});

// Инициализация
initControlPanel();