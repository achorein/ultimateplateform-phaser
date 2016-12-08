class Moving extends Phaser.Sprite {

    //initialization code in the constructor
    constructor(game, x, y, sprite, frame) {
        super(game, x, y, sprite, frame);
        this.game.physics.arcade.enableBody(this);
        this.body.collideWorldBounds = true;
        this.body.maxVelocity.set(this.game.global.level.maxVelocity);
    }

    init() {
        this.velocityX = this.body.velocity.x;
        this.velocityY = this.body.velocity.y;
    }

    changeDirection() {
        if (this.velocityX != 0) {
            if (this.body.touching.left || this.body.blocked.left) {
                this.scale.x *= -1; // symetrie verticale
                this.body.velocity.x = Math.abs(this.velocityX);
            } else if (this.body.touching.right || this.body.blocked.right) {
                this.scale.x *= -1; // symetrie verticale
                this.body.velocity.x = -Math.abs(this.velocityX);

            }
        }
        if (this.velocityY != 0) {
            if (this.body.touching.up || this.body.blocked.up) {
                this.body.velocity.y = Math.abs(this.velocityY);
            }  else if(this.body.touching.down || this.body.blocked.down) {
                this.body.velocity.y = -Math.abs(this.velocityY);
            }
        }
    }

}

export default Moving;
