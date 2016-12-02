class Player extends Phaser.Sprite {

    //initialization code in the constructor
    constructor(game, x, y, frame) {
        super(game, x, y, game.global.player.sprite, 'idle/01');
        this.scale.setTo(0.33);

        //setup physics properties
        this.game.physics.arcade.enableBody(this);
        this.game.camera.follow(this);

        //this.body.bounce.y = 0.1;
        this.body.maxVelocity.set(this.game.global.level.maxVelocity);
        this.body.collideWorldBounds = true;
        if (this.game.global.player.sprite == 'ninja') {
            this.body.setSize(128, 192, 0, 28);
        } else if (this.game.global.player.sprite == 'knight') {
            this.body.setSize(128, 192, 0, 40);
        } else if (this.game.global.player.sprite == 'adventure_girl') {
            this.body.setSize(128, 192, 64, 48);
        } else { // robot
            this.body.setSize(128, 192, 64, 52);
        }
        this.anchor.setTo(0.5,0.5);

        // add animations from spritesheets
        this.animations.add('dead', Phaser.Animation.generateFrameNames('dead/', 1, 8, '', 2), 6, false, false);
        this.animations.add('idle', Phaser.Animation.generateFrameNames('idle/', 1, 10, '', 2), 10, true, false);
        this.animations.add('jump', Phaser.Animation.generateFrameNames('jump/', 1, 10, '', 2), 10, false, false);
        this.animations.add('run', Phaser.Animation.generateFrameNames('run/', 1, 10, '', 2), 10, true, false);
        this.animations.add('attack', Phaser.Animation.generateFrameNames('attack/', 1, 3, '', 2), 10, false, false);
        if (this.game.global.player.sprite == 'ninja') {
            this.animations.add('climp', Phaser.Animation.generateFrameNames('climp/', 1, 10, '', 2), 10, false, false);
            this.canClimp = true;
        }

        this.addWeapon();

        this.inventory = {};

        this.jumpTimer = 0; // temps entre deux auts
        this.facing = 'right';
        this.status = 'idle';
    }

    action() {
        if(this.weapon.fire()) {
            this.animations.play('attack');
            if (this.facing != 'left') { // regarde à droite
                this.body.velocity.x = -this.game.global.player.speed*1.5;
            } else {
                this.body.velocity.x = this.game.global.player.speed*1.5;
            }
            //this.game.add.audio('attackSound').play();
        }
    }

    addToInventory(type, name, sprite) {
        if (!this.inventory[type]) {
            this.inventory[type] = [];
        }
        this.inventory[type].push({name: name, sprite: sprite});
    }

    getFromInventory(type, name) {
        if (this.inventory[type]) {
            for(var i=0; i<this.inventory[type].length; i++) {
                if (this.inventory[type][i].name == name) {
                    return this.inventory[type][i].sprite;
                }
            }
        }
        return null;
    }

    removeFromInventory(type, name) {
        if (this.inventory[type]) {
            for(var i=0; i<this.inventory[type].length; i++) {
                if (this.inventory[type][i].name == name) {
                    this.inventory[type].splice(i, 1); // remove object from table
                    return;
                }
            }
        }
    }

    jump() {
        if (this.jumpTimer <  this.game.time.now && this.onFloor()) {
            this.animations.play('jump');
            this.body.velocity.y = -this.game.global.player.speed;
            this.jumpTimer = this.game.time.now + 1000;
            this.status = 'jump';
            this.onEchelle = false;
        }
    }

    left() {
        this.body.velocity.x = -this.game.global.player.speed;

        if (this.facing != 'left') {
            this.scale.x *= -1; // symetrie verticale
            this.weapon.fireAngle = Phaser.ANGLE_LEFT;
        }

        if (this.onEchelle && this.canClimp) {
            this.animations.play('climp');
        } else if (this.onFloor()) {
            this.animations.play('run');
        }

        this.facing = 'left';
        this.status = 'move';
    }

    right() {
        this.body.velocity.x = this.game.global.player.speed;

        if (this.facing != 'right') {
            this.scale.x *= -1; // symetrie verticale
            this.weapon.fireAngle = Phaser.ANGLE_RIGHT;
        }
        if (this.onEchelle && this.canClimp) {
            this.animations.play('climp');
        } else if (this.onFloor()) {
            this.animations.play('run');
        }
        this.facing = 'right';
        this.status = 'move';
    }

    up() {
        if (this.echelleOverlap) { // si on est sur une echelle
            if(this.canClimp) {
                this.animations.play('climp');
            }
            this.body.velocity.y = -this.game.global.player.speed/2;
            this.body.gravity.set(0, -this.game.global.level.gravity+0.1);
            this.onEchelle = true;
        }
    }

    down() {
        if (this.echelleOverlap) { // si on est sur une echelle
            if(this.canClimp) {
                this.animations.play('climp');
            }
            this.body.velocity.y = this.game.global.player.speed/2;
            this.body.gravity.set(0, -this.game.global.level.gravity+0.1);
            this.onEchelle = true;
        }
    }

    idle() {
        if (this.canClimp && this.onEchelle) {
            this.animations.play('climp');
            this.animations.stop();
        }else if (this.status != 'idle' && this.onFloor())  {
            this.animations.stop();
            this.animations.play('idle');
            this.status = 'idle';
        }
    }

    die() {
        this.status = 'dead';
        this.animations.play('dead');
    }

    onFloor() {
        return this.body.onFloor() || this.echelleOverlap || this.game.global.timer.bloc>0;
    }

    addWeapon() {
        //  Creates 3 bullets, using the 'bullet' graphic
        this.weapon = this.game.add.weapon(this.game.global.player.nbBullet, 'bullet-fire');
        this.weapon.bulletGravity.set(0, -this.game.global.level.gravity);
        //  The bullet will be automatically killed when it leaves the world bounds
        this.weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
        this.weapon.bulletLifespan = 2000; // en milisecondes
        //  The speed at which the bullet is fired
        this.weapon.bulletSpeed = 600;
        //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
        this.weapon.fireRate = 200;
        this.weapon.bulletWorldWrap = true;
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
