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
    this.game.load.image('background','assets/background.png');

    this.game.load.tilemap('tilemap', 'assets/tilesmap/world.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.spritesheet('world','assets/tilesmap/world.png', 64, 64);

    this.game.load.image('text_go', 'assets/text_go.png');
    this.game.load.image('text_ready', 'assets/text_ready.png');
    this.game.load.spritesheet('dude', 'assets/dude.png', 32, 48);

    this.game.load.audio('musicMenu','assets/menu.mp3');
    this.game.load.audio('musicGame','assets/game.mp3');
  }

  onLoadComplete() {
    this.game.state.start('menu');
  }
}

export default Preloader;
