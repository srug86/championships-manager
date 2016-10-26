if (Meteor.isServer) {
    Meteor.startup(function() {
        if (!Teams.findOne()) {
            try {
                var fs = Npm.require('fs');
                var data = fs.readFileSync('./assets/app/jsonfiles/teams.json', 'utf8');
                var teams = JSON.parse(data);
                for (var i=0;i<teams.length; i++) {
                    Teams.insert(
                        {
                            name:teams[i].name,
                            short_name:teams[i].short_name,
                            logo:teams[i].logo
                        });
                }
            } catch (e) {
                console.log(e.message);
            }
        }
        // Reset collection
        //else {
        //    Teams.remove({});
        //}
        if (!Championships.findOne()) {
            try {
                var fs = Npm.require('fs');
                var data = fs.readFileSync('./assets/app/jsonfiles/competitions.json', 'utf8');
                var competitions = JSON.parse(data);
                for (var i=0;i<competitions.length; i++) {
                    var championship = {
                            name:competitions[i].name,
                            short_name:competitions[i].short_name,
                            logo:competitions[i].logo,
                            teams:[]
                        };
                    for (var j=0;j<competitions[i].teams.length;j++) {
                        var team = competitions[i].teams[j];
                        championship.teams.push({
                            "name":team.name
                        });
                    }
                    Championships.insert(championship);
                }
            } catch (e) {
                console.log(e.message);
            }
        }
        // Reset collection
        //else {
        //    Championships.remove({});
        //}
        if (!Knockouts.findOne()) {
            try {
                var fs = Npm.require('fs');
                var data = fs.readFileSync('./assets/app/jsonfiles/knockouts.json', 'utf8');
                var knockouts = JSON.parse(data);
                for (var i=0;i<knockouts.length; i++){
                    var competition = {
                        name:knockouts[i].name,
                        matches:[]
                    };
                    for (var j=0;j<knockouts[i].matches.length;j++) {
                        var match_ = knockouts[i].matches[j];
                        competition.matches.push({
                            "round_id":match_.round_id,
                            "home_team":match_.home_team,
                            "home_score":match_.home_score,
                            "home_score_comment":match_.home_score_comment,
                            "away_team":match_.away_team,
                            "away_score":match_.away_score,
                            "away_score_comment":match_.away_score_comment
                        });
                    }
                    Knockouts.insert(competition);
                }
            } catch (e) {
                console.log(e.message);
            }
        }
        // Reset collection
        //else {
        //    Knockouts.remove({});
        //}
    })
}
