import LevelMap from '../prefabs/level';
import SpecialBloc from '../prefabs/specialbloc';

class Game extends Phaser.State {

    constructor()  {
        super();
    }

    create() {
        var style = { font: "bold 18px Arial", fill: "#888", boundsAlignH: "center", boundsAlignV: "middle" };
        var styleBig = { font: "bold 56px Lucida Console", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        this.game.global.player.collected = [];

        // Sprites
        this.config = this.game.cache.getJSON('level-'+this.game.global.level.current+'-config');

        if (this.config.sky) {
            this.sky = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'background-sky-level-' + this.game.global.level.current); // repeat background
            this.sky.fixedToCamera = true;
        }
        this.trees = this.game.add.tileSprite(0, 0, this.game.width, this.config.trees.height || 1500, 'background-trees-level-'+this.game.global.level.current);
        //this.trees = this.game.add.sprite(0,0,'background-trees-level-'+this.game.global.level.current);

        // tilemap
        this.map = new LevelMap(this, 'tilemap-level-'+this.game.global.level.current);
        this.trees.width = this.world.width;
        this.trees.y = this.world.height - this.trees.height;
        if (this.config.trees && this.config.trees.offset) {
            this.trees.y -= this.config.trees.offset;
        }

        // commons
        this.game.physics.startSystem(Phaser.Physics.ARCADE); // gestion simple des collision : carré et cercle
        this.game.physics.arcade.gravity.y = this.game.global.level.gravity;
        this.game.time.desiredFps = 30;
        //this.game.physics.arcade.skipQuadTree = true;

        // Ajout du score
        this.game.global.score = 0;
        this.scoreText = this.game.add.text(5, 5, 'SCORE ' + this.game.global.score, style);
        //this.scoreText.anchor.set(0.5);
        this.scoreText.fixedToCamera = true;

        // Ajout du temps écoulé
        this.startTime = this.game.time.now;
        this.timeText = this.game.add.text(5, 32, 'TIME 0' + this.game.global.score, style);
        //this.timeText.anchor.set(0.5);
        this.timeText.fixedToCamera = true;

        this.playerLifeGroup = this.game.add.group();
        // Ajout des vies
        for (var i=0; i<this.game.global.player.maxlife; i++) {
            var life = this.game.add.sprite(5 + 30*i, 59, 'heartEmpty');
            life.fixedToCamera = true;
            life.scale.setTo(0.5);
            this.playerLifeGroup.add(life);
        }
        this.updateLives();

        // Ajout du nom du niveau !
        if (this.config.name) {
            var levelNameText = this.game.add.text(this.game.centerX, this.game.centerY, this.config.name, styleBig);
            levelNameText.fixedToCamera = true;
            levelNameText.anchor.set(0.5);
            levelNameText.stroke = '#000000';
            levelNameText.strokeThickness = 6;
            this.game.add.tween(levelNameText).to({alpha: 0}, 2000, Phaser.Easing.Linear.None, true); // fondu
        }

        // Ajout de l'aide si première partie
        if (!this.game.global.helpShown) {
            this.help = this.game.add.sprite(32, this.game.height - 200, 'keys');
            this.help.fixedToCamera = true;
            this.help.alpha = 0.75;
            this.game.add.tween(this.help).to({alpha: 0}, 5000, Phaser.Easing.Linear.None, true); // fondu
            this.game.global.helpShown = true;
        }

        // Setup audio
        this.music = this.game.add.audio('music-level-'+this.game.global.level.current, 2, true);
        this.music.play();

        this.soundButton = this.game.add.button(this.game.width - 50, 5, (this.game.sound.mute)?'sound-off':'sound-on', this.toggleSound, this);
        this.soundButton.scale.setTo(0.25);
        this.soundButton.fixedToCamera = true;
        this.homeButton = this.game.add.button(this.game.width - 100, 5, 'home', this.goHome, this);
        this.homeButton.scale.setTo(0.25);
        this.homeButton.fixedToCamera = true;

        // Inputs
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.cursors.up.onDown.add(function(){
            var tile = this.map.getTileOnSprite(this.player, this.map.backLayer);
            this.playerAction(tile);
        }, this);
        this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.actionButton = this.game.input.keyboard.addKey(Phaser.KeyCode.CONTROL);
        this.homeKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        this.homeKey.onDown.add(this.goHome, this);
        this.soundKey = this.game.input.keyboard.addKey(Phaser.Keyboard.F8);
        this.soundKey.onDown.add(this.toggleSound, this);
        if (this.game.global.devMode) {
            // permet de rapidement passer au niveau suivant
            this.cheatCodeButton = this.game.input.keyboard.addKey(Phaser.Keyboard.F9);
            this.cheatCodeButton.onDown.add(function() {
                this.endGame('victory');
            }, this);
            // permet de perdre instantanement
            this.dieButton = this.game.input.keyboard.addKey(Phaser.Keyboard.F10);
            this.dieButton.onDown.add(function() {
                this.endGame('gameover');
            }, this);

        }
    }

