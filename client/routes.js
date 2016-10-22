Router.configure({
    layoutTemplate: 'layout'
});
Router.route('/', function () {
    this.render('home');
});
Router.route('/championships', function () {
    this.render('championships');
});
Router.route('/teams', function () {
    this.render('teams');
});
Router.route('/about', function () {
    this.render('about');
});
