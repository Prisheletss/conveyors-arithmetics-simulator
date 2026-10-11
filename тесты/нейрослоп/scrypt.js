// --- КОНСТАНТЫ ---
const SQUARE_SIZE = 50;
const SQUARE_COLOR_DEFAULT = '#000';
const SQUARE_BORDER = '2px solid #f00';

// --- СОСТОЯНИЕ ---
let currentColor = SQUARE_COLOR_DEFAULT;
let squaresList = [];

// Режимы
let mode = 'draw'; // 'draw' или 'select'

// Состояние перетаскивания
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let draggedSquare = null;

// Состояние рамки
let isSelecting = false;
let selectStart = { x: 0, y: 0 };
let tempSelection = [];
let selectionBox = null;

// --- ЭЛЕМЕНТЫ ---
const workspace = document.getElementById('workspace');

// --- ФУНКЦИИ УПРАВЛЕНИЯ РЕЖИМАМИ ---
function setMode(newMode) {
    mode = newMode;

    // Сбрасываем все временные состояния при смене режима
    deselectAllSquares();
    tempSelection = [];
    isDragging = false;
    draggedSquare = null;
    isSelecting = false;
    if (selectionBox) selectionBox.style.display = 'none';

    // Обновляем вид кнопок
    document.querySelectorAll('.control-panel button').forEach(btn => {
        btn.classList.remove('selected-mode');
        btn.disabled = false;
    });

    const activeBtn = document.querySelector(`.control-panel button[data-mode="${mode}"]`);
    if (activeBtn) {
        activeBtn.classList.add('selected-mode');
    }

    // В режиме выделения кнопка рисования недоступна
    const drawBtn = document.querySelector('.control-panel button[data-mode="draw"]');
    if (drawBtn) {
        drawBtn.disabled = (mode === 'select');
    }

    // Меняем курсор тела
    document.body.classList.toggle('cursor-select', mode === 'select');
}

