
class MenuCredits extends Phaser.State {

  constructor() {
    super();
  }
  
  create() {
    var self = this;
    //add background image
      this.background = this.game.add.image(0,0, 'swirl');
      this.background.height = this.game.world.height;
      this.background.width = this.game.world.width;

      //	This is the BitmapData we're going to be drawing to
      this.bmd = this.game.add.bitmapData(this.game.width, this.game.height);

      //	Black and opaque
      this.bmd.fill(0, 0, 0, 1);

      this.bmd.addToWorld();

      //	Our text object
      this.text = this.game.make.text(0, 0, "v1kings.io", { font: "bold 32px Arial", fill: "#ff0044" });
      this.text.anchor.set(0.5);

      this.game.add.tween(this.text.scale).to( { x: 0.5, y: 0.5 }, 2000, Phaser.Easing.Linear.None, true, 0, Number.MAX_VALUE, true);

      this.escButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
  }

  update() {

      this.bmd.fill(0, 0, 0, 0.05);

      this.bmd.draw(this.text, this.game.world.randomX, this.game.world.randomY, null, null, 'destination-out');

      if(this.escButton.isDown) {
          this.game.state.start('menu');
      }

  }

}

export default MenuCredits;
