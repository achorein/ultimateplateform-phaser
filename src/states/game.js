//import Crosshairs from '../prefabs/crosshairs';
import Target from '../prefabs/target';

class Game extends Phaser.State {

  constructor() {
    super();
  }
  
  create() {
    // commons
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.time.desiredFps = 30;
    this.game.physics.arcade.gravity.y = 250;

    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // Sprites
    this.background = this.game.add.sprite(0,0,'background');
    this.background.height = this.game.world.height;
    this.background.width = this.game.world.width;

    var tilesize=128;
    this.tilesprite = this.game.add.tileSprite(
        0, this.game.world.bottom-tilesize, // x y
        this.game.world.width*2, this.game.world.bottom-tilesize, // width height
        'world', 1); // sprite + frame
    this.tilesprite.scale.setTo(0.5, 0.5);

    this.player = this.game.add.sprite(32, 32, 'dude');
    this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    this.player.animations.add('turn', [4], 20, true);
    this.player.animations.add('right', [5, 6, 7, 8], 10, true);

    // Physics
    this.game.physics.enable([this.player, this.tilesprite], Phaser.Physics.ARCADE);
    this.player.body.bounce.y = 0.2;
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(20, 32, 5, 16);

    //this.tilesprite.body.collideWorldBounds = true;
    this.tilesprite.body.immovable = true;
    this.tilesprite.body.allowGravity = false;
    this.tilesprite.body.setSize(this.game.world.width*2, tilesize, 0, tilesize);


    //setup UI
    /*
    this.countdownText = this.add.text(this.game.world.centerX, 0, '', {
      font: '40px Arial', fill: '#ffffff', align: 'center'
    });
    this.countdownText.anchor.set(0.5,0);*/

    //set up click listeners
    //this.game.input.onDown.add(this.shoot, this);

    //setup audio
    this.music = this.game.add.audio('musicGame');
    this.music.play();

    //setup prefabs
    //this.crosshairs = new Crosshairs(this.game);
    //this.target = new Target(this.game,this.game.world.centerX,this.game.world.centerY);
    //this.game.add.existing(this.crosshairs);
    //this.game.add.existing(this.target);

    //this.tilesprite.visible=true;

    //setup a timer to end the game
    //this.endGameTimer = this.game.time.create();
    //this.endGameTimer.add(Phaser.Timer.SECOND * 15, this.endGame,this);
    //this.endGameTimer.start();
  }


  update() {
    this.game.physics.arcade.collide(this.player, this.tilesprite);
    //this.game.debug.body(this.tilesprite);


    this.player.body.velocity.x = 0;

    if (this.cursors.left.isDown)
    {
      this.player.body.velocity.x = -150;

      if (this.facing != 'left')
      {
        this.player.animations.play('left');
        this.facing = 'left';
      }
    }
    else if (this.cursors.right.isDown)
    {
      this.player.body.velocity.x = 150;

      if (this.facing != 'right')
      {
        this.player.animations.play('right');
        this.facing = 'right';
      }
    }
    else
    {
      if (this.facing != 'idle')
      {
        this.player.animations.stop();

        if (this.facing == 'left')
        {
          this.player.frame = 0;
        }
        else
        {
          this.player.frame = 5;
        }

        this.facing = 'idle';
      }
    }

    if (this.jumpButton.isDown || this.cursors.up.isDown /*&& this.player.body.onFloor()*/ && this.game.time.now > this.jumpTimer)
    {
      this.player.body.velocity.y = -250;
      this.jumpTimer = this.game.time.now + 750;
    }
  }

  endGame() {
    this.music.stop();
    this.game.state.start('gameover');
  }

}

export default Game;
