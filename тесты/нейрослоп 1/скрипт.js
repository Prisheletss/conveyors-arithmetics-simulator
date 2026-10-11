function createSquare(x, y) {
    const square = document.createElement('div');
    square.classList.add('square');
    
    // Цвет берётся из глобального состояния!
    square.style.width = `${SQUARE_SIZE}px`;
    square.style.height = `${SQUARE_SIZE}px`;
    square.style.backgroundColor = currentColor;
    square.style.border = SQUARE_BORDER;

    const offset = SQUARE_SIZE / 2;
    square.style.left = `${x - offset}px`;
    square.style.top = `${y - offset}px`;

    document.body.appendChild(square);

    // Сохраняем данные о квадрате
    squaresList.push({
        element: square,
        id: Date.now() + Math.random(),
        x: x - offset,
        y: y - offset,
        size: SQUARE_SIZE,
        color: currentColor,
        createdAt: new Date().toISOString()
    });
}





function setCurrentColor(color) {
    currentColor = color;
}





function initControlPanel() {
    // Контейнер для кнопок
    const panel = document.createElement('div');
    panel.classList.add('control-panel'); // Теперь этот класс отвечает за стили

    // Кнопки
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
        `;
        
        // Анимация нажатия
        btn.onmousedown = () => btn.style.transform = 'scale(0.97)';
        btn.onmouseup = () => btn.style.transform = '';

        // Назначаем действие
        btn.addEventListener('click', () => setCurrentColor(item.hex));

        panel.appendChild(btn);
    });

    // Вставляем панель в DOM
    document.body.append(panel);
}





// Обработчик кликов по документу
document.addEventListener('click', function(event) {
    // Игнорируем все клики внутри панели управления
    if (event.target.closest('.control-panel')) return;

    // Игнорируем правую кнопку мыши
    if (event.button !== 0) return;

    const x = event.clientX;
    const y = event.clientY;
    createSquare(x, y);
});









const SQUARE_SIZE = 50;
const SQUARE_COLOR_DEFAULT = '#000';
const SQUARE_BORDER = '2px solid #f00';

let currentColor = SQUARE_COLOR_DEFAULT; // Глобальное состояние цвета
let squaresList = [];


initControlPanel();