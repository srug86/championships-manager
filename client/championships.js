var visjsobj;
if (Meteor.isClient) {
    // helper functions
    Template.championships.helpers({
        "get_user_name":function(){
            return getUserName();
        }
    });
    
    Template.championships_list.helpers({
        "get_all_championships":function(){
            var userName = getUserName();
            var championships = Championships.find({});
            var features = new Array();
            var ind = 0;
            championships.forEach(function(championship){
                var owner = championship.owner;
                if (owner == "public" || userName != undefined) {
                    features[ind] = {
                        _id:championship._id,
                        owner:owner == "public" ? "globe" : "user",
                        name:championship.name,
                        logo:championship.logo
                    };
                    ind++;
                }
            })
            return features;
        }
    });
    
    Template.add_championship_form.helpers({
        "get_all_teams":function() {
            var userName = getUserName();
            var userChampionshipTeams = NewChampionshipTeams.findOne({owner:userName});
            return userChampionshipTeams.teams;
        },
        
        "get_selected_teams":function() {
            return getSelectedTeams();
        },
        
        "get_number_of_teams":function() {
            return Teams.find({}).count();
        },
        
        "get_number_of_selected_teams":function() {
            return getNumberOfSelectedTeams();
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
                    features[ind] = {
                        name:team.name,
                        logo:team.logo
                    };
                    ind++;
                });
                return features;
            }
            return null;
        }
    });
    
    Template.knockout_view.helpers({
        "get_current_match":function(){
            return findCurrentMatch();
        },
    });
    
    // event functions
    Template.championships_list.events({
        "click .js-select-championship":function(event){
            selectChampionship(event,this);
            return false;
        }
    });
    
    Template.add_championship_form.events({
        "click .js-toggle-championship-form":function(event){
            $("#championship_form").toggle('slow');
            initializeNewChampionshipTeams();
        },
        
        "submit .js-save-championship-form":function(event){
            event.preventDefault();
            var name = event.target.name.value;
            var shortName = event.target.short_name.value;
            var logo = event.target.logo.value;
            var numberOfTeams = event.target.number_of_teams.value;
            if (name != "" && shortName != ""){
                var championship = insertChampionship(name,shortName,logo,numberOfTeams);
                if (championship != undefined) {
                    initializeKnockouts(championship);
                }
            } else {
                // TODO
                console.log("invalid data");
            }
            return false;
        },
        
        "click .js-team-check":function(event) {
            var team = event.target.id;
            var isChecked = event.target.checked;
            updateChampionshipTeams(team,isChecked);
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
        "click .js-select-results-tab":function(event) {
            openTab(event,'championship_results');
            generateKnockouts();
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

function getNumberOfSelectedTeams() {
    var userName = getUserName();
    var userChampionshipTeams = NewChampionshipTeams.findOne({owner:userName});
    var counter = 0;
    userChampionshipTeams.teams.forEach(function(team){
        if (team.selected == true) {
            counter++;
        }
    });
    return counter;
}

function getSelectedTeams() {
    var userName = getUserName();
    var userChampionshipTeams = NewChampionshipTeams.findOne({owner:userName});
    var features = new Array();
    var ind = 0;
    userChampionshipTeams.teams.forEach(function(team){
        if (team.selected == true) {
            features[ind] = {
                name:team.name,
                logo:team.logo,
            };
            ind++;
        }
    });
    return features;
}

function selectChampionship(event,championship) {
    var championshipId = championship._id;
    Session.set("championshipId",championshipId);
    Session.set("matchId",undefined);
    resetTabs();
}

function insertChampionship(name,shortName,logo,numberOfTeams) {
    var userName = getUserName();
    var championshipTeams = getSelectedTeams();
    if (championshipTeams.length == numberOfTeams) {
        var championship = Championships.findOne({name:name});
        if (championship == undefined) {
            championship = {
                owner:userName,
                name:name,
                short_name:shortName,
                logo:logo,
                teams:[]
            };
            for (var i=0;i<championshipTeams.length;i++) {
                var team = championshipTeams[i];
                championship.teams.push({
                    "name":team.name,
                    "logo":team.logo
                });
            }
            Championships.insert(championship);
            return championship;
        } else {
            console.log("already exists");
            // TODO
        }
    } else {
        console.log("incorrect number of teams");
        // TODO
    }
    return undefined;
}

function initializeKnockouts(championship) {
    var userName = getUserName();
    var knockouts = {
        name:championship.name,
        matches:[]
    };
    var roundIdLength=1;
    var roundMatches=[];
    var numberOfMatches=championship.teams.length-1;
    var numberOfRoundMatches=championship.teams.length/2;
    var matchIds = "ABCDEFGHIJKLMNOP";
    var teamIndex=0;
    for (var i=0;i<numberOfRoundMatches;i++) {
        var roundId=matchIds.substr(i,roundIdLength);
        var homeTeam=championship.teams[teamIndex];
        var awayTeam=championship.teams[teamIndex+1];
        var roundMatch = {
            "round_id":roundId,
            "home_team":homeTeam.name,
            "home_kit":homeTeam.logo,
            "home_score":0,
            "home_score_comment":"",
            "away_team":awayTeam.name,
            "away_kit":awayTeam.logo,
            "away_score":0,
            "away_score_comment":""
        };
        roundMatches.push(roundMatch);
        knockouts.matches.push(roundMatch);
        teamIndex=teamIndex+2;
    }
    while(numberOfRoundMatches > 1) {
        roundIdLength=roundIdLength*2;
        numberOfRoundMatches=roundMatches.length/2;
        roundMatches=[];
        for (var i=0;i<numberOfRoundMatches;i++) {
            var roundId=matchIds.substr(i*roundIdLength,roundIdLength);
            var roundMatch = {
                "round_id":roundId,
                "home_team":"",
                "home_kit":"ball",
                "home_score":0,
                "home_score_comment":"",
                "away_team":"",
                "away_kit":"ball",
                "away_score":0,
                "away_score_comment":""
            };
            roundMatches.push(roundMatch);
            knockouts.matches.push(roundMatch);
        }
    }
    Knockouts.insert(knockouts);
}

function findCurrentMatch() {
    if (Session.get("championshipId") != undefined
        && Session.get("matchId") != undefined){
        var matchId = Session.get("matchId");
        var championship = Championships.findOne({_id:Session.get("championshipId")});
        var knockouts = Knockouts.findOne({name:championship.name});
        for (var i=0;i<knockouts.matches.length;i++) {
            var match_ = knockouts.matches[i];
            if (match_.round_id == matchId) {
                return match_;
            }
        }
        return null;
    }
    return null;
}

function resetTabs() {
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
}

function openTab(evt, tabName) {
    resetTabs();

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function initializeNewChampionshipTeams() {
    var userName = getUserName();
    var userChampionshipTeams = NewChampionshipTeams.findOne({owner:userName});
    if (userChampionshipTeams) {
        NewChampionshipTeams.remove({_id:userChampionshipTeams._id});
    }
    var championshipTeams = {
        "owner":userName,
        "teams":[]
    };
    var teams = Teams.find({});
    teams.forEach(function(team){
        championshipTeams.teams.push({
            _id:team._id,
            "selected":false,
            "name":team.name,
            "logo":team.logo
        });
    });
    NewChampionshipTeams.insert(championshipTeams);
}

function updateChampionshipTeams(teamName,isChecked) {
    var userName = getUserName();
    var championshipTeams = NewChampionshipTeams.findOne({owner:userName});
    if (championshipTeams != undefined) {
        var ind = 0;
        var teams = new Array();
        championshipTeams.teams.forEach(function(championshipTeam){
            var selected = championshipTeam.name == teamName ? isChecked : championshipTeam.selected;
            teams[ind] = {
                "_id":championshipTeam._id,
                "selected":selected,
                "name":championshipTeam.name,
                "logo":championshipTeam.logo
            };
            ind++;
        });
        NewChampionshipTeams.update({_id:championshipTeams._id},{$set:{"teams":teams}});
    }
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
        nodes[homeIndex] = {
            id: match_.round_id + "1",
            shape: 'image',
            image: DOM + match_.home_kit + ".png",
            value: "10",
            label: match_.home_team + ": " + match_.home_score + " " + match_.home_score_comment
        };
        var awayIndex = nodeIndex+1;
        nodes[awayIndex] = {
            id: match_.round_id + "2",
            shape: 'image',
            image: DOM + match_.away_kit + ".png",
            value: "10",
            label: match_.away_team + ": " + match_.away_score + " " + match_.away_score_comment
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
        physics: {
            enabled: false,
            stabilization: { 
                enabled: false,
                iterations: 1
            }
        },
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
    
    // vis events
    visjsobj.on("click", function (params) {
        var teamMatchId = params.nodes[0];
        if (teamMatchId != undefined) {
            var matchId = teamMatchId.substring(0,teamMatchId.length-1);
            Session.set("matchId",matchId);
        }
    });
}
