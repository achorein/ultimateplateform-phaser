import Moving from '../prefabs/moving';

class Enemy extends Moving {

    //initialization code in the constructor
    constructor(game, tile) {
        var sprite = 'spider';
        if (tile.properties.sprite) {
            sprite = tile.properties.sprite;
        }
        var offsetX = (tile.properties.offsetX)?tile.properties.offsetX:16;
        var offsetY = (tile.properties.offsetY)?tile.properties.offsetY:16;
        if (tile.properties.offset) {
            offsetX = tile.properties.offset;
            offsetY = tile.properties.offset;
        }

        super(game, tile.x * tile.width + offsetX, tile.y * tile.height + offsetY, sprite, 1);
        this.body.gravity.set(0, -this.game.global.level.gravity);
        if (tile.properties.velocity) {
            this.body.velocity.x = tile.properties.velocity;
        } else {
            this.body.velocity.x = -75;
        }
        this.anchor.setTo(.5, 0);
        if (tile.properties.scale){
            this.scale.setTo(tile.properties.scale);
        }
        if (tile.properties.miror) {
            this.scale.x *= -1; // symetrie verticale
        }

        if (tile.properties.atlas) {
            this.animations.add('dead', Phaser.Animation.generateFrameNames('dead/', 1, 8, '.png', 2), 6, false, false);
            this.animations.add('walk', Phaser.Animation.generateFrameNames('walk/', 1, 10, '.png', 2), 10, true, false);
            this.animations.play('walk');
        } else {
            this.animations.add('walk', [1, 2], 2, true);
            this.animations.add('dead', [0], 2, false);
            this.animations.play('walk');
        }


        this.invincible = tile.properties.invincible;

        if (tile.properties.points) {
            this.points = tile.properties.points;
        } else {
            this.points = 25;
        }

        this.init();
    }

}

export default Enemy;
