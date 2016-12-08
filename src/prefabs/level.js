import Player from '../prefabs/player';
import Enemy from '../prefabs/enemy';
import PNJ from '../prefabs/pnj';
import SpecialBloc from '../prefabs/specialbloc';

class Level extends Phaser.Tilemap {

    //initialization code in the constructor
    constructor(state, key, tileWidth, tileHeight, width, height) {
        super(state.game, key, tileWidth, tileHeight, width, height);
        this.maxLevelScore = 0;

        this.addTilesetImage('world-spritesheet', 'world');
        // réupération des layers pour la construction du monde
        var backUndergroundLayer = this.layers[this.getLayer('backUnderground')];
        if (backUndergroundLayer) { // si il y a un deuxième layer back
            this.backUndergroundLayer = this.createLayer('backUnderground');
            this.backUndergroundLayer.resizeWorld();
        }
        this.backLayer = this.createLayer('back');
        this.backLayer.resizeWorld();
        this.blocsLayer = this.createLayer('blocs');
        this.blocsLayer.resizeWorld();

        // gestion des collisions sur tile
        this.setLayer(this.blocsLayer);
        this.setCollisionBetween(1, 680);

        // Gestion des collisions avec le décors (ajout des callback)
        // gestion des jumper
        this.jumperSprites = [573, 574];
        this.setTileIndexCallback(this.jumperSprites[0],
            this.jumperCallback, this, this.backLayer);
        // Gestion des pics et de l'eau
        this.setTileIndexCallback([571, 572, 81, 82, 83, 84, 85, 86, 170, 171, 176, 177],
            state.killPlayerCallback, state, this.backLayer);

        // Ajoute des zonnes de collision spécifiques
        this.addCollisionObjects();
        // Ajout des blocs mobiles
        this.addLevelSpecialBlocs();

        // Ajou des pièges/lasers
        this.addLevelTraps();
        // Ajout des bonus
        this.addLevelBonus();
        // Ajout des enemies
        this.addLevelEnemies();
        // Ajout des PNJ
        this.addLevelPNJ();

        // Ajout du joueur
        var gameLayer = this.layers[this.getLayer('game')];
        gameLayer.data.forEach(function(row) {
            row.forEach(function(data){
                if (data.index > 0 && data.properties.start) {
                    this.player = new Player(this.game, data.x*data.width, data.y*data.height);
                    this.game.add.existing(this.player);
                }
            }, state);
        }, state);
        if (!state.player) {
            console.log('La position de démraage du joueur n\'est pas définie dans le niveau');
        }

        // Ajout du layer front en dernier pour être au premier plan
        this.frontLayer = this.createLayer('front');
        this.frontLayer.resizeWorld();
        console.log('max score level ' + this.game.global.level.current + ' :' + this.maxLevelScore);
    }

