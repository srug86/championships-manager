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
                    logo:championship.logo,
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
        }
    });
    
    // event functions
    Template.championships_list.events({
        "click .js-select-championship":function(event){
            selectChampionship(event,this);
            return false;
        }
    });
}

function selectChampionship(event,championship) {
    var championshipId = championship._id;
    Session.set("championshipId",championshipId);
}