// --- ФУНКЦИИ РАБОТЫ С КВАДРАТАМИ ---
function createSquare(x, y) {
    const square = document.createElement('div');
    square.classList.add('square');
    
    square.style.width = `${SQUARE_SIZE}px`;
    square.style.height = `${SQUARE_SIZE}px`;
    square.style.backgroundColor = currentColor;
    square.style.border = SQUARE_BORDER;

    const offset = SQUARE_SIZE / 2;
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

function selectSquare(squareData, append = false) {
    if (!append) deselectAllSquares();
    squareData.element.classList.add('selected');
    selectedSquares.push(squareData);
}

function deselectAllSquares() {
    selectedSquares.forEach(sq => sq.element.classList.remove('selected'));
    selectedSquares = [];
}

// --- ФУНКЦИИ ВЫДЕЛЕНИЯ ---
function initSelectionBox() {
    selectionBox = document.createElement('div');
    selectionBox.classList.add('selection-box');
    workspace.appendChild(selectionBox);
}

function isRectsOverlap(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

// --- ИНИЦИАЛИЗАЦИЯ ПАНЕЛИ ---
function initControlPanel() {
    const panel = document.createElement('div');
    panel.classList.add('control-panel');

    const colors = [
        { hex: '#ff0000', label: 'Красный' },
        { hex: '#00ff00', label: 'Зелёный' },
        { hex: '#0000ff', label: 'Синий' }
    ];

    colors.forEach(item => {
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
            border: none;
        `;
        btn.addEventListener('click', () => setCurrentColor(item.hex));
        panel.appendChild(btn);
    });

    // Кнопка "Рисовать"
    const drawBtn = document.createElement('button');
    drawBtn.textContent = 'Рисовать';
    drawBtn.dataset.mode = 'draw';
    drawBtn.classList.add('selected-mode');
    drawBtn.addEventListener('click', () => setMode('draw'));
    panel.appendChild(drawBtn);

    // Кнопка "Курсор"
    const selectBtn = document.createElement('button');
    selectBtn.textContent = 'Курсор';
    selectBtn.dataset.mode = 'select';
    selectBtn.addEventListener('click', () => setMode('select'));
    panel.appendChild(selectBtn);

    document.body.append(panel);
    initSelectionBox();
}

// --- ГЛОБАЛЬНЫЙ МАССИВ ВЫДЕЛЕНИЯ (для удаления) ---
let selectedSquares = [];

// --- ОБРАБОТЧИКИ СОБЫТИЙ ---
document.addEventListener('mousedown', function(event) {
    if (event.button !== 0) return;

    // ВАЖНО: Игнорируем клики по кнопкам панели и самой рамке
    if (event.target.closest('.control-panel') || event.target === selectionBox) {
        return;
    }

    if (mode === 'draw' && workspace.contains(event.target)) {
        deselectAllSquares();
        createSquare(event.clientX, event.clientY);
        return; // Прерываем, чтобы не сработала логика выделения
    }

    if (mode === 'select' && workspace.contains(event.target)) {
        const clickedSquare = squaresList.find(sq => sq.element === event.target);

        if (clickedSquare) {
            const append = event.shiftKey;
            if (!append && !clickedSquare.element.classList.contains('selected')) {
                deselectAllSquares();
            }
            selectSquare(clickedSquare, append);

            isDragging = true;
            draggedSquare = clickedSquare;
            const refRect = clickedSquare.element.getBoundingClientRect();
            dragOffset.x = event.clientX - refRect.left;
            dragOffset.y = event.clientY - refRect.top;
        } else {
            // Клик по пустому месту — начало рамки
            isSelecting = true;
            selectStart = { x: event.clientX, y: event.clientY };
            tempSelection = [];
            deselectAllSquares();
        }
    }
});

document.addEventListener('mousemove', function(event) {
    if (mode === 'draw') {
        document.body.style.cursor = workspace.contains(event.target) ? 'crosshair' : 'default';
    }

    if (mode === 'select') {
        if (isDragging && draggedSquare) {
            const rect = workspace.getBoundingClientRect();
            const offset = SQUARE_SIZE / 2;

            const draggedRect = draggedSquare.element.getBoundingClientRect();
            const targetX = event.clientX - dragOffset.x;
            const targetY = event.clientY - dragOffset.y;

            const deltaX = targetX - draggedRect.left;
            const deltaY = targetY - draggedRect.top;

            selectedSquares.forEach(sq => {
                const sqRect = sq.element.getBoundingClientRect();
                const newX = sqRect.left + deltaX - rect.left;
                const newY = sqRect.top + deltaY - rect.top;

                sq.element.style.left = `${Math.max(-offset, Math.min(newX, rect.width - SQUARE_SIZE + offset))}px`;
                sq.element.style.top = `${Math.max(-offset, Math.min(newY, rect.height - SQUARE_SIZE + offset))}px`;
                sq.x = parseFloat(sq.element.style.left);
                sq.y = parseFloat(sq.element.style.top);
            });
        }

        if (isSelecting) {
            const rect = workspace.getBoundingClientRect();
            const startX = selectStart.x - rect.left;
            const startY = selectStart.y - rect.top;
            const currentX = event.clientX - rect.left;
            const currentY = event.clientY - rect.top;

            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            
            selectionBox.style.left = `${Math.min(startX, currentX)}px`;
            selectionBox.style.top = `${Math.min(startY, currentY)}px`;
            selectionBox.style.width = `${width}px`;
            selectionBox.style.height = `${height}px`;
            selectionBox.style.display = 'block';

            const selectionRect = selectionBox.getBoundingClientRect();
            
            // Визуальное выделение внутри рамки
            squaresList.forEach(squareData => {
                const sqRect = squareData.element.getBoundingClientRect();
                if (isRectsOverlap(sqRect, selectionRect)) {
                    if (!tempSelection.includes(squareData)) {
                        squareData.element.classList.add('selected');
                        tempSelection.push(squareData);
                    }
                } else {
                    if (tempSelection.includes(squareData)) {
                        squareData.element.classList.remove('selected');
                        const index = tempSelection.indexOf(squareData);
                        tempSelection.splice(index, 1);
                    }
                }
            });
        }
    }
});

document.addEventListener('mouseup', function() {
    if (isDragging) {
        isDragging = false;
        draggedSquare = null;
    }
    
    if (isSelecting) {
        isSelecting = false;
        selectedSquares = tempSelection;
        tempSelection = [];
        selectionBox.style.display = 'none';
    }
});

document.addEventListener('keydown', function(event) {
    if ((event.key === 'Delete' || event.key === 'Backspace') && mode === 'select') {
        if (selectedSquares.length > 0) {
            selectedSquares.forEach(sq => {
                sq.element.remove();
                const index = squaresList.findIndex(s => s.id === sq.id);
                if (index !== -1) {
                    squaresList.splice(index, 1);
                }
            });
            selectedSquares = [];
        }
    }
});

// --- ЗАПУСК ---
initControlPanel();