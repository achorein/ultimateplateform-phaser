class Player extends Phaser.Sprite {

  //initialization code in the constructor
  constructor(game, x, y, frame) {
    super(game, x, y, game.global.playerSprite, 'idle/01');
    this.scale.setTo(0.33);

    //setup physics properties
    this.game.physics.arcade.enableBody(this);

    this.body.bounce.y = 0.1;
    this.body.collideWorldBounds = true;
    if (game.global.playerSprite == 'ninjaPlayer' || game.global.playerSprite == 'knightPlayer') {
        this.body.setSize(120, 200, 0, 16);
    } else {
        this.body.setSize(120, 200, 96, 32);
    }

    this.anchor.setTo(.5,.5);

    // add animations from spritesheets
    this.animations.add('dead', Phaser.Animation.generateFrameNames('dead/', 1, 8, '', 2), 6, false, false);
    this.animations.add('idle', Phaser.Animation.generateFrameNames('idle/', 1, 10, '', 2), 10, true, false);
    this.animations.add('jump', Phaser.Animation.generateFrameNames('jump/', 1, 10, '', 2), 10, false, false);
    this.animations.add('run', Phaser.Animation.generateFrameNames('run/', 1, 10, '', 2), 10, true, false);

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
