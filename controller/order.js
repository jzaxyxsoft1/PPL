/**
 *订单
 */
var Svc = require('Svc').Svc;
exports.get = function (req, res) {
    var t = req.query['t'].toLowerCase();
    switch (t) {
        case 'n': //新建订单
            res.render('order/n', {user: req.currentUser});
            break;
        case 's': //订单状态
            var st = req.query['st']; //状态
            res.render('order/s', {user: req.currentUser, status: st });
            break;
        case 'submitorder': //提交订单
            var id = req.query['id'];
            var st = req.query['st'];
            Svc.db.Order.update({_id: id}, {$set: {Status: '未付款'}}, function (e) {
                res.json({msg: e == null, error: e});
            });
            break;
        case 'payment': //经销商付款
            var id = req.query['id'];
            var voucherNum = req.query['voucherNum'];
            Svc.db.Order.update({_id: id}, {$set: {VoucherNum: voucherNum,Status:'已付款'}}, function (e) {
                res.json({msg: e == null, error: e});
            });
            break;
        case 'paymentconfirm': //财务_经销商付款确认
            var id = req.query['id'];
            Svc.db.Order.update({_id: id}, {$set: {  Status: '付款已确认'}}, function (e) {
                res.json({msg: e == null, error: e});
            });
            break;
        case 'ordership': //订单发货
            var id = req.query['id'];
            Svc.db.Order.update({_id: id}, {$set: {  Status: '已发货'}}, function (e) {
                res.json({msg: e == null, error: e});
            });
            break;
        case 'complete': //订单完成
            var id = req.query['id'];
            Svc.db.Order.update({_id: id}, {$set: {  Status: '完成'}}, function (e) {
                res.json({msg: e == null, error: e});
            });
            break;
    }

};