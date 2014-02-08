/**
 * 库存
 */
var Svc = require('Svc').Svc;
var helper = require('Svc').HttpHelper;
var async = require('async');
exports.get = function (req, res) {
    var t = req.query['t'];
    var m = req.query['m'];
    switch (t) {
        case 'stock':
            res.render('storage/stock.ejs', {Org: req.currentUser.Org});
            break;
        case 'codeprint'://条码打印
            if (m) {
                m = Number(m);
                var _r = [];
                for (var i = 0; i < m; i++) {
                    _r.push(Svc.getBillNum('Package'));
                }
                res.json(_r);
            }
            else {
                res.render('storage/codeprint.ejs');
            }
            break;
        case 'package': //产品封包
            res.render('storage/package.ejs');
            break;
        case 'stockin'://入库
            res.render('storage/stockin.ejs', {u: req.currentUser});
            break;
        case 'stockinconfirm'://入库确认
            res.render('storage/stockinc.ejs');
            break;
        case 'stockout'://出库
            res.render('storage/stockout.ejs');
            break;
        case 'ship': //发货
            res.render('storage/ship.ejs');
            break;
    }
}
exports.post = function (req, res) {
    var t = req.body['t'].toLowerCase();
    switch (t) {
        case 'savepackages':
            var objs = JSON.parse(req.body['objs']);
            Svc.db.Package.insert(objs, function (e) {
                res.json(true);
            })
            break;
        case 'stockinconfirm':
            var obj = JSON.parse(req.body['obj']);
            async.waterfall({
                /**
                 * 单据更新
                 */
                bill: function (cb) {
                    Svc.db.StockIn.update({_id: obj._id}, {$set: {Status: obj.Status, Items: obj.Items, StockInComfirmOperator: req.currentUser}}, cb);
                },
                /**
                 * 库存更新
                 */
                update: function (cb) {
                    async.each(obj.Items, function (i, icb) {
                        Svc.db.Storage.findOne({'RelativeObj.Item1': i.RelativeObj.Item1, 'Stock.Value': i.Stock.Value},
                            function (ee, d) {
                                if (d) {
                                    var am = d.Amount + i.Amount;
                                    var cs = Math.round((d.Amount * d.UnitCost + i.Amount * i.UnitCost) / am, 2);
                                    Svc.db.Storage.update({_id: d._id}, {$set: {Amount: am, Cost: cs}}, icb);
                                }
                                else {
                                    Svc.db.Storage.insert({
                                        _id: Svc.db.Storage.ObjectID().toString()(),
                                        RelativeObj: i.RelativeObj,
                                        Amount: i.Amount,
                                        Model: i.Model,
                                        Unit: i.Unit,
                                        UnitCost: i.UnitCost,
                                        Cost: Math.round((i.Amount * i.UnitCost), 2),
                                        Stock: i.Stock
                                    }, icb);
                                }
                            });
                    }, cb);
                },
                /**
                 * 删除零库存
                 */
                del: function (cb) {
                    Svc.db.Storage.remove({Amount: 0}, cb);
                }
            }, function (e) {
                res.json({msg: e == null, error: e});
            })
            break;
    }
}