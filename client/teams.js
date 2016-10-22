if (Meteor.isClient) {
    Template.teams_list.helpers({
        "get_all_teams":function(){
            var teams = Teams.find({});
            var features = new Array();
            var ind = 0;
            teams.forEach(function(team){
                features[ind] = {
                    name:team.name,
                    logo:team.logo,
                };
                ind++;
            })
            return features;
        }
    })
}
