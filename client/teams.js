
if (Meteor.isClient) {
    // helper functions
    Template.teams.helpers({
        "get_user_name":function(){
            return getUserName();
        }
    });
    
    Template.teams_list.helpers({
        "get_all_teams":function(){
            var userName = getUserName();
            var teams = Teams.find({});
            var features = new Array();
            var ind = 0;
            teams.forEach(function(team){
                var owner = team.owner;
                if (owner == "public" || userName != undefined) {
                    features[ind] = {
                        _id:team._id,
                        owner:owner == "public" ? "globe" : "user",
                        name:team.name,
                        logo:team.logo,
                    };
                    ind++;
                }
            });
            return features;
        }
    });
    
    Template.team_view.helpers({
        "get_current_team":function(){
            if (Session.get("teamId") != undefined){
                return Teams.findOne({_id:Session.get("teamId")});
            }
            return null;
        }
    });
    
    // event functions
    Template.teams_list.events({
        "click .js-select-team":function(event){
            selectTeam(event,this);
            return false;
        }
    });
    
    Template.add_team_form.events({
        "click .js-toggle-team-form":function(event){
            $("#team_form").toggle('slow');
        },  
        "submit .js-save-team-form":function(event){
            var name = event.target.name.value;
            var shortName = event.target.short_name.value;
            var kitStyle = event.target.kit_style.value;
            var primaryColor = event.target.primary_color.value;
            var secondaryColor = event.target.secondary_color.value;
            var logo = kitStyle + '_' + primaryColor + '_' + secondaryColor;
            if (name != "" && shortName != "") {
                if (!Teams.findOne({name:name})) {
                    insertTeam(name,shortName,logo);
                } else {
                    // TODO
                }
            } else {
                // TODO
            }
            return false;
        }
    });
}

function getUserName() {
    if (Meteor.user() != undefined) {
        return Meteor.user().emails[0].address;
    }
    return undefined;
}

function selectTeam(event,team) {
    var teamId = team._id;
    Session.set("teamId",teamId);
}

function insertTeam(teamName,teamShortName,teamLogo) {
    var userName = getUserName();
    if (userName != undefined) {
        Teams.insert(
            {
                owner:userName,
                name:teamName,
                short_name:teamShortName,
                logo:teamLogo
            });
        console.log("the team was inserted: ");
        console.log(teamName);
    }
}
