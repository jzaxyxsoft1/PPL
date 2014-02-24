var cookie = require('Svc').HttpHelper.Cookie;
var Svc = require('Svc').Svc;
var async = require('async');
exports.index = function (req, res) {
    res.render('index.ejs', { isMobile: req.query['m'] == "1" ? true : false, msg: req.query['s']});
};
exports.m = function (req, res) {
    res.redirect('/index?m=1')
}
exports.saveProduct = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var obj = JSON.parse(req.body['obj']);
    async.waterfall(
        [
            function (cb) {
                if (obj._id) {
                    var oid = obj._id;
                    delete obj._id;
                    Svc.db.Product.update({_id: oid}, {$set: obj}, function (e) {cb(oid)});
                }
                else {
                    cb(null);
                }
            },
            function (cb) {
                obj._id = Svc.db.Product.ObjectID().toString();
                Svc.db.insert(obj, function (e, ds) {cb(obj._id)});
            }
        ], function (id) {
            res.json({msg: true, error: null, ID: id});
        })
}
exports.postl = function (req, res) {
    var pn = req.body['pn'];
    var pwd = req.body['pwd'];
    var num = req.body['num'];
    var m = req.body['m'] == 'true' ? true : false;
    if (num == '0' && pn == 'Admin' && pwd == '9998') {
        setCurrentUser(res, {_id: '0', Name: 'Admin', Org: {Name: '全局管理', Value: '0'}});
        res.redirect('main?p=' + m);
    }
    else {
        Svc.db.Org.findOne({OrgNum: num, flag: 1}, function (e, org) {
            if (org == null) {
                res.redirect('/index?s=1&m=' + m);
            }
            else {
                Svc.db.User.findOne({Name: pn, Pwd: pwd, 'Org.Value': org._id}, function (e, d) {
                    if (d) {
                        setCurrentUser(res, {_id: d._id, Name: d.Name, Org: d.Org});
                        res.redirect('/main?p=' + m);
                    }
                    else {
                        res.redirect('/index?s=2&m=' + m)
                    }
                });
            }
        });
    }
};
exports.main = function (req, res) {
    var u = cookie.get(req, cookie.defaultUserCookieName);
    res.render('main.ejs', {isMobile: req.query['p'] == 'true' ? true : false });
}
exports.barcheck=function (req,res){
    var code = req.query['c'];
    var pack;
    async.waterfall(
        [
            function (cb) {
                Svc.db.Package.findOne({'Items._id': code}, {Route: 1, Items: 1}, function (e, o) {
                    if (o ==null) cb(1, {msg: false, error: '产品序列号无效,请提防假货!'});
                    else {
                        cb(null, o);
                    }
                });
            },
            function (pkg, cb) {
                pack = pkg;
                async.parallel(
                    {
                        product: function (pcb) {
                            var rl = _.find(pkg.Items, function (i) {return i._id == code});
                            Svc.db.Product.findOne({_id: rl.RelativeObj.Item1}, function (e, pro) {
                                pcb(null, pro);
                            });
                        },
                        salebill: function (pcb) {
                            Svc.db.SaleBill.findOne({ProductInstanceID: code}, function (e, sb) {
                                pcb(null, sb);
                            });
                        }
                    },
                    function (e, result) {
                        var cb = req.query['callback'];
                        if (e) {
                            if (cb)  res.jsonp(result);
                            else res.json(result);
                        }
                        else {
                            var r = {msg: true, error: null, obj: {}};
                            var p = result.product;
                            r.obj = {
                                Name: p.Name,
                                Model: p.Model,
                                Unit: p.Unit,
                                Price: p.Price,
                                Img: p.ImgUrls.length ? p.ImgUrls[0] : '',
                                BatchNum: pack.BatchNum,
                                ProduceTime: pack.ProduceTime,
                                Dealer: pack.Route.Name
                            };
                            if (result.salebill) {
                                r.msg = false;
                                r.error = '序列号为'+code+'的产品,\r已由'+result.salebill.Org.Name+'\r于'+result.salebill.CreateTime.Itme1+'售出,请提防假货!'
                            }
                            if (cb) res.jsonp(r);
                            else res.json(r)
                        }
                    }
                )
            }
        ],
        function (e, d) {
            res.json(d);
        })
}
function setCurrentUser(res, iuser) {
    cookie.set(res, cookie.defaultUserCookieName, iuser);
}
