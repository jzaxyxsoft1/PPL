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
        case 'stockIn'://入库
            res.render('storage/stockin.ejs', {Org: req.currentUser.Org});
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
    }
}