class Player extends Phaser.Sprite {

    //initialization code in the constructor
    constructor(game, x, y, frame) {
        super(game, x, y, game.global.playerSprite, 'idle/01');
        this.scale.setTo(0.33);

        //setup physics properties
        this.game.physics.arcade.enableBody(this);
        this.game.camera.follow(this);

        //this.body.bounce.y = 0.1;
        this.body.maxVelocity.set(this.game.global.maxVelocity);
        this.body.collideWorldBounds = true;
        if (this.game.global.playerSprite == 'ninja' || this.game.global.playerSprite == 'knight') {
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
        this.animations.add('attack', Phaser.Animation.generateFrameNames('attack/', 1, 3, '', 2), 10, false, false);

        this.addWeapon();

        this.jumpTimer = 0; // temps entre deux auts
        this.facing = 'right';
        this.status = 'idle';
    }

    action() {
      this.animations.play('attack');
      //this.game.add.audio('attackSound').play();
      this.weapon.fire();
    }

    jump() {
      if (this.jumpTimer <  this.game.time.now && (this.body.onFloor() || this.game.global.timer.echelle>0 || this.game.global.timer.bloc>0)) {
          this.animations.play('jump');
          this.body.velocity.y = -250;
          this.jumpTimer = this.game.time.now + 1000;
          this.status = 'jump';
      }
    }

    left() {
      if (this.game.global.timer.echelle>0) { // si on est sur une echelle
          this.x -= 5;
      } else {
          this.body.velocity.x = -this.game.global.speed;
      }

      if (this.facing != 'left') {
          this.scale.x *= -1; // symetrie verticale
          this.weapon.fireAngle = Phaser.ANGLE_LEFT;
      }

      if (this.body.onFloor()) {
          this.animations.play('run');
      }

      this.facing = 'left';
      this.status = 'move';
    }

    right() {
      if (this.game.global.timer.echelle>0) { // si on est sur une echelle
          this.x += 5;
      } else {
          this.body.velocity.x = this.game.global.speed;
      }
      if (this.facing != 'right') {
          this.scale.x *= -1; // symetrie verticale
          this.weapon.fireAngle = Phaser.ANGLE_RIGHT;
      }
      if (this.body.onFloor()) {
          this.animations.play('run');
      }
      this.facing = 'right';
      this.status = 'move';
    }

    up() {
      if (this.game.global.timer.echelle>0) { // si on est sur une echelle
          this.body.velocity.y = 0;
          this.body.gravity.set(0, -this.game.global.gravity);
          this.y -= 5;
      }
    }

    down() {
      if (this.game.global.timer.echelle>0) { // si on est sur une echelle
          this.body.velocity.y = 0;
          this.body.gravity.set(0, -this.game.global.gravity);
          this.y += 5;
      }
    }

    idle() {
      if (this.status != 'idle' && (this.body.onFloor() || this.game.global.timer.echelle>0 || this.game.global.timer.bloc>0) )  {
          this.animations.stop();
          this.animations.play('idle');
          this.status = 'idle';
      }
    }

    die() {
      this.status = 'dead';
      this.animations.play('dead');
    }

    addWeapon() {
        //  Creates 3 bullets, using the 'bullet' graphic
        this.weapon = this.game.add.weapon(3, 'bullet-fire');
        this.weapon.bulletGravity.set(0, -this.game.global.gravity);
        //  The bullet will be automatically killed when it leaves the world bounds
        this.weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
        this.weapon.bulletLifespan = 2000; // en milisecondes
        //  The speed at which the bullet is fired
        this.weapon.bulletSpeed = 600;
        //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
        this.weapon.fireRate = 200;
        //  Tell the Weapon to track the 'player' Sprite
        //  With no offsets from the position
        //  But the 'true' argument tells the weapon to track sprite rotation
        this.weapon.trackSprite(this, 0, 0);
        this.weapon.fireAngle = Phaser.ANGLE_RIGHT;
        this.weapon.onFire.add(function(bullet, weapon) {
            bullet.body.angularVelocity = 720;
        });
    }

}

export default Player;
