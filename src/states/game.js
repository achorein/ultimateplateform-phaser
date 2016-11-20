 import Player from '../prefabs/player';

 /* variables globales */
 var echelle = 0;

class Game extends Phaser.State {

  constructor()  {
    super();
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
    this.background.fixedToCamera = true;

    // tilemap
    this.map = this.game.add.tilemap('tilemap-level-'+this.game.global.level);
    this.map.addTilesetImage('world-spritesheet', 'world');
    // réupération des layers pour la construction du monde
    this.backLayer = this.map.createLayer('back');
    this.backLayer.resizeWorld();
    this.blocsLayer = this.map.createLayer('blocs');
    this.blocsLayer.resizeWorld();

    // gestion des collisions sur tile
    this.map.setLayer(this.blocsLayer);
    this.map.setCollisionBetween(1, 256);

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
          self.game.add.audio('jumpSound').play('', 0, 0.25);
          // on met une image de jumper activé
          self.map.replace(tile.index, 234, tile.x, tile.y, 1, 1, self.backLayer);
          self.game.time.events.add(Phaser.Timer.SECOND * 0.25, function() {
              // on remet une image de jumper désactivé
            self.map.replace(234, 242, tile.x, tile.y, 1, 1, self.backLayer);
          });
        },
        this, this.backLayer);
    // Gestion des pics
    this.map.setTileIndexCallback(250,
        function(sprite, tile) { self.endGame(self, 'gameover') },
        this, this.backLayer);
    // Gestion de l'eau
    this.map.setTileIndexCallback(130,
        function(sprite, tile) { self.endGame(self, 'gameover') },
        this, this.backLayer);
    // Gestion des echelles
    this.map.setTileIndexCallback([156, 164, 188, 228],
        function(sprite, tile) {
          // quand le joueur touche un sprite d'echelle, incrémente un compteur
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
        var offset = 16;
          var star = self.starsGroup.create(data.x*data.width+offset, data.y*data.height+offset, (data.properties.points=='100')?'gem':'coin');
          star.points = parseInt(data.properties.points);
          star.body.moves = false; // ne subit pas la gravité
        }
      });
    });

    //setup prefabs
    var gameLayer = this.map.layers[this.map.getLayer('game')];
    gameLayer.data.forEach(function(row) {
        row.forEach(function(data){
            if (data.index > 0 && data.properties.start) {
                self.player = new Player(self.game, data.x*data.width, data.y*data.height);
                self.game.add.existing(self.player);
            }
        });
    });

    // Ajout du score
    this.font = this.game.add.retroFont('fonts', 16, 16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ -0123456789', 20);
    this.font.text =  'SCORE ' + this.game.global.score;
    this.game.add.image(5,5, this.font);

    //setup audio
    this.music = this.game.add.audio('musicGame', 2, true);
    this.music.play();

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
    // gestion des collisions (type terrain)
    this.game.physics.arcade.collide(this.player, this.blocsLayer);
    // hack pour gérer les pentes
    this.game.physics.arcade.collide(this.player, this.stairGroup, function(player, stair) {
      if (player.body.touching.left || player.body.touching.right) {
        player.y -= 1;
        player.body.velocity.x += 10;
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

    var onEchelle = echelle>0;
    if (this.cursors.left.isDown) { // fleche de gauche
      this.player.left(onEchelle);
    } else if (this.cursors.right.isDown) { // fleche de droite
      this.player.right(onEchelle);
    } else if (this.cursors.up.isDown) { // fleche du haut
        var tile = this.map.getTile(Math.floor((this.player.x+32)/64), Math.floor((this.player.y+32)/64), this.backLayer);
        if (tile && tile.index == 204) { // sur une porte
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

  endGame(self, state) {
      if (state == 'gameover') {
        if (self.player.action != 'dead') {
            self.player.die();
            self.game.add.audio('deadSound').play();
            self.game.time.events.add(Phaser.Timer.SECOND * 0.7, function () {
                self.music.stop();
                self.game.state.start('gameover');
            });
        }
      } else {
          self.music.stop();
          self.game.state.start(state);
      }
  }

  shutdown() {
    this.game.world.removeAll();
  }

  collectStar(player, star) {
    this.game.add.audio('collectSound').play('', 0, 0.25);
    // Removes the star from the screen
    star.kill();
    //  Add and update the score
    this.game.global.score += star.points;
    this.font.text = 'SCORE ' + this.game.global.score;

    if (this.starsGroup.countLiving() <= 0) {
      this.endGame(this, 'victory');
    }
  }
}

export default Game;
