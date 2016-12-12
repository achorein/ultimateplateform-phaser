class Menu extends Phaser.State {

    constructor() {
        super();
        this.cursorPos = 1;
        this.timer = 0;

        this.menuBox = {
            width: 250,
            heigth: 250,
            length: 4
        };

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
    }

    create() {
        //add background image
        this.background = this.game.add.sprite(0,0, 'background-menu');
        this.background.height = this.game.height;
        this.background.width = this.game.width;
        this.background.alpha = 0.25;

        this.cursorPos = 1;

        // Ajout personnages


        var offset = 15;
        this.game.add.sprite(this.game.centerX, 100, 'logo').anchor.set(0.5);
        this.game.add.sprite(offset, this.game.height - 100 - offset, 'vikings').alpha = 0.5;
        this.game.add.sprite(this.game.width - 117 - offset , this.game.height - 100 - offset, 'phaser').alpha = 0.5;

        var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        this.menu.forEach(function(player) {
            var sprite = this.game.add.button(this.computePosition(player.index).x, this.game.centerY - 50, player.texture, function(sprite){
                this.cursorPos = sprite.cursorPos;
                this.goNextState();
            }, this, 'idle/01.png');
            sprite.cursorPos = player.index;
            sprite.anchor.set(0.5);
            sprite.animations.add('idle', Phaser.Animation.generateFrameNames('idle/', 1, 10, '.png', 2), 10, true, false);
            sprite.scale.setTo(1);
            player.sprite = sprite;
            var text = this.game.add.text(this.computePosition(player.index).x, this.game.centerY + 100, player.name, style);
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

        this.soundButton = this.game.add.button(this.game.width - 50, 5, (this.game.sound.mute)?'sound-off':'sound-on', this.toggleSound, this);
        this.soundButton.scale.setTo(0.25);
        this.infoButton = this.game.add.button(this.game.width - 100, 5, 'info', function() {
            window.open('http://github.com/achorein/phaserdemo','_blank');
        }, this);
        this.infoButton.scale.setTo(0.25);

        this.selectPlayer(true);

        this.loadData();

        this.canContinueToNextState = true;
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.okKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.soundKey = this.game.input.keyboard.addKey(Phaser.Keyboard.F8);
        this.soundKey.onDown.add(this.toggleSound, this);
    }

    toggleSound() {
        if (this.game.sound.mute) {
            this.game.sound.mute = false;
            this.soundButton.loadTexture('sound-on');
        } else {
            this.game.sound.mute = true;
            this.soundButton.loadTexture('sound-off');
        }
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
            } else if(this.okKey.isDown) {
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
                /*wordIndex = -1;
                lineIndex = -1;
                this.game.time.events.add(lineDelay, this.writeText, this);*/
            } else {
                player.sprite.animations.stop();
                player.sprite.scale.setTo(0.8);
                player.text.scale.setTo(1);
            }
        }, this);
    }

    /*computePosition(index) {
        var squareWidth = 250;
        var min = this.menu.length/2 * squareWidth/2;
        var value = this.cursorPos;
        if (index) {
            value = index;
        }
        var pos = (this.game.centerX - min) + (value-1)*squareWidth;
        return pos;
    }*/

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
        if (!position || position == 'center') {
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

export default Menu;
