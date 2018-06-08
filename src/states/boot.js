import Commun from '../commun';
import environement from '../env.json';

class Boot extends Phaser.State {

    constructor() {
        super();
    }

    preload() {
        this.load.image('preloader', 'assets/menu/preloader.gif');
        this.load.image('logo', 'assets/menu/game-logo.png');
        this.load.image('vikings', 'assets/menu/vikings-logo.png');
        this.load.image('phaser', 'assets/menu/phaser.png');
    }

    create() {
        this.initGlobalVariables();
        this.game.commun = new Commun(this.game);
        this.game.state.start('preloader');
    }

    initGlobalVariables(){
        this.game.centerX = Math.floor(this.game.width/2);
        this.game.centerY = Math.floor(this.game.height/2);
        this.game.global = {
            score: 0,
            scoreLastLevel: 0,
            level: {
                current: 1,
                max: 3,
                gravity: 400,
                maxVelocity: 475,
                elapsedTime: 0
            },
            player: {
                life: 1,
                maxlife: 1,
                speed: 250,
                nbBullet: 1,
                sprite: '',
                name: 'Player 1'
            },
            server: {
                url: '/api'
            },
            devMode: true,
            enableRest: true,
            enablePad: false
        };
        
        this.game.global.level.max = environement.level_max;
        this.game.global.enablePad = environement.enable_pad;
        //this.game.global.enableRest = false;
        this.game.global.server.url = environement.server_url
    }

}

export default Boot;
