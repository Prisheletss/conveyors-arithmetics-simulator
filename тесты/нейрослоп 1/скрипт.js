// Захардкоженные параметры (легко менять в одном месте)
const SQUARE_SIZE = 50;
const SQUARE_COLOR = '#000000';
const SQUARE_BORDER = '2px solid #f00';

// Главный массив, в котором хранятся все созданные квадраты
var squaresList = [];

/**
 * Функция создания квадрата
 * @param {number} x - координата X клика
 * @param {number} y - координата Y клика
 */
function createSquare(x, y) {
    const square = document.createElement('div');
    square.classList.add('square');

    // Устанавливаем захардкоженные стили
    square.style.width = `${SQUARE_SIZE}px`;
    square.style.height = `${SQUARE_SIZE}px`;
    square.style.backgroundColor = SQUARE_COLOR;
    square.style.border = SQUARE_BORDER;

    // 
    // Корректировка координат: 
    // вычитаем половину размера, чтобы квадрат появлялся 
    // ровно по центру курсора, а не своим левым верхним углом.
    const offset = SQUARE_SIZE / 2;
    square.style.left = `${x - offset}px`;
    square.style.top = `${y - offset}px`;

    // Добавляем квадрат в DOM
    document.body.appendChild(square);

    // Создаем объект с данными квадрата и добавляем его в массив
    const squareData = {
        element: square,
        id: Date.now() + Math.random(), // Уникальный ID
        x: x - offset,
        y: y - offset,
        size: SQUARE_SIZE,
        color: SQUARE_COLOR,
        createdAt: new Date().toISOString()
    };
        
    squaresList.push(squareData);
}

// Обработчик клика по всему экрану
document.addEventListener('click', function(event) {
    // Игнорируем клики по правой и средней кнопкам мыши
    if (event.button !== 0) return;

    // Координаты клика относительно видимой области страницы
    const x = event.clientX;
    const y = event.clientY;

    createSquare(x, y);
});

