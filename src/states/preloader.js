class Preloader extends Phaser.State {

    constructor() {
        super();
        this.asset = null;
        this.ready = false;
    }

    preload() {
        this.game.stage.backgroundColor = "#4488AA";

        this.game.add.sprite(this.game.centerX, this.game.centerY-200, 'logo').anchor.set(0.5);

        //setup loading bar
        this.asset = this.add.sprite(this.game.centerX - 110, this.game.centerY, 'preloader');
        this.load.setPreloadSprite(this.asset);

        this.game.add.sprite(this.game.centerX - 150, this.game.height - 100, 'vikings').anchor.set(0.5);
        this.game.add.sprite(this.game.centerX + 150 , this.game.height - 100, 'phaser').anchor.set(0.5);

        //Setup loading and its events
        this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
        this.loadResources();
    }

    loadResources() {
        /**
         * Images
         */
        // commun
        this.game.load.image('background','assets/background.png');

        // carte
        for (var i=1;i<=this.game.global.level.max;i++) {
            this.game.load.tilemap('tilemap-level-'+i, 'assets/tilesmap/level-'+i+'.json', null, Phaser.Tilemap.TILED_JSON);
            this.game.load.image('background-level-'+i, 'assets/tilesmap/level-'+i+'-background.png');
        }
        this.game.load.spritesheet('world','assets/tilesmap/tilesmap.png', 64, 64);

        // players
        this.game.load.atlasJSONHash('adventure_girl', 'assets/adventure_girl.png', 'assets/adventure_girl.json');
        this.game.load.atlasJSONHash('knight', 'assets/knight.png', 'assets/knight.json');
        this.game.load.atlasJSONHash('robot', 'assets/robot.png', 'assets/robot.json');
        this.game.load.atlasJSONHash('ninja', 'assets/ninja.png', 'assets/ninja.json');
        this.game.load.atlasJSONHash('ninjagirl', 'assets/ninjagirl.png', 'assets/ninjagirl.json');
        this.game.load.atlasJSONHash('santa', 'assets/santa.png', 'assets/santa.json');
        // enemies
        this.game.load.atlasJSONHash('zombiemale', 'assets/zombiemale.png', 'assets/zombiemale.json');
        this.game.load.atlasJSONHash('zombiefemale', 'assets/zombiefemale.png', 'assets/zombiefemale.json');
        this.game.load.atlasJSONHash('pingun', 'assets/enemy-pingun.png', 'assets/enemy-pingun.json');
        this.game.load.spritesheet('snowman', 'assets/enemy-snowman.png', 64, 73);
        this.game.load.spritesheet('spider', 'assets/enemy-spider.png', 77, 53);
        this.game.load.spritesheet('bee', 'assets/enemy-bee.png', 56, 48);
        this.game.load.spritesheet('frog', 'assets/enemy-frog.png', 61, 54);
        this.game.load.spritesheet('bat', 'assets/enemy-bat.png', 88, 47);
        this.game.load.spritesheet('snail', 'assets/enemy-snail.png', 60, 40);
        this.game.load.spritesheet('fly', 'assets/enemy-fly.png', 65, 45);
        this.game.load.spritesheet('mouse', 'assets/enemy-mouse.png', 59, 35);

        // armes
        this.game.load.image('bullet-knife', 'assets/bullet_knife.png');
        this.game.load.image('bullet-laser', 'assets/bullet_laser.png');
        this.game.load.image('bullet-fire', 'assets/bullet_fire.png');
        this.game.load.image('bullet-water', 'assets/bullet_water.png');

        // Elements divers
        this.game.load.image('heartFull', 'assets/hud_heartFull.png');
        this.game.load.image('heartEmpty', 'assets/hud_heartEmpty.png');
        this.game.load.image('victory', 'assets/text_victory.png');
        this.game.load.image('finished', 'assets/text_finished.png');
        this.game.load.image('lose', 'assets/text_lose.png');
        this.game.load.image('gameover', 'assets/text_gameover.png');

        this.game.load.image('keys', 'assets/keys.png');

        /*
         * Sons
         */
        // musics
        this.game.load.audio('musicMenu','assets/sounds/menu_music.mp3');
        this.game.load.audio('miscMenu','assets/sounds/menu_misc.wav');
        this.game.load.audio('musicGame','assets/sounds/game.mp3');
        // bruitages
        this.game.load.audio('okMenu','assets/sounds/menu_ok.wav');
        this.game.load.audio('jumpSound','assets/sounds/jump.ogg');
        this.game.load.audio('winnerSound','assets/sounds/winner.mp3');
        this.game.load.audio('failedSound','assets/sounds/lose.mp3');
        this.game.load.audio('deadSound','assets/sounds/dead.mp3');
        this.game.load.audio('collectSound','assets/sounds/collect.mp3');
        this.game.load.audio('attackSound','assets/sounds/attack.mp3');
        this.game.load.audio('hitSound','assets/sounds/hit.mp3');
    }

    onLoadComplete() {
        this.game.state.start('menu');
    }
}

export default Preloader;
