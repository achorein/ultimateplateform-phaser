 import Player from '../prefabs/player';

 /* variables globales */
 var echelle = 0;

class Game extends Phaser.State {

  constructor()  {
    super();
    this.jumpTimer = 0; // temps entre deux sauts
  }
  
  create() {
    var self = this; // pour utilisation simple dans les callback

    // commons
    this.game.physics.startSystem(Phaser.Physics.ARCADE); // gestion simple des collision : carré et cercle
    this.game.physics.arcade.gravity.y = this.game.global.gravity;
    this.game.time.desiredFps = 30;

    // Sprites
    this.background = this.game.add.sprite(0,0,'background');
    this.background.height = this.game.world.height;
    this.background.width = this.game.world.width;

    // tilemap
    this.map = this.game.add.tilemap('tilemap');
    this.map.addTilesetImage('world-spritesheet', 'world');
    // réupération des layers pour la construction du monde
    this.backLayer = this.map.createLayer('back');
    this.backLayer.resizeWorld();
    this.blocsLayer = this.map.createLayer('blocs');
    this.blocsLayer.resizeWorld();

    // gestion des collisions sur tile
    this.map.setLayer(this.blocsLayer);
    this.map.setCollisionBetween(1, 128);

    // Ajoute des zonnes de collision spécifiques à la main (car fonction this.map.createFromObjects impossible sans gid non généré par Tiled)
    // gestion des pentes
    this.stairGroup = this.game.add.group();
    this.stairGroup.enableBody = true;
    this.map.objects.stair.forEach(function(object){
      var sprite = self.game.add.sprite(object.x, object.y);
      self.game.physics.arcade.enableBody(sprite);
      sprite.body.moves = false;
      sprite.body.setSize(object.width, object.height);
      self.stairGroup.add(sprite);
    });
    // gestion des collisions sur les obejetcs plus petit qu'un sprite
    this.collisionGroup = this.game.add.group();
    this.collisionGroup.enableBody = true;
    this.map.objects.collision.forEach(function(object){
      var sprite = self.game.add.sprite(object.x, object.y);
      self.game.physics.arcade.enableBody(sprite);
      sprite.body.moves = false;
      sprite.body.setSize(object.width, object.height);
      self.collisionGroup.add(sprite);
    });

    // Gestion des collisions avec le décors (ajout des callback)
    // gestion des jumper
    this.map.setTileIndexCallback(242,
        function(sprite, tile) {
          sprite.body.velocity.y = -500;
          self.game.add.audio('jumpSound').play();
          tile.frameName = '';
        },
        this, this.backLayer);
    // Gestion des pics
    this.map.setTileIndexCallback(250,
        function(sprite, tile) { self.gameOver(self) },
        this, this.backLayer);
    // Gestion de l'eau
    this.map.setTileIndexCallback(130,
        function(sprite, tile) { self.gameOver(self) },
        this, this.backLayer);
    // Gestion des echelles
    this.map.setTileIndexCallback([156, 164, 188],
        function(sprite, tile) {
          // quand le joueur touche un sprite d'echelle, incrémente un compteur
          /*if (echelle <= 0) { console.log('echelle debut !' + echelle); }*/
          echelle++;
          self.game.time.events.add(Phaser.Timer.SECOND * 0.1, function() {
            // décrémente le compteur pour pouvoir déterminer si on est sortie de l'echelle
            echelle--;
            if (echelle <= 0) {
              // sortie de l'echelle, restauration de la gravité
              this.game.physics.arcade.gravity.y = this.game.global.gravity;
            }
          }, self);
        },
        this, this.backLayer);

    // Ajout des bonus
    this.starsGroup = this.game.add.group();
    this.starsGroup.enableBody = true;
    var collectableLayer = this.map.layers[this.map.getLayer('collectable')];
    collectableLayer.data.forEach(function(row) {
      row.forEach(function(data){
        if (data.index > 0) {
          var star = self.starsGroup.create(data.x*data.width, data.y*data.height, 'coin');
        }
      });
    });

    // Ajout du score
    this.font = this.game.add.retroFont('fonts', 16, 16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ -0123456789', 20);
    this.font.text =  'SCORE 0';
    this.game.add.image(5,5, this.font);

    //setup prefabs
    this.player = new Player(this.game, 16, this.game.world.centerY);
    this.game.add.existing(this.player);

    //setup audio
    this.music = this.game.add.audio('musicGame');
    this.music.play();

    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  }

  render() {
    var self = this;
    // Debug : mise en couleur des blocs invisibles
    /*this.stairGroup.forEachAlive(function(member) {
      self.game.debug.spriteBounds(member);
    });
    self.game.debug.body(this.player);*/
  }

  update() {
    // gestion des collisions (type terrain)
    this.game.physics.arcade.collide(this.player, this.blocsLayer);
    // hack pour gérer les pentes
    this.game.physics.arcade.collide(this.player, this.stairGroup, function(player, stair) {
      if (player.body.touching.left || player.body.touching.right) {
        player.y -= 1;
      }
    });
    // type decors
    this.game.physics.arcade.collide(this.player, this.backLayer); // nécessaire pour les callback sur tile
    // type bonus
    this.game.physics.arcade.collide(this.starsGroup, this.blocsLayer); // les étoiles sont soumis à la gravité donc se pose sur les blocs
    this.game.physics.arcade.collide(this.starsGroup, this.stairGroup); // les étoiles sont soumis à la gravité donc se pose sur les blocs
    this.game.physics.arcade.overlap(this.player, this.starsGroup, this.collectStar, null, this); // quand le joueur touche une étoile

      // gestion du joueur
    this.player.body.velocity.x = 0;

    if (this.cursors.left.isDown) { // fleche de gauche
      if (echelle>0) { // si on est sur une echelle
        this.player.x -= 5;
      } else {
        this.player.body.velocity.x = -150;
      }

      if (this.facing != 'left') {
        this.player.animations.play('left');
        this.facing = 'left';
      }

    } else if (this.cursors.right.isDown) { // fleche de droite
      if (echelle>0) { // si on est sur une echelle
        this.player.x += 5;
      } else {
        this.player.body.velocity.x = 150;
      }
      if (this.facing != 'right') {
        this.player.animations.play('right');
        this.facing = 'right';
      }

    } else if (this.cursors.up.isDown) { // fleche du haut
      if (echelle > 0) { // si on est sur une echelle
        this.player.body.velocity.y = 0;
        this.game.physics.arcade.gravity.y = 0.1;
        this.player.y -= 5;
      }

    } else if (this.cursors.down.isDown) { // fleche du bas
      if (echelle > 0) { // si on est sur une echelle
        this.player.body.velocity.y = 0;
        this.game.physics.arcade.gravity.y = 0.1;
        this.player.y += 5;
      }

    } else { // si aucune touche appuyée
      if (this.facing != 'idle')  {
        this.player.animations.stop();

        if (this.facing == 'left') {
          this.player.frame = 0;
        } else {
          this.player.frame = 5;
        }

        this.facing = 'idle';
      }
    }

    if (this.jumpButton.isDown && this.player.body.onFloor()) {
      this.player.body.velocity.y = -250;
      this.jumpTimer = this.game.time.now + 1500;
    }
  }

  gameOver(self) {
    self.music.stop();
    self.game.state.start('gameover');
  }

  collectStar(player, star) {
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    this.game.global.score += 10;
    this.font.text = 'SCORE ' + this.game.global.score;

    if (this.starsGroup.countLiving() <= 0) {
      self.music.stop();
      self.game.state.start('victory');
    }
  }
}

export default Game;
