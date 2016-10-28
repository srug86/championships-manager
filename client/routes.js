Router.configure({
    layoutTemplate: 'layout'
});
Router.route('/', function () {
    this.render('home');
});
Router.route('/championships', function () {
    Session.set("championshipId",undefined);
    Session.set("matchId",undefined);
    this.render('championships');
});
Router.route('/teams', function () {
    Session.set("teamId",undefined);
    this.render('teams');
});
Router.route('/about', function () {
    this.render('about');
});
