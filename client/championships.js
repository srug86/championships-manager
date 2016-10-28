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
            event.preventDefault();
            openTab(event,'championship_knockouts');
            generateKnockouts();
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

////////////////////////////
///// function that set up and display the visualisation
////////////////////////////
function generateKnockouts() {
    if (visjsobj != undefined){
        visjsobj.destroy();
    }
    if (Session.get("championshipId") == undefined){
        return;
    }
    var championship = Championships.findOne({_id:Session.get("championshipId")});
    var championshipName = championship.name;
    console.log(championshipName);
    var knockouts = Knockouts.findOne({name:championshipName});
    var nodeIndex = 0;
    var knockoutIndex = 0;
    var nodes = new Array();
    var DOM = "/images/teams/";
    for (var i=0;i<knockouts.matches.length;i++) {
        var match_ = knockouts.matches[i];
        var homeIndex = nodeIndex;
        var homeTeamName = match_.home_team;
        var homeTeam = Teams.findOne({name:homeTeamName});
        var homeTeamImage = homeTeam == null ? "plain_white_white" : homeTeam.logo;
        var homeLabel = homeTeamName + ": " + match_.home_score + " " + match_.home_score_comment;
        nodes[homeIndex] = {
            id: match_.round_id + "1",
            shape: 'image',
            image: DOM + homeTeamImage + ".png",
            value: "10",
            label: homeLabel
        };
        var awayIndex = nodeIndex+1;
        var awayTeamName = match_.away_team;
        var awayTeam = Teams.findOne({name:awayTeamName});
        var awayTeamImage = awayTeam == null ? "plain_red_red" : awayTeam.logo;
        var awayLabel = awayTeamName + ": " + match_.away_score + " " + match_.away_score_comment;
        nodes[awayIndex] = {
            id: match_.round_id + "2",
            shape: 'image',
            image: DOM + awayTeamImage + ".png",
            value: "10",
            label: awayLabel
        };
        nodeIndex = nodeIndex+2;
        knockoutIndex++;
    }
    nodes[nodeIndex] = {
        id: "0",
        shape: 'image',
        image: "/images/competitions/" + championship.logo + ".png",
        value: "10",
        label: championshipName
    };
    var matchIndex = 0;
    var edges = new Array();
    var longestId = "";
    for (var i=0;i<nodes.length-1;i++) {
        var teamMatchId = nodes[i].id;
        var matchId = teamMatchId.substring(0,teamMatchId.length-1);
        var teamId = teamMatchId.substring(teamMatchId.length-1,teamMatchId.length);
        if (matchId.length > 1 && teamId == "1") {
            var prevMatchId1 = matchId.substring(0,matchId.length/2);
            edges[matchIndex] = {
                from:prevMatchId1 + "1",
                to:matchId + "1"
            };
            edges[matchIndex+1] = {
                from:prevMatchId1 + "2",
                to:matchId + "1"
            };
            var prevMatchId2 = matchId.substring(matchId.length/2,matchId.length);
            edges[matchIndex+2] = {
                from:prevMatchId2 + "1",
                to:matchId + "2"
            };
            edges[matchIndex+3] = {
                from:prevMatchId2 + "2",
                to:matchId + "2"
            };
            matchIndex=matchIndex+4;
        }
        if (longestId.length <= matchId.length) {
            longestId = matchId;
        }
    }
    edges[matchIndex] = {
        from:longestId + "1",
        to:"0"
    };
    edges[matchIndex+1] = {
        from:longestId + "2",
        to:"0"
    };
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
        interaction: {dragNodes :false},
        manipulation: {enabled:false},
        physics: {enabled: false},
        layout: {
            hierarchical: {
                enabled:true,
                direction: 'RL',
                sortMethod: 'directed'
            }
        },
        height: '600px'
    };
    // get the div from the DOM that we are going to 
    // put our graph into 
    var container = document.getElementById('visjs');
    // create the graph
    visjsobj = new vis.Network(container, data, options);
}
