import Moving from '../prefabs/moving';

class SpecialBloc extends Moving {

    //initialization code in the constructor
    constructor(game, tile) {
        super(game, tile.x * tile.width, tile.y * tile.height, "world", tile.index - 1);

        if (tile.properties.x) {
            this.body.velocity.x = parseInt(tile.properties.x);
        }
        if (tile.properties.y) {
            this.body.velocity.y = parseInt(tile.properties.y);
        }

        if (!tile.properties.pushable) {
            this.body.gravity.set(0, -this.game.global.level.gravity);
            this.body.immovable = true;
        } else {
            this.body.bounce.set(0.8, 0.1);
            //this.body.friction.set(1000);
        }
        if (tile.properties.fallingTime) {
            this.fallingTime = tile.properties.fallingTime;
        }
        if (tile.properties.lock) {
            this.lockColor = tile.properties.lock;
        }
        if (tile.properties.destructable) {
            this.destructable = tile.properties.destructable;
        }
        if (tile.properties.alpha) {
            this.alpha = tile.properties.alpha;
        }
        this.switchname = tile.properties.switchname;

        this.init();
    }

}

export default SpecialBloc;
