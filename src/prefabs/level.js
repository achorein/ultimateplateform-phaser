import Player from '../prefabs/player';

/* variables globales */
var echelle = 0;

class Level extends Phaser.Tilemap {

  //initialization code in the constructor
  constructor(state, key, tileWidth, tileHeight, width, height) {
    super(state.game, key, tileWidth, tileHeight, width, height);
    var self = this;
    this.levelState = state;

    this.addTilesetImage('world-spritesheet', 'world');
    // réupération des layers pour la construction du monde
    this.backLayer = this.createLayer('back');
    this.backLayer.resizeWorld();
    this.blocsLayer = this.createLayer('blocs');
    this.blocsLayer.resizeWorld();

    // gestion des collisions sur tile
    this.setLayer(this.blocsLayer);
    this.setCollisionBetween(1, 256);

    // Ajoute des zonnes de collision spécifiques à la main (car fonction this.createFromObjects impossible sans gid non généré par Tiled)
    // gestion des pentes
    this.stairGroup = this.game.add.group();
    this.stairGroup.enableBody = true;
    this.objects.stair.forEach(function(object){
      var sprite = self.game.add.sprite(object.x, object.y);
      self.game.physics.arcade.enableBody(sprite);
      sprite.body.moves = false;
      sprite.body.setSize(object.width, object.height);
      self.stairGroup.add(sprite);
    });
    // gestion des collisions sur les obejetcs plus petit qu'un sprite
    this.collisionGroup = this.game.add.group();
    this.collisionGroup.enableBody = true;
    this.objects.collision.forEach(function(object){
      var sprite = self.game.add.sprite(object.x, object.y);
      self.game.physics.arcade.enableBody(sprite);
      sprite.body.moves = false;
      sprite.body.setSize(object.width, object.height);
      self.collisionGroup.add(sprite);
    });

    // Gestion des collisions avec le décors (ajout des callback)
    // gestion des jumper
    this.setTileIndexCallback(557, this.jumperCallback, this, this.backLayer);
    // Gestion des pics et de l'eau
    this.setTileIndexCallback([555, 556, 81, 82, 83, 84, 85, 86, 170, 171, 176,177], state.killPlayerCallback, this, this.backLayer);
    // Gestion des echelles
    this.setTileIndexCallback([79, 80, 93, 94, 95], this.echelleCallback, this, this.backLayer);

    // Ajout des bonus
    this.bonusGroup = this.game.add.group();
    this.bonusGroup.enableBody = true;
    var collectableLayer = this.layers[this.getLayer('collectable')];
    collectableLayer.data.forEach(function(row) {
      row.forEach(function(data){
          if (data.index > 0) {
              var offset = 16;
              var star = self.bonusGroup.create(data.x*data.width+offset, data.y*data.height+offset, (data.properties.points=='100')?'gem':'coin');
              star.points = parseInt(data.properties.points);
              star.body.moves = false; // ne subit pas la gravité
          }
      });
    });

    // Ajout du joueur
    var gameLayer = this.layers[this.getLayer('game')];
    gameLayer.data.forEach(function(row) {
      row.forEach(function(data){
          if (data.index > 0 && data.properties.start) {
              state.player = new Player(self.game, data.x*data.width, data.y*data.height);
              self.game.add.existing(state.player);
          }
      });
    });

    this.frontLayer = this.createLayer('front');
    this.frontLayer.resizeWorld();
  }

  update(state) {
      // gestion des collisions (type terrain)
      this.game.physics.arcade.collide(state.player, this.blocsLayer);
      // hack pour gérer les pentes
      this.game.physics.arcade.collide(state.player, this.stairGroup, function(player, stair) {
          if (player.body.touching.left || player.body.touching.right) {
              player.y -= 1;
              player.body.velocity.x += 10;
          }
      });
      // type decors
      this.game.physics.arcade.collide(state.player, this.backLayer); // nécessaire pour les callback sur tile
      // type bonus
      this.game.physics.arcade.overlap(state.player, this.bonusGroup, state.collectBonus, null, this); // quand le joueur touche une étoile
      return echelle>0;
  }

  jumperCallback(sprite, tile) {
    var self = this;
    sprite.body.velocity.y = -this.game.global.jump;
    this.game.add.audio('jumpSound').play('', 0, 0.25);
    // on met une image de jumper activé
    this.replace(tile.index, 558, tile.x, tile.y, 1, 1, this.backLayer);
    this.game.time.events.add(Phaser.Timer.SECOND * 0.25, function() {
        // on remet une image de jumper désactivé
        self.replace(558, 557, tile.x, tile.y, 1, 1, self.backLayer);
    });
  }

  echelleCallback(sprite, tile) {
      // quand le joueur touche un sprite d'echelle, incrémente un compteur
      echelle++;
      this.game.time.events.add(Phaser.Timer.SECOND * 0.1, function() {
          // décrémente le compteur pour pouvoir déterminer si on est sortie de l'echelle
          echelle--;
          if (echelle <= 0) {
              // sortie de l'echelle, restauration de la gravité
              this.game.physics.arcade.gravity.y = this.game.global.gravity;
          }
      }, this);
  }
}

export default Level;
