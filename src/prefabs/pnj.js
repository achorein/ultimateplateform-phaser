import Moving from '../prefabs/moving';

class PNJ extends Moving {

    //initialization code in the constructor
    constructor(game, tile) {
        var sprite = 'ninjagirl';
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
        if (tile.properties.scale){
            this.scale.setTo(tile.properties.scale);
        }
        if (tile.properties.miror) {
            this.scale.x *= -1; // symetrie verticale
        }
        this.anchor.setTo(.5, 0);
        if (!tile.properties.gravity) {
            this.body.gravity.set(0, -this.game.global.level.gravity); // annulation de la gravité
        }
        this.body.immovable = true;

        if (tile.properties.atlas) {
            this.animations.add('idle', Phaser.Animation.generateFrameNames('idle/', 1, 10, '.png', 2), 10, true, false);
        } else {
            this.animations.add('idle', [0, 1], 2, true);
        }
        this.animations.play('idle');

        this.text = tile.properties.text;
        this.textOffsetX = (tile.properties.textOffsetX)?tile.properties.textOffsetX:32;
        this.textOffsetY = (tile.properties.textOffsetY)?tile.properties.textOffsetY:-64;
        this.textTime = (tile.properties.textTime)?tile.properties.textTime:4000 ;

        this.init();
    }

    static pnjOverlapCallback(player, pnj) {
        // afficher le texte
        if (pnj.text && !pnj.textBloc) {
            pnj.textBloc = this.game.add.text(pnj.x + pnj.textOffsetX, pnj.y + pnj.textOffsetY, pnj.text, {
                font: "14px Arial", fill: "#fff", wordWrap: true, wordWrapWidth: 200, align: "center",
                stroke: '#000000', strokeThickness: 6
            });
            this.game.time.events.add(pnj.textTime, function() {
                pnj.textBloc.kill();
                pnj.textBloc = null;
            });
        }
    }

}

export default PNJ;