    /**
     *
     * @param state l'était courant du jeu
     * @returns {boolean} vrai si joueur sur une echelle
     */
    update(state) {

        // gestion des collisions (type terrain)
        this.game.physics.arcade.collide(state.player, this.blocsLayer);
        this.game.physics.arcade.collide(state.player, this.playerCollisionGroup, this.specialBlocCallback, null, state);
        // type decors (nécessaire pour les callback sur tile)
        this.game.physics.arcade.collide(state.player, this.backLayer);
        // hack pour gérer les pentes
        this.game.physics.arcade.collide(state.player, this.stairGroup, this.stairCallback, null, state);
        // blocs mobiles
        this.game.physics.arcade.collide(this.specialBlocsGroup, this.blocsLayer, this.movingCollisionCallBack);
        this.game.physics.arcade.collide(this.specialBlocsGroup, this.gameCollisionGroup, this.movingCollisionCallBack);
        this.game.physics.arcade.collide(state.player, this.specialBlocsGroup, this.specialBlocCallback, null, state);

        // gestion des collisions sur objets donnant la mort
        this.game.physics.arcade.collide(state.player, this.deathGroup, state.killPlayerCallback, null, state);

        // type bonus, quand le joueur touche une étoile
        this.game.physics.arcade.overlap(state.player, this.bonusGroup, state.collectBonus, null, state);

        // Gestion des pièges
        this.traps.forEach(function(trap){
            this.physics.arcade.collide(trap.bullets, this.map.blocsLayer, function(bullet){ bullet.kill();});
            this.physics.arcade.collide(trap.bullets, this.map.gameCollisionGroup, function(bullet) { bullet.kill(); });
            this.physics.arcade.overlap(trap.bullets, this.player, this.killPlayerCallback, null, this);
        }, state);

        for(var key in this.switchBlocsGroup){
            this.game.physics.arcade.collide(state.player, this.switchBlocsGroup[key], function(player, bloc) {
                if (player.body.touching.right || player.body.touching.left) {
                    player.body.velocity.x = 0;
                }
            }, function() { return true; }, this);
        }

        // gestion des collisions des ennemies (terrain)
        this.game.physics.arcade.collide(this.enemiesGroup, this.blocsLayer, this.movingCollisionCallBack);
        // gestion des collisions des ennemies (barriere virtuelle)
        this.game.physics.arcade.collide(this.enemiesGroup, this.gameCollisionGroup, this.movingCollisionCallBack);
        // quand le joueur touche un enemie
        this.game.physics.arcade.overlap(state.player, this.enemiesGroup, this.enemyOverlapCallback, null, state);

        // gestion des collisions des PNJ (terrain)
        this.game.physics.arcade.collide(this.pnjGroup, this.blocsLayer, this.movingCollisionCallBack);
        // gestion des collisions des PNJ (barriere virtuelle)
        this.game.physics.arcade.collide(this.pnjGroup, this.gameCollisionGroup, this.movingCollisionCallBack);
        // quand le joueur touche un player
        this.game.physics.arcade.overlap(state.player, this.pnjGroup, this.pnjOverlapCallback, null, this);
    }

