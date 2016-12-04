class Commun {

    constructor(game) {
        this.url = game.global.server.url;
        this.game = game;
    }

    refreshPlayerName(disabled) {
        var playerName = localStorage.getItem('playerName');
        if (!playerName) {
            playerName = 'Player 1';
        }
        $('#playerName').val(playerName);
        $('#playerName').prop('disabled', disabled);
        return playerName;
    }

    // actualisation des scores globaux
    refreshScore() {
        $.ajax({
            url: this.url + '/score/max',
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                $('#score-max').html('#1 - ' + data.playername + ' - ' + data.score + ' points');
            },
            failure: function (err) {
                console.log('Erreur de récupération du score max !');
            }
        });
        $.ajax({
            url: this.url + '/score/top',
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                $('#score-top').html('');
                for (var i = 1; i < data.length; i++) {
                    $('#score-top').append('<li><a href="#">#'+ (i+1) + ' - ' + data[i].playername + ' - ' + data[i].score + '</a></li>');
                }
            },
            failure: function (err) {
                console.log('Erreur de récupération des scores !');
            }
        });
    }

    getLevelScore(level, text) {
        $.ajax({
            url: this.url + '/score/level/'+level+'/max?playername='+localStorage.getItem('playerName'),
            type: 'GET',
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                text.text = data.score;
                localStorage.setItem('level'+level, data.score);
            },
            failure: function (err) {
                console.log('Erreur de récupération du score du level ' + level);
            }
        });
    }

    saveScore() {
        var maxlevelScore = localStorage.getItem('level'+this.game.global.level.current)
        if (!maxlevelScore || parseInt(maxlevelScore) < this.game.global.score) {
            localStorage.setItem('level' + this.game.global.level.current, this.game.global.score);
            $.ajax({
                url: this.game.global.server.url + '/score',
                type: 'PUT',
                dataType: 'json',
                data: JSON.stringify({
                    playername: this.game.global.player.name,
                    player: this.game.global.player.sprite,
                    score: this.game.global.score,
                    level: this.game.global.level.current
                }),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    console.log('Score level saved !');
                },
                failure: function (err) {
                    console.log('Erreur de sauvegarde du score level !');
                }
            });
            var scoreTotal = 0;
            for (var i = 0; i < this.game.global.level.max; i++) {
                var scoreLevel = localStorage.getItem('level' + (i+1));
                if (scoreLevel) {
                    scoreTotal += parseInt(scoreLevel);
                }
            }
            $.ajax({
                url: this.game.global.server.url + '/score',
                type: 'PUT',
                dataType: 'json',
                data: JSON.stringify({
                    playername: this.game.global.player.name,
                    player: this.game.global.player.sprite,
                    score: scoreTotal
                }),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    console.log('Score total saved !');
                },
                failure: function (err) {
                    console.log('Erreur de sauvegarde du score total !');
                }
            });
        }
    }
}

export default Commun;