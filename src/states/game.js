//import Crosshairs from '../prefabs/crosshairs';
import Target from '../prefabs/target';

class Game extends Phaser.State {

  constructor() {
    super();
    this.jumpTimer = 0;
  }
  
  create() {
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
    this.layer.debug = true;
    /*for(var y = 0; y < this.layer.map.height; ++y){
      for(var x = 0; x < this.layer.map.width; ++x){
        var tile = this.layer.map.getTile(x, y);
        console.log(tile);
      }
    }*/

    this.blocsLayer = this.map.createLayer('blocs');
    //this.layer.scale.set(0.2);
    this.blocsLayer.resizeWorld();
    //this.blocsLayer.wrap = true;
    //this.layer.debug = true;

    this.map.setLayer(this.blocsLayer);
    this.map.setCollisionBetween(1, 112);
    // jumper
    this.map.setTileIndexCallback(242, function(sprite, tile) { sprite.body.velocity.y = -500; }, this, this.layer);
    // pics
    this.map.setTileIndexCallback(250, function(sprite, tile) { sprite.body.velocity.y = -500; }, this, this.layer);
    // water
    this.map.setTileIndexCallback(130, function(sprite, tile) { sprite.body.velocity.y = -500; }, this, this.layer);

    this.player = this.game.add.sprite(32, 32, 'dude');
    this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    this.player.animations.add('turn', [4], 20, true);
    this.player.animations.add('right', [5, 6, 7, 8], 10, true);

    // Physics
    this.game.physics.enable([this.player], Phaser.Physics.ARCADE);
    this.player.body.bounce.y = 0.2;
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(20, 32, 5, 16);


    //setup audio
    this.music = this.game.add.audio('musicGame');
    this.music.play();

    //setup prefabs
    //this.crosshairs = new Crosshairs(this.game);
    //this.target = new Target(this.game,this.game.world.centerX,this.game.world.centerY);
    //this.game.add.existing(this.crosshairs);
    //this.game.add.existing(this.target);

    //setup a timer to end the game
    //this.endGameTimer = this.game.time.create();
    //this.endGameTimer.add(Phaser.Timer.SECOND * 15, this.endGame,this);
    //this.endGameTimer.start();

    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  }


  update() {
    this.game.physics.arcade.collide(this.player, this.blocsLayer);
    this.game.physics.arcade.collide(this.player, this.layer);

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

  endGame() {
    this.music.stop();
    this.game.state.start('gameover');
  }

  changeMapTileSetArray(tileSetKey){
    this.map.tiles = [];
    var tileSet = Constant.TILE_SET_DICT[tileSetKey];
    var currentTileSetId = this.map.getTilesetIndex(tileSetKey);
    for(var i = 0;i<tileSet.tileList.length;i++){
      this.map.tiles.push([tileSet.tileList[i].x,tileSet.tileList[i].y,currentTileSetId]);
    }
  };
}



export default Game;
