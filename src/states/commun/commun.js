class Commun extends Phaser.State {

    constructor() {
        super();
    }

    create() {

    }

    addButtons(onlyRight) {
        // bouttons en haut à gauche
        this.homeButton = this.game.add.button(5, 5, 'home', this.goPreviousState, this);
        this.homeButton.scale.setTo(0.25);
        // bouttons en haut à droite
        this.soundButton = this.game.add.button(this.game.width - 50, 5, (this.game.sound.mute) ? 'sound-off' : 'sound-on', this.toggleSound, this);
        this.soundButton.scale.setTo(0.25);
        this.infoButton = this.game.add.button(this.game.width - 100, 5, 'info', function () {
            window.open('http://github.com/achorein/phaserdemo', '_blank');
        }, this);
        this.infoButton.scale.setTo(0.25);
        this.scoreButton = this.game.add.button(this.game.width - 150, 5, 'score', function () {
            this.game.state.start('menu-leaderboard', true, false);
        }, this);
        this.scoreButton.scale.setTo(0.25);

        // inputs
        this.homeKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        this.homeKey.onDown.add(this.goPreviousState, this);
        this.soundKey = this.game.input.keyboard.addKey(Phaser.Keyboard.F8);
        this.soundKey.onDown.add(this.toggleSound, this);

        this.cursors = this.game.input.keyboard.createCursorKeys();
    }

    addCredits() {
        var offset = 15;
        this.game.add.sprite(this.game.centerX, 100, 'logo').anchor.set(0.5);
        this.game.add.sprite(offset, this.game.height - 100 - offset, 'vikings').alpha = 0.5;
        this.game.add.sprite(this.game.width - 117 - offset, this.game.height - 100 - offset, 'phaser').alpha = 0.5;
    }

    update() {
    }

    goPreviousState() {
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

    shutdown() {
        this.game.world.removeAll();
    }

}

export default Commun;
