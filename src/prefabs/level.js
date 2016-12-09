import Moving from '../prefabs/moving';
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

        this.player = new Player(this.game);
        state.player = this.player;

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
                    this.player.x = data.x*data.width;
                    this.player.y = data.y*data.height;
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
        this.game.physics.arcade.collide(state.player, this.playerCollisionGroup, SpecialBloc.specialBlocCallback, null, state);
        // type decors (nécessaire pour les callback sur tile)
        this.game.physics.arcade.collide(state.player, this.backLayer);
        // hack pour gérer les pentes
        this.game.physics.arcade.collide(state.player, this.stairGroup, this.stairCallback, null, state);
        // blocs mobiles
        this.game.physics.arcade.collide(this.specialBlocsGroup, this.blocsLayer, Moving.movingCollisionCallBack);
        this.game.physics.arcade.collide(this.specialBlocsGroup, this.gameCollisionGroup, Moving.movingCollisionCallBack);
        this.game.physics.arcade.collide(state.player, this.specialBlocsGroup, SpecialBloc.specialBlocCallback, null, state);

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

        for(var key in SpecialBloc.switchBlocsGroup){
            this.game.physics.arcade.collide(state.player, SpecialBloc.switchBlocsGroup[key], function(player, bloc) {
                if (player.body.touching.right || player.body.touching.left) {
                    player.body.velocity.x = 0;
                }
            }, function() { return true; }, this);
        }

        // gestion des collisions des ennemies (terrain)
        this.game.physics.arcade.collide(this.enemiesGroup, this.blocsLayer, Moving.movingCollisionCallBack);
        // gestion des collisions des ennemies (barriere virtuelle)
        this.game.physics.arcade.collide(this.enemiesGroup, this.gameCollisionGroup, Moving.movingCollisionCallBack);
        // quand le joueur touche un enemie
        this.game.physics.arcade.overlap(this.player, this.enemiesGroup, state.enemyOverlapCallback, null, state);

        // gestion des collisions des PNJ (terrain)
        this.game.physics.arcade.collide(this.pnjGroup, this.blocsLayer, Moving.movingCollisionCallBack);
        // gestion des collisions des PNJ (barriere virtuelle)
        this.game.physics.arcade.collide(this.pnjGroup, this.gameCollisionGroup, Moving.movingCollisionCallBack);
        // quand le joueur touche un player
        this.game.physics.arcade.overlap(this.player, this.pnjGroup, PNJ.pnjOverlapCallback, null, this);

        this.game.physics.arcade.collide(this.player.weapon.bullets, this.map.blocsLayer, function(bullet) { bullet.kill(); });
        this.game.physics.arcade.collide(this.player.weapon.bullets, this.map.collisionGroup, function(bullet) { bullet.kill(); });
        this.game.physics.arcade.overlap(this.player.weapon.bullets, this.map.enemiesGroup, state.killEnemy, null, this);
        this.game.physics.arcade.overlap(this.player.weapon.bullets, this.map.specialBlocsGroup, state.killBlocCallback, null, this);

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
        SpecialBloc.specialBlocCallback(player, stair);
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

    getTileOnSprite(player, layer) {
        return this.getTile(Math.floor(player.x / 64), Math.floor((player.y + 32) / 64), layer);
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
        SpecialBloc.switchBlocsGroup = {};
        var collectableLayer = this.layers[this.getLayer('game')];
        collectableLayer.data.forEach(function (row) {
            row.forEach(function (tile) {
                if (tile.index > 0 && tile.properties.bloc) {
                    var bloc = new SpecialBloc(this.game, tile);
                    if (bloc.switchname) {
                        if (!SpecialBloc.switchBlocsGroup[tile.properties.switchname]) {
                            SpecialBloc.switchBlocsGroup[tile.properties.switchname] =  this.game.add.group();
                            SpecialBloc.switchBlocsGroup[tile.properties.switchname].enableBody = true;
                        }
                        SpecialBloc.switchBlocsGroup[tile.properties.switchname].add(bloc);
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
                        this.player.getCollectedObject(enemy.key, 0, enemy.points, tile.properties.scale); // le créé si existe pas
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
                    this.player.getCollectedObject('world', tile.index - 1, bonus.points); // le créé si existe pas
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