    pnjOverlapCallback(player, pnj) {
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

    enemyOverlapCallback(player, enemy) {
        if (enemy.alive) {
            if (player.body.touching.down && !enemy.invincible) {
                this.killEnemy(null, enemy);
                player.body.velocity.y = -this.game.global.player.speed/2;
            } else {
                this.killPlayerCallback(player, enemy);
            }
        }
    }

    stairCallback(player, stair) {
        if (player.body.touching.left || player.body.touching.right) {
            player.y -= 1;
            if (player.body.touching.left) {
                player.body.velocity.x -= 10;
            } else {
                player.body.velocity.x += 10;
            }
        }
        this.map.specialBlocCallback(player, stair);
    }

    jumperCallback(sprite, tile) {
        sprite.body.velocity.y = -this.game.global.level.maxVelocity;
        this.game.add.audio('jumpSound').play('', 0, 0.25);
        // on met une image de jumper activé
        this.replace(tile.index, this.jumperSprites[1], tile.x, tile.y, 1, 1, this.backLayer);
        this.game.time.events.add(Phaser.Timer.SECOND * 0.25, function() {
            sprite.animations.play('jump');
            // on remet une image de jumper désactivé
            this.replace(this.jumperSprites[1], this.jumperSprites[0], tile.x, tile.y, 1, 1, this.backLayer);
        }, this);
    }

    specialBlocCallback(player, bloc) {
        // quand le joueur est sur un bloc, incrémente un compteur
        if (player.body.touching.down && this.game.global.timer.bloc < 5) {
            if (bloc.fallingTime) {
                this.game.time.events.add(bloc.fallingTime, function () {
                    player.animations.play('jump');
                    // chute du bloc
                    bloc.body.gravity.set(0);
                    bloc.body.immovable = false;
                    // fait disparaitre le bloc au bout de 2 secondes
                    this.game.add.tween(bloc).to({alpha: 0}, 2000, Phaser.Easing.Linear.None, true);
                    this.game.time.events.add(2000, function () {
                        bloc.kill();
                    }, this);
                }, this);
            }
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

    movingCollisionCallBack(moving, bloc) {
        moving.changeDirection(bloc);
    }

    getTileOnSprite(player, layer) {
        return this.getTile(Math.floor(player.x / 64), Math.floor((player.y + 32) / 64), layer);
    }

    /**
     *
     * @param sprite nom du sprite
     * @param frame index de la frame du spritesheet
     * @param points nombre de points affecté au bonus (si value créé l'objet dans l'inventaire)
     * @param scale sera utilisé pour l'affichage des écrans de points
     * @returns {*}
     */
    getCollectedObject(sprite, frame, points, scale) {
        for (var i=0; i<this.game.global.player.collected.length; i++){
            if (this.game.global.player.collected[i].sprite == sprite && this.game.global.player.collected[i].frame == frame) {
                if (points || points == 0) {
                    this.game.global.player.collected[i].count = 0;
                }
                return this.game.global.player.collected[i];
            }
        }
        if (points || points == 0) {
            // création d'un nouveau type d'objet à collecter
            var object = {
                sprite: sprite,
                frame: frame,
                points: points,
                scale: scale,
                count: 0
            };
            this.game.global.player.collected.push(object);
            return object;
        }
        return null;
    }

    /**
     * à la main (car fonction this.createFromObjects impossible sans gid non généré par Tiled)
     */
    addCollisionObjects() {
        // gestion des pentes
        this.stairGroup = this.game.add.group();
        this.stairGroup.enableBody = true;
        if (this.objects.stairCollision) {
            this.objects.stairCollision.forEach(function (object) {
                var sprite = this.game.add.sprite(object.x, object.y);
                this.game.physics.arcade.enableBody(sprite);
                sprite.body.moves = false;
                sprite.body.setSize(object.width, object.height);
                this.stairGroup.add(sprite);
            }, this);
        }

        // gestion des collisions sur les objets plus petit qu'un sprite
        this.playerCollisionGroup = this.game.add.group();
        this.playerCollisionGroup.enableBody = true;
        if (this.objects.playerCollision) {
            this.objects.playerCollision.forEach(function (object) {
                var sprite = this.game.add.sprite(object.x, object.y);
                this.game.physics.arcade.enableBody(sprite);
                sprite.body.moves = false;
                sprite.body.setSize(object.width, object.height);
                this.playerCollisionGroup.add(sprite);
            }, this);
        }

        // gestion des collisions sur les objets plus petit qu'un sprite
        this.deathGroup = this.game.add.group();
        this.deathGroup.enableBody = true
        if (this.objects.deathCollision) {
            this.objects.deathCollision.forEach(function (object) {
                var sprite = this.game.add.sprite(object.x, object.y);
                this.game.physics.arcade.enableBody(sprite);
                sprite.body.moves = false;
                sprite.body.setSize(object.width, object.height);
                this.deathGroup.add(sprite);
            }, this);
        }

        // gestion des collisions sur les enemies (limitation des mouvements)
        this.gameCollisionGroup = this.game.add.group();
        this.gameCollisionGroup.enableBody = true;
        if (this.objects.gameCollision) {
            this.objects.gameCollision.forEach(function (object) {
                var sprite = this.game.add.sprite(object.x, object.y);
                this.game.physics.arcade.enableBody(sprite);
                sprite.body.moves = false;
                sprite.body.setSize(object.width, object.height);
                this.gameCollisionGroup.add(sprite);
            }, this);
        }
    }

    addLevelSpecialBlocs() {
        // gestion des blocs qui bouges
        this.specialBlocsGroup = this.game.add.group();
        this.specialBlocsGroup.enableBody = true;
        this.switchBlocsGroup = {};
        var collectableLayer = this.layers[this.getLayer('game')];
        collectableLayer.data.forEach(function (row) {
            row.forEach(function (tile) {
                if (tile.index > 0 && tile.properties.bloc) {
                    var bloc = new SpecialBloc(this.game, tile);
                    if (bloc.switchname) {
                        if (!this.switchBlocsGroup[tile.properties.switchname]) {
                            this.switchBlocsGroup[tile.properties.switchname] =  this.game.add.group();
                            this.switchBlocsGroup[tile.properties.switchname].enableBody = true;
                        }
                        this.switchBlocsGroup[tile.properties.switchname].add(bloc);
                    } else {
                        this.specialBlocsGroup.add(bloc);
                    }
                }
            }, this);
        }, this);
    }

    /**
     *
     */
    addLevelEnemies() {
        this.enemiesGroup = this.game.add.group();
        this.enemiesGroup.enableBody = true;
        var enemiesLayer = this.layers[this.getLayer('game')];
        if (enemiesLayer) { // si il y a un layer enemies
            enemiesLayer.data.forEach(function (row) {
                row.forEach(function (tile) {
                    if (tile.index > 0 && tile.properties.enemy) {
                        var enemy = new Enemy(this.game, tile);
                        this.enemiesGroup.add(enemy);
                        this.maxLevelScore += enemy.points;
                        this.getCollectedObject(enemy.key, 0, enemy.points, tile.properties.scale); // le créé si existe pas
                    }
                }, this);
            }, this);
        }

    }
    /**
     *
     */
    addLevelTraps() {
        this.traps = [];
        var trapLayer = this.layers[this.getLayer('blocs')];
        trapLayer.data.forEach(function (row) {
            row.forEach(function (tile) {
                if (tile.properties.bulletSpeed) {
                    var sprite = 'bullet-fire';
                    if (tile.properties.sprite){
                        sprite = tile.properties.sprite;
                    }
                    var trap = this.game.add.weapon(30, sprite);
                    var offset = 32;
                    trap.x = tile.x * tile.width + offset;
                    trap.y = tile.y * tile.height + offset;
                    trap.autofire = true
                    trap.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS
                    trap.bulletSpeed = tile.properties.bulletSpeed;
                    trap.fireRate = tile.properties.fireRate;
                    var gravity = -this.game.global.level.gravity;
                    if (tile.properties.gravity) {
                        gravity += tile.properties.gravity;
                    }
                    trap.bulletGravity.set(0, gravity);
                    if (tile.properties.fireAngle == 'left') {
                        trap.fireAngle = Phaser.ANGLE_LEFT;
                        trap.x -= 32;
                    } else if (tile.properties.fireAngle == 'up') {
                        trap.fireAngle = Phaser.ANGLE_UP;
                        trap.y -= 32;
                    } else if (tile.properties.fireAngle == 'down') {
                        trap.fireAngle = Phaser.ANGLE_DOWN;
                        trap.y += 32;
                    } else {
                        trap.fireAngle = Phaser.ANGLE_RIGHT;
                        trap.x += 32;
                    }
                    if (tile.properties.angularVelocity) {
                        trap.onFire.add(function (bullet, weapon) {
                            bullet.body.angularVelocity = tile.properties.angularVelocity;
                        });
                    }
                    this.traps.push(trap);
                }
            }, this);
        }, this);
    }

    /**
     *
     * @param this
     */
    addLevelBonus() {
        this.bonusGroup = this.game.add.group();
        this.bonusGroup.enableBody = true;
        var collectableLayer = this.layers[this.getLayer('game')];
        collectableLayer.data.forEach(function (row) {
            row.forEach(function (tile) {
                if (tile.index > 0 && (tile.properties.points || tile.properties.key || tile.properties.life)) {
                    var bonus = this.game.add.sprite(tile.x * tile.width, tile.y * tile.height, "world", tile.index - 1);
                    this.game.physics.arcade.enableBody(bonus);
                    if (tile.properties.points) {
                        bonus.points = tile.properties.points;
                    } else {
                        bonus.points = 0;
                    }
                    if (tile.properties.key) {
                        bonus.keyColor = tile.properties.key;
                    }
                    if (tile.properties.life) {
                        bonus.life = true;
                    }
                    bonus.body.moves = false; // ne subit pas la gravité
                    this.bonusGroup.add(bonus);
                    this.maxLevelScore += bonus.points;
                    this.getCollectedObject('world', tile.index - 1, bonus.points); // le créé si existe pas
                }
            }, this);
        }, this);
    }

    addLevelPNJ() {
        this.pnjGroup = this.game.add.group();
        var pnjLayer = this.layers[this.getLayer('game')];
        if (pnjLayer) { // si il y a un layer enemies
            pnjLayer.data.forEach(function (row) {
                row.forEach(function (tile) {
                    if (tile.index > 0 && tile.properties.pnj) {
                        var pnj = new PNJ(this.game, tile);
                        this.pnjGroup.add(pnj);
                    }
                }, this);
            }, this);
        }
    }

}

export default Level;
