import LevelMap from '../prefabs/level';

class Game extends Phaser.State {

  constructor()  {
    super();
  }
  
  create() {
    var self = this; // pour utilisation simple dans les callback

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

    this.game.global.collected = {
          coin: {
              count: 0
          },
          gem: {
              count: 0
          }
      };

    // Ajout du score
    this.scoreText = this.game.add.retroFont('fonts', 16, 16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ -0123456789', 20);
    this.scoreText.text =  'SCORE ' + this.game.global.score;
    this.game.add.image(5,5, this.scoreText);

    // Ajout du temps écoulé
    this.startTime = this.game.time.now;
    this.timeText = this.game.add.retroFont('fonts', 16, 16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ -0123456789', 20);
    this.timeText.text =  'TIME 0';
    this.game.add.image(5, 32, this.timeText);

    // Setup audio
    this.music = this.game.add.audio('musicGame', 2, true);
    this.music.play();

    // Inputs
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.escapeButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
  }

  render() {
    var self = this;
    // Debug : mise en couleur des blocs invisibles
    /*this.stairGroup.forEachAlive(function(member) {
      self.game.debug.spriteBounds(member);
    });*/
    //self.game.debug.body(this.player);
  }

  update() {
    var onEchelle = this.map.update(this); // gestion des collisions

    // Mise à jour du temps
    this.timeText.text =  'TIME ' + this.elapseSeconds();

    // gestion du joueur
    this.player.body.velocity.x = 0;
    if (this.cursors.left.isDown) { // fleche de gauche
      this.player.left(onEchelle);
    } else if (this.cursors.right.isDown) { // fleche de droite
      this.player.right(onEchelle);
    } else if (this.cursors.up.isDown) { // fleche du haut
        var tile = this.map.getTile(Math.floor((this.player.x+32)/64), Math.floor((this.player.y+32)/64), this.map.backLayer);
        if (tile && tile.index == 57) { // sur une porte
            this.endGame(this, 'victory');
        } else {
            this.player.up(onEchelle, this.map);
        }
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
  }

  elapseSeconds() {
      return Math.floor((this.game.time.now - this.startTime)/1000);
  }

  endGame(self, state) {
      self.game.global.elapsedTime = self.elapseSeconds();
      if (state == 'gameover') {
        if (self.player.action != 'dead') {
            self.player.die();
            self.game.add.audio('deadSound').play();
            self.music.stop();
            self.game.state.start('gameover');
            return;
        }
      }
      self.music.stop();
      self.game.state.start(state);
  }

  shutdown() {
    this.game.world.removeAll();
  }

  /*
   * Callbacks appelés depuis la classe Level (utilisation de this.levelState)
   */

  killPlayerCallback(sprite, tile) {
    this.levelState.endGame(this.levelState, 'gameover');
  }

  collectBonus(player, bonus) {
    this.game.add.audio('collectSound').play('', 0, 0.25);
    bonus.kill(); // Removes the bonus from the screen

    //  Add and update the score
    this.game.global.score += bonus.points;
    this.game.global.collected[bonus.key].count++;
    this.game.global.collected[bonus.key].points = bonus.points;
    this.levelState.scoreText.text = 'SCORE ' + this.game.global.score;

    if (this.bonusGroup.countLiving() <= 0) {
      this.levelState.endGame(this.levelState, 'victory');
    }
  }
}

export default Game;
