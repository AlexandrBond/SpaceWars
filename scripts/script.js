
var HeroX = 300,
    HeroY = 570,
    HeroW = 30,
    HeroH = 30,
    EnemyH = 30,
    EnemyW = 30,
    BoardW = 600,
    BoardH = 600,
    speedBullet = 2,
    scores,
    level = 1; //Чем больше число тем проще (минимум 1)
var hero,
    enemy,
    boom,
    badaboom,
    bullet,
    ctx,
    canvas,
    boomflag = false,
    badaboomflag = false,
    EnemyArr,
    Bullets,
    BonusArr,
    bonusSrc,
    bonusIndex,
    boomcoords = [],
    badaboomcoords = [],
    gameLoop,
    enemiesLoop,
    bonusLoop,
    killsound,
    bonussound,
    shotsound,
    gameOverSound,
    gameFonSound;

function Init() {
   
    //находим canvas и заливаем
    canvas = document.getElementById("game");
    canvas.height = BoardH;
    canvas.width = BoardW;
    ctx = canvas.getContext("2d");

    //создаем ГГ и противников
    hero = new Image();
    hero.src = "img/hero.png";

    back = new Image();
    back.src = "img/fon1.jpg";

    enemy = new Image();
    enemy.src = "img/enemy.png";

    bullet = new Image();
    bullet.src = "img/bullet.png"; 

    boom = new Image();
    boom.src = "img/boom.png";

    badaboom = new Image();
    badaboom.src = "img/bada-boom.png";

    bonus = new Image();
    console.log('bonus: ', bonus);
    bonusSrc = ["img/bonus_sheet.png","img/bonus.png","img/bonus_time.png"];
    
    //bonus.src = "img/bonus_sheet.png";

    //звуки

    killsound = new Audio();
    killsound.src = "sounds/kill.mp3";
    killsound.load();

    bonussound = new Audio();
    bonussound.src = "sounds/bonus.mp3";
    bonussound.load();

    shotsound = new Audio();
    shotsound.src = "sounds/Laser.mp3";
    shotsound.load();
    shotsound.volume = .1;

    gameOverSound = new Audio();
    gameOverSound.src = "sounds/gameover.mp3";
    gameOverSound.load();

    gameFonSound = new Audio();
    gameFonSound.src = "sounds/gamefonsound.mp3";
    gameFonSound.load(); 
    EnemyArr = [];
    Bullets = [];
    BonusArr = [];
    scores = 0;
};

//проверка условия проигрыша (захождение первого врага в зону героя)
function GameOver() {
    if (EnemyArr.length > 0 && EnemyArr[0].EnemyY > HeroY + HeroW - 10) {
        return true;
    }
    else {
        
        return false;
    };
};

function drawAll() {
    
    if (!GameOver()) {
        //рисуем фон
        ctx.drawImage(back, 0, 0);
        ctx.drawImage(hero, HeroX, HeroY);

        // рисуем врагов и пули
       for (var i = 0; i < EnemyArr.length; i++) {
            ctx.drawImage(enemy, EnemyArr[i].EnemyX, EnemyArr[i].EnemyY);
        };

        for (var i = 0; i < Bullets.length; i++) {
            ctx.drawImage(bullet, Bullets[i].X, Bullets[i].Y)
        };


        //рисуем бонусы
        if (BonusArr.length > 0) {
            ctx.drawImage(bonus, BonusArr[0], BonusArr[1])
            //console.log('BonusArr: ', BonusArr);
            
        }

        //взрывы
        if (badaboomflag) {
            ctx.drawImage(badaboom, badaboomcoords[0], badaboomcoords[1])
            badaboomflag = false;
        };
        if (boomflag) {
            ctx.drawImage(boom, boomcoords[0], boomcoords[1])
            boomflag = false;
            badaboomflag = true;
        };
        // очки 
        ctx.fillStyle = "red";
        ctx.font = "20px serif";
        ctx.fillText("SCORES: " + scores, 450, 25);
        //перемещение врагов и пуль, удаление
        ChangeEnemies();
        ChangeBullets();
        DeleteEnemy();
        DeleteBullets();
        if (BonusArr.length > 0) {
            ChangeBonus();
            DeleteBonus();
        };
    }
    else {
        ctx.drawImage(back, 0, 0); 
        ctx.fillStyle = "rgb(10,16,39)";
        ctx.fillRect(150, 200, 300, 170);
        ctx.fillStyle = "red";
        ctx.font = "30px serif";
        ctx.fillText("GAME OVER !", 195, 255);
        ctx.fillText("YOUR SCORE : " + scores, 165, 325);
        document.removeEventListener("click", zz);
        gameFonSound.pause();
        gameOverSound.play();
        clearInterval(gameLoop);
        clearInterval(enemiesLoop);
        clearInterval(bonusLoop);
        document.getElementById("restart").disabled = false; 
    }; 
};

//генерация врагов
function GenerateEnemies() {
    var obj = {};
    obj.EnemyY = 0;
    obj.EnemyX = parseInt((Math.random() * (570 + 1)), 10)
    EnemyArr.push(obj);
};

