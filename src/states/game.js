import LevelMap from '../prefabs/level';

class Game extends Phaser.State {

    constructor()  {
        super();
    }

    create() {
        var self = this; // pour utilisation simple dans les callback
        var style = { font: "bold 18px Arial", fill: "#888", boundsAlignH: "center", boundsAlignV: "middle" };
        this.game.global.player.collected = [];

        // Sprites
        this.background = this.game.add.sprite(0,0,'background-level-'+this.game.global.level.current);
        //this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'background-level-'+this.game.global.level.current); // repeat background
        this.background.height = this.game.height;
        this.background.width = this.game.width;
        this.background.fixedToCamera = true;

        // tilemap
        this.map = new LevelMap(this, 'tilemap-level-'+this.game.global.level.current);

        // commons
        this.game.physics.startSystem(Phaser.Physics.ARCADE); // gestion simple des collision : carré et cercle
        this.game.physics.arcade.gravity.y = this.game.global.level.gravity;
        this.game.time.desiredFps = 30;
        //this.game.physics.arcade.skipQuadTree = true;

        // Ajout du score
        this.scoreText = this.game.add.text(5, 5, 'SCORE ' + this.game.global.score, style);
        //this.scoreText.anchor.set(0.5);
        this.scoreText.fixedToCamera = true;

        // Ajout du temps écoulé
        this.startTime = this.game.time.now;
        this.timeText = this.game.add.text(5, 32, 'TIME 0' + this.game.global.score, style);
        //this.timeText.anchor.set(0.5);
        this.timeText.fixedToCamera = true;

        this.playerLifeGroup = this.game.add.group();;
        //this.playerLifeGroup.enableBody = true;
        // Ajout des vies
        for (var i=0; i<this.game.global.player.maxlife; i++) {
            var life = this.game.add.sprite(5 + 30*i, 59, 'heartEmpty');
            life.fixedToCamera = true;
            life.scale.setTo(0.5);
            this.playerLifeGroup.add(life);
        }
        this.updateLives();

        // Ajout de l'aide si pas déjà fait
        if (!this.game.global.helpShown) {
            this.help = this.game.add.sprite(32, this.game.height - 200, 'keys');
            this.help.fixedToCamera = true;
            this.help.alpha = 0.75;
            this.game.add.tween(this.help).to({alpha: 0}, 5000, Phaser.Easing.Linear.None, true);
            this.game.global.helpShown = true;
        }

        // Setup audio
        this.music = this.game.add.audio('musicGame', 2, true);
        this.music.play();

        // Inputs
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.cursors.up.onDown.add(function(){
            var tile = this.map.getTile(Math.floor(this.player.x/64), Math.floor(this.player.y/64), this.map.backLayer);
            if (tile) {
                if (tile.properties.end) { // sur une porte
                    this.endGame(this, 'victory');
                } else if (tile.properties.teleportX) {
                    this.player.x = tile.properties.teleportX * 64;
                    this.player.y = tile.properties.teleportY * 64;
                } else {
                    this.player.up(this.map);
                }
            }
        }, this);
        this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.actionButton = this.game.input.keyboard.addKey(Phaser.KeyCode.CONTROL);
        this.escapeButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        this.soundButton = this.game.input.keyboard.addKey(Phaser.Keyboard.F8);
        this.soundButton.onDown.add(function(){
            if (this.game.sound.mute) {
                this.game.sound.mute = false;
            } else {
                this.game.sound.mute = true;
            }
        }, this);
        if (this.game.global.devMode) {
            // permet de rapidement passer au niveau suivant
            this.cheatCodeButton = this.game.input.keyboard.addKey(Phaser.Keyboard.F9);
            this.cheatCodeButton.onDown.add(function() {
                this.endGame(this, 'victory');
            }, this);
            // permet de perdre instantanement
            this.dieButton = this.game.input.keyboard.addKey(Phaser.Keyboard.F10);
            this.dieButton.onDown.add(function() {
                this.endGame(this, 'gameover');
            }, this);

        }
    }

    render() {
        var self = this;
        // Debug : mise en couleur des blocs invisibles
        if (this.game.global.devMode) {
            this.game.debug.body(this.player);
            this.game.debug.body(this.map.pnjGroup);
        }
    }

