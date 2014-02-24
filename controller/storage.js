/**
 * 库存
 */
var Svc = require('Svc').Svc;
var StorageSvc = require('Svc').StorageSvc;
var FinanceSvc = require('Svc').FinanceSvc;
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
            Svc.db.TransferBill.find(query).toArray(function (e, ds) {
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
        case 'useablestorage':
            var id = req.query['id'];
            query['_id'] = id;
            query['$or'] = [
                {'Org.Value': '0'},
                {'Org.Value': '1'}
            ];
            Svc.db.Storage.find(query, {Org: 1, Amount: 1, Locked: 1}, function (e, ds) {
            });
            break;
        case 'barcheck':

            var code = req.query['c'];
            var pack;
            async.waterfall(
                [
                    function (cb) {
                        Svc.db.Package.findOne({'Items._id': code}, {Route: 1, Items: 1}, function (e, o) {
                            if (e) cb(e, {msg: false, error: '产品序列号无效,请提防假货!'});
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
            break;
    }
}
exports.post = function (req, res) {
    var t = req.body['t'].toLowerCase();
    switch (t) {
        case 'savepackages':
            var objs = JSON.parse(req.body['objs']);
            var stockInId = req.query['iId'];
            async.parallel(
                [
                    function (cb) {
                        if (stockInId) {
                            StorageSvc.StockInConfirm(stockInId, req.currentUser, function () {cb();});
                        } else {cb();}
                    },
                    function (cb) {
                        Svc.db.Package.insert(objs, function (e) {
                            cb();
                        })
                    }
                ], function (e) {
                    res.json(true);
                })
            break;
        case 'stockinconfirm':
            var obj = JSON.parse(req.body['obj']);
            async.series(
                [
                    function (cb) {
                        Svc.db.StockIn.update({_id: obj._id}, {$set: {Status: obj.Status, Items: obj.Items, StockInConfirmOperator: req.currentUser, StockInConfirmTime: Date.ToCreateTime()}}, cb);
                    },
                    function (cb) {
                        async.each(obj.Items, function (i, icb) {
                            Svc.db.Storage.findOne({'RelativeObj.Item1': i.RelativeObj.Item1, 'Stock.Value': i.Stock.Value}, function (e, storage) {
                                var mc = i.Amount;
                                if (storage) {
                                    storage.Amount = storage.Amount + i.Amount;
                                    var cst = (storage.Cost + i.Cost);
                                    var uc = Math.round(cst / storage.Amount, 2);
                                    Svc.db.Storage.update({_id: storage._id}, {$set: {Amount: storage.Amount, Cost: cst, UnitCost: uc, Useable: storage.Amount - i.Locked}}, icb);
                                }
                                else {
                                    Svc.db.Storage.insert({
                                                              _id: Svc.db.Storage.ObjectID().toString(),
                                                              RelativeObj: i.RelativeObj,
                                                              Amount: i.Amount,
                                                              Model: i.Model,
                                                              Unit: i.Unit,
                                                              Cost: Math.round(i.Cost, 2),
                                                              Stock: i.Stock,
                                                              UnitCost: i.UnitCost,
                                                              Locked: 0,
                                                              Useable: i.Amount,
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
            var order, trBill;
            async.waterfall(
                [
                    //保存运单
                    function (cb) {
                        Svc.getObj('Order', {BillNum: obj.OrderID}, function (ee, ord) {
                            order = ord;
                            trBill = {
                                _id: '',
                                LogisticsOrg: trBill.LogisticsOrg,
                                LogisticsNum: trBill.LogisticsNum,
                                Status: '已发货',
                                OrderID: obj.OrderID,
                                ShipAddress: obj.ShipAddress,
                                Tel: obj.Tel,
                                StockBillNum: obj.BillNum,
                                Receiver: order.Owner,
                                Packages: obj.Packages
                            };
                            Svc.insert('TranseferBill', trBill, req.currentUser, function (e, ds) {
                                cb(e, order, tb);
                            });
                        });
                    },
                    //更新出库单
                    function (cb) {
                        Svc.db.StockOut.update({_id: obj._id}, {$set: {Status: obj.Status, Items: obj.Items }}, function (e) {
                            cb(e);
                        });
                    },
                    //更新库存
                    function (order, tBill, cb) {
                        async.each(obj.Items, function (i, icb) {
                            Svc.db.Storage.findOne(
                                {'RelativeObj.Item1': i.RelativeObj.Item1, 'Stock.Value': i.Stock.Value},
                                function (ee, d) {
                                    if (d) {
                                        var am = d.Amount - i.Amount;
                                        var cst = d.Cost - d.UnitCost * am;
                                        var lck = d.Locked - i.Amount;
                                        Svc.db.Storage.update({_id: d._id}, {$set: {Amount: am, Cost: cst, Useable: am - d.Locked, Locked: lck}}, icb);
                                    }
                                    else icb(null);
                                });
                        }, function (e) {
                            cb(e, order, tBill);
                        });
                    },
                    //更新订单状态
                    function (order, tb, cb) {
                        _.each(tb.Items, function (ti) {
                            var oi = _.find(order.Items, function (i) {
                                return i.RelativeObj.Item1 == ti.RelativeObj.Item1
                            });
                            oi.CompleteAmount = oi.CompleteAmount + ti.CompleteAmount;
                            oi.Status = oi.CompleteAmount >= oi.Amount ? '已全部发货' : '已部分发货';
                            oi.TranseferBills = oi.TranseferBills || [];
                            oi.TranseferBills.push({Time: Date.ToCreateTime(), TransferBillNum: tb.BillNum, Amount: ti.CompleteAmount});
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
                        Svc.db.Order.update({_id: order._id}, {$set: { Items: order.Items, Status: order.Status}}, function () {
                            cb(null, order)
                        });
                    },
                    //往来处理
                    function (order, cb) {
                        FinanceSvc.CreateRnP(req.currentUser.Org, order.Org, '发货(' + trBill.BillNum + ')', order.Sum, 0, req.currentUser, '', function (e) {
                            cb(e);
                        });
                    },
                    //更新包装物流信息
                    function (cb) {
                        async.each(obj.Packages, function (i, icb) {
                            Svc.db.Package.update({_id: i}, {$set: {Rounte: order.Owner}}, function () {
                                icb(null);
                            });
                        }, function () {
                        });
                        cb(null);
                    }
                ], function (e) {
                    res.json({msg: e == null, error: e});
                })
            break;
    }
}
exports.poststockin = function (req, res) {
    var stockIn = JSON.parse(req.body['obj']);
    var user = req.currentUser;
    StorageSvc.SaveStockIn(stockIn, user, function (e, d) {
        res.json({msg: e == null, error: e});
    });
}
exports.poststockinc = function (req, res) {
    var stockIn = JSON.parse(req.body['obj']);
    var user = req.currentUser;
    StorageSvc.StockInConfirm(stockIn, user,
                              function (e, od) {
                                  res.json({msg: e == null, error: e});
                              }
    )
}
exports.poststockout = function (req, res) {
    var stockOut = JSON.parse(req.body['obj']);
    var user = req.currentUser;
    StorageSvc.SaveStockOut(stockOut, user, function (e) {
        res.json({msg: e == null, error: e});
    })
}
exports.postship = function (req, res) {
    var transferBill = JSON.parse(req.body['obj']);
    var user = req.currentUser;
    StorageSvc.Ship(transferBill, user, false, function (e) {
        res.json({msg: e == null, error: e});
    });
}
exports.print = function (req, res) {
    var c = req.query['c'];
    c = c.replace(",", "','")
    res.render('storage/print.ejs', {m: c});
}