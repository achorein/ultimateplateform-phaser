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
        //add background image
        this.background = this.game.add.sprite(0,0, 'background-menu');
        this.background.height = this.game.height;
        this.background.width = this.game.width;
        this.background.alpha = 0.25;

        this.cursorPos = 1;

        // Ajout personnages
        this.menu = [
            {index: 1, name:'SB', description:[
                'Se faufiller dans des situations peu confortables est votre quotidien,',
                'vous allez devoir user de votre agilité pour mener à bien votre mission.'
            ], texture:'ninja'},
            {index: 2, name:'ARC', description:[
                'A la recherche des meilleurs artefacts permettant de construire des applications',
                'toujours plus évoluées, vous allez braver les dangers qui vous attendent.'
            ], texture:'robot'},
            {index: 3, name:'BA', description:[
                'Vous partez à l\'aventure à la recherche des parchemins sacrés,',
                'décrivant les besoins cachés d\'utilisateurs toujours plus vicieux.'
            ], texture:'adventure_girl'},
            {index: 4, name:'PM', description:[
                'Afin de financer votre projet vous partez vous battre contre une armée de problèmes',
                'pour collecter un trésor qui n\'a d\'égal que votre ambition.'
            ], texture:'knight'}
        ];

        var offset = 15;
        this.game.add.sprite(this.game.centerX, 100, 'logo').anchor.set(0.5);
        this.game.add.sprite(offset, this.game.height - 100 - offset, 'vikings').alpha = 0.5;
        this.game.add.sprite(this.game.width - 117 - offset , this.game.height - 100 - offset, 'phaser').alpha = 0.5;

        /*var font = this.createFont('CHOOSE YOUR PLAYER');
        var img = this.game.add.image(this.game.centerX, 200, font);
        img.anchor.set(0.5);*/

        var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        this.menu.forEach(function(player) {
            var sprite = this.game.add.button(this.computePosition(player.index), this.game.centerY - 50, player.texture, function(sprite){
                this.cursorPos = sprite.cursorPos;
                this.goNextState();
            }, this, 'idle/01.png');
            sprite.cursorPos = player.index;
            sprite.anchor.set(0.5);
            sprite.animations.add('idle', Phaser.Animation.generateFrameNames('idle/', 1, 10, '.png', 2), 10, true, false);
            sprite.scale.setTo(1);
            player.sprite = sprite;
            var text = this.game.add.text(this.computePosition(player.index), this.game.centerY + 100, player.name, style);
            text.anchor.set(0.5);
            player.text = text;
            sprite.onInputOver.add(function(sprite){
                this.cursorPos = sprite.cursorPos;
                this.selectPlayer();
            }, this);
        }, this);

        //setup audio
        this.music = this.game.add.audio('musicMenu', 0.5, true);
        this.music.play();

        this.selectPlayer(true);

        this.loadData();

        this.canContinueToNextState = true;
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.okButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.soundButton = this.game.input.keyboard.addKey(Phaser.Keyboard.F8);
        this.soundButton.onDown.add(function(){
            if (this.game.sound.mute) {
                this.game.sound.mute = false;
            } else {
                this.game.sound.mute = true;
            }
        }, this);
    }

    loadData() {
        this.game.global.player.name = this.game.commun.refreshPlayerName(false);
        this.game.commun.refreshScore();
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
               this.goNextState();
            }
    }

    goNextState() {
        this.game.add.audio('okMenu').play('', 0, 0.5);
        this.game.global.player.sprite = this.menu[this.cursorPos-1].texture;
        this.music.stop();
        localStorage.setItem('playerName', this.game.global.player.name);
        this.game.state.start('menu-level', true, false);
    }

    selectPlayer(ignoreSound) {
        this.menu.forEach(function(player){
            if (player.index == this.cursorPos) {
                player.sprite.scale.setTo(1);
                player.text.scale.setTo(1.25);
                player.sprite.animations.play('idle');
                if (!ignoreSound) {
                    this.game.add.audio('miscMenu').play();
                }
                wordIndex = -1;
                lineIndex = -1;
                this.game.time.events.add(lineDelay, this.writeText, this);
            } else {
                player.sprite.animations.stop();
                player.sprite.scale.setTo(0.8);
                player.text.scale.setTo(1);
            }
        }, this);
    }

    computePosition(index) {
        var squareWidth = 250;
        var min = this.menu.length/2 * squareWidth/2;
        var value = this.cursorPos;
        if (index) {
            value = index;
        }
        var pos = (this.game.centerY - min) + (value-1)*squareWidth;
        return pos;
    }

    writeText(){
        var barX = 128;
        var barY = this.game.height - 250;
        var bar = this.game.add.graphics();
        bar.beginFill(0xEEEEEE, 1);
        bar.drawRoundedRect(barX, barY, 800, 100, 5);
        this.text = this.game.add.text(barX + 18, barY + 18, '', { font: "18px Arial", fill: "#666" });
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
