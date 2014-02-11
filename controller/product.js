var db = require('DB').DB;
var async = require('async');
var _ = require('underscore');
var Svc = require('Svc').Svc;
exports.get = function (req, res) {
    var t = req.query['t'].toLowerCase();
    switch (t) {
        case 'objs':
            var query = req.query['query'] || {};
            var option = req.query['option'] || {};
            option = typeof option == 'string' ? JSON.parse(option) : option;
            db.Product.find(query, option).toArray(function (e, ds) {
                res.json(ds);
            });
            break;
        case 'obj':
            var query = req.query['query'];
            var option = req.query['option'] || {};
            option = typeof option == 'string' ? JSON.parse(option) : option;
            db.Product.findOne(query, option, function (e, d) {res.json(d);});
            break;
        case 'price':
            var m = req.query['m'];
            if (m) {
                db.Product.find({}, {Name: 1, Model: 1, PartnerPrice: 1, Price: 1, UnitCost: 1}).toArray(function (e, d) {
                    res.json(d);
                });
            }
            else {
                res.render('product/price.ejs');
            }
            break;
    }
};
exports.post = function (req, res) {
    var t = req.body['t'].toLowerCase();
    switch (t) {
        case 'updateprices':
            var objs = JSON.parse(req.body['objs']);
            async.each(objs, function (i, icb) {
                    var _o = i;
                    var oid = i._id;
                    delete   i._id;
                    delete i.Name;
                    delete i.Model;
                    Svc.db.Product.update({_id: oid}, {$set: i}, function (e) { icb(e);});
                }, function (e) {}
            )
            break;
    }
}
