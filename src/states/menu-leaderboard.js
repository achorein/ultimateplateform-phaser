import Menu from '../states/commun/menu';

class LeaderBoard extends Menu {

    constructor() {
        super();
        this.menuBox = {
            width: 445,
            heigth: 101,
            length: 2
        };
    }

    create() {
        super.create();

        this.game.commun.refreshScore(this.showScore, this);
    }

    showScore(data) {
        if (data) {
            for (var i=1; i<=data.length; i++) {
                this.game.add.sprite(this.computePosition(i).x, this.computePosition(i).y, 'leaderboard-score').anchor.set(0.5);
                this.game.add.text(this.computePosition(i).x, this.computePosition(i).y, data[i-1].score, this.style).anchor.set(0.5);
                this.game.add.sprite(this.computePosition(i, 'top').x + 8, this.computePosition(i, 'top').y + 13, 'score').scale.set(0.30);
                this.game.add.text(this.computePosition(i, 'top').x + 25, this.computePosition(i, 'top').y + 22, i ,this.style);
            }
        }
    }

    update() {
        super.update();
    }

    goNextState(cursorPos) {
        super.goNextState(cursorPos);
        //this.game.state.start('menu-level', true, false);
    }

    goPreviousState(cursorPos) {
        super.goPreviousState(cursorPos);
        if (this.game.global.player.sprite) {
            this.game.state.start('menu-level', true, false);
        } else {
            this.game.state.start('menu', true, false);
        }
    }

    computePosition(index, position) {
        var pos = this.cursorPos;
        if (index) {
            pos = index;
        }

        var paddingX = Math.floor(this.menuBox.width*0.1);
        var paddingY = Math.floor(this.menuBox.heigth*0.3);

        var boxWidth = this.menuBox.width + paddingX;
        var boxHeight = this.menuBox.heigth + paddingY;
        //console.log(this.menuBox.height + ','+ paddingY + ',' + boxHeight);

        var marginX =  Math.floor((this.game.width - (this.menuBox.length * boxWidth))/2);
        var marginY =  Math.floor((this.game.height - (Math.ceil(this.game.global.level.max/this.menuBox.length) * boxHeight))/2);

        //var nbByLine = Math.floor((this.game.width - (marginX*2)) / boxWidth);

        var linePos = Math.floor(pos/(this.menuBox.length+1)) + 1;
        var colPos = ((pos-1) % this.menuBox.length) + 1;

        var posX =  marginX + ((colPos - 1)*boxWidth);
        var posY = marginY + ((linePos - 1)*boxHeight);
        if (!position  || position == 'center') {
            posX += Math.floor(this.menuBox.width/2);
            posY += Math.floor(this.menuBox.heigth/2);
        } else if (position == 'bottom') {
            posY += this.menuBox.heigth;
        } else if (position == 'bottom-center') {
            posX += Math.floor(this.menuBox.width/2);
            posY += this.menuBox.heigth;
        } else if (position == 'top') {
            // rien à faire
        }

        var point = {
            line: linePos,
            col: colPos,
            x: posX,
            y: posY + 75
        };
        return point;
    }

}

export default LeaderBoard;
