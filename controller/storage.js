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
                    Svc.db.StockIn.update({_id: obj._id}, {$set: {Status: obj.Status, Items: obj.Items, StockInConfirmOperator: req.currentUser, StockInConfirmTime: Date.ToCreateTime()}}, cb);
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
        case 'savetransbill':
            var obj = req.body['obj'];
            var trBill = req.body['trbill'];
            async.waterfall({
                /**
                 * 出库单更新
                 */
                outUpdate: function (cb) {
                    Svc.db.StockOut.update({_id: obj._id}, {$set: {Status: obj.Status, Items: obj.Items, StockOutConfirmOperator: req.currentUser, StockOutConfrimTime: Date.ToCreateTime()}}, cb);
                },
                /**
                 * 库存更新
                 */
                storageUpdate: function (cb) {
                    async.each(obj.Items, function (i, icb) {
                        Svc.db.Storage.findOne({'RelativeObj.Item1': i.RelativeObj.Item1, 'Stock.Value': i.Stock.Value},
                            function (ee, d) {
                                if (d) {
                                    var am = d.Amount - i.Amount;
                                    Svc.db.Storage.update({_id: d._id}, {$set: {Amount: am }}, icb);
                                }
                                else(icb());
                            });
                    }, cb);
                },
                /**
                 * 清理库存
                 */
                delStorage: function (cb) {
                    Svc.db.Storage.remove({Amount: 0}, cb);
                },
                /**
                 * 物流单更新
                 */
                transBill: function (cb) {
                    Svc.getObj('Order', {BillNum: obj.OrderID}, {}, function (ee, order) {
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
                        Svc.insert('TranseferBill', tb, req.currentUser, function (e, ds) {
                            cb(e, order, tb);
                        });
                    });
                },
                /**
                 * 订单更新
                 */
                order: function (order, tb, cb) {
                    _.each(tb.Items, function (ti) {
                        var oi = _.find(order.Items, function (i) {
                            return i.RelativeObj.Item1 == ti.RelativeObj.Item1
                        });
                        oi.Status = ti.CompleteAmount >= oi.Amount ? '已发货' : '部分发货';
                    });
                    if (!_.any(order.Items, function (i) {
                        return i.Status != '已发货'
                    })) {
                        order.Status = '全部发货';
                    }
                    else if (_.any(order.Items, function (i) {
                        return i.Status == '部分发货'
                    })) {
                        order.Status = '部分发货';
                    }
                    Svc.db.Order.update('Order', {_id: order._id}, {$set: {Items: order.Items, Status: order.Status}}, cb);
                }
            }, function (e) {
                res.json({msg: e == null, error: e});
            })
            break;
    }
}