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
        // carte
        for (var i=1;i<=this.game.global.level.max;i++) {
            this.game.load.tilemap('tilemap-level-'+i, 'assets/tilesmap/level-'+i+'.json', null, Phaser.Tilemap.TILED_JSON);
            this.game.load.image('background-level-'+i, 'assets/tilesmap/level-'+i+'-background.png');
        }
        this.game.load.spritesheet('world','assets/tilesmap/tilesmap.png', 64, 64);

        // players
        this.game.load.atlasJSONHash('adventure_girl', 'assets/animations/character/adventure_girl.png', 'assets/animations/character/adventure_girl.json');
        this.game.load.atlasJSONHash('adventure_boy', 'assets/animations/character/adventure_boy.png', 'assets/animations/character/adventure_boy.json');
        this.game.load.atlasJSONHash('knight', 'assets/animations/character/knight.png', 'assets/animations/character/knight.json');
        this.game.load.atlasJSONHash('robot', 'assets/animations/character/robot.png', 'assets/animations/character/robot.json');
        this.game.load.atlasJSONHash('ninja', 'assets/animations/character/ninja.png', 'assets/animations/character/ninja.json');
        this.game.load.atlasJSONHash('ninjagirl', 'assets/animations/character/ninjagirl.png', 'assets/animations/character/ninjagirl.json');
        this.game.load.atlasJSONHash('santa', 'assets/animations/character/santa.png', 'assets/animations/character/santa.json');
        // enemies
        this.game.load.atlasJSONHash('zombiemale', 'assets/animations/character/zombiemale.png', 'assets/animations/character/zombiemale.json');
        this.game.load.atlasJSONHash('zombiefemale', 'assets/animations/character/zombiefemale.png', 'assets/animations/character/zombiefemale.json');
        this.game.load.atlasJSONHash('pingun', 'assets/animations/enemy/enemy-pingun.png', 'assets/animations/enemy/enemy-pingun.json');
        this.game.load.spritesheet('snowman', 'assets/animations/enemy/enemy-snowman.png', 64, 73);
        this.game.load.spritesheet('spider', 'assets/animations/enemy/enemy-spider.png', 77, 53);
        this.game.load.spritesheet('bee', 'assets/animations/enemy/enemy-bee.png', 56, 48);
        this.game.load.spritesheet('frog', 'assets/animations/enemy/enemy-frog.png', 61, 54);
        this.game.load.spritesheet('bat', 'assets/animations/enemy/enemy-bat.png', 88, 47);
        this.game.load.spritesheet('snail', 'assets/animations/enemy/enemy-snail.png', 60, 40);
        this.game.load.spritesheet('fly', 'assets/animations/enemy/enemy-fly.png', 65, 45);
        this.game.load.spritesheet('mouse', 'assets/animations/enemy/enemy-mouse.png', 59, 35);

        // armes
        this.game.load.image('bullet-knife', 'assets/hud/bullet_knife.png');
        this.game.load.image('bullet-laser', 'assets/hud/bullet_laser.png');
        this.game.load.image('bullet-fire', 'assets/hud/bullet_fire.png');
        this.game.load.image('bullet-water', 'assets/hud/bullet_water.png');

        // Elements divers
        this.game.load.image('heartFull', 'assets/hud/hud_heartFull.png');
        this.game.load.image('heartEmpty', 'assets/hud/hud_heartEmpty.png');
        this.game.load.image('keys', 'assets/hud/keys.png');

        // menu
        this.game.load.image('background-menu','assets/menu/background.png');
        this.game.load.image('bloc', 'assets/menu/bloc.png');
        this.game.load.image('victory', 'assets/menu/text_victory.png');
        this.game.load.image('finished', 'assets/menu/text_finished.png');
        this.game.load.image('lose', 'assets/menu/text_lose.png');
        this.game.load.image('gameover', 'assets/menu/text_gameover.png');
        this.game.load.image('level-ko', 'assets/menu/level-ko.png');
        this.game.load.image('level-ok', 'assets/menu/level-ok.png');
        this.game.load.image('level-locked', 'assets/menu/level-locked.png');

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