//перемещение врагов
function ChangeEnemies() {
    for (var i = 0; i < EnemyArr.length; i++) {
        EnemyArr[i].EnemyY += 1;
    };
};

//генерация бонусов
function GenerateBonus() {
    bonusIndex = Math.floor((Math.random()) * 3) ;
    console.log('bonusIndex: ', bonusIndex); 
    var BonusY = 0;
    var BonusX = parseInt((Math.random() * (570 + 1)), 10);

    bonus.src = bonusSrc[bonusIndex]//"img/bonus_sheet.png";

    BonusArr = [BonusX,BonusY];
    //console.log('BonusArr2: ', BonusArr);

};

//перемещение бонусов
function ChangeBonus() {
    BonusArr[1] += 3;
};

//генерация выстрелов
function GenerateBullet(posH = HeroX){
    var obj = {};
    obj.Y = HeroY;
    obj.X = posH + HeroH / 2;
    Bullets.push(obj);
};

//перемещение пуль
function ChangeBullets() {
    for (var i = 0; i < Bullets.length; i++) {
        Bullets[i].Y += -speedBullet;
    };
};

//вычисление попаданий
function DeadCollision(bullet, enemy) {
    if (bullet.X >= enemy.EnemyX && bullet.X <= enemy.EnemyX + EnemyW) {
        if (bullet.Y >= enemy.EnemyY && bullet.Y <= enemy.EnemyY + EnemyH) {
            badaboomcoords = [enemy.EnemyX, enemy.EnemyY];
            boomcoords = [enemy.EnemyX, enemy.EnemyY];
            boomflag = true;
            return true;
        };
    };
};

//удаление умерших противников
function DeleteEnemy() {
    for (var i = 0; i < EnemyArr.length; i++) {
        for (var j = 0; j < Bullets.length; j++) {
            if (DeadCollision(Bullets[j], EnemyArr[i])) {
                EnemyArr.splice(i, 1);
                Bullets.splice(j, 1);
                scores += 10;
                killsound.play();
            };
        };
    };
};

//удаление пуль из массива, вышедших за границу
function DeleteBullets() {
    for (var i = 0; i < Bullets.length; i++) {
        if (Bullets[i].X > BoardW) {
            Bullets.splice(i, 1);
        }
    };
  //  console.log('Bullets.length = ',Bullets.length);
};

//получение бонусов при поимке бонуса
function DeleteBonus() {
    if(BonusArr[1] === HeroY- HeroW){
        if (BonusArr[0] + 40 >= HeroX && BonusArr[0] <= HeroX + HeroH)
        {
            switch(bonusIndex){
            case 0:  EnemyArr = []; break;
            case 1: scores += 100; break;
            case 2:// clearInterval(enemiesLoop);
           // console.log('enemiesLoop!!!: ', enemiesLoop);
            /*enemiesLoop = setInterval(GenerateEnemies, level * 2000);; 
            */
           // enemiesLoop = setInterval(GenerateEnemies, level * 1000);
            break;
            }
            
            BonusArr.splice(0,2);
            bonussound.play();
        }
    }
}
// Чтение клавы
function keyHandler(evt) {
    switch (evt.keyCode) {
        // Down arrow.
        case 37:case 65:
            HeroX = HeroX - HeroH / 2;
            if (HeroX < 0) {
                HeroX = 0;
            }
            break;
            // Up arrow.
        case 39:case 68:

            HeroX = HeroX + HeroH/2;
            if (HeroX > BoardH - HeroH) {
                HeroX = BoardH - HeroH;
            }
            break;
        case 32:
            GenerateBullet(HeroX - 10);
            shotsound.play();
    };
};
function zz(){
    GenerateBullet(HeroX - 10);
    shotsound.play();  
}
function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
   // var relativeY = e.clientY - canvas.offsetLeft;
    if(relativeX > 10 && relativeX < (canvas.width - 1) ) {
        HeroX = relativeX - HeroH/2;
      /*  if(relativeY > 10 && relativeY < canvas.height - 10) {
            HeroY = relativeY - HeroH/2;        }*/

    }
}
function drawGameCanvas() {
    // Play the game until the ball stops.
    gameLoop = setInterval(drawAll, 16);
    //Генерим координаты врагов
    enemiesLoop = setInterval(GenerateEnemies, level * 500);
    //Генерим бонусы
    bonusLoop = setInterval(GenerateBonus, level*5000)
    // Слушаем клаву
    window.addEventListener('keydown', keyHandler, true);
};

//стартуем
function Start() {
   /* clearInterval(gameLoop);
    clearInterval(enemiesLoop);
    clearInterval(bonusLoop);*/
    
    document.addEventListener("click", zz);
    Init();
    gameFonSound.autoplay = true;
    gameFonSound.volume = .4;
    drawGameCanvas();
    document.getElementById("start").disabled = true; 
};
// рестарт
function checkReStart(){
    if (gameFonSound){
        gameFonSound.pause() ;   
       }  
       
       Start();  
}
//document.getElementById("start").onclick = Start;
//document.onload = Start();
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("click", zz); 
document.getElementById("start").onclick = checkReStart;//Start;
