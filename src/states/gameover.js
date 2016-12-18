import GameEnd from '../states/commun/gameend';

class GameOver extends GameEnd {

    constructor() {
        super();
    }

    create() {
        super.create();

        // Ajout texte
        if (this.game.global.player.life > 0) {
            var img = this.game.add.sprite(this.game.centerX, 100, 'lose');
        } else {
            var img = this.game.add.sprite(this.game.centerX, 100, 'gameover');
        }
        img.anchor.set(0.5);
        img.fixedToCamera = true;

        // CALCUL DU SCORE REEL ET DES HAUTS FAITS
        this.computeAndSaveScore();

        this.addScoreAndStars();

        // Ajout personnage mort
        var sprite = this.game.add.sprite(this.game.centerX, this.game.centerY, this.game.global.player.sprite, 'idle/01.png');
        sprite.anchor.set(0.5);
        sprite.animations.add('dead', Phaser.Animation.generateFrameNames('dead/', 1, 10, '.png', 2), 10, false, false);
        sprite.animations.play('dead');
        this.game.camera.follow(sprite);

        // Ajout temps écoulé
        this.time = this.game.add.text(this.game.centerX, this.game.centerY + 200,
            this.game.global.level.elapsedTime + ' seconde' + ((this.game.global.level.elapsedTime>1)?'s':''), this.styleSmall);
        this.time.anchor.set(0.5);

        // Lecture du son dédié à l'écran
        this.game.add.audio('failedSound').play('', 0, 0.5);

        this.addButtons();

        // press any key
        this.game.input.keyboard.callbackContext = this;
        this.game.input.keyboard.onDownCallback = function(e) {
            this.onInputDown();
        }
        // click anywhere
        this.game.input.onDown.addOnce(this.game.input.keyboard.onDownCallback, this);
    }

    computeAndSaveScore() {
        // on sauvegarde le score sur le serveur
        this.levelData = this.game.commun.saveScore(this.game.global.score, this.game.global.level.elapsedTime, false);
    }

    goHome() {
        //this.music.stop();
        this.game.state.start('menu-level', true, false);
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

    update() {}

    onInputDown () {
        if(this.canContinueToNextState){
            this.canContinueToNextState = false;
            if (this.game.global.player.life > 0) {
                // si il me reste des vies recommance le niveau
                this.game.global.score = this.game.global.scoreLastLevel;
                this.game.state.start('game', true, false);
            } else {
                this.game.state.start('menu-level', true, false);
            }
        }
    }

}

export default GameOver;
