import GameEnd from '../states/commun/gameend';

class Victory extends GameEnd {

    constructor() {
        super();
    }

    create() {
        super.create();

        // Ajout texte
        if (this.game.global.level.current >= this.game.global.level.max) {
            var img = this.game.add.sprite(this.game.centerX, 100, 'finished');
        } else {
            var img = this.game.add.sprite(this.game.centerX, 100, 'victory');
        }
        img.anchor.set(0.5);
        img.fixedToCamera = true;

        // CALCUL DU SCORE REEL ET DES HAUTS FAITS
        this.computeAndSaveScore();

        this.addScoreAndStars();

        // Ajout personnage qui saute
        var sprite = this.game.add.sprite(this.game.centerX, this.game.centerY + 50, this.game.global.player.sprite, 'idle/01.png');
        sprite.anchor.set(0.5);
        sprite.animations.add('jump', Phaser.Animation.generateFrameNames('jump/', 1, 10, '.png', 2), 10, true, false);
        sprite.animations.play('jump');
        this.game.camera.follow(sprite);

        // Ajout temps écoulé
        this.time = this.game.add.text(this.game.centerX, this.game.centerY + 200,
            this.game.global.level.elapsedTime + ' seconde' + ((this.game.global.level.elapsedTime>1)?'s':''), this.styleSmall);
        this.time.anchor.set(0.5);

        // Ajout résumé des bonus
        var curPos = 10, i=1;
        this.game.global.player.collected.forEach(function(bonus) {
            sprite = this.game.add.sprite(this.computePosition(curPos, i) - 24, this.computePosition(curPos), bonus.sprite, bonus.frame);
            if (bonus.scale) {
                sprite.scale.setTo(bonus.scale*0.7);
            } else {
                sprite.scale.setTo(0.7);
            }
            sprite.anchor.setTo(0.5);
            this.game.add.text(this.computePosition(curPos, i) + 24, this.computePosition(curPos), bonus.count, this.styleSmall).anchor.set(0.5);
            if (i%3 == 0) {
                curPos++;
                i = 1;
            } else {
                i++;
            }
        }, this);

        // Lecture du son dédié à l'écran
        this.game.add.audio('winnerSound').play('', 0, 0.5);

        this.addButtons();

        // press any key
        this.game.input.keyboard.callbackContext = this;
        this.game.input.keyboard.onDownCallback = function(e) {
            this.onInputDown(this);
        }
        // click anywhere
        this.game.input.onDown.addOnce(this.game.input.keyboard.onDownCallback, this);
    }

    computeAndSaveScore() {
        // Ajout du bonus de temps
        this.config = this.game.cache.getJSON('level-config')[this.game.global.level.current-1];
        var bestTime = this.config.bestTime || 40;
        var playerTime = (this.game.global.level.elapsedTime<bestTime)?bestTime:this.game.global.level.elapsedTime;
        var bonusTemps = Math.floor(bestTime * 1000 / playerTime);
        console.log('bestTime : ' + bestTime + ', ' + playerTime + ', bonus: ' + bonusTemps);
        this.game.global.score += bonusTemps;

        // Ajout du bonus de vie
        this.game.global.score += 50 * this.game.global.player.life;

        // sauvegarde du score
        this.levelData = this.game.commun.saveScore(this.game.global.score, this.game.global.level.elapsedTime, true);
        this.game.global.scoreLastLevel = this.game.global.score;
        var oldMaxLevel = localStorage.getItem('playerMaxLevel');
        if (!oldMaxLevel || parseInt(oldMaxLevel) < this.game.global.level.current+1) {
            localStorage.setItem('playerMaxLevel', this.game.global.level.current + 1);
        }
    }

    update() {}

    onInputDown () {
        if(this.canContinueToNextState){
            this.canContinueToNextState = false;
            if (this.game.global.level.current < this.game.global.level.max) {
                this.game.global.level.current++;
                this.game.state.start('game', true, false);
            } else {
                this.game.state.start('menu-level', true, false);
            }
        }
    }


}

export default Victory;
