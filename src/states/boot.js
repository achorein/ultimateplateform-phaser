class Boot extends Phaser.State {

    constructor() {
        super();
    }

    preload() {
        this.load.image('preloader', 'assets/preloader.gif');
        this.load.image('logo', 'assets/game-logo.png');
        this.load.image('vikings', 'assets/vikings-logo.png');
        this.load.image('phaser', 'assets/phaser.png');
    }

    create() {
        this.initGlobalVariables();

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
                life: 2,
                maxlife: 3,
                speed: 250,
                nbBullet: 1,
                sprite: '',
                collected: [],
                name: 'Player 1'
            },
            timer: {
                bloc: 0,
                echelle: 0
            },
            server: {
                url: '/api'
            },
            devMode: true
        };
        if (!this.game.global.devMode) {
            this.game.global.level.max = 1;
        }
    }

}

export default Boot;
