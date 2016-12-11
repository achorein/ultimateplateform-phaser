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
        if (tile.properties.friction) {
            this.body.friction.x = tile.properties.friction;
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

    static specialBlocCallback(player, bloc) {
        var game = player.game;
        // quand le joueur est sur un bloc, incrémente un compteur
        if (player.body.touching.down && bloc.fallingTime) {
            game.time.events.add(bloc.fallingTime, function () {
                player.animations.play('jump');
                // chute du bloc
                bloc.body.gravity.set(0);
                bloc.body.immovable = false;
                // fait disparaitre le bloc au bout de 2 secondes
                game.add.tween(bloc).to({alpha: 0}, 2000, Phaser.Easing.Linear.None, true);
                game.time.events.add(2000, function () {
                    bloc.kill();
                }, this);
            }, this);
        }
        if (bloc.lockColor) {
            var key = player.getFromInventory('key', bloc.lockColor);
            if (key) { // le joueur à au moins une clé, on déverouille le block
                player.removeFromInventory('key', bloc.lockColor);
                key.kill();
                bloc.kill();
                this.updateKeys();
            }
        }
        if (player.body.touching.right || player.body.touching.left) {
            player.body.velocity.x = 0;
        }
    }

    static actionOnTile(tile, map) {
        var game = map.game;
        if (tile.properties.switchname) {
            // gestion des leviers
            if (tile.index == tile.properties.tileOff + 1) { // activation du levier
                map.replace(tile.properties.tileOff + 1, tile.properties.tileOn + 1, tile.x, tile.y, 1, 1, map.backLayer);
                if (tile.properties.switchaction == 'destroy') {
                    SpecialBloc.switchBlocsGroup[tile.properties.switchname].forEach(function(bloc) {
                        bloc.kill();
                    });
                    if (tile.properties.switchtimer) {
                        SpecialBloc.switchBlocsGroup[tile.properties.switchname].switchevent = game.time.events.add(tile.properties.switchtimer, function () {
                            map.replace(tile.properties.tileOn + 1, tile.properties.tileOff + 1, tile.x, tile.y, 1, 1, map.backLayer);
                            SpecialBloc.switchBlocsGroup[tile.properties.switchname].forEach(function(bloc){
                                bloc.revive();
                            });
                        });
                    }
                } else if (tile.properties.switchaction == 'fire') {
                    SpecialBloc.switchBlocsGroup[tile.properties.switchname].forEach(function(trap){
                        trap.autofire = !trap.autofire;
                    });
                } else {
                    console.log('action inconnu pour ce levier : ' + tile.properties.switchaction);
                }
            } else if (tile.index == tile.properties.tileOn + 1 && !tile.properties.switchonlyonce) { // desactivation du levier
                map.replace(tile.properties.tileOn + 1, tile.properties.tileOff + 1, tile.x, tile.y, 1, 1, map.backLayer);
                if (tile.properties.switchaction == 'destroy') {
                    SpecialBloc.switchBlocsGroup[tile.properties.switchname].forEach(function(bloc){
                        bloc.revive();
                    });
                    if (SpecialBloc.switchBlocsGroup[tile.properties.switchname].switchevent) {
                        game.time.events.remove(SpecialBloc.switchBlocsGroup[tile.properties.switchname].switchevent);
                    }
                } else {
                    console.log('action inconnu pour ce levier : ' + tile.properties.switchaction);
                }
            } else {
                console.log('Propriété du levier tileOn et tileOff non définie');
            }
        } else {
            console.log('aucune action sur des blocs pour ce tile');
        }
    }

    /**
     * Contexte (this) = Level (map)
     * @param player
     * @param tile
     */
    static switchCallback(player, tile) {
        SpecialBloc.actionOnTile(tile, this);
    }

}

export default SpecialBloc;
