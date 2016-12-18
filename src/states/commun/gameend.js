import Commun from '../commun/commun';

class GameEnd extends Commun {

    constructor() {
        super();
        this.styleBig = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        this.styleSmall = { font: "bold 18px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    }

    create() {
        //add background image
        this.background = this.game.add.sprite(0,0,'background-menu');
        this.background.height = this.game.height;
        this.background.width = this.game.width;
        this.background.alpha = 0.25;

        this.addButtons();

        //prevent accidental click-thru by not allowing state transition for a short time
        this.canContinueToNextState = false;
        this.game.time.events.add(Phaser.Timer.SECOND*0.25, function(){ this.canContinueToNextState = true; }, this);
    }


    update() {

    }

    addScoreAndStars() {
        // ajout des étoiles vides
        for (var i = 0; i < 3; i++) {
            var star = this.game.add.sprite(this.game.centerX - 120 + (120 * i), this.computePosition(2) - 65, 'star-empty');
            star.scale.setTo(0.5);
            star.anchor.set(0.5, 0);
        }
        // ajout des étoiles remplis
        if (this.levelData) {
            this.nbStar = 0;
            for (var j = 0; j < this.levelData.star; j++) {
                this.game.time.events.add(Phaser.Timer.SECOND * ((j * 0.75) + 2.25), function () {
                    var star = this.game.add.sprite(this.game.centerX - 120 + (120 * this.nbStar), this.computePosition(2) - 65, 'star');
                    star.scale.setTo(0.5);
                    star.anchor.set(0.5, 0);
                    this.game.add.audio('starSound').play('', 0, 0.5);
                    this.nbStar++;
                }, this);
            }
        }

        // Ajout du scored sur l'écran
        this.score = this.game.add.text(this.game.centerX, this.computePosition(3),
            this.game.global.score + ' points', this.styleBig);
        this.score.anchor.set(0.5);

        // ajout des vies restantes
        /*for (var i=0; i<this.game.global.player.life; i++) {
         var sprite = this.game.add.sprite(this.game.centerX - 30 + 30*i, this.computePosition(3), 'heartFull');
         sprite.scale.setTo(0.5);
         sprite.anchor.setTo(0.5);
         }
         for (;i<this.game.global.player.maxlife;i++) {
         sprite = this.game.add.sprite(this.game.centerX - 30 + 30*i, this.computePosition(3), 'heartEmpty');
         sprite.scale.setTo(0.5);
         sprite.anchor.setTo(0.5);
         }*/
    }


    computePosition(posY, posX) {
        if (posX) {
            return this.game.centerX - 240 + (posX * 120);
        } else {
            return this.game.centerY - 200 + ((posY - 1) * 48);
        }
    }

}

export default GameEnd;
