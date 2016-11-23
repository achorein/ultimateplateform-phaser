class GameOver extends Phaser.State {

  constructor() {
    super();
  }

  create() {
    var self = this;
    //add background image
    this.background = this.game.add.sprite(0,0,'background');
    this.background.height = this.game.world.height;
    this.background.width = this.game.world.width;
    this.background.alpha = 0.25;

    // Ajout du score
    this.gameoverText = this.createFont('YOU LOSE!');
    var img = this.game.add.image(this.game.world.centerX, this.computePos(1), this.gameoverText);
    img.anchor.set(0.5);

    // Ajout temps écoulé
    var style = { font: "bold 18px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    var text = self.game.add.text(self.game.world.centerX, this.computePos(2), this.game.global.elapsedTime + ' seconde' + ((this.game.global.elapsedTime>1)?'s':''), style);
    text.anchor.set(0.5);

    // ajout des vies restantes
    for (var i=0; i<this.game.global.life; i++) {
        var sprite = this.game.add.sprite(this.game.world.centerX - 30 + 30*i, this.computePos(3), 'heartFull');
        sprite.scale.setTo(0.5);
        sprite.anchor.setTo(0.5);
    }
    for (;i<this.game.global.maxlife;i++) {
        sprite = this.game.add.sprite(this.game.world.centerX - 30 + 30*i, this.computePos(3), 'heartEmpty');
        sprite.scale.setTo(0.5);
        sprite.anchor.setTo(0.5);
    }

    // Ajout du score
    this.score = this.createFont('SCORE '+ this.game.global.score);
    img = this.game.add.image(this.game.world.centerX, this.game.world.centerY + 200, this.score);
    img.anchor.set(0.5);

    sprite = self.game.add.sprite(self.game.world.centerX, self.game.world.centerY, this.game.global.playerSprite, 'idle/01');
    sprite.anchor.set(0.5);
    sprite.animations.add('dead', Phaser.Animation.generateFrameNames('dead/', 1, 10, '', 2), 10, false, false);
    sprite.animations.play('dead');
    this.game.camera.follow(sprite);

    //prevent accidental click-thru by not allowing state transition for a short time
    this.canContinueToNextState = false;
    this.game.time.events.add(Phaser.Timer.SECOND*0.5, function(){ this.canContinueToNextState = true; }, this);

    this.game.add.audio('failedSound').play('', 0, 0.5);

    // press any key
    this.game.input.keyboard.onDownCallback = function(e) {
        self.onInputDown(self);
    }
  }

  update() {}

  createFont(text) {
      var font = this.game.add.retroFont('fonts', 16, 16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ -0123456789', 20);
      font.text = text;
      return font;
  }

  onInputDown () {
    if(this.canContinueToNextState){
      this.canContinueToNextState = false;
      if (this.game.global.life > 0) {
          this.game.state.start('game', true, false);
      } else {
          this.game.state.start('menu', true, false);
      }
    }
  }

  computePos(index) {
      return this.game.world.centerY - 200 + ((index - 1) * 48);
  }
}

export default GameOver;
