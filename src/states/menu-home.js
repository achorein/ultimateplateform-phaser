import Menu from '../states/commun/menu';

class MenuHome extends Menu {

    constructor() {
        super();
        this.menuBox = {
            width: 250,
            heigth: 250,
            length: 4
        };
        this.menu = [
            {index: 1, name:'SB', texture:'ninja'},
            {index: 2, name:'ARC', texture:'robot'},
            {index: 3, name:'BA', texture:'adventure_girl'},
            {index: 4, name:'PM', texture:'knight'}
        ];
    }

    create() {
        super.create();

        // Ajout des personnages
        this.menu.forEach(function(player) {
            var sprite = this.game.add.button(this.computePosition(player.index).x, this.game.centerY - 50, player.texture, function(sprite){
                this.cursorPos = sprite.cursorPos;
                this.goNextState();
            }, this, 'idle/01.png');
            sprite.cursorPos = player.index;
            sprite.anchor.set(0.5);
            sprite.animations.add('idle', Phaser.Animation.generateFrameNames('idle/', 1, 10, '.png', 2), 10, true, false);
            sprite.scale.setTo(1);
            player.sprite = sprite;
            var text = this.game.add.text(this.computePosition(player.index).x, this.game.centerY + 100, player.name, this.styleSmall);
            text.anchor.set(0.5);
            player.text = text;
            sprite.onInputOver.add(function(sprite){
                this.cursorPos = sprite.cursorPos;
                this.selectItem();
            }, this);
        }, this);

        this.selectItem(true);

        //this.game.global.player.name = this.game.commun.refreshPlayerName(false);
        //this.game.commun.refreshScore();
    }

    update() {
        super.update();
    }

    selectItem(ignoreSound) {
        this.menu.forEach(function(player){
            if (player.index == this.cursorPos) {
                player.sprite.scale.setTo(1);
                player.text.scale.setTo(1.25);
                player.sprite.animations.play('idle');
                if (!ignoreSound) {
                    this.game.add.audio('miscMenu').play();
                }
            } else {
                player.sprite.animations.stop();
                player.sprite.scale.setTo(0.8);
                player.text.scale.setTo(1);
            }
        }, this);
    }

    goNextState(cursorPos) {
        super.goNextState(cursorPos);
        this.game.global.player.sprite = this.menu[this.cursorPos-1].texture;
        localStorage.setItem('playerName', this.game.global.player.name);
        this.game.state.start('menu-level', true, false);
    }

}

export default MenuHome;
