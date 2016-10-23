var visjsobj;
if (Meteor.isClient) {
    
    // helper functions
    Template.championships_list.helpers({
        "get_all_championships":function(){
            var championships = Championships.find({});
            var features = new Array();
            var ind = 0;
            championships.forEach(function(championship){
                features[ind] = {
                    _id:championship._id,
                    name:championship.name,
                    logo:championship.logo
                };
                ind++;
            })
            return features;
        }
    });
    
    Template.championship_view.helpers({
        "get_current_championship":function(){
            if (Session.get("championshipId") != undefined){
                return Championships.findOne({_id:Session.get("championshipId")});
            }
            return null;
        },
        
        "get_championship_teams":function(){
            if (Session.get("championshipId") != undefined){
                var championship = Championships.findOne({_id:Session.get("championshipId")});
                var features = new Array();
                var ind = 0;
                championship.teams.forEach(function(team){
                    features[ind] = {name:team.name};
                    ind++;
                });
                return features;
            }
            return null;
        }
    });
    
    // event functions
    Template.championships_list.events({
        "click .js-select-championship":function(event){
            selectChampionship(event,this);
            return false;
        }
    });
    
    Template.championship_view.events({
        "click .js-select-info-tab":function(event) {
            openTab(event,'championship_info');
            return false;
        },
        "click .js-select-teams-tab":function(event) {
            openTab(event,'championship_teams');
            return false;
        },
        "click .js-select-knockouts-tab":function(event) {
            openTab(event,'championship_knockouts');
            return false;
        }
    })
}

function selectChampionship(event,championship) {
    var championshipId = championship._id;
    Session.set("championshipId",championshipId);
}

function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}
