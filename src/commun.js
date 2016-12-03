class Commun {

    constructor(game) {
        this.url = game.global.server.url;
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
                $('#score-max').html('#1 - ' + data.name + ' - ' + data.score + ' points');
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
                    $('#score-top').append('<li><a href="#">#'+ (i+1) + ' - ' + data[i].name + ' - ' + data[i].score + '</a></li>');
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
}

export default Commun;