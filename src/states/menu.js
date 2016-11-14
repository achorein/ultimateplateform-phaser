import Player from '../prefabs/player';

class Menu extends Phaser.State {

  constructor() {
    super();
  }
  
  create() {
    var self = this;
    //add background image
    this.background = this.game.add.sprite(0,0, 'background');
    this.background.height = this.game.world.height;
    this.background.width = this.game.world.width;
    this.background.alpha = 0.1;

    // Ajout du score
    this.font = this.game.add.retroFont('fonts', 16, 16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ -0123456789', 20);
    this.font.text = 'PRESS ANY KEY';
    this.game.add.image(this.game.world.centerX,this.game.world.centerY, this.font);

    // press any key
    this.game.input.keyboard.onDownCallback = function(e) {
      self.onInputDown(self);
    }

    this.player = new Player(this.game, -32, this.game.world.height * 0.75);
    this.player.body.collideWorldBounds = false;
    this.game.add.existing(this.player);
    this.player.body.velocity.x = 150;
    this.player.animations.play('right');

    this.canContinueToNextState = true;
  }

  update() {}

  //create some cool tweens and apply them to 'this.ready' and 'this.go'
  onInputDown (self) {
    if( ! self.canContinueToNextState){ //do not allow tweens to be created multiple times simultaneously
      return;
    }

    self.canContinueToNextState = false;
    self.font.visible = false;

    //self.music.stop();
    self.game.state.start('game');
/*
    self.go.angle = -15;

    //create some tweens - http://phaser.io/docs/2.5.0/Phaser.Tween.html#to
    const ready_tween = self.game.add.tween(self.ready.scale)
      .to({ x: 1.5, y: 1.5}, 500, Phaser.Easing.Linear.In,false,0,-1,true);

    const go_tween = self.game.add.tween(self.go)
      .to({ angle: 15}, 200, Phaser.Easing.Linear.In,false,0,-1,true);

    //when the 'ready' tween is done, hide it and show 'go'. perform a shaking/rotating tween on 'go'. When 'go' is done, start the game
    var go_tween_repeat_num = 3; //how many times these tweens should loop
    var ready_tween_repeat_num = 3;

    const go_tween_loop = function(){
      go_tween_repeat_num -= 0.5;
      if(go_tween_repeat_num < 1){
        self.go.visible = false;
        self.music.stop();
        self.game.state.start('game');
      }
    };
    const ready_tween_loop = function(){
      ready_tween_repeat_num -= 0.5;
      if(ready_tween_repeat_num < 1){
        self.ready.visible = false;
        self.go.visible = true;

        go_tween.start();
      }
    };
    ready_tween.onLoop.add(ready_tween_loop, self);
    go_tween.onLoop.add(go_tween_loop, self);

    ready_tween.start();
    */
  }

}

export default Menu;
