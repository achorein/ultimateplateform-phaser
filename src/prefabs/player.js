class Player extends Phaser.Sprite {

  //initialization code in the constructor
  constructor(game, x, y, frame) {
    super(game, x, y, 'dude', frame);

    //setup physics properties
    this.game.physics.arcade.enableBody(this);

    this.body.bounce.y = 0.1;
    this.body.collideWorldBounds = true;
    this.body.setSize(40, 32, 5, 16);
    this.anchor.setTo(.5,.5);

    // add animations from spritesheets
    this.animations.add('dead', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 6, false);
    this.animations.add('idle', [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 20, true);
    this.animations.add('jump', [20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 10, false);
    this.animations.add('run', [30, 31, 32, 33, 34, 35, 36, 37], 10, true);

    this.jumpTimer = 0; // temps entre deux sauts
    this.facing = 'right';
    this.action = 'idle';
  }

  jump(onEchelle) {
      if (this.body.onFloor() || onEchelle) {
          this.animations.play('jump');
          this.body.velocity.y = -250;
          this.jumpTimer = this.game.time.now + 1500;
          this.action = 'jump';
      }
  }

  left(onEchelle) {
      if (onEchelle) { // si on est sur une echelle
          this.x -= 5;
      } else {
          this.body.velocity.x = -150;
      }

      if (this.facing != 'left') {
          this.scale.x *= -1; // symetrie verticale
      }

      if (this.body.onFloor()) {
          this.animations.play('run');
      }

      this.facing = 'left';
      this.action = 'move';
  }

  right(onEchelle) {
      if (onEchelle) { // si on est sur une echelle
          this.x += 5;
      } else {
          this.body.velocity.x = 150;
      }
      if (this.facing != 'right') {
          this.scale.x *= -1; // symetrie verticale
      }
      if (this.body.onFloor()) {
          this.animations.play('run');
      }
      this.facing = 'right';
      this.action = 'move';
  }

  up(onEchelle) {
      if (onEchelle) { // si on est sur une echelle
          this.body.velocity.y = 0;
          this.game.physics.arcade.gravity.y = 0.1;
          this.y -= 5;
      }
  }

  down(onEchelle) {
      if (onEchelle) { // si on est sur une echelle
          this.body.velocity.y = 0;
          this.game.physics.arcade.gravity.y = 0.1;
          this.y += 5;
      }
  }

  idle(onEchelle) {
      if (this.action != 'idle' && (this.body.onFloor() || onEchelle) )  {
          this.animations.stop();
          this.animations.play('idle');
          this.action = 'idle';
      }
  }

  die() {
      this.action = 'dead';
      this.animations.play('dead');
  }

}

export default Player;
