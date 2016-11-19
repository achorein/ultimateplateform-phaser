
class Menu extends Phaser.State {

  constructor() {
    super();
    this.cursorPos = 1;
    this.timer = 0;
  }
  
  create() {
    var self = this;
    //add background image
    this.background = this.game.add.sprite(0,0, 'background');
    this.background.height = this.game.world.height;
    this.background.width = this.game.world.width;
    this.background.alpha = 0.1;

    this.cursorPos = 1;
    // Ajout du score
    this.menu = ['NEW GAME', 'CREDITS'];
    for (var i=0; i<this.menu.length; i++) {
        var font = self.createFont(this.menu[i]);
        var img = self.game.add.image(self.game.world.centerX ,self.computePosition(i+1), font);
        img.anchor.set(0.5);
    }

    this.menuCursor = this.game.add.sprite(self.game.world.centerX - 128, this.computePosition(this.cursorPos), 'coin');
    this.menuCursor.anchor.set(0.5);

    this.canContinueToNextState = true;
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.okButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
  }

  update() {
    if ( this.game.time.now > this.timer)
      if (this.cursors.up.isDown) { // fleche du haut
          this.cursorPos++;
          if (this.cursorPos>this.menu.length){
            this.cursorPos = 1;
          }
          this.menuCursor.y = this.computePosition(this.cursorPos);
          this.timer = this.game.time.now + 250;
      } else if (this.cursors.down.isDown) { // fleche du bas
          this.cursorPos--;
          if (this.cursorPos<1){
              this.cursorPos = this.menu.length;
          }
          this.menuCursor.y = this.computePosition(this.cursorPos);
          this.timer = this.game.time.now + 250;
      } else if(this.okButton.isDown) {
          if (this.cursorPos === 1) {
              this.game.state.start('game');
          } else {
              this.game.state.start('menucredits');
          }
      }

  }

  createFont(text) {
      var font = this.game.add.retroFont('fonts', 16, 16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ -0123456789', 20);
      font.text = text;
      return font;
  }

  computePosition(value) {
    var pos = this.game.world.centerY - 48 + (value-1)*48;
    return pos;
  }

}

export default Menu;
