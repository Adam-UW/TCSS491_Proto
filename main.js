function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
    this.left = false;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        if(index === 20 && this.left){
            index -= 2;
        }
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// function Background(game) {
//     Entity.call(this, game, 0, 200);
//     this.radius = 200;
// }


function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y);
};

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "Green";
    ctx.fillRect(0,290,800,200);
    Entity.prototype.draw.call(this);
}

function Mario(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/Walk-Sheet.png"), 0, 0, 88, 125, 0.20, 7, true, true);
    this.Leftanimation = new Animation(ASSET_MANAGER.getAsset("./img/Walk-Reverse-Sheet.png"), 0, 0, 88, 125, 0.20, 7, true, true);
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/Crouch-Swing-Sheet.png"), 0, 0, 164, 97, 0.11 , 9, false, false);
    this.LeftjumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/Walk-Sheet.png"), 0, 0, 113.88888, 132, 0.20, 9, false, true);
    this.radius = 100;
    this.ground = 180;
    Entity.call(this, game, 0, 180);
}

Mario.prototype = new Entity();
Mario.prototype.constructor = Mario;

Mario.prototype.update = function () {
    if ((this.x === 550 && !this.left) || (this.x === 900 && this.left)) this.jumping = true;

    if (this.jumping ) {
        if (this.jumpAnimation.isDone() && !this.left) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        } else if(this.LeftjumpAnimation.isDone() && this.left) {
            this.LeftjumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }

        if(!this.left) {
            var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
            var totalHeight = 10;
        } else {
            var jumpDistance = this.LeftjumpAnimation.elapsedTime / this.LeftjumpAnimation.totalTime;
            var totalHeight = 10;
        }

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        //var height = jumpDistance * 2 * totalHeight;
        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }
    Entity.prototype.update.call(this);
}

Mario.prototype.draw = function (ctx) {
    if (this.jumping && !this.left) {
        this.x = this.x +5;
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34, .5);
    }
    else if(this.jumping && this.left) {
        this.x = this.x -5;
        this.LeftjumpAnimation.drawFrame(this.game.clockTick, ctx, this.x - 17, this.y - 34, .5);
    } else {
        if (this.left) {
            this.x = this.x -5;
            if (this.x < -75) {
                this.left = false;
                //this.x = -75;
            }
            this.Leftanimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        } else {
            this.x = this.x + 5;
            if (this.x > 800) {
                this.left = true;
                //this.x = -75;
            }
            this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/Walk-Sheet.png");
ASSET_MANAGER.queueDownload("./img/Walk-Reverse-Sheet.png");
ASSET_MANAGER.queueDownload("./img/Crouch-Swing-Sheet.png");
// ASSET_MANAGER.queueDownload("./img/mario_left_jump_new.png");
ASSET_MANAGER.queueDownload("./img/TitleScreen_new.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();


    //var bg = new Background(gameEngine);
    gameEngine.init(ctx);
    gameEngine.start();
    gameEngine.addEntity(new Background(gameEngine, ASSET_MANAGER.getAsset("./img/TitleScreen_new.png")));
    var mario = new Mario(gameEngine);
  //  gameEngine.addEntity(new Background(gameEngine, ASSET_MANAGER.getAsset("./img/TitleScreen_new.png")));

  //  gameEngine.addEntity(bg);
    gameEngine.addEntity(mario);

    // gameEngine.init(ctx);
    // gameEngine.start();

      console.log("All Done!");
});
