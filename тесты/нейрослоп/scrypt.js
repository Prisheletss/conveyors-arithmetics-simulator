// ===== ===== ===== ===== ===== глобальные переменные

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
let dragStartMouse = { x: 0, y: 0 };
let dragStartSquarePos = { x: 0, y: 0 };
let draggedSquare = null;

// Состояние рамки
let isSelecting = false;
let selectStart = { x: 0, y: 0 };
let tempSelection = [];
let selectionBox = null;

// --- ЭЛЕМЕНТЫ ---
const workspace = document.getElementById('workspace');

// Массив выделенных объектов (исправлено: теперь это глобальная переменная)
let selectedSquares = [];






// ===== ===== ===== ===== ===== ФУНКЦИИ ===== ===== ===== ===== =====






// --- КНОПКИ ---



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
}



// --- ФУНКЦИИ РАБОТЫ С КВАДРАТАМИ ---



function createSquare(x, y) {
    const square = document.createElement('div');
    square.classList.add('square');
    
    square.style.width = `${SQUARE_SIZE}px`;
    square.style.height = `${SQUARE_SIZE}px`;
    square.style.backgroundColor = currentColor;
    square.style.border = SQUARE_BORDER;
    square.style.position = 'absolute';

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



// --- ФУНКЦИИ ВЫДЕЛЕНИЯ ---



function selectSquare(squareData, append = false) {
    if (!append) deselectAllSquares();
    squareData.element.classList.add('selected');
    selectedSquares.push(squareData);
}





function deselectAllSquares() {
    selectedSquares.forEach(sq => sq.element.classList.remove('selected'));
    selectedSquares = [];
}





function initSelectionBox() {
    selectionBox = document.createElement('div');
    selectionBox.classList.add('selection-box');
    workspace.appendChild(selectionBox);
}





function isRectsOverlap(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}






// --- ОБРАБОТЧИКИ СОБЫТИЙ ---






document.addEventListener('mousedown', function(event) {
    if (event.button !== 0) return;

    if (event.target.closest('.control-panel') || event.target === selectionBox) {
        return;
    }

    if (mode === 'draw' && workspace.contains(event.target)) {
        deselectAllSquares();
        createSquare(event.clientX, event.clientY);
        return;
    }

    if (mode === 'select' && workspace.contains(event.target)) {
        const clickedSquare = squaresList.find(sq => sq.element === event.target);

        if (clickedSquare) {
            // Если кликнули по уже выделенному квадрату и Shift не зажат — 
            // не сбрасываем выделение, просто готовимся к перетаскиванию группы.
            const isAlreadySelected = selectedSquares.includes(clickedSquare);
            const append = event.shiftKey;

            if (!isAlreadySelected) {
                if (!append) {
                    deselectAllSquares();
                }
                selectSquare(clickedSquare, append);
            } 
            // Если квадрат уже был в группе и Shift не нажат, мы просто продолжаем двигать группу.
            // Если Shift нажат, а квадрат уже в группе — убираем его (toggle).
            else if (append) {
                clickedSquare.element.classList.remove('selected');
                const index = selectedSquares.indexOf(clickedSquare);
                if (index !== -1) {
                    selectedSquares.splice(index, 1);
                }
                // Если после удаления группа пуста — нечего двигать
                if (selectedSquares.length === 0) {
                    return;
                }
            }

            // Подготовка к перетаскиванию ВСЕЙ текущей группы
            isDragging = true;
            draggedSquare = clickedSquare; // храним только для смены курсора, двигать будем массив
            dragStartMouse.x = event.clientX;
            dragStartMouse.y = event.clientY;

            // Сохраняем начальные позиции КАЖДОГО квадрата в группе
            selectedSquares.forEach(sq => {
                sq.startX = parseFloat(sq.element.style.left);
                sq.startY = parseFloat(sq.element.style.top);
            });
            return;
        } else {
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
        if (isDragging && selectedSquares.length > 0) {
            const rect = workspace.getBoundingClientRect();
            const offset = SQUARE_SIZE / 2;

            const deltaX = event.clientX - dragStartMouse.x;
            const deltaY = event.clientY - dragStartMouse.y;

            // Двигаем каждый квадрат группы относительно ЕГО СОБСТВЕННОЙ начальной позиции
            selectedSquares.forEach(sq => {
                const newX = sq.startX + deltaX;
                const newY = sq.startY + deltaY;

                sq.element.style.left = `${Math.max(-offset, Math.min(newX, rect.width - SQUARE_SIZE + offset))}px`;
                sq.element.style.top = `${Math.max(-offset, Math.min(newY, rect.height - SQUARE_SIZE + offset))}px`;
                // Обновляем данные в массиве squaresList для сохранения состояния
                const data = squaresList.find(s => s.id === sq.id);
                if (data) {
                    data.x = parseFloat(sq.element.style.left);
                    data.y = parseFloat(sq.element.style.top);
                }
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