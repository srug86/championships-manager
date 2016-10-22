var visjsobj;
if (Meteor.isClient) {
    Template.championships_list.helpers({
        "get_all_championships":function(){
            var championships = Championships.find({});
            var features = new Array();
            var ind = 0;
            championships.forEach(function(championship){
                features[ind] = {
                    name:championship.name,
                    logo:championship.logo,
                };
                ind++;
            })
            return features;
        }
    })
}