    goHome() {
        this.endGame('menu-level');
    }

    toggleSound() {
        if (this.game.sound.mute) {
            this.game.sound.mute = false;
            this.soundButton.loadTexture('sound-on');
        } else {
            this.game.sound.mute = true;
            this.soundButton.loadTexture('sound-off');
        }
    }

    playerAction(tile) {
        if (tile) {
            if (tile.properties.end) { // sur une porte
                this.endGame('victory');
            } else if (tile.properties.teleportX) {
                // gestion des portes (ou téléporteurs)
                this.player.x = tile.properties.teleportX * 64;
                this.player.y = tile.properties.teleportY * 64;
            } else if (tile.properties.switchname) {
                SpecialBloc.actionOnTile(tile, this.map);
            } else {
                this.player.up(this.map);
            }
        }
    }

    render() {
        // Debug : mise en couleur des blocs invisibles
        if (this.game.global.devMode) {
            this.game.debug.body(this.player);
            this.game.debug.body(this.map.pnjGroup);
            this.map.specialBlocsGroup.forEachAlive(function(bloc) {
                this.game.debug.body(bloc);
            }, this);
        }
    }

    update() {
        if (this.sky) {
            this.sky.tilePosition.y = -(this.game.camera.y * 0.7);
            this.sky.tilePosition.x = -(this.game.camera.x * 0.7);
        }
        //this.trees.tilePosition.x = -(this.game.camera.x * 0.1);

        this.map.update(this); // gestion des collisions

        // Mise à jour du temps
        this.timeText.text =  'TIME ' + this.elapseSeconds();

        // Gestion des echelles
        var wasEchelleOverlap = this.player.echelleOverlap; // ancien status
        var backTile = this.map.getTileOnSprite(this.player, this.map.backLayer); // nouveau status
        if (backTile) {
            this.player.echelleOverlap = [79, 80, 93, 94, 95, 540].indexOf(backTile.index) >= 0;
        } else {
            this.player.echelleOverlap = false;
        }
        if (!this.player.echelleOverlap) { // reinit la gravité si pas sur une echelle
            this.player.body.gravity.set(0);
            if (wasEchelleOverlap) { // sortie de l'echelle
                this.player.animations.play('jump');
            }
            this.player.onEchelle = false;
        }

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
            this.player.up();
        } else if (this.cursors.down.isDown) { // fleche du bas
            this.player.down();
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

    updateScore(sprite, index) {
        var collected = this.player.getCollectedObject(sprite, index);
        collected.count++;
        if(collected.points>0) {
            // bonus standard
            this.game.global.score += collected.points;
            this.scoreText.text = 'SCORE ' + this.game.global.score;
        }
    }

    elapseSeconds() {
        return Math.floor((this.game.time.now - this.startTime)/1000);
    }

    endGame(state) {
        this.game.global.level.elapsedTime = this.elapseSeconds();
        this.game.global.player.collected = this.player.collected;
        if (state == 'gameover') {
            if (this.player.action != 'dead') {
                this.game.global.player.life--;
                this.player.die();
                this.game.add.audio('deadSound').play();
                this.music.stop();
                this.game.state.start('gameover', true, false);
                return;
            }
        }
        this.music.stop();
        this.game.state.start(state, true, false);
    }

    shutdown() {
        this.game.world.removeAll();
    }

    /*
     * Callbacks appelés depuis la classe Level (utilisation de this.levelState)
     */

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

    killPlayerCallback(player, tile) {
        this.endGame('gameover');
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
                this.endGame('victory');
            }
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
            if (!enemy.invincible) {
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
}

export default Game;
