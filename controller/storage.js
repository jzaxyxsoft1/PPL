/**
 * 库存
 */
var Svc = require('Svc').Svc;
var helper = require('Svc').HttpHelper;
var async = require('async');
var _ = require('underscore');
exports.get = function (req, res) {
    var t = req.query['t'];
    var m = req.query['m'];
    switch (t) {
        case 'storages':
            var query = req.query['query'] || {};
            query['Org.Value'] = req.currentUser.Org.Value;
            Svc.db.Storage.find(query).toArray(function (e, ds) {
                res.json(ds);
            })
            break;
        case 'transferbills':
            var query = req.query['query'];
            Svc.db.TranseferBill.find(query).toArray(function (e, ds) {
                res.json(ds)
            });
            break;
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
            res.render('storage/package.ejs', {u: req.currentUser});
            break;
        case 'stockin'://入库
            res.render('storage/stockin.ejs', {u: req.currentUser});
            break;
        case 'stockinconfirm'://入库确认
            res.render('storage/stockinc.ejs', {u: req.currentUser});
            break;
        case 'stockout'://出库
            res.render('storage/stockout.ejs', {u: req.currentUser});
            break;
        case 'ship': //发货
            res.render('storage/ship.ejs', {u: req.currentUser});
            break;
        case 'statistics':
            res.render('storage/statistics.ejs', {u: req.currentUser});
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
            async.series([
                function (cb) {
                    Svc.db.StockIn.update({_id: obj._id}, {$set: {Status: obj.Status, Items: obj.Items, StockInConfirmOperator: req.currentUser, StockInConfirmTime: Date.ToCreateTime()}}, cb);
                },
                function (cb) {
                    async.each(obj.Items, function (i, icb) {
                        Svc.db.Storage.findOne({'RelativeObj.Item1': i.RelativeObj.Item1, 'Stock.Value': i.Stock.Value}, function (e, storage) {
                            var mc = i.Amount;
                            if (storage) {
                                storage.Amount = storage.Amount + i.Amount;
                                var cst = (storage.Cost + i.Sum);
                                var uc = Math.round(cst / storage.Amount, 2);
                                Svc.db.Storage.update({_id: storage._id}, {$set: {Amount: storage.Amount + i.Amount, Cost: cst, UnitCost: uc}}, icb);
                            }
                            else {
                                Svc.db.Storage.insert({
                                    _id: Svc.db.Storage.ObjectID().toString(),
                                    RelativeObj: i.RelativeObj,
                                    Amount: i.Amount,
                                    Model: i.Model,
                                    Unit: i.Unit,
                                    Cost: Math.round(i.Sum, 2),
                                    Stock: i.Stock,
                                    UnitCost: i.UnitCost,
                                    Org: req.currentUser.Org
                                }, icb);
                            }
                        });
                    }, cb);
                }
            ], function (e) {
                res.json({msg: e == null, error: e});
            });
            break;
        case 'savetransbill':
            var obj = JSON.parse(req.body['obj']);
            var trBill = req.body['trbill'];
            async.waterfall([
                /**
                 * 更新出库单
                 */
                    function (cb) {
                    Svc.db.StockOut.update({_id: obj._id}, {$set: {Status: obj.Status, Items: obj.Items, StockOutConfirmOperator: req.currentUser, StockOutConfrimTime: Date.ToCreateTime()}}, function (e) {
                        cb(null);
                    });
                },
                /**
                 * 更新库存
                 */
                    function (cb) {
                    async.each(obj.Items, function (i, icb) {
                        Svc.db.Storage.findOne({'RelativeObj.Item1': i.RelativeObj.Item1, 'Stock.Value': i.Stock.Value},
                            function (ee, d) {
                                if (d) {
                                    var am = d.Amount - i.Amount;
                                    var cst = d.Cost - d.UnitCost * am;
                                    Svc.db.Storage.update({_id: d._id}, {$set: {Amount: am, Cost: cst}}, icb);
                                }
                                else icb(null);
                            });
                    }, function () {
                        cb(null);
                    });

                },
                /**
                 * 保存运单
                 */
                    function (cb) {
                    Svc.getObj('Order', {BillNum: obj.OrderID}, function (ee, order) {
                        var tb = {
                            _id: '',
                            LogisticsOrg: trBill.LogisticsOrg,
                            LogisticsNum: trBill.LogisticsNum,
                            Status: '已发货',
                            OrderID: obj.OrderID,
                            ShipAddress: obj.ShipAddress,
                            Tel: obj.Tel,
                            StockBillNum: obj.BillNum,
                            Receiver: order.Owner
                        };
                        tb.Items = _.filter(obj.Items, function (i) {
                            return i.CompleteAmount > 0
                        });
                        _.each(tb.Items, function (i) {
                            i.Status = '已发货';
                        });
                        Svc.insert('TranseferBill', tb, req.currentUser, function (e, ds) {
                            cb(e, order, tb);
                        });
                    });
                },
                /**
                 * 更新订单状态
                 */
                    function (order, tb, cb) {
                    _.each(tb.Items, function (ti) {
                        var oi = _.find(order.Items, function (i) {
                            return i.RelativeObj.Item1 == ti.RelativeObj.Item1
                        });
                        oi.Status = ti.CompleteAmount >= oi.Amount ? '已全部发货' : '已部分发货';
                        oi.ShipAmount = ti.CompleteAmount;
                    });
                    if (!_.any(order.Items, function (i) {
                        return i.Status != '已全部发货'
                    })) {
                        order.Status = '已全部发货';
                    }
                    else if (_.any(order.Items, function (i) {
                        return i.Status == '已部分发货'
                    })) {
                        order.Status = '已部分发货';
                    }
                    Svc.db.Order.update({_id: order._id}, {$set: {  TranseferBillNum: tb.BillNum, Items: order.Items, Status: order.Status}}, function () {
                        cb(null, order)
                    });
                },
                /**
                 * 更新包装物流信息
                 */
                    function (order, cb) {
                    async.each(obj.Packages, function (i, icb) {
                        Svc.db.Package.update({_id: i}, {$set: {Rounte: order.Owner}}, function () {
                            icb(null);
                        });
                    });
                    cb(null);
                }
            ], function (e) {
                res.json({msg: e == null, error: e});
            })
            break;
    }
}