
class MenuLevel extends Phaser.State {

    constructor() {
        super();
        this.cursorPos = 1;
        this.timer = 0;
        this.menuBox = {
            width: 183,
            heigth: 190,
            length: 4
        };
    }

    create() {
        var styleBig = { font: "bold 64px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        var styleSmall = { font: "bold 48x Arial", fontSize: 32, fill: "#666", boundsAlignH: "center", boundsAlignV: "middle" };
        this.cursorPos = 1;
        this.playerMaxLevel = localStorage.getItem('playerMaxLevel');
        if (!this.playerMaxLevel) {
            this.playerMaxLevel = 1;
        }

        /**
         * AJOUT DES IMAGES EN ARRIERE PLAN
         */
        var offset = 15;
        this.game.add.sprite(this.game.centerX, 100, 'logo').anchor.set(0.5);
        this.game.add.sprite(offset, this.game.height - 100 - offset, 'vikings').alpha = 0.5;
        this.game.add.sprite(this.game.width - 117 - offset , this.game.height - 100 - offset, 'phaser').alpha = 0.5;

        this.levelBloc = this.game.add.sprite(this.game.centerX, this.game.centerY + 75, 'bloc');
        this.levelBloc.anchor.set(0.5);
        this.levelBloc.scale.setTo(0.9);

        /**
         * GESTION DU CONTENU
         */
        this.game.global.player.name = this.game.commun.refreshPlayerName(false);
        this.game.commun.refreshScore();

        this.menu = [];
        for (var i = 0; i<this.game.global.level.max; i++) {
            if (i+1 <= this.playerMaxLevel) {
                // gestion des points du joueur sur le niveau
                var bar = this.game.add.graphics();
                bar.beginFill(0xffffff);
                // Ajout d'une image de preview du niveau
                var levelPreview = this.game.add.sprite(this.computePosition(i+1, 'center').x, this.computePosition(i+1, 'center').y, 'background-trees-level-'+(i+1));
                levelPreview.anchor.set(0.5);
                // création d'un masque permettant d'arrondir l'image de preview
                var mask = this.game.add.graphics();
                mask.beginFill(0xffffff);
                // ajout du carré représentant le niveau
                var sprite = this.game.add.button(this.computePosition(i+1).x, this.computePosition(i+1).y, 'level-ko', function(sprite){
                    this.runLevel(sprite.cursorPos);
                }, this);
                sprite.cursorPos = i+1;
                sprite.alpha = 0.8;
                levelPreview.width = sprite.width;
                levelPreview.height = sprite.height;
                mask.drawRoundedRect(this.computePosition(i+1).x+16, this.computePosition(i+1).y+5, sprite.width-32, sprite.height-30, 30);
                levelPreview.mask = mask;
                // ajout du texte indiquant le numéro du niveau
                var text = this.game.add.text(this.computePosition(i+1, 'center').x, this.computePosition(i+1, 'center').y, ''+(i+1), styleBig);
                text.anchor.set(0.5);
                this.menu.push({index: i+1, sprite: sprite, text: text});
                sprite.onInputOver.add(function(sprite){
                    this.cursorPos = sprite.cursorPos;
                    this.selectLevel();
                }, this);

                bar.drawRoundedRect(this.computePosition(i+1, 'bottom').x+8, this.computePosition(i+1, 'bottom').y-sprite.height/4, sprite.width - 16, sprite.height/2, 30);
                //sprite = this.game.add.sprite(this.computePosition(i+1, 'bottom').x - 5, this.computePosition(i+1, 'bottom').y - 17, 'bloc-points');
                var score = localStorage.getItem('level'+(i+1));
                if (!score) { score = 0; }
                text = this.game.add.text(this.computePosition(i+1, 'bottom-center').x + 5, this.computePosition(i+1, 'bottom').y + 3, score, styleSmall);
                text.anchor.set(0.5, 0);
                this.game.commun.getLevelScore(i+1, text);
            } else {
                var sprite = this.game.add.sprite(this.computePosition(i+1).x, this.computePosition(i+1).y, 'level-locked');
            }
        };
        this.selectLevel(true);

        /**
         * DIVERS
         */
        //setup audio
        this.music = this.game.add.audio('musicMenu', 0.5, true);
        this.music.play();

        // inputs
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.okButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.escapeButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        this.escapeButton.onDown.add(function(){
            this.music.stop();
            this.game.state.start('menu', true, false);
        }, this);
        this.soundButton = this.game.input.keyboard.addKey(Phaser.Keyboard.F8);
        this.soundButton.onDown.add(function(){
            if (this.game.sound.mute) {
                this.game.sound.mute = false;
            } else {
                this.game.sound.mute = true;
            }
        }, this);

        this.canContinueToNextState = true;
    }

    update() {
        if ( this.game.time.now > this.timer)
            if (this.cursors.right.isDown) { // fleche de droite
                this.cursorPos++;
                if (this.cursorPos>this.menu.length){
                    this.cursorPos = 1;
                }
                this.selectLevel();
                this.timer = this.game.time.now + 250;
            } else if (this.cursors.left.isDown) { // fleche du gauche
                this.cursorPos--;
                if (this.cursorPos<1){
                    this.cursorPos = this.menu.length;
                }
                this.selectLevel();
                this.timer = this.game.time.now + 250;
            } else if(this.okButton.isDown) {
                this.runLevel(this.cursorPos);
            }
    }

    runLevel(level) {
        this.game.add.audio('okMenu').play('', 0, 0.5);
        this.music.stop();
        this.game.global.level.current = level;
        this.game.global.score = 0;
        this.game.global.scoreLastLevel = 0;
        this.game.global.player.life = this.game.global.player.maxlife - 1;
        this.game.global.player.name = $('#playerName').val();
        localStorage.setItem('playerName', this.game.global.player.name);
        $('#playerName').prop('disabled', true);
        this.game.state.start('game', true, false);
    }

    selectLevel(ignoreSound) {
        this.menu.forEach(function(level){
            if (level.index == this.cursorPos) {
                level.sprite.loadTexture('level-ok');
                if (!ignoreSound) {
                    this.game.add.audio('miscMenu').play();
                }
            } else {
                level.sprite.loadTexture('level-ko');
            }
        }, this);
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
        var marginY =  marginX;

        //var nbByLine = Math.floor((this.game.width - (marginX*2)) / boxWidth);

        var linePos = Math.floor(pos/(this.menuBox.length+1)) + 1;
        var colPos = ((pos-1) % this.menuBox.length) + 1;

        var posX =  marginX + ((colPos - 1)*boxWidth);
        var posY = marginY + ((linePos - 1)*boxHeight);
        if (position == 'center') {
            posX += Math.floor(this.menuBox.width/2);
            posY += Math.floor(this.menuBox.heigth/2);
        } else if (position == 'bottom') {
            posY += this.menuBox.heigth;
        } else if (position == 'bottom-center') {
            posX += Math.floor(this.menuBox.width/2);
            posY += this.menuBox.heigth;
        }

        var point = {
            line: linePos,
            col: colPos,
            x: posX,
            y: posY + 75
        };
        return point;
    }

    shutdown() {
        this.game.world.removeAll();
    }

}

export default MenuLevel;
