import Boot from './states/boot';
import Game from './states/game';
import Menu from './states/menu';
import Preloader from './states/preloader';
import Gameover from './states/gameover';
import Victory from './states/victory';

var conf = {
    width: 1024,
    height: 768,
    renderer: Phaser.AUTO,
    parent: 'phaserdemo-game',
    transparent: false,
    antialias: false,
    state: this,
    scaleMode: Phaser.ScaleManager.RESIZE
};

const game = new Phaser.Game(conf);

game.state.add('boot', new Boot());
game.state.add('game', new Game());
game.state.add('menu', new Menu());
game.state.add('preloader', new Preloader());
game.state.add('gameover', new Gameover());
game.state.add('victory', new Victory());

game.state.start('boot');
