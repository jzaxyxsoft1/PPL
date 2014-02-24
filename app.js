/**
 * Module dependencies.
 */
var DB = require('DB').DB;
var Svc = require('Svc');
var cookie = require('Svc').HttpHelper.Cookie;
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var url = require('url');
var _ = require('underscore');
var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser('keyboard cat'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
var fs = require('fs');
var files = fs.readdirSync('./controller');
var _s = '', controllers = {};
app.get('/', routes.index);
app.get('/index', routes.index);
app.get('/m', routes.m);
app.get('/barcheck',routes.barcheck)
app.get('/getproducts', function (req, res) {
    DB.Product.find().toArray(function (e, ds) {
        _.each(ds, function (i) {
            delete i.UnitCost;
            delete i.PartnerPrice;
            delete i.DelegatePrice;
        });
        res.json(ds);
    })
});
app.get('/getproductinstance', function (req, res) {
    var id = req.query['id'];
    DB.Product.findOne({_id: id}, function (e, d) {
        delete d.UnitCost;
        delete d.PartnerPrice;
        delete d.DelegatePrice;
        res.json(d);
    })
});
app.post('/index/postl', routes.postl);
app.post('/saveproduct',routes.saveProduct)
app.get('/main', routes.main);
function checkUser(req, res, next) {
    req.currentUser = cookie.get(req, cookie.defaultUserCookieName);
    res.locals = {isMobile: url.parse(req.url).pathname.substr(0, 2) == '/M'};
    if (req.currentUser) {next();}
    else {
        res.redirect('/');
        res.end();
    }
};
app.post('/file/pos', require('./controller/file.js').pos);
files.forEach(function (f) {
    _s = f.replace(/\.js/, '');
    controllers[_s] = require('./controller/' + f);
    if (_s != 'file') {
        for (var ex  in controllers[_s]) {
            if (ex.indexOf('post') > -1) {
                app.post('/' + _s + '/' + ex, checkUser, controllers[_s][ex]);
            }
            else {
                app.get('/M/' + _s + '/' + ex , checkUser, controllers[_s][ex])
                app.get('/' + _s + '/' + ex, checkUser, controllers[_s][ex]);
            }
        }
    }
});
DB.addCollection('localhost:4000/RBCSiteDB', 'BODefine');
DB.addCollection('localhost:4000/RBCSiteDB', 'Product');
Svc.init(function (e) {
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
});

