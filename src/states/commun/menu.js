import Commun from '../commun/commun';

class Menu extends Commun {

    constructor() {
        super();
        this.cursorPos = 1;
        this.timer = 0;
        this.nbItem = 1;

        this.menuBox = {
            width: 250,
            heigth: 250,
            length: 4
        };
        this.styleSmall = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        this.style = { font: "bold 48x Arial", fontSize: 32, fill: "#666", boundsAlignH: "center", boundsAlignV: "middle" };
        this.styleBig = { font: "bold 64px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    }

    create() {
        //add background image
        this.background = this.game.add.sprite(0,0, 'background-menu');
        this.background.height = this.game.height;
        this.background.width = this.game.width;
        this.background.alpha = 0.25;

        this.cursorPos = 1;
        this.addCredits();

        //setup audio
        this.music = this.game.add.audio('musicMenu', 0.5, true);
        this.music.play();

        this.addButtons();
        this.okButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.okButton.onDown.add(this.goNextState, this);

        this.canContinueToNextState = true;
    }

    update() {
        if ( this.game.time.now > this.timer)
            if (this.cursors.right.isDown) { // fleche de droite
                this.cursorPos++;
                if (this.cursorPos>this.menu.length){
                    this.cursorPos = 1;
                }
                this.selectItem();
                this.timer = this.game.time.now + 250;
            } else if (this.cursors.left.isDown) { // fleche du gauche
                this.cursorPos--;
                if (this.cursorPos<1){
                    this.cursorPos = this.menu.length;
                }
                this.selectItem();
                this.timer = this.game.time.now + 250;
            } else if (this.cursors.up.isDown) { // fleche du haut
                var newPos = this.cursorPos - this.menuBox.length;
                if (newPos > 0) {
                    this.cursorPos = newPos;
                }
                this.selectItem();
                this.timer = this.game.time.now + 250;
            } else if (this.cursors.down.isDown) { // fleche du bas
                var newPos = this.cursorPos + this.menuBox.length;
                if (newPos <= this.nbItem) {
                    this.cursorPos = newPos;
                }
                this.selectItem();
                this.timer = this.game.time.now + 250;
            }
    }

    selectItem(ignoreSound) {
    }

    goNextState(cursorPos) {
        this.game.add.audio('okMenu').play('', 0, 0.5);
        this.music.stop();
    }

    goPreviousState(cursorPos) {
        this.game.add.audio('okMenu').play('', 0, 0.5);
        this.music.stop();
    }

    computePosition(index, position) {
        var pos = this.cursorPos;
        if (index) {
            pos = index;
        }

        var paddingX = Math.floor(this.menuBox.width*0.1);
        var paddingY = Math.floor(this.menuBox.heigth*0.3);

        var boxWidth = this.menuBox.width + paddingX;
        var boxHeight = this.menuBox.heigth + paddingY;
        //console.log(this.menuBox.height + ','+ paddingY + ',' + boxHeight);

        var marginX =  Math.floor((this.game.width - (this.menuBox.length * boxWidth))/2);
        var marginY =  Math.floor((this.game.height - (Math.ceil(this.game.global.level.max/this.menuBox.length) * boxHeight))/2);

        //var nbByLine = Math.floor((this.game.width - (marginX*2)) / boxWidth);

        var linePos = Math.floor(pos/(this.menuBox.length+1)) + 1;
        var colPos = ((pos-1) % this.menuBox.length) + 1;

        var posX =  marginX + ((colPos - 1)*boxWidth);
        var posY = marginY + ((linePos - 1)*boxHeight);
        if (!position  || position == 'center') {
            posX += Math.floor(this.menuBox.width/2);
            posY += Math.floor(this.menuBox.heigth/2);
        } else if (position == 'bottom') {
            posY += this.menuBox.heigth;
        } else if (position == 'bottom-center') {
            posX += Math.floor(this.menuBox.width/2);
            posY += this.menuBox.heigth;
        } else if (position == 'top') {
            // rien à faire
        }

        var point = {
            line: linePos,
            col: colPos,
            x: posX,
            y: posY + 75
        };
        return point;
    }

}

export default Menu;
