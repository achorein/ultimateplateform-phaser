import Player from '../prefabs/player';

class Game extends Phaser.State {

  constructor() {
    super();
    this.jumpTimer = 0;
  }
  
  create() {
    var self = this;

    // commons
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 250;
    this.game.time.desiredFps = 30;

    // Sprites
    this.background = this.game.add.sprite(0,0,'background');
    this.background.height = this.game.world.height;
    this.background.width = this.game.world.width;

    // tilemap
    this.map = this.game.add.tilemap('tilemap');
    this.map.addTilesetImage('world-spritesheet', 'world');

    this.layer = this.map.createLayer('back');
    //this.layer.scale.set(0.2);
    this.layer.resizeWorld();
    //this.layer.wrap = true;
    //this.layer.debug = true;

    this.blocsLayer = this.map.createLayer('blocs');
    //this.layer.scale.set(0.2);
    this.blocsLayer.resizeWorld();
    //this.blocsLayer.wrap = true;
    //this.layer.debug = true;

    this.map.setLayer(this.blocsLayer);
    this.map.setCollisionBetween(1, 112);

    // Gestion des collisions avec le décors (ajout des callback)
    // jumper
    this.map.setTileIndexCallback(242,
        function(sprite, tile) { sprite.body.velocity.y = -500; },
        this, this.layer);
    // pics
    this.map.setTileIndexCallback(250,
        function(sprite, tile) { self.endGame(self) },
        this, this.layer);
    // water
    this.map.setTileIndexCallback(130,
        function(sprite, tile) { self.endGame(self) },
        this, this.layer);

    // Ajout des bonus
    this.game.global.bonusLeft = 0;
    this.stars = this.game.add.group();
    this.stars.enableBody = true;
    var collectable= this.map.layers[this.map.getLayer('collectable')];
    collectable.data.forEach(function(row) {
      row.forEach(function(data){
        if (data.index > 0) {
          var star = self.stars.create(data.x*data.width, data.y*data.height, 'coin');
        }
      });
    });

    // Ajout du score
    this.font = this.game.add.retroFont('fonts', 16, 16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ -0123456789', 20);
    this.font.text =  'SCORE 0';
    this.game.add.image(5,5, this.font);

    //setup prefabs
    this.player = new Player(this.game, 16, this.game.world.centerY);
    this.game.add.existing(this.player);

    //setup audio
    this.music = this.game.add.audio('musicGame');
    this.music.play();

    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  }


  update() {
    this.game.physics.arcade.collide(this.player, this.blocsLayer);
    this.game.physics.arcade.collide(this.player, this.layer);
    this.game.physics.arcade.collide(this.stars, this.blocsLayer);
    this.game.physics.arcade.overlap(this.player, this.stars, this.collectStar, null, this);

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

    if ((this.jumpButton.isDown || this.cursors.up.isDown) && this.game.time.now > this.jumpTimer) {
      //this.player.body.onFloor()
      this.player.body.velocity.y = -250;
      this.jumpTimer = this.game.time.now + 1500;
    }
  }

  endGame(self) {
    self.music.stop();
    self.game.state.start('gameover');
  }

  collectStar(player, star) {
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    this.game.global.score += 10;
    this.font.text = 'SCORE ' + this.game.global.score;

    if (this.stars.countLiving() <= 0) {
      this.endGame(this);
    }
  }
}

export default Game;
