class Victory extends Phaser.State {

    constructor() {
        super();
    }

    create() {
        var self = this;
        //add background image
        this.background = this.game.add.sprite(0,0,'background');
        this.background.height = this.game.world.height;
        this.background.width = this.game.world.width;
        this.background.alpha = 0.25;

        // Ajout du score
        if (this.game.global.level == this.game.global.levelmax) {
            this.gameover = this.createFont('GAME FINISHED');
        } else {
            this.gameover = this.createFont('VICTORY');
        }

        var img = this.game.add.image(this.game.world.centerX,this.game.world.centerY - 250, this.gameover);
        img.anchor.set(0.5);

        // Ajout temps écoulé
        var style = { font: "bold 18px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        var text = self.game.add.text(self.game.world.centerX, self.game.world.centerY - 200, this.game.global.elapsedTime + ' seconde' + ((this.game.global.elapsedTime>1)?'s':''), style);
        text.anchor.set(0.5);

        // Ajout résumé des bonus
        console.log(this.game.global.collected);
        var sprite = this.game.add.sprite(this.game.world.centerX - 32, this.game.world.centerY - 150, 'coin');
        sprite.scale.setTo(0.7);
        sprite.anchor.setTo(0.5);
        this.game.add.text(this.game.world.centerX + 32, this.game.world.centerY - 150, this.game.global.collected.coin.count, style).anchor.set(0.5);

        sprite = this.game.add.sprite(this.game.world.centerX - 32, this.game.world.centerY - 100, 'gem');
        sprite.scale.setTo(0.7);
        sprite.anchor.setTo(0.5);
        this.game.add.text(this.game.world.centerX + 32, this.game.world.centerY - 100, this.game.global.collected.gem.count, style).anchor.set(0.5);

        // Ajout du bonus de temps
        this.game.global.score += Math.floor(1500 / this.game.global.elapsedTime);

        // Ajout du score
        this.score = this.createFont('SCORE '+ this.game.global.score);
        img = this.game.add.image(this.game.world.centerX,this.game.world.centerY+200, this.score);
        img.anchor.set(0.5);

        // press any key
        this.game.input.keyboard.onDownCallback = function(e) {
            self.onInputDown(self);
        }

        this.game.add.audio('winnerSound').play();

        var sprite = self.game.add.sprite(self.game.world.centerX, self.game.world.centerY + 50, this.game.global.playerSprite, 'idle/01');
        sprite.anchor.set(0.5);
        sprite.animations.add('jump', Phaser.Animation.generateFrameNames('jump/', 1, 10, '', 2), 10, true, false);
        sprite.animations.play('jump');
        this.game.camera.follow(sprite);

        //prevent accidental click-thru by not allowing state transition for a short time
        this.canContinueToNextState = false;
        this.game.time.events.add(Phaser.Timer.SECOND * 2, function(){ this.canContinueToNextState = true; }, this);

        this.saveVarsToLocalStorage();
        this.resetGlobalVariables();
    }

    saveVarsToLocalStorage(){
        var max = localStorage["maxScore"] || 0; //default value of 0 is it does not exist
        if (this.game.global.score > max){ localStorage["maxScore"] = this.game.global.score; }
    }

    resetGlobalVariables(){
        //this.game.global.score = 0;
    }
    update() {}

    createFont(text) {
        var font = this.game.add.retroFont('fonts', 16, 16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ -0123456789', 20);
        font.text = text;
        return font;
    }

    onInputDown () {
        if(this.canContinueToNextState){
            if (this.game.global.level < this.game.global.levelmax) {
                this.game.global.level++;
                this.game.state.start('game');
            }
        }
    }

}

export default Victory;
