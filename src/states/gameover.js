class GameOver extends Phaser.State {

    constructor() {
        super();
    }

    create() {
        var styleBig = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        var styleSmall = { font: "bold 18px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

        //add background image
        this.background = this.game.add.sprite(0,0,'background-menu');
        this.background.height = this.game.height;
        this.background.width = this.game.width;
        this.background.alpha = 0.25;

        // Ajout texte
        if (this.game.global.player.life > 0) {
            var img = this.game.add.sprite(this.game.centerX, 100, 'lose');
        } else {
            var img = this.game.add.sprite(this.game.centerX, 100, 'gameover');
        }
        img.anchor.set(0.5);

        // Ajout du score
        this.score = this.game.add.text(this.game.centerX, this.computePos(2),
            this.game.global.score + ' points', styleBig);
        this.score.anchor.set(0.5);

        // ajout des vies restantes
        for (var i=0; i<this.game.global.player.life; i++) {
            var sprite = this.game.add.sprite(this.game.centerX - 30 + 30*i, this.computePos(3), 'heartFull');
            sprite.scale.setTo(0.5);
            sprite.anchor.setTo(0.5);
        }
        for (;i<this.game.global.player.maxlife;i++) {
            sprite = this.game.add.sprite(this.game.centerX - 30 + 30*i, this.computePos(3), 'heartEmpty');
            sprite.scale.setTo(0.5);
            sprite.anchor.setTo(0.5);
        }

        // Ajout personnage mort
        sprite = this.game.add.sprite(this.game.centerX, this.game.centerY, this.game.global.player.sprite, 'idle/01');
        sprite.anchor.set(0.5);
        sprite.animations.add('dead', Phaser.Animation.generateFrameNames('dead/', 1, 10, '', 2), 10, false, false);
        sprite.animations.play('dead');
        this.game.camera.follow(sprite);

        // Ajout temps écoulé
        this.time = this.game.add.text(this.game.centerX, this.game.centerY + 200,
            this.game.global.level.elapsedTime + ' seconde' + ((this.game.global.level.elapsedTime>1)?'s':''), styleSmall);
        this.time.anchor.set(0.5);

        // Lecture du son dédié à l'écran
        this.game.add.audio('failedSound').play('', 0, 0.5);

        // on sauvegarde le score sur le serveur
        this.game.commun.saveScore();

        //prevent accidental click-thru by not allowing state transition for a short time
        this.canContinueToNextState = false;
        this.game.time.events.add(Phaser.Timer.SECOND*0.25, function(){ this.canContinueToNextState = true; }, this);

        // press any key
        this.game.input.keyboard.callbackContext = this;
        this.game.input.keyboard.onDownCallback = function(e) {
            this.onInputDown();
        }
    }

    update() {}

    onInputDown () {
        if(this.canContinueToNextState){
            this.canContinueToNextState = false;
            if (this.game.global.player.life > 0) {
                // si il me reste des vies recommance le niveau
                this.game.global.score = this.game.global.scoreLastLevel;
                this.game.state.start('game', true, false);
            } else {
                this.game.state.start('menu', true, false);
            }
        }
    }

    computePos(index) {
        return this.game.centerY - 200 + ((index - 1) * 48);
    }
}

export default GameOver;
