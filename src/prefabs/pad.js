class Pad extends Phaser.Sprite {

    //initialization code in the constructor
    constructor(game) {
        super(game, 5, game.height - 170, 'pad');
        this.alpha = 0.1;
        this.fixedToCamera = true;

        /*this.up = this.addButton(this.game.add.button(this.x + 53, this.y, 'pad-up'));
        this.left = this.addButton(this.game.add.button(this.x + 4, this.y + 55, 'pad-left'));
        this.right = this.addButton(this.game.add.button(this.x + 81, this.y + 55, 'pad-right'));
        this.down = this.addButton(this.game.add.button(this.x + 53, this.y + 82, 'pad-down'));*/
        this.up = {};
        this.down = {};
        this.right = {};
        this.left = {};

        this.buttonA = this.addButton(this.game.add.button(game.width - 235, game.height - 150, 'button-a'));
        this.buttonB = this.addButton(this.game.add.button(game.width - 125, game.height - 150, 'button-b'));
    }

    addButton(button) {
        button.fixedToCamera = true;
        button.alpha = 0.5;
        button.onInputDown.add(function(){
            this.isDown = true;
        }, button);
        button.onInputUp.add(function(){
            this.isDown = false;
        }, button);
        return button;
    }

}

export default Pad;
