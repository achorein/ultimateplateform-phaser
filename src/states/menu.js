var line = [];
var wordIndex = 0;
var lineIndex = 0;

var wordDelay = 180;
var lineDelay = 500;

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
    this.background.alpha = 0.25;

    this.cursorPos = 1;

    // Ajout personnages
    this.menu = [
      {index: 1, name:'SB', description:[
          'Se faufiller dans des situations peu confortable est votre quotidien,',
          'vous allez devoir user de votre agilité pour mener à bien votre mission.'
      ], texture:'ninjaPlayer'},
      {index: 2, name:'ARC', description:[
          'A la recherche des meilleurs artefacts permettant de construire des applications',
          'toujours plus évoluées, vous aller braver les dangers qui vous attendent.'
      ], texture:'robotPlayer'},
      {index: 3, name:'BA', description:[
          'Vous partez à l\'aventure à la recherche des parchemins sacrés,',
          'décrivant les besoins cachés d\'utilisateurs toujours plus vicieux.'
      ], texture:'adventurePlayer'},
      {index: 4, name:'PM', description:[
          'Afin de financer votre projet vous partez vous battre contre une armée de problèmes',
          'afin de collecter un trésor qui n\'a d\'égale que votre ambition.'
      ], texture:'knightPlayer'}
    ];

    var font = self.createFont('CHOOSE YOUR PLAYER');
    var img = self.game.add.image(self.game.world.centerX, 32, font);
    img.anchor.set(0.5);

    var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    this.menu.forEach(function(player) {
      var sprite = self.game.add.sprite(self.computePosition(self, player.index), self.game.world.centerY - 150, player.texture, 'idle/01');
      sprite.anchor.set(0.5);
      sprite.animations.add('idle', Phaser.Animation.generateFrameNames('idle/', 1, 10, '', 2), 10, true, false);
      sprite.scale.setTo(0.7);
      player.sprite = sprite;
      var text = self.game.add.text(self.computePosition(self, player.index), self.game.world.centerY, player.name, style);
      text.anchor.set(0.5);
    });

    //setup audio
    this.music = this.game.add.audio('musicMenu', 0.5, true);
    this.music.play();

    this.selectPlayer(true);

    //  This is our BitmapData onto which we'll draw the word being entered
    this.bmd = this.game.make.bitmapData(800, 200);
    this.bmd.context.font = '64px Arial';
    this.bmd.context.fillStyle = '#ffffff';
    this.bmd.context.fillText(this.game.global.playerName, 64, this.game.world.height - 200);
    this.bmd.addToWorld();

    this.canContinueToNextState = true;
    this.game.input.keyboard.addCallbacks(this, null, null, this.keyPress); //  Capture all key presses
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.okButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
  }

  update() {

      if ( this.game.time.now > this.timer)
      if (this.cursors.right.isDown) { // fleche de droite
          this.cursorPos++;
          if (this.cursorPos>this.menu.length){
            this.cursorPos = 1;
          }
          this.selectPlayer();
          this.timer = this.game.time.now + 250;
      } else if (this.cursors.left.isDown) { // fleche du gauche
          this.cursorPos--;
          if (this.cursorPos<1){
              this.cursorPos = this.menu.length;
          }
          this.selectPlayer();
          this.timer = this.game.time.now + 250;
      } else if(this.okButton.isDown) {
          this.game.add.audio('okMenu').play('', 0, 0.5);
          this.game.global.playerSprite = this.menu[this.cursorPos-1].texture;
          this.music.stop();
          this.game.global.level = 1;
          this.game.global.life = 3;
          this.game.state.start('game', true, false);
      }
  }

  selectPlayer(ignoreSound) {
      var self = this;
      this.menu.forEach(function(player){
          if (player.index == self.cursorPos) {
            player.sprite.scale.setTo(1);
            player.sprite.animations.play('idle');
            if (!ignoreSound) {
                self.game.add.audio('miscMenu').play();
            }
            wordIndex = -1;
            lineIndex = -1;
            self.game.time.events.add(lineDelay, self.writeText, self);
          } else {
            player.sprite.animations.stop();
            player.sprite.scale.setTo(0.7);
          }
      });
  }

  createFont(text) {
      var font = this.game.add.retroFont('fonts', 16, 16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ -0123456789', 20);
      font.text = text;
      return font;
  }

  computePosition(self, index) {
    var squareWidth = 250;
    var min = self.menu.length/2 * squareWidth/2;
    var value = self.cursorPos;
    if (index) {
        value = index;
    }
    var pos = (self.game.world.centerY - min) + (value-1)*squareWidth;
    return pos;
  }

  keyPress(char){
      //  Clear the BMD
      this.bmd.cls();

      //  Set the x value we'll start drawing the text from
      //var x = 64;
      //this.bmd.context.fillText(letter, x, 64);
      //x += this.bmd.context.measureText(letter).width;
  }

  writeText(){
      var barX = 128;
      var barY = this.game.world.height - 350;
      var bar = this.game.add.graphics();
      bar.beginFill(0x666666, 1);
      bar.drawRoundedRect(barX, barY, 800, 100, 5);
      this.text = this.game.add.text(barX + 18, barY + 18, '', { font: "18px Arial", fill: "#FFF" });
      this.text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
      line = [];
      wordIndex = 0;
      lineIndex = 0;
      this.nextLine();
  }

  nextLine() {
    var content = this.menu[this.cursorPos-1].description;
    if (lineIndex<0 || lineIndex >= content.length) {
        //  We're finished
        return;
    }
    //  Split the current line on spaces, so one word per array element
    line = content[lineIndex].split(' ');
    //  Reset the word index to zero (the first word in the line)
    wordIndex = 0;
    //  Call the 'nextWord' function once for each word in the line (line.length)
    this.game.time.events.repeat(wordDelay, line.length, this.nextWord, this);
    //  Advance to the next line
    lineIndex++;
  }

  nextWord() {
    if (wordIndex<0 || !line[wordIndex]) {
      return;
    }
    //  Add the next word onto the text string, followed by a space
    this.text.text = this.text.text.concat(line[wordIndex] + " ");
    //  Advance the word index to the next word in the line
    wordIndex++;
    //  Last word?
    if (wordIndex >= line.length) {
        //  Add a carriage return
        this.text.text = this.text.text.concat("\n");
        //  Get the next line after the lineDelay amount of ms has elapsed
        this.game.time.events.add(lineDelay, this.nextLine, this);
    }
  }

   shutdown() {
    this.game.world.removeAll();
   }

}

export default Menu;
