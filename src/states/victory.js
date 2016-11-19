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
        this.background.alpha = 0.1;

        // Ajout du score
        this.gameover = this.createFont('VICTORY');
        var img = this.game.add.image(this.game.world.centerX,this.game.world.centerY-20, this.gameover);
        img.anchor.set(0.5);

        // Ajout du score
        this.score = this.createFont('SCORE '+ this.game.global.score);
        img = this.game.add.image(this.game.world.centerX,this.game.world.centerY+20, this.score);
        img.anchor.set(0.5);

        // press any key
        this.game.input.keyboard.onDownCallback = function(e) {
            self.onInputDown(self);
        }

        this.game.add.audio('winnerSound').play();

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
        this.game.global.score = 0;
    }
    update() {}

    createFont(text) {
        var font = this.game.add.retroFont('fonts', 16, 16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ -0123456789', 20);
        font.text = text;
        return font;
    }

    onInputDown () {
        if(this.canContinueToNextState){
            this.game.state.start('menu');
        }
    }

}

export default Victory;
