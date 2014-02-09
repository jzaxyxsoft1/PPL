/**
 * 交流
 */
var async = require('async');
var _ = require('underscore');
var Svc = require('Svc').Svc;
exports.get = function (req, res) {
    var t = req.query['t'].toLowerCase();
    switch (t) {
        case 'l': //列表
            res.render('communication/l.ejs');
            break;
        case 'd': //详细
            res.render('communication/d.ejs', {id: req.query['id']});
            break;
        case 'e': //编辑
            res.render('communication/e.ejs', {u: req.currentUser,id:(req.query['id']||''),pid:req.query['pid']});
            break;

        case 'list':
            var pager = req.query['p'];//分页{cp:当前页 index,ps;每页数量}
            cPager(pager);
            Svc.db.Communication
                .find({flag: 1}, {Org: 1, Creator: 1, CreateTime: 1})
                .sort({'CreateTime.Item1': -1})
                .skip(pager.cp * pager.ps)
                .limit(pager.ps)
                .toArray(function (e, ds) {
                    res.json(ds);
                })
            break;
        case 'detail': //详细
            var id = req.query['id'];
            Svc.db.Communication.findOne({_id: id}, function (e, d) {
                res.json(d);
            });
            break;
        case 'replay': //回复
            var id = req.query['id'];
            var p = req.query['p'];//分页{cp:当前页 index,ps;每页数量}
            cPager(p)
            Svc.db.Communication.find({ParentID: id}).sort({'CreateTime.Item1': -1}).skip(p.cp * p.ps).limit(p.ps).toArray(function (e, ds) {
                res.json(ds);
            })
            break;

    }
}
exports.post = function (req, res) {
}
function cPager(p) {
    Object.keys(p).forEach(function (i) {
        p[i] = Number(p[i]);
    });
}