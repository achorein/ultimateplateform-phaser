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
    refreshScore(callback, callbackContext) {
        if (this.game.global.enableRest) {
            $.ajax({
                url: this.url + '/score/top',
                type: 'GET',
                contentType: "application/json; charset=utf-8",
                context: callbackContext,
                success: callback,
                failure: function (err) {
                    console.log('Erreur de récupération des scores ! ' + err);
                }
            });
        }
    }

    getLevelScore(level, text) {
        if (this.game.global.enableRest) {
            $.ajax({
                url: this.url + '/score/level/' + level + '/max?playername=' + localStorage.getItem('playerName'),
                type: 'GET',
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    text.text = data.score;
                    localStorage.setItem('level' + level, data.score);
                },
                failure: function (err) {
                    console.log('Erreur de récupération du score du level ' + level);
                }
            });
        }
    }

    getlevelData(level) {
        var data = localStorage.getItem('level' + level)
        return (data)?JSON.parse(data):null;
    }

    saveScore(score, time, finished) {
        var levelData = this.getlevelData(this.game.global.level.current);
        var config = this.game.cache.getJSON('level-config')[this.game.global.level.current-1];

        var star = 0;
        if (finished) {
            star = 1;
        }
        if (score/config.bestScore >= 1) {
            star = 3
        } else if (score/config.bestScore >= 0.5) {
            star = 2
        }
        var currentData = {
            score: score,
            time: time,
            finished: finished,
            star: star
        };
        if (!levelData || parseInt(levelData.score) < currentData.score) {
            // sauvegarde du score en local
            localStorage.setItem('level' + this.game.global.level.current, JSON.stringify(currentData));

            if (this.game.global.enableRest) {
                // sauvegarde du score sur le serveur
                $.ajax({
                    url: this.game.global.server.url + '/score',
                    type: 'PUT',
                    dataType: 'json',
                    data: JSON.stringify({
                        playername: this.game.global.player.name,
                        player: this.game.global.player.sprite,
                        score: currentData.score,
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
                // calcul du score total (ciummul de tous les niveaux pour le leaderboard)
                var scoreTotal = 0;
                for (var i = 0; i < this.game.global.level.max; i++) {
                    var scoreLevel = this.getlevelData(i + 1);
                    if (scoreLevel) {
                        scoreTotal += parseInt(scoreLevel.score);
                    }
                }
                // sauvegarde en local
                localStorage.setItem('scoreTotal', scoreTotal);
                // sauvegarde sur le serveur
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
        // retourne les données calculées (ex: nb etoiles)
        return currentData;
    }
}

export default Commun;