class Menu extends Phaser.State {

  constructor() {
    super();
  }

  create() {
    var self = this;
    //add background image
    this.background = this.game.add.sprite(0,0,'background');
    this.background.height = this.game.world.height;
    this.background.width = this.game.world.width;
    this.background.alpha = 0.1;

    // Ajout du score
    this.gameover = this.game.add.retroFont('fonts', 16, 16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ -0123456789', 20);
    this.gameover.text = 'GAME OVER';
    this.game.add.image(this.game.world.centerX,this.game.world.centerY-20, this.gameover);

    // Ajout du score
    this.score = this.game.add.retroFont('fonts', 16, 16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ -0123456789', 20);
    this.score.text = 'SCORE '+ this.game.global.score;
    this.game.add.image(this.game.world.centerX,this.game.world.centerY+20, this.score);

    // press any key
    this.game.input.keyboard.onDownCallback = function(e) {
      self.onInputDown(self);
    }

    //prevent accidental click-thru by not allowing state transition for a short time
    this.canContinueToNextState = false;
    this.game.time.events.add(Phaser.Timer.SECOND * .5, function(){ this.canContinueToNextState = true; }, this);

    this.saveVarsToLocalStorage();
    this.resetGlobalVariables();
  }

  saveVarsToLocalStorage(){
    var max = localStorage["maxScore"] || 0; //default value of 0 is it does not exist
    if (this.game.global.score > max){ localStorage["maxScore"] = this.game.global.score; }
  }

  resetGlobalVariables(){
    this.game.global.score = 0;
  }
  update() {}

  onInputDown () {
    if(this.canContinueToNextState){
      this.game.state.start('menu');
    }
  }

}

export default Menu;
