var Svc = require('Svc').Svc;
var db = require('DB').DB;
var async = require('async');
exports.bo = function (req, res) {
    var id = req.query['id'];
    var m = req.query['m'];
    m = m ? true : false;
    var bo = Svc.getDefine(id);
    res.render('admin/bo.ejs', {id: id, bo: bo, manageFlg: m});
}
exports.org = function (req, res) {
    if (req.currentUser.Org.Value == '0') {
        res.render('admin/org.ejs');
    }
    else {
        res.render('admin/orgc.ejs', {u: req.currentUser});
    }
}
exports.orgpost = function (req, res) {
    var t = req.body['t'].toLowerCase();
    switch (t) {
        case 'i':
            var obj = req.body['obj'];
            break;
        case 'u':
            var query = req.body['query'];
            var option = req.body['option'];
            break;
        case 'ixzqh':
            var objs = req.body['objs'];
            break;
    }
}
function orgTypeProcess() {
}
exports.get = function (req, res) {
    var t = req.query['t'].toLowerCase();
    var tp, id;
    switch (t) {
        case 'cleardata':
            async.parallel(
                [
                    function (cb) {db.Order.remove({}, cb)},
                    function (cb) {db.RnP.remove({}, cb)},
                    function (cb) {db.TransferBill.remove({}, cb)},
                    function (cb) {db.StockIn.remove({}, cb)},
                    function (cb) {db.StockOut.remove({}, cb)},
                    function (cb) {db.Storage.remove({}, cb)}
                ], function (e) {
                    res.send("Done")}
            )
            break;
        case "sysfuns":
            var sfs;
            if (req.currentUser._id == '0') {
                sfs = Svc.getGVObjs('SysFun', function (i) {return true;});
            }
            else if (req.currentUser.Org.Value == '0') {
                sfs = Svc.getGVObjs('SysFun', function (i) { return i._id == '300' || i._id == '100'});
            }
            else if (req.currentUser.Org.Value == '1') {
                sfs = Svc.getGVObjs('SysFun', function (i) {return i._id == '100' || i._id == '200' || i._id == '300'})
            }
            else {
                sfs = Svc.getGVObjs('SysFun', function (i) {return i._id.length == 1})
            }
            res.json(sfs);
            break;
        case 'adduser':
            var oid = req.query['oid'];
            Svc.db.Org.findOne({_id: oid}, function (e, org) {
                Svc.db.User.findOne({Name: 'Admin', 'Org.Value': org._id}, function (e, d) {
                    if (!d) {
                        Svc.db.User.insert({_id: Svc.db.User.ObjectID().toString(), Name: 'Admin', Simcode: 'ADMIN', Pwd: org.SMSNum, Org: {Name: org.Name, Value: org._id, Type: 'Org'}, flag: 1, TypeFullName: 'User'}, function () { });
                    }
                });
            });
            break;
        case 'agg':
            Svc.db.Order.aggregate(
                [
                    {$match: {'Owner.Item1': '0'}},
                    {$group: {_id: '$Owner', totle: {$sum: '$Sum'}}}
                ], function (e, r) {
                    var t = r;
                });
            break;
        default :
            break;
    }
};
exports.xzqhpost = function (req, res) {
    var obj = (  req.body['obj']);
    var fs = require('fs');
    var path = require('path');
    var _p = path.resolve('public/javascripts') + '\\xzqh.js';
    var xs = 'var xzqh=' + obj + ';';
    fs.writeFileSync(_p, xs);
    res.json('done');
}

