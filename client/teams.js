
if (Meteor.isClient) {
    // helper functions
    Template.teams_list.helpers({
        "get_all_teams":function(){
            var teams = Teams.find({});
            var features = new Array();
            var ind = 0;
            teams.forEach(function(team){
                features[ind] = {
                    _id:team._id,
                    owner:team.owner == "public" ? "globe" : "user",
                    name:team.name,
                    logo:team.logo,
                };
                ind++;
            })
            return features;
        }
    });
    
    Template.team_view.helpers({
        "get_current_team":function(){
            if (Session.get("teamId") != undefined){
                return Teams.findOne({_id:Session.get("teamId")});
            }
        }
    });
    
    // event functions
    Template.teams_list.events({
        "click .js-select-team":function(event){
            selectTeam(event,this);
            return false;
        }
    });
}

function selectTeam(event,team) {
    var teamId = team._id;
    Session.set("teamId",teamId);
}
