class Preloader extends Phaser.State {

  constructor() {
    super();
    this.asset = null;
    this.ready = false;
  }

  preload() {
    //setup loading bar
    this.asset = this.add.sprite(this.game.width * 0.5 - 110, this.game.height * 0.5 - 10, 'preloader');
    this.load.setPreloadSprite(this.asset);

    //Setup loading and its events
    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.loadResources();
  }

  loadResources() {
    this.game.load.image('fonts', 'assets/fonts/070.png');
    this.game.load.image('swirl','assets/fonts/swirl1.jpg');
    this.game.load.image('background','assets/background.png');

    this.game.load.tilemap('tilemap', 'assets/tilesmap/world.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.physics('physicsData', 'assets/tilesmap/world.json');
    this.game.load.spritesheet('world','assets/tilesmap/world.png', 64, 64);

    this.game.load.atlasJSONHash('adventurePlayer', 'assets/adventure_girl.png', 'assets/adventure_girl.json');
    this.game.load.atlasJSONHash('knightPlayer', 'assets/knight.png', 'assets/knight.json');
    this.game.load.atlasJSONHash('robotPlayer', 'assets/robot.png', 'assets/robot.json');
    this.game.load.atlasJSONHash('ninjaPlayer', 'assets/ninja.png', 'assets/ninja.json');

    this.game.load.image('coin', 'assets/hud_coins.png');
    this.game.load.image('heart', 'assets/hud_heartFull.png');
    this.game.load.image('gem', 'assets/hud_gem_green.png');
    this.game.load.image('star', 'assets/hud_star.png');

    this.game.load.audio('musicMenu','assets/sounds/menu.mp3');
    this.game.load.audio('musicGame','assets/sounds/game.mp3');
    this.game.load.audio('jumpSound','assets/sounds/jump.ogg');
    this.game.load.audio('winnerSound','assets/sounds/winner.wav');
    this.game.load.audio('failedSound','assets/sounds/failed.wav');
    this.game.load.audio('deadSound','assets/sounds/dead.wav');
  }

  onLoadComplete() {
    this.game.state.start('menu');
  }
}

export default Preloader;
