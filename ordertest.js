var SvcApp = require('Svc');
var Svc = SvcApp.Svc;
var OrderSvc = SvcApp.OrderSvc;
var FinanceSvc = SvcApp.FinanceSvc;
var StorageSvc = SvcApp.StorageSvc;
var async = require('async');
var assert = require('assert');
var _ = require('underscore');
var db = require('DB').DB;
db.addCollection('localhost:4000/RBCSiteDB', 'BODefine');
db.addCollection('localhost:4000/RBCSiteDB', 'Product');
SvcApp.init(function (e) {
    Svc.db = db;
    var org, user, order, products, stockIn, stockOut, transferBill, packages, pUser, pOrg;
    async.series(
        {
            删除: function (scb) {
                async.parallel(
                    [
                        function (pcb) {db.RnP.remove({}, pcb) },
                        function (pcb) {db.Order.remove({}, pcb) },
                        function (pcb) {db.Storage.remove({}, pcb)},
                        function (pcb) {db.StockIn.remove({}, pcb)},
                        function (pcb) {db.StockOut.remove({}, pcb)},
                        function (pcb) {db.Package.remove({}, pcb)},
                        function (pcb) {db.TranseferBill.remove({}, pcb)}
                    ], function (e) {
                        console.log('Delete complete');
                        scb();
                    });
            },
            初始化数据: function (scb) {
                async.parallel(
                    [
                        function (pcb) {
                            db.Product.find({}).toArray(function (e, ds) {
                                products = ds;
                                org = Svc.OrgCache['0'];
                                user = {Name: 'Admin', _id: '0', Org: org};
                                pcb();
                            })
                        },
                        function (pcb) {
                            db.User.findOne({_id: '52fa137c2882fa342e000007'}, {Name: 1, Org: 1}, function (e, u) {
                                pUser = u;
                                pOrg = pUser.Org;
                                pcb();
                            });
                        }
                    ], function (e) {
                        console.log('Init Complete');
                        scb(null);
                    });
            },
            新建订单: function (scb) {
                var pro = products[0];
                order = {
                    _id: '',
                    Items: [
                        {RelativeObj: {Item1: pro._id, Item2: pro.Name, Item3: 'Product'}, Model: pro.Model, Unit: pro.Unit, UnitPrice: pro.PartnerPrice, Amount: 12}
                    ],
                    Sum: 12 * pro.PartnerPrice
                };
                OrderSvc.CreateOrder(order, pUser, function (e) {
                    async.parallel(
                        [
                            function (pcb) {db.Order.findOne({_id: order._id}, pcb)},
                            function (pcb) { db.RnP.findOne({'Org.Value': user.Org.Value}, pcb)}
                        ],
                        function (e, result) {
                            var ordr = result[0];
                            var rnp = result[1];
                            assert(ordr != null && ordr.Status == '待提交', 'Order.CreateOrder error');
                            console.log('OrderSvc.CreateOrder passed');
                            scb(null);
                        });
                });
            },
            提交订单: function (scb) {
                OrderSvc.SubmitOrder(order._id, pUser, function (e) {
                    db.Order.findOne({_id: order._id}, function (e, d) {
                        assert(d && d.Status == '待付款', 'OrderSvc.SubmitOrder error');
                        console.log('OrderSvc.SubmitOrder passed');
                        scb();
                    });
                })
            },
            订单支付: function (scb) {
                OrderSvc.OrderPayment(order._id, '9999', pUser, function (e) {
                    async.parallel(
                        {
                            ord: function (pcb) {db.Order.findOne({_id: order._id}, pcb)},
                            rnp: function (pcb) {db.RnP.findOne({'Org.Value': pUser.Org.Value, Summary: {$regex: '付'}}, pcb)}
                        },
                        function (e, result) {
                            var ord = result.ord;
                            var rnp = result.rnp;
                            assert(ord && ord.Status == '已付款', ' OrderSvc.OrderPayment error');
                            assert(
                                rnp &&
                                    rnp.Debit == order.Sum &&
                                    rnp.RelativeOrg.Value == user.Org.Value &&
                                    rnp.Summary.indexOf(order.BillNum) > -1 &&
                                    rnp.Credit == 0,
                                ' OrderSvc.OrderPayment RnP error');
                            console.log('OrderPayment passed');
                            console.log('OrderPayment RnP passed');
                            scb();
                        }
                    );
                })
            },
            确认付款: function (scb) {
                OrderSvc.PaymentConfirm(order._id, user, function (e) {
                    async.parallel(
                        {
                            ord: function (pcb) {db.Order.findOne({_id: order._id}, pcb)},
                            rnp: function (pcb) {db.RnP.findOne({Summary: {$regex: '收'}, 'Org.Value': user.Org.Value}, pcb)},
                            storage: function (pcb) {db.Storage.findOne({'RelativeObj.Item1': order.Items[0].RelativeObj.Item1}, pcb);}
                        },
                        function (e, result) {
                            var ord = result.ord;
                            var rnp = result.rnp;
                            var storage = result.storage;
                            assert(ord && ord.Status == '付款已确认', ' Svc.OrderSvc.PaymentConfirm error');
                            assert(
                                rnp &&
                                    rnp.Debit == 0 &&
                                    rnp.RelativeOrg.Value == pUser.Org.Value &&
                                    rnp.Summary.indexOf(order.BillNum) > -1 &&
                                    rnp.Credit == order.Sum,
                                'OrderSvc.PaymentConfirm RnP error');
                            assert(
                                storage &&
                                    storage.Amount == 0 &&
                                    storage.Locked == order.Items[0].Amount &&
                                    storage.Useable == (0 - order.Items[0].Amount),
                                'OrderSvc.PaymentConfirm storage locked error')
                            console.log('OrderSvc.PaymentConfirm passed');
                            console.log('OrderSvc.PaymentConfirm RnP passed');
                            console.log('OrderSvc.PaymentConfirm Storage locked passed');
                            scb();
                        }
                    );
                });
            },
            入库单: function (scb) {
                stockIn = {
                    _id: '',
                    Items: []
                };
                var pro = products[0]
                stockIn.Items.push(
                    {
                        RelativeObj: {Item1: pro._id, Item2: pro.Name, Item3: 'Product'},
                        UnitCost: pro.UnitCost,
                        Amount: 120,
                        Model: pro.Model,
                        Unit: pro.Unit
                    }
                );
                StorageSvc.SaveStockIn(stockIn, user, function (e, d) {
                    db.StockIn.findOne(
                        {  'Org.Value': user.Org.Value, Items: {  $elemMatch: {  'RelativeObj.Item1': pro._id }  }  },
                        function (e, st) {
                            assert(st && st.Status == '待执行', 'StorageSvc.SaveStockIn  error ');
                            console.log('StorageSvc.SaveStockIn passed');
                            scb();
                        });
                });
            },
            入库确认: function (scb) {
                _.each(stockIn.Items, function (i) {
                    i.CompleteAmount = i.Amount;
                });
                StorageSvc.StockInConfirm(
                    stockIn, user,
                    function (e, od) {
                        var pro = products[0];
                        async.parallel(
                            [
                                function (pcb) {
                                    db.StockIn.findOne({_id: stockIn._id}, pcb);
                                }           ,
                                function (pcb) {
                                    db.Storage.findOne({'Org.Value': user.Org.Value, 'RelativeObj.Item1': stockIn.Items[0].RelativeObj.Item1 }, pcb);
                                }
                            ],
                            function (e, result) {
                                var st = result[0];
                                var storage = result[1];
                                assert(st && st.Status == '已完成', 'StorageSvc.StockInConfirm  error ');
                                assert(storage.Useable == storage.Amount - order.Items[0].Amount, 'StorageSvc.StockInConfirm useable amount error');
                                assert(storage.Cost == storage.Amount * pro.UnitCost, 'StorageSvc.StockInConfirm Cost error');
                                console.log('StorageSvc.StockInConfirm passed');
                                scb();
                            })
                    }
                )
            },
            出库单: function (scb) {
                stockOut = {_id: '', Items: [], OrderID: order.BillNum};
                var pro = products[0];
                stockOut.Items.push(
                    {
                        RelativeObj: {Item1: pro._id, Item2: pro.Name, Item3: 'Product'},
                        UnitCost: pro.UnitCost,
                        Amount: order.Items[0].Amount,
                        Model: pro.Model,
                        Unit: pro.Unit
                    }
                );
                StorageSvc.SaveStockOut(stockOut, user, function (e) {
                    assert(e == null, e);
                    db.StockOut.findOne({_id: stockOut._id}, function (e, ot) {
                        assert(ot && ot.Status == '待执行', ' StorageSvc.SaveStockOut error');
                        console.log('StorageSvc.SaveStockOut passed');
                        scb();
                    });
                })
            },
            条码: function (scb) {
                packages = [];
                for (var i = 0; i < 12; i++) {
                    var its = [];
                    for (var j = 0; j < order.Items.Amount; j++) {
                        its.push(
                            {
                                _id: '111111111111' + j.toString(),
                                RelativeObj: order.items[0].RelativeObj,
                                BatchNum: 'aaaaaa',
                                ProduceTime: Date.ToDateTimeString(null, 1)
                            }
                        );
                    }
                    packages.push({_id: (i + 1).toString(), Items: its, flag: 1});
                }
                db.Package.insert(packages, function (e) { scb();});
            },
            产品发货: function (scb) {
                transferBill = {_id: '', Items: [], StockOutID: stockOut.BillNum, OrderID: order.BillNum, LogisticsOrg: '物流1', LogisticsNum: '物流单号1'};
                var oi = stockOut.Items[0];
                transferBill.Items.push({RelativeObj: oi.RelativeObj, Amount: oi.Amount, CompleteAmount: oi.Amount, Packages: [packages[0]._id]});
                StorageSvc.Ship(transferBill, user, false, function (e) {
                    assert(e == null, e);
                    async.parallel(
                        {
                            ord: function (picb) {
                                db.Order.findOne({_id: order._id}, picb)
                            },
                            rnp: function (picb) {
                                db.RnP.findOne({Summary: {$regex: '发'}}, picb)
                            },
                            stkot: function (picb) {
                                db.StockOut.findOne({_id: stockOut._id}, picb)
                            },
                            storage: function (picb) {
                                db.Storage.findOne({'Org.Value': user.Org.Value, 'RelativeObj.Item1': order.Items[0].RelativeObj.Item1}, picb);
                            },
                            pack: function (picb) {
                                db.Package.find({'Route.Value': order.Org.Value}).toArray(picb);
                            }
                        },
                        function (e, result) {
                            var ord = result.ord;
                            var rnp = result.rnp;
                            var stkot = result.stkot;
                            var stor = result.storage;
                            var pack = result.pack;
                            assert(e == null, e);
                            assert(ord && ord.Status == '已全部发货', ' StorageSvc.Ship order status error');
                            assert(ord.Items[0].CompleteAmount == ord.Items[0].Amount, ' StorageSvc.Ship order item completeAmount error');
                            assert(rnp && rnp.Debit == ord.Sum, ' StorageSvc.Ship rnp error');
                            assert(stkot && stkot.Status == '已完成', ' StorageSvc.Ship stockout status error');
                            assert(stor && stor.Amount == (stockIn.Items[0].Amount - stockOut.Items[0].Amount), ' StorageSvc.Ship amount error');
                            assert(stor.Locked == 0 && stor.Useable == stor.Amount, ' StorageSvc.Ship storage useable amount error');
                            assert(stor.Cost == stor.Amount * stor.UnitCost, ' StorageSvc.Ship storage cost error');
                            assert(pack != null && pack.length > 0 && pack[0]._id == '1', ' StorageSvc.Ship package route error');
                            console.log('StorageSvc.Ship passed');
                            scb();
                        })
                });
            },
            确认收货: function (scb) {
                OrderSvc.Complete(transferBill._id, pUser, function (e) {
                    assert(e == null, e);
                    async.parallel(
                        {
                            ord: function (pcb) {
                                db.Order.findOne({_id: order._id}, pcb);
                            },
                            trB: function (pcb) {
                                db.TranseferBill.findOne({_id: transferBill._id}, pcb);
                            },
                            strg: function (pcb) {
                                db.Storage.findOne({'Org.Value': pUser.Org.Value}, pcb);
                            },
                            rnp: function (pcb) {
                                db.RnP.findOne({Summary: {$regex: '收'}, 'Org.Value': pUser.Org.Value }, pcb);
                            }
                        },
                        function (e, result) {
                            var ord = result.ord;
                            var trB = result.trB;
                            var strg = result.strg;
                            var rnp = result.rnp;
                            assert(ord && ord.Status == '已全部完成', ' OrderSvc.Complete order status error');
                            assert(trB && trB.Status == '已完成', ' OrderSvc.Complete transferBill status error');
                            assert(strg && strg.Amount == transferBill.Items[0].Amount, 'OrderSvc.Complete storage amount error');
                            assert(rnp && rnp.Credit == order.Sum, 'OrderSvc.Complete rnp error');
                            console.log('OrderSvc.Complete passed');
                            scb();
                        });
                });
            }
        },
        function (e) {
            console.log(e || 'All passed');
        }
    )
})
;
