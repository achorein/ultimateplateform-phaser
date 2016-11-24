import LevelMap from '../prefabs/level';

class Game extends Phaser.State {

  constructor()  {
    super();
  }
  
  create() {
    var self = this; // pour utilisation simple dans les callback
    this.game.global.collected = [];

    // Sprites
    this.background = this.game.add.sprite(0,0,'background-level-'+this.game.global.level);
    this.background.height = this.game.world.height;
    this.background.width = this.game.world.width;
    this.background.fixedToCamera = true;

    // tilemap
    this.map = new LevelMap(this, 'tilemap-level-'+this.game.global.level);

    // commons
    this.game.physics.startSystem(Phaser.Physics.ARCADE); // gestion simple des collision : carré et cercle
    this.game.physics.arcade.gravity.y = this.game.global.gravity;
    this.game.time.desiredFps = 30;

    // Ajout du score
    var style = { font: "bold 18px Arial", fill: "#333", boundsAlignH: "center", boundsAlignV: "middle" };
    this.scoreText = this.game.add.text(5, 5, 'SCORE ' + this.game.global.score, style);
    //this.scoreText.anchor.set(0.5);
    this.scoreText.fixedToCamera = true;

    // Ajout du temps écoulé
    this.startTime = this.game.time.now;
    this.timeText = this.game.add.text(5, 32, 'TIME 0' + this.game.global.score, style);
    //this.timeText.anchor.set(0.5);
    this.timeText.fixedToCamera = true;

    // Ajout des vies
    this.updateLives();

    // Setup audio
    this.music = this.game.add.audio('musicGame', 2, true);
    this.music.play();

    // Inputs
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.actionButton = this.game.input.keyboard.addKey(Phaser.KeyCode.CONTROL);
    this.escapeButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
    this.cheatCodeButton = this.game.input.keyboard.addKey(Phaser.Keyboard.F9);
  }

  render() {
    var self = this;
    // Debug : mise en couleur des blocs invisibles
    self.game.debug.body(this.player);
  }

  update() {
    var onEchelle = this.map.update(this); // gestion des collisions
    this.physics.arcade.collide(this.player.weapon.bullets, this.map.blocsLayer, function(bullet) { bullet.kill(); });
    this.physics.arcade.collide(this.player.weapon.bullets, this.map.collisionGroup, function(bullet) { bullet.kill(); });
    this.physics.arcade.overlap(this.player.weapon.bullets, this.map.enemiesGroup, this.killEnemy, null, this);

    // Mise à jour du temps
    this.timeText.text =  'TIME ' + this.elapseSeconds();

    // gestion du joueur
    this.player.body.velocity.x = 0;
    if (this.cursors.left.isDown) { // fleche de gauche
      this.player.left(onEchelle);
    } else if (this.cursors.right.isDown) { // fleche de droite
      this.player.right(onEchelle);
    } else if (this.cursors.up.isDown) { // fleche du haut
        this.player.up(onEchelle, this.map);
    } else if (this.cursors.down.isDown) { // fleche du bas
        this.player.down(onEchelle);
    } else if (this.escapeButton.isDown) {
        this.endGame(this, 'menu');
    } else { // si aucune touche appuyée
      this.player.idle(onEchelle);
    }
    if (this.jumpButton.isDown) {
      this.player.jump(onEchelle);
    }
    if (this.actionButton.isDown) {
        var tile = this.map.getTile(Math.floor((this.player.x+32)/64), Math.floor((this.player.y+32)/64), this.map.backLayer);
        if (tile && tile.index == 57) { // sur une porte
            this.endGame(this, 'victory');
        } else {
            this.player.action(onEchelle);
        }
    }

    // permet de rapidement passer au niveau suivant
    if (this.cheatCodeButton.isDown) {
        this.endGame(this, 'victory');
    }
  }

  updateLives() {
      var sprite;
      for (var i=0; i<this.game.global.life; i++) {
          sprite = this.game.add.sprite(5 + 30*i, 59, 'heartFull');
          sprite.scale.setTo(0.5);
          sprite.fixedToCamera = true;
      }
      for (;i<this.game.global.maxlife;i++) {
          sprite = this.game.add.sprite(5 + 30*i, 59, 'heartEmpty');
          sprite.scale.setTo(0.5);
          sprite.fixedToCamera = true;
      }
  }

  elapseSeconds() {
      return Math.floor((this.game.time.now - this.startTime)/1000);
  }

  endGame(self, state) {
      self.game.global.elapsedTime = self.elapseSeconds();
      if (state == 'gameover') {
        if (self.player.action != 'dead') {
            this.game.global.life--;
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
    this.game.add.audio('collectSound').play('', 0, 0.25);
    bonus.kill(); // Removes the bonus from the screen

    //  Add and update the score
    this.updateScore(bonus.key, bonus.frame);

    if (this.map.bonusGroup.countLiving() <= 0) {
      this.endGame(this, 'victory');
    }
  }

  updateScore(sprite, index) {
      var collected = this.map.getCollectedObject(sprite, index);
      this.game.global.score += collected.points;
      collected.count++;
      this.scoreText.text = 'SCORE ' + this.game.global.score;
  }

  killEnemy(bullet, enemy) {
      if (enemy.alive) {
          bullet.kill();
          enemy.body.velocity.x = 0;
          enemy.animations.play('dead');
          enemy.alive = false;
          this.game.add.audio('hitSound').play();
          this.updateScore(enemy.key, enemy.frame);
          this.game.add.tween(enemy).to({alpha: 0}, 2000, Phaser.Easing.Linear.None, true);
          this.game.time.events.add(Phaser.Timer.SECOND * 2, function () {
              enemy.kill();
          });
      }
  }
}

export default Game;
