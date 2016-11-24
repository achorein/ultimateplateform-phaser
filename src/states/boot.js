class Boot extends Phaser.State {

  constructor() {
    super();
  }
  
  preload() {
    this.load.image('preloader', 'assets/preloader.gif');
  }

  create() {
    //this.game.input.maxPointers = 1;

    //setup device scaling
      /*
    if (this.game.device.desktop) {
      this.game.scale.pageAlignHorizontally = true;
    } else {
      this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.game.scale.minWidth =  480;
      this.game.scale.minHeight = 260;
      this.game.scale.maxWidth = 800;
      this.game.scale.maxHeight = 600;
      this.game.scale.forceOrientation(true);
      this.game.scale.pageAlignHorizontally = true;
      this.game.scale.setScreenSize(true);
      this.game.input.touch.preventDefault = false;
    }
    */

    this.initGlobalVariables();

    this.game.state.start('preloader');
  }

  initGlobalVariables(){
    this.game.global = {
      score: 0,
      elapsedTime: 0,
      collected: [],
      gravity: 400,
      speed: 250,
      maxVelocity: 500,
      level: 1,
      levelmax: 5,
      life: 2,
      maxlife: 3,
      playerSprite: '',
      playerName: 'Anonymous',
      backendUrl: 'http://localhost:3000/api'
    };
  }

}

export default Boot;
