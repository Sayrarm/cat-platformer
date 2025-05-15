document.addEventListener('DOMContentLoaded', function() {
    // Создаём HTML-структуру
    const body = document.body;

    // UI элементы
    const uiDiv = document.createElement('div');
    uiDiv.id = 'ui';
    uiDiv.innerHTML = 'Очки: <span id="score">0</span> | Жизни: <span id="lives">3</span>';

    // Canvas для игры
    const gameCanvas = document.createElement('canvas');
    gameCanvas.id = 'gameCanvas';

    // Стартовый экран
    const startScreen = document.createElement('div');
    startScreen.id = 'startScreen';

    const title = document.createElement('h1');
    title.textContent = 'Кот-платформер';

    const instructions = document.createElement('p');
    instructions.textContent = 'Используйте стрелки для движения и пробел для прыжка';

    const startButton = document.createElement('button');
    startButton.id = 'startButton';
    startButton.textContent = 'Начать игру';

    startScreen.appendChild(title);
    startScreen.appendChild(instructions);
    startScreen.appendChild(startButton);

    // Добавляем элементы на страницу
    body.appendChild(uiDiv);
    body.appendChild(gameCanvas);
    body.appendChild(startScreen);

    // Инициализация игры (остальной код остаётся без изменений)
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const startButtonElement = document.getElementById('startButton');

    // Размеры холста
    canvas.width = 800;
    canvas.height = 500;

    // Игровые переменные
    let score = 0;
    let lives = 3;
    let gameRunning = false;
    let gameSpeed = 3;
    let cameraOffset = 0;

    // Кот
    const cat = {
        x: 100,
        y: 300,
        width: 40,
        height: 50,
        speed: 5,
        jumpForce: 12,
        velocityY: 0,
        isJumping: false,
        direction: 'right',

        draw() {
            ctx.fillStyle = '#FF9800';
            // Тело
            ctx.beginPath();
            ctx.ellipse(this.x - cameraOffset, this.y, this.width/2, this.height/2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Голова
            ctx.beginPath();
            ctx.arc(this.x - cameraOffset + (this.direction === 'right' ? this.width/3 : -this.width/3), this.y - this.height/3, this.width/3, 0, Math.PI * 2);
            ctx.fill();

            // Глаза
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x - cameraOffset + (this.direction === 'right' ? this.width/2 : -this.width/2 + 10), this.y - this.height/3, 5, 0, Math.PI * 2);
            ctx.arc(this.x - cameraOffset + (this.direction === 'right' ? this.width/2 : -this.width/2 - 10), this.y - this.height/3, 5, 0, Math.PI * 2);
            ctx.fill();

            // Зрачки
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(this.x - cameraOffset + (this.direction === 'right' ? this.width/2 + 2 : -this.width/2 + 8), this.y - this.height/3, 2, 0, Math.PI * 2);
            ctx.arc(this.x - cameraOffset + (this.direction === 'right' ? this.width/2 - 2 : -this.width/2 - 12), this.y - this.height/3, 2, 0, Math.PI * 2);
            ctx.fill();

            // Уши
            ctx.fillStyle = '#FF9800';
            ctx.beginPath();
            ctx.moveTo(this.x - cameraOffset + (this.direction === 'right' ? this.width/3 : -this.width/3), this.y - this.height/2);
            ctx.lineTo(this.x - cameraOffset + (this.direction === 'right' ? this.width/2 : -this.width/2 - 10), this.y - this.height);
            ctx.lineTo(this.x - cameraOffset + (this.direction === 'right' ? this.width/2 + 20 : -this.width/2 + 10), this.y - this.height);
            ctx.fill();

            // Хвост
            ctx.beginPath();
            ctx.moveTo(this.x - cameraOffset - (this.direction === 'right' ? this.width/2 : -this.width/2), this.y);
            ctx.quadraticCurveTo(
                this.x - cameraOffset - (this.direction === 'right' ? this.width : -this.width),
                this.y - 20,
                this.x - cameraOffset - (this.direction === 'right' ? this.width + 20 : -this.width + 20),
                this.y + 10
            );
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#FF9800';
            ctx.stroke();
        },

        update() {
            // Гравитация
            this.velocityY += 0.5;
            this.y += this.velocityY;

            // Проверка на выход за нижнюю границу
            if (this.y > canvas.height) {
                this.respawn();
            }

            // Проверка коллизий с платформами
            platforms.forEach(platform => {
                if (
                    this.y + this.height/2 >= platform.y &&
                    this.y - this.height/2 <= platform.y + platform.height &&
                    this.x + this.width/2 >= platform.x &&
                    this.x - this.width/2 <= platform.x + platform.width
                ) {
                    // Если падает сверху на платформу
                    if (this.velocityY > 0 && this.y + this.height/2 < platform.y + platform.height/2) {
                        this.y = platform.y - this.height/2;
                        this.velocityY = 0;
                        this.isJumping = false;
                    }
                }
            });

            // Движение камеры, когда кот достигает середины экрана
            if (this.x - cameraOffset > canvas.width / 2) {
                cameraOffset = this.x - canvas.width / 2;
            }
        },

        jump() {
            if (!this.isJumping) {
                this.velocityY = -this.jumpForce;
                this.isJumping = true;
            }
        },

        respawn() {
            this.y = 100;
            this.x = 100 + cameraOffset;
            this.velocityY = 0;
            this.isJumping = false;
            lives--;
            livesElement.textContent = lives;

            if (lives <= 0) {
                gameOver();
            }
        }
    };

    // Платформы
    let platforms = [];

    function createPlatforms() {
        platforms = [];

        // Стартовая платформа
        platforms.push({
            x: 0,
            y: 400,
            width: 200,
            height: 20,
            color: '#4CAF50'
        });

        // Генерируем случайные платформы
        for (let i = 0; i < 20; i++) {
            const prevPlatform = platforms[platforms.length - 1];
            const gap = 150 + Math.random() * 100;
            const width = 80 + Math.random() * 120;
            const height = 20;
            const y = Math.max(
                200,
                Math.min(
                    450,
                    prevPlatform.y + (Math.random() > 0.5 ? -50 : 50)
                )
            );

            platforms.push({
                x: prevPlatform.x + prevPlatform.width + gap,
                y: y,
                width: width,
                height: height,
                color: i % 2 === 0 ? '#8BC34A' : '#4CAF50'
            });
        }
    }

    // Монетки
    let coins = [];

    function createCoins() {
        coins = [];

        platforms.forEach(platform => {
            // Добавляем монетки на некоторые платформы
            if (Math.random() > 0.3) {
                const coinCount = 1 + Math.floor(Math.random() * 3);
                for (let i = 0; i < coinCount; i++) {
                    coins.push({
                        x: platform.x + platform.width * (0.2 + 0.6 * Math.random()),
                        y: platform.y - 30,
                        radius: 10,
                        collected: false
                    });
                }
            }
        });
    }

    // Отрисовка платформ
    function drawPlatforms() {
        platforms.forEach(platform => {
            if (platform.x + platform.width > cameraOffset && platform.x < cameraOffset + canvas.width) {
                ctx.fillStyle = platform.color;
                ctx.fillRect(platform.x - cameraOffset, platform.y, platform.width, platform.height);

                // Текстура платформы
                ctx.fillStyle = '#2E7D32';
                for (let i = 0; i < platform.width; i += 10) {
                    ctx.fillRect(platform.x - cameraOffset + i, platform.y, 5, 2);
                }
            }
        });
    }

    // Отрисовка монеток
    function drawCoins() {
        coins.forEach(coin => {
            if (!coin.collected && coin.x > cameraOffset - 20 && coin.x < cameraOffset + canvas.width + 20) {
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(coin.x - cameraOffset, coin.y, coin.radius, 0, Math.PI * 2);
                ctx.fill();

                // Блеск монетки
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(coin.x - cameraOffset - 3, coin.y - 3, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    // Проверка сбора монеток
    function checkCoinCollision() {
        coins.forEach(coin => {
            if (!coin.collected) {
                const distance = Math.sqrt(
                    Math.pow(cat.x - coin.x, 2) +
                    Math.pow(cat.y - coin.y, 2)
                );

                if (distance < cat.width/2 + coin.radius) {
                    coin.collected = true;
                    score += 10;
                    scoreElement.textContent = score;
                }
            }
        });
    }

    // Управление
    const keys = {
        left: false,
        right: false,
        up: false
    };

    window.addEventListener('keydown', (e) => {
        if (!gameRunning) return;

        switch(e.key) {
            case 'ArrowLeft':
                keys.left = true;
                cat.direction = 'left';
                break;
            case 'ArrowRight':
                keys.right = true;
                cat.direction = 'right';
                break;
            case 'ArrowUp':
            case ' ':
                keys.up = true;
                cat.jump();
                break;
        }
    });

    window.addEventListener('keyup', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
                keys.left = false;
                break;
            case 'ArrowRight':
                keys.right = false;
                break;
            case 'ArrowUp':
            case ' ':
                keys.up = false;
                break;
        }
    });

    // Игровой цикл
    function gameLoop() {
        if (!gameRunning) return;

        // Очистка экрана
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Фон
        ctx.fillStyle = '#E0F7FA';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Облака на заднем фоне
        drawClouds();

        // Обновление и отрисовка объектов
        drawPlatforms();
        drawCoins();

        // Управление котом
        if (keys.left && cat.x > cat.width/2) {
            cat.x -= cat.speed;
        }
        if (keys.right) {
            cat.x += cat.speed;
        }

        cat.update();
        cat.draw();

        checkCoinCollision();

        requestAnimationFrame(gameLoop);
    }

    // Облака на заднем фоне
    function drawClouds() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

        // Статичные облака (движутся с камерой)
        for (let i = 0; i < 5; i++) {
            const cloudX = (i * 300) % (canvas.width * 3) - cameraOffset * 0.2;
            const cloudY = 50 + (i * 50) % 100;

            ctx.beginPath();
            ctx.arc(cloudX, cloudY, 30, 0, Math.PI * 2);
            ctx.arc(cloudX + 25, cloudY - 10, 25, 0, Math.PI * 2);
            ctx.arc(cloudX + 50, cloudY, 20, 0, Math.PI * 2);
            ctx.arc(cloudX + 25, cloudY + 10, 25, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Начало игры
    function startGame() {
        score = 0;
        lives = 3;
        cameraOffset = 0;

        scoreElement.textContent = score;
        livesElement.textContent = lives;

        createPlatforms();
        createCoins();

        cat.x = 100;
        cat.y = 300;
        cat.velocityY = 0;
        cat.isJumping = false;

        gameRunning = true;
        startScreen.style.display = 'none';

        gameLoop();
    }

    // Конец игры
    function gameOver() {
        gameRunning = false;
        startScreen.style.display = 'flex';
        startScreen.querySelector('h1').textContent = 'Игра окончена!';
        startScreen.querySelector('p').textContent = `Ваш счет: ${score}`;
        startButton.textContent = 'Играть снова';
    }

    // Обработчик кнопки старта
    startButtonElement.addEventListener('click', startGame);
});