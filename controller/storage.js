/**
 * 库存
 */
var Svc = require('Svc').Svc;
var helper = require('Svc').HttpHelper;
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
            res.render('storage/stockin.ejs', {u:req.currentUser});
            break;
        case 'stockinconfirm'://入库确认
            res.render('storage/stockinc.ejs');
            break;
        case 'stockout'://出库
            res.render('storage/stockout.ejs');
            break;
    }
}
exports.post=function (req,res){
    var t= req.body['t'].toLowerCase();
    switch (t){
        case 'savepackages':
            var objs=JSON.parse(req.body['objs']);
            Svc.db.Package.insert(objs, function (e){
                res.json(true);
            })
            break;
        case 'stockinconfirm':
            var obj=JSON.parse(req.body['obj']);
            Svc.db.StockIn.update({_id:obj._id},{$set:{Status:obj.Status, Items:obj.Items}},function (e){
                res.json({msg:e ==null,error:e});
            });
            break;
    }
}