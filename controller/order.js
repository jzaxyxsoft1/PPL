/**
 *订单
 */
var _ = require('underscore');
var async = require('async');
var Svc = require('Svc').Svc;
var OrderSvc = require('Svc').OrderSvc;
var FinanceSvc = require('Svc').FinanceSvc;
exports.get = function (req, res) {
    var t = req.query['t'].toLowerCase();
    var m = req.query['m'];
    switch (t) {
        case 'n': //新建订单
            Svc.db.Org.findOne({_id: req.currentUser.Org.Value }, function (e, org) {
                res.render('order/n.ejs', {user: req.currentUser, org: org});
            });
            break;
        case 'submitorder': //提交订单
            if (m) {
                res.render('order/sub.ejs');
            }
            else {
                var id = req.query['id'];
                var st = req.query['st'];
                Svc.db.Order.update({_id: id}, {$set: {Status: '未付款'}}, function (e) {
                    res.json({msg: e == null, error: e});
                });
            }
            break;
        case 'pay': //经销商付款
            if (m) {
                res.render('order/pay.ejs', {user: req.currentUser});
            }
            else {
                var id = req.query['id'];
                var voucherNum = req.query['voucherNum'];
                async.waterfall([
                    //订单处理
                    function (cb) {
                        Svc.db.Order.findOne({_id: id}, function (e, order) {
                            Svc.db.Order.update({_id: id}, {$set: {VoucherNum: voucherNum, Status: '已付款', PayOperator: req.currentUser, PayTime: Date.ToCreateTime()}}, function (er) {
                                cb(er, order);
                            });
                        });
                    },
                    //代理商
                    function (order, cb) {
                        Svc.db.Org.findOne({_id: '0'}, function (e, org) {
                            cb(e, order, org);
                        });
                    },
                    //往来处理
                    function (order, org, cb) {
                        FinanceSvc.CreateRnP(order.Org, org, '付货款(' + order.BillNum + ')', order.Sum, 0, order.Creator, '', function (e, rnp) {
                            cb(null);
                        });
                    }
                ], function (e) {
                    res.json({msg: e == null, error: e});
                });
            }
            break;
        case 'paymentconfirm': //财务_经销商付款确认
            if (m) {
                res.render('order/paymentconfirm.ejs', {user: req.currentUser});
            }
            else {
                var id = req.query['id'];
                async.waterfall([
                    //订单处理
                    function (cb) {
                        Svc.db.Order.findOne({_id: id}, function (e, order) {
                            Svc.db.Order.update({_id: id},
                                {$set: {  Status: '付款已确认', PayConfirmOperator: req.currentUser, PayConfirmTime: Date.ToCreateTime()}},
                                function (e) {
                                    cb(e, order);
                                });
                        });
                    },
                    //往来处理
                    function (order, org, cb) {
                        Svc.createRnP(order.Org, req.currentUser.Org, '付货款(' + order.BillNum + ')', 0, order.Sum, req.currentUser, '', cb);
                    },
                    //锁定库存
                    function (order, cb) {
                        async.each(order.Items,
                            function (i, acb) {
                                Svc.db.Storage.findOne({'RelativeObj': i.RelativeObj.Item1}, {Amount: 1, Locked: 1}, function (e, storage) {
                                    var lck = 0;
                                    if (storage) {
                                        lck = storage.Locked + i.Amount;
                                        Svc.db.Storage.update({_id: storage._id}, {$set: {Locked: lck}}, function (e) {
                                            acb(null);
                                        });
                                    }
                                    else {
                                        storage = {_id: '', RelativeObj: i.RelativeObj, Model: i.Model, Unit: i.Unit, Cost: 0, Amount: 0, UnitCost: 0, Stock: {Name: '', Value: ''}, Org: {Name: '1', Value: ''}, Locked: i.Amount};
                                        Svc.db.Storage.insert(storage, function (e) {
                                            acb(null);
                                        });
                                    }
                                });
                            }, function (e) {
                                cb(null);
                            });
                    }
                ], function (e) {
                    res.json({msg: e == null, error: e})
                });
            }
            break;
        case 'ordership': //订单发货
            if (m) {
                res.render('order/ordership.ejs', {user: req.currentUser});
            }
            else {
                var id = req.query['id'];
                Svc.db.Order.update({_id: id}, {$set: {  Status: '已发货'}}, function (e) {
                    res.json({msg: e == null, error: e});
                });
            }
            break;
        case 'complete': //订单完成
            if (m) {
                res.render('order/complete.ejs', {user: req.currentUser});
            }
            else {
                var id = req.query['id']; //订单ID
                var pid = req.query['pid'];//产品ID
                async.waterfall([
                    //运单处理
                    function (cb) {
                        Svc.db.TranseferBill.findOne({BillNum: id}, function (e, trBill) {
                            var itm = _.find(trBill.Items, function (i) {
                                return i.RelativeObj.Item1 == pid;
                            });
                            itm.Status = '已完成';
                            if (!_.any(trBill.Items, function (i) {
                                return i.Status != '已完成'
                            })) {
                                trBill.Status = '已完成';
                            }
                            Svc.db.TranseferBill.update({_id: trBill._id}, {$set: {Statues: trBill.Statues, Items: trBill.Items}}, function (e) {
                                cb(e, trBill);
                            });
                        });
                    },
                    //库存处理
                    function (trBill, cb) {
                        async.each(trBill.Items, function (i, icb) {
                            Svc.db.Storage.fineOne({'Org.Value': trBill.Org.Value, 'RelativeObj.Item1': i.RelativeObj.Item1}, function (e, storage) {
                                if (storage) {
                                    var ca = storage.Amount + i.Amount;
                                    var cst = storage.Cost + i.Sum
                                    var uc = Math.round(cst / ca, 2);
                                    Svc.db.Storage.update({_id: storage._id}, {$set: {Amount: ca, Cost: cst, UnitCost: uc}}, function (e) {
                                        icb(e);
                                    });
                                }
                                else {
                                    Svc.db.Storage.insert({Org: trBill.Org, RelativeObj: i.RelativeObj, Amount: i.Amount, UnitCost: i.UnitCost, Model: i.Model, Unit: i.Unit, Cost: i.Sum}, function (e) {
                                        icb(e);
                                    });
                                }
                            });
                        }, function (e) {
                            cb(e, trBill);
                        });
                    },
                    //往来处理
                    function (trBill, org, cb) {
                        Svc.db.Org.findOne({_id: '0'}, function (e, org) {
                            FinanceSvc.CreateRnP(req.currentUser.Org, {Name: org.Name, Value: org._id}, '收货(' + trBill.OrderID + ')', 0, trBill.Sum, req.currentUser, '运单:' + trBill.BillNum, function (e) {
                                cb(e, trBill.OrderiD);
                            });
                        });
                    },
                    //更新订单状态
                    function (orderID, cb) {
                        Svc.db.Order.findOne({BillNum: orderID}, function (e, order) {
                            var itm = _.find(order.Items, function (i) {
                                return i.RelativeObj.Item1 == pid;
                            });
                            itm.Status = itm.Status.replace(/发货/, '完成');
                            if (!_.any(order.Items, function (i) {
                                return i.Status != '已全部完成'
                            })) {
                                order.Status = '已全部完成';
                            }
                            Svc.db.Order.update({_id: order._id}, {$set: {Status: order.Statues, Items: order.Items}}, function (e) {
                                cb(e, order);
                            });
                        });
                    }

                ], function (e) {
                    res.json({msg: e == null, error: e});
                })
            }
            break;
    }
};
exports.postsave = function (req, res) {
    var order = JSON.parse(req.body['obj']);
    var pUser = req.currentUser;
    if (order.Status == '未付款')OrderSvc.SubmitOrder(order._id, pUser, function (e) {
        Svc.db.Order.findOne({_id: order._id}, function (e, d) {
            res.json({msg: e == null, error: e, ID: d._id, BillNum: d.BillNum });
        });
    })
    else OrderSvc.CreateOrder(order, pUser, function (e) {
        async.parallel(
            [
                function (pcb) {
                    Svc.db.Order.findOne({_id: order._id}, pcb)
                },
                function (pcb) {
                    Svc.db.RnP.findOne({'Org.Value': pUser.Org.Value}, pcb)
                }
            ],
            function (e, result) {
                var ordr = result[0];
                var rnp = result[1];
                res.json({msg: e == null, error: e, ID: ordr._id, BillNum: ordr.BillNum });
            });
    });
}
exports.postpay = function (req, res) {
    var id = req.body['id'];
    var voucherNum = req.body['voucherNum'];
    var pUser = req.currentUser;
    OrderSvc.OrderPayment(id, voucherNum, pUser, function (e) {
        res.json({msg: e == null, error: e});
    })
}
exports.postpayconfirm = function (req, res) {
    var id = req.body['id'];
    var user = req.currentUser;
    OrderSvc.PaymentConfirm(id, user, function (e) {
        res.json({msg: e == null, error: e})
    });
}
exports.postcomplete = function (req, res) {
    var id = req.body['id'];
    var pUser = req.currentUser;
    OrderSvc.Complete(id, pUser, function (e) {
        res.json({msg: e == null, error: e});
    });
}