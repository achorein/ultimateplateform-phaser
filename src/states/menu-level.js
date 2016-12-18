import Menu from '../states/commun/menu';

class MenuLevel extends Menu {

    constructor() {
        super();
        this.menuBox = {
            width: 183,
            heigth: 190,
            length: 4
        };
    }

    create() {
        super.create();

        this.playerMaxLevel = localStorage.getItem('playerMaxLevel');
        if (!this.playerMaxLevel) {
            this.playerMaxLevel = 1;
        }

        /**
         * AJOUT DES IMAGES EN ARRIERE PLAN
         */
        this.levelBloc = this.game.add.sprite(this.game.centerX, this.game.centerY + 75, 'bloc');
        this.levelBloc.anchor.set(0.5);
        this.levelBloc.scale.setTo(0.9);

        /**
         * GESTION DU CONTENU
         */
        //this.game.global.player.name = this.game.commun.refreshPlayerName(false);
        //this.game.commun.refreshScore();

        this.menu = [];
        for (var i = 0; i<this.game.global.level.max; i++) {
            if (i+1 <= this.playerMaxLevel) {
                var levelConfig = this.game.cache.getJSON('level-config')[i];
                // Ajout d'un fond blan pour l'affichage des des points associés au niveau
                var bar = this.game.add.graphics();
                bar.beginFill(0xffffff);
                // Ajout d'une image de preview du niveau
                var levelPreview = this.game.add.sprite(this.computePosition(i+1, 'center').x, this.computePosition(i+1, 'center').y, 'background-trees-level-'+(i+1));
                levelPreview.anchor.set(0.5);
                // création d'un masque permettant d'arrondir l'image de preview
                var mask = this.game.add.graphics();
                mask.beginFill(0xffffff);
                // ajout du carré représentant le niveau
                var levelSprite = this.game.add.button(this.computePosition(i+1).x, this.computePosition(i+1).y, 'level-ko', function(sprite){
                    this.goNextState(sprite.cursorPos);
                }, this);
                levelSprite.anchor.set(0.5);
                levelSprite.cursorPos = i+1;
                levelSprite.alpha = 0.8;
                levelPreview.width = levelSprite.width;
                levelPreview.height = levelSprite.height;
                mask.drawRoundedRect(this.computePosition(i+1, 'top').x+16, this.computePosition(i+1, 'top').y+5, levelSprite.width-32, levelSprite.height-30, 30);
                levelPreview.mask = mask;
                // ajout du texte indiquant le numéro du niveau
                var text = this.game.add.text(this.computePosition(i+1, 'center').x, this.computePosition(i+1, 'center').y, ''+(i+1), this.styleBig);
                text.anchor.set(0.5);
                this.menu.push({index: i+1, sprite: levelSprite, text: text});
                levelSprite.onInputOver.add(function(sprite){
                    this.cursorPos = sprite.cursorPos;
                    this.selectItem();
                }, this);

                bar.drawRoundedRect(this.computePosition(i+1, 'bottom').x+8, this.computePosition(i+1, 'bottom').y-levelSprite.height/4, levelSprite.width - 16, levelSprite.height/2, 30);
                //sprite = this.game.add.sprite(this.computePosition(i+1, 'bottom').x - 5, this.computePosition(i+1, 'bottom').y - 17, 'bloc-points');
                var levelData = this.game.commun.getlevelData(i+1);
                var score = 0;
                if (levelData) {
                    score = levelData.score;
                }

                // Ajout des points (nombre d'étoiles)
                /*text = this.game.add.text(this.computePosition(i+1, 'bottom-center').x + 5, this.computePosition(i+1, 'bottom').y + 3, score, this.style);
                text.anchor.set(0.5, 0);
                this.game.commun.getLevelScore(i+1, text);*/
                // ajout des étoiles vides
                for (var j=0; j<3; j++) {
                    var star = this.game.add.sprite(this.computePosition(i+1, 'bottom-center').x - 50 + (50 * j), this.computePosition(i+1, 'bottom-center').y + 5, 'star-empty');
                    star.scale.setTo(0.2);
                    star.anchor.set(0.5, 0);
                }
                // ajout des étoiles
                if (levelData) {
                    for (var j = 0; j < levelData.star; j++) {
                        star = this.game.add.sprite(this.computePosition(i + 1, 'bottom-center').x - 50 + (50 * j), this.computePosition(i + 1, 'bottom-center').y + 5, 'star');
                        star.scale.setTo(0.2);
                        star.anchor.set(0.5, 0);
                    }
                }

            } else {
                var sprite = this.game.add.sprite(this.computePosition(i+1).x, this.computePosition(i+1).y, 'level-locked');
                sprite.anchor.set(0.5);
            }
        };
        this.selectItem(true);

    }

    update() {
        super.update();
    }

    goNextState(cursorPos) {
        super.goNextState();
        this.game.global.level.current = cursorPos;
        this.game.global.score = 0;
        this.game.global.scoreLastLevel = 0;
        this.game.global.player.life = this.game.global.player.maxlife - 1;
        this.game.global.player.name = $('#playerName').val();
        localStorage.setItem('playerName', this.game.global.player.name);
        $('#playerName').prop('disabled', true);
        this.game.state.start('game', true, false);
    }

    goPreviousState(cursorPos) {
        super.goNextState(cursorPos);
        this.game.state.start('menu', true, false);
    }

    selectItem(ignoreSound) {
        this.menu.forEach(function(level){
            if (level.index == this.cursorPos) {
                level.sprite.loadTexture('level-ok');
                if (!ignoreSound) {
                    this.game.add.audio('miscMenu').play();
                }
            } else {
                level.sprite.loadTexture('level-ko');
            }
        }, this);
    }

}

export default MenuLevel;
