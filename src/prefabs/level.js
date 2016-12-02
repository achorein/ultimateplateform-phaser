import Player from '../prefabs/player';

class Level extends Phaser.Tilemap {

    //initialization code in the constructor
    constructor(state, key, tileWidth, tileHeight, width, height) {
        super(state.game, key, tileWidth, tileHeight, width, height);
        var self = this;

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
        this.addCollisionObjects(self);
        // Ajout des blocs mobiles
        this.addLevelSpecialBlocs(self);

        // Ajou des pièges/lasers
        this.addLevelTraps(self);
        // Ajout des bonus
        this.addLevelBonus(self);
        // Ajout des enemies
        this.addLevelEnemies(self);
        // Ajout des PNJ
        this.addLevelPNJ(self);

        // Ajout du joueur
        var gameLayer = this.layers[this.getLayer('game')];
        gameLayer.data.forEach(function(row) {
            row.forEach(function(data){
                if (data.index > 0 && data.properties.start) {
                    state.player = new Player(self.game, data.x*data.width, data.y*data.height);
                    self.game.add.existing(state.player);
                }
            });
        });

        // Ajout du layer front en dernier pour être au premier plan
        this.frontLayer = this.createLayer('front');
        this.frontLayer.resizeWorld();
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
        this.game.physics.arcade.collide(this.specialBlocsGroup, this.blocsLayer, this.specialBlocsCollisionCallBack);
        this.game.physics.arcade.collide(this.specialBlocsGroup, this.gameCollisionGroup, this.specialBlocsCollisionCallBack);
        this.game.physics.arcade.collide(state.player, this.specialBlocsGroup, this.specialBlocCallback, null, state);

        // gestion des collisions sur objets donnant la mort
        this.game.physics.arcade.collide(state.player, this.deathGroup, state.killPlayerCallback, null, state);

        // type bonus, quand le joueur touche une étoile
        this.game.physics.arcade.overlap(state.player, this.bonusGroup, state.collectBonus, null, state);

        // Gestion des pièges
        this.traps.forEach(function(trap){
            state.physics.arcade.collide(trap.bullets, state.map.blocsLayer, function(bullet){ bullet.kill();});
            state.physics.arcade.collide(trap.bullets, state.map.gameCollisionGroup, function(bullet) { bullet.kill(); });
            state.physics.arcade.overlap(trap.bullets, state.player, state.killPlayerCallback, null, state);
        });

        // gestion des collisions des ennemies (terrain)
        this.game.physics.arcade.collide(this.enemiesGroup, this.blocsLayer, this.enemyCollisionCallBack);
        // gestion des collisions des ennemies (barriere virtuelle)
        this.game.physics.arcade.collide(this.enemiesGroup, this.gameCollisionGroup, this.enemyCollisionCallBack);
        // quand le joueur touche un enemie
        this.game.physics.arcade.overlap(state.player, this.enemiesGroup, this.enemyOverlapCallback, null, state);

        // gestion des collisions des PNJ (terrain)
        this.game.physics.arcade.collide(this.pnjGroup, this.blocsLayer, this.enemyCollisionCallBack);
        // gestion des collisions des PNJ (barriere virtuelle)
        this.game.physics.arcade.collide(this.pnjGroup, this.gameCollisionGroup, this.enemyCollisionCallBack);
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
            if (player.body.touching.down) {
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
        var self = this;
        sprite.body.velocity.y = -this.game.global.level.maxVelocity;
        this.game.add.audio('jumpSound').play('', 0, 0.25);
        // on met une image de jumper activé
        this.replace(tile.index, this.jumperSprites[1], tile.x, tile.y, 1, 1, this.backLayer);
        this.game.time.events.add(Phaser.Timer.SECOND * 0.25, function() {
            sprite.animations.play('jump');
            // on remet une image de jumper désactivé
            self.replace(self.jumperSprites[1], self.jumperSprites[0], tile.x, tile.y, 1, 1, self.backLayer);
        });
    }

    specialBlocCallback(player, bloc) {
        // quand le joueur est sur un bloc, incrémente un compteur
        if (player.body.touching.down && this.game.global.timer.bloc < 5) {
            this.game.global.timer.bloc++;
            this.game.time.events.add(Phaser.Timer.SECOND * 0.1, function () {
                // décrémente le compteur pour pouvoir déterminer si on est sortie du bloc
                this.game.global.timer.bloc--;
            }, this);
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
    }

    specialBlocsCollisionCallBack(special, bloc) {
        if (special.body.touching.left || special.body.touching.right) {
            special.body.velocity.x *= -1;
        } else if (special.body.touching.up || special.body.touching.down) {
            special.body.velocity.y *= -1;
        }
    }

    enemyCollisionCallBack(enemy, bloc) {
        if (enemy.body.touching.left || enemy.body.touching.right) {
            enemy.scale.x *= -1; // symetrie verticale
            enemy.body.velocity.x *= -1;
        }
    }

    getTileOnSprite(player, layer) {
        return this.getTile(Math.floor(player.x / 64), Math.floor(player.y / 64), layer);
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
     * @param self
     */
    addCollisionObjects(self) {
        // gestion des pentes
        this.stairGroup = this.game.add.group();
        this.stairGroup.enableBody = true;
        if (this.objects.stairCollision) {
            this.objects.stairCollision.forEach(function (object) {
                var sprite = self.game.add.sprite(object.x, object.y);
                self.game.physics.arcade.enableBody(sprite);
                sprite.body.moves = false;
                sprite.body.setSize(object.width, object.height);
                self.stairGroup.add(sprite);
            });
        }

        // gestion des collisions sur les objets plus petit qu'un sprite
        this.playerCollisionGroup = this.game.add.group();
        this.playerCollisionGroup.enableBody = true;
        if (this.objects.playerCollision) {
            this.objects.playerCollision.forEach(function (object) {
                var sprite = self.game.add.sprite(object.x, object.y);
                self.game.physics.arcade.enableBody(sprite);
                sprite.body.moves = false;
                sprite.body.setSize(object.width, object.height);
                self.playerCollisionGroup.add(sprite);
            });
        }

        // gestion des collisions sur les objets plus petit qu'un sprite
        this.deathGroup = this.game.add.group();
        this.deathGroup.enableBody = true
        if (this.objects.deathCollision) {
            this.objects.deathCollision.forEach(function (object) {
                var sprite = self.game.add.sprite(object.x, object.y);
                self.game.physics.arcade.enableBody(sprite);
                sprite.body.moves = false;
                sprite.body.setSize(object.width, object.height);
                self.deathGroup.add(sprite);
            });
        }

        // gestion des collisions sur les enemies (limitation des mouvements)
        this.gameCollisionGroup = this.game.add.group();
        this.gameCollisionGroup.enableBody = true;
        if (this.objects.gameCollision) {
            this.objects.gameCollision.forEach(function (object) {
                var sprite = self.game.add.sprite(object.x, object.y);
                self.game.physics.arcade.enableBody(sprite);
                sprite.body.moves = false;
                sprite.body.setSize(object.width, object.height);
                self.gameCollisionGroup.add(sprite);
            });
        }
    }

    addLevelSpecialBlocs(self) {
        // gestion des blocs qui bouges
        this.specialBlocsGroup = this.game.add.group();
        this.specialBlocsGroup.enableBody = true;
        var collectableLayer = this.layers[this.getLayer('game')];
        collectableLayer.data.forEach(function (row) {
            row.forEach(function (tile) {
                if (tile.index > 0 && tile.properties.bloc) {
                    var bloc = self.game.add.sprite(tile.x * tile.width, tile.y * tile.height, "world", tile.index - 1);
                    self.game.physics.arcade.enableBody(bloc);
                    bloc.body.collideWorldBounds = true;

                    if (tile.properties.x) bloc.body.velocity.x = parseInt(tile.properties.x);
                    if (tile.properties.y) bloc.body.velocity.y = parseInt(tile.properties.y);
                    bloc.body.maxVelocity.set(self.game.global.level.maxVelocity);

                    if (!tile.properties.pushable) {
                        bloc.body.gravity.set(0, -self.game.global.level.gravity);
                        bloc.body.immovable = true;
                    } else {
                        bloc.body.bounce.set(0.8, 0.1);
                        //bloc.body.friction.set(1000);
                    }
                    if (tile.properties.fallingTime) {
                        bloc.fallingTime = tile.properties.fallingTime;
                    }
                    if (tile.properties.lock) {
                        bloc.lockColor = tile.properties.lock;
                    }
                    if (tile.properties.destructable) {
                        bloc.destructable = tile.properties.destructable;
                    }
                    if (tile.properties.alpha) {
                        bloc.alpha = tile.properties.alpha;
                    }

                    self.specialBlocsGroup.add(bloc);
                }
            });
        });
    }

    /**
     *
     * @param self
     */
    addLevelEnemies(self) {
        this.enemiesGroup = this.game.add.group();
        this.enemiesGroup.enableBody = true;
        var enemiesLayer = this.layers[this.getLayer('game')];
        if (enemiesLayer) { // si il y a un layer enemies
            enemiesLayer.data.forEach(function (row) {
                row.forEach(function (tile) {
                    if (tile.index > 0 && tile.properties.enemy) {
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
                        var enemy = self.enemiesGroup.create(tile.x * tile.width + offsetX, tile.y * tile.height + offsetY, sprite, 1);
                        if (tile.properties.atlas) {
                            enemy.animations.add('dead', Phaser.Animation.generateFrameNames('dead/', 1, 8, '', 2), 6, false, false);
                            enemy.animations.add('walk', Phaser.Animation.generateFrameNames('walk/', 1, 10, '', 2), 10, true, false);
                            enemy.animations.play('walk');
                        } else {
                            enemy.animations.add('walk', [1, 2], 2, true);
                            enemy.animations.add('dead', [0], 2, false);
                            enemy.animations.play('walk');
                        }
                        enemy.anchor.setTo(.5, 0);
                        if (tile.properties.scale){
                            enemy.scale.setTo(tile.properties.scale);
                        }
                        if (tile.properties.velocity) {
                            enemy.body.velocity.x = tile.properties.velocity;
                        } else {
                            enemy.body.velocity.x = -75;
                        }
                        if (tile.properties.miror) {
                            enemy.scale.x *= -1; // symetrie verticale
                        }
                        enemy.body.maxVelocity.set(self.game.global.level.maxVelocity);
                        enemy.body.gravity.set(0, -self.game.global.level.gravity);
                        enemy.body.collideWorldBounds = true;
                        self.getCollectedObject(sprite, 0, 25, tile.properties.scale); // le créé si existe pas
                    }
                });
            });
        }

    }
    /**
     *
     * @param self
     */
    addLevelTraps(self) {
        this.traps = [];
        var trapLayer = this.layers[this.getLayer('blocs')];
        trapLayer.data.forEach(function (row) {
            row.forEach(function (tile) {
                if (tile.properties.bulletSpeed) {
                    var sprite = 'bullet-fire';
                    if (tile.properties.sprite){
                        sprite = tile.properties.sprite;
                    }
                    var trap = self.game.add.weapon(30, sprite);
                    var offset = 32;
                    trap.x = tile.x * tile.width + offset;
                    trap.y = tile.y * tile.height + offset;
                    trap.autofire = true
                    trap.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS
                    trap.bulletSpeed = tile.properties.bulletSpeed;
                    trap.fireRate = tile.properties.fireRate;
                    var gravity = -self.game.global.level.gravity;
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
                    self.traps.push(trap);
                }
            });
        });
    }

    /**
     *
     * @param self
     */
    addLevelBonus(self) {
        this.bonusGroup = this.game.add.group();
        this.bonusGroup.enableBody = true;
        var collectableLayer = this.layers[this.getLayer('game')];
        collectableLayer.data.forEach(function (row) {
            row.forEach(function (tile) {
                if (tile.index > 0 && (tile.properties.points || tile.properties.key || tile.properties.life)) {
                    var bonus = self.game.add.sprite(tile.x * tile.width, tile.y * tile.height, "world", tile.index - 1);
                    self.game.physics.arcade.enableBody(bonus);
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
                    self.bonusGroup.add(bonus);
                    self.getCollectedObject('world', tile.index - 1, bonus.points); // le créé si existe pas
                }
            });
        });
    }

    addLevelPNJ(self) {
        this.pnjGroup = this.game.add.group();
        this.pnjGroup.enableBody = true;
        var pnjLayer = this.layers[this.getLayer('game')];

        if (pnjLayer) { // si il y a un layer enemies
            pnjLayer.data.forEach(function (row) {
                row.forEach(function (tile) {
                    if (tile.index > 0 && tile.properties.pnj) {
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
                        var pnj = self.pnjGroup.create(tile.x * tile.width + offsetX, tile.y * tile.height + offsetY, sprite, 1);
                        pnj.body.gravity.set(0, -self.game.global.level.gravity);
                        pnj.body.immovable = true;
                        if (tile.properties.atlas) {
                            pnj.animations.add('idle', Phaser.Animation.generateFrameNames('idle/', 1, 10, '', 2), 10, true, false);
                        } else {
                            pnj.animations.add('idle', [0, 1], 2, true);
                        }
                        pnj.animations.play('idle');
                        pnj.anchor.setTo(.5, 0);
                        if (tile.properties.scale){
                            pnj.scale.setTo(tile.properties.scale);
                        }
                        if (tile.properties.miror) {
                            pnj.scale.x *= -1; // symetrie verticale
                        }
                        pnj.text = tile.properties.text;
                        pnj.textOffsetX = (tile.properties.textOffsetX)?tile.properties.textOffsetX:32;
                        pnj.textOffsetY = (tile.properties.textOffsetY)?tile.properties.textOffsetY:-64;
                        pnj.textTime = (tile.properties.textTime)?tile.properties.textTime:4000 ;
                    }
                });
            });
        }
    }

}

export default Level;