    update() {
        //this.background.tilePosition.y = -(this.game.camera.y * 0.7);

        this.map.update(this); // gestion des collisions
        this.physics.arcade.collide(this.player.weapon.bullets, this.map.blocsLayer, function(bullet) { bullet.kill(); });
        this.physics.arcade.collide(this.player.weapon.bullets, this.map.collisionGroup, function(bullet) { bullet.kill(); });
        this.physics.arcade.overlap(this.player.weapon.bullets, this.map.enemiesGroup, this.killEnemy, null, this);
        this.physics.arcade.overlap(this.player.weapon.bullets, this.map.specialBlocsGroup, this.killBlocCallback, null, this);

        // Mise à jour du temps
        this.timeText.text =  'TIME ' + this.elapseSeconds();

        // gestion du joueur
        this.player.body.velocity.x = 0;
        if (this.player.onEchelle) {
            this.player.body.velocity.y = 0;
        }
        if (this.actionButton.isDown) {
            this.player.action();
        } else if (this.cursors.left.isDown) { // fleche de gauche
            this.player.left();
        } else if (this.cursors.right.isDown) { // fleche de droite
            this.player.right();
        } else if (this.cursors.up.isDown) { // fleche du haut
            this.player.up(this.map);
        } else if (this.cursors.down.isDown) { // fleche du bas
            this.player.down();
        } else if (this.escapeButton.isDown) {
            this.endGame(this, 'menu');
        } else { // si aucune touche appuyée
            this.player.idle();
        }
        if (this.jumpButton.isDown) {
            this.player.jump();
        }
    }

    updateLives() {
        for (var i=0; i<this.game.global.player.life; i++) {
            this.playerLifeGroup.children[i].key = 'heartFull';
            this.playerLifeGroup.children[i].loadTexture('heartFull');
        }
        for (;i<this.game.global.player.maxlife;i++) {
            this.playerLifeGroup.children[i].key = 'heartEmpty';
            this.playerLifeGroup.children[i].loadTexture('heartEmpty');
        }
    }

    updateKeys() {
        var k = 0;
        for (var i=0; i<this.player.inventory.key.length; i++){
            var object = this.player.inventory.key[i];
            object.sprite.fixedToCamera = true;
            object.sprite.cameraOffset.x = 5 + 30*k;
            object.sprite.cameraOffset.y = 88;
            object.sprite.scale.setTo(0.5);
            k++;
        }
    }

    elapseSeconds() {
        return Math.floor((this.game.time.now - this.startTime)/1000);
    }

    endGame(self, state) {
        self.game.global.level.elapsedTime = self.elapseSeconds();
        if (state == 'gameover') {
            if (self.player.action != 'dead') {
                this.game.global.player.life--;
                self.player.die();
                self.game.add.audio('deadSound').play();
                self.music.stop();
                self.game.state.start('gameover', true, false);
                return;
            }
        }
        self.music.stop();
        self.game.state.start(state, true, false);
    }

    shutdown() {
        this.game.world.removeAll();
    }

    /*
     * Callbacks appelés depuis la classe Level (utilisation de this.levelState)
     */

    killPlayerCallback(sprite, tile) {
        this.endGame(this, 'gameover');
    }

    collectBonus(player, bonus) {
        if (bonus.alive) {
            this.game.add.audio('collectSound').play('', 0, 0.25);
            if (bonus.keyColor) {
                player.addToInventory('key', bonus.keyColor, bonus);
                bonus.alive = false; // on ne peux plus la prendre
                this.updateKeys(bonus);
            } else {
                bonus.kill(); // Removes the bonus from the screen
            }

            if (bonus.life) {
                if (this.game.global.player.life<this.game.global.player.maxlife) {
                    this.game.global.player.life++;
                    this.updateLives();
                } else {
                    this.game.global.score += 100;
                }
            }
            //  Add and update the score
            this.updateScore(bonus.key, bonus.frame);

            if (this.map.bonusGroup.countLiving() <= 0) {
                this.endGame(this, 'victory');
            }
        }
    }

    updateScore(sprite, index) {
        var collected = this.map.getCollectedObject(sprite, index);
        collected.count++;
        if(collected.points>0) {
            // bonus standard
            this.game.global.score += collected.points;
            this.scoreText.text = 'SCORE ' + this.game.global.score;
        }
    }

    killBlocCallback(bullet, bloc) {
        bullet.kill();
        if (bloc.destructable) {
            bloc.kill();
        }
    }

    killEnemy(bullet, enemy) {
        if (enemy.alive) {
            if (bullet) {
                bullet.kill();
            }
            enemy.body.velocity.x = 0;
            enemy.animations.play('dead');
            enemy.alive = false;
            this.game.add.audio('hitSound').play();
            this.updateScore(enemy.key, 0);
            this.game.add.tween(enemy).to({alpha: 0}, 2000, Phaser.Easing.Linear.None, true);
            this.game.time.events.add(Phaser.Timer.SECOND * 2, function () {
                enemy.kill();
            });
        }
    }
}

export default Game;
