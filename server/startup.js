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
                    Championships.insert(
                        {
                            name:competitions[i].name,
                            short_name:competitions[i].short_name,
                            logo:competitions[i].logo
                        });
                }
            } catch (e) {
                console.log(e.message);
            }
        }
        // Reset collection
        //else {
        //    Championships.remove({});
        //}
    })
}
