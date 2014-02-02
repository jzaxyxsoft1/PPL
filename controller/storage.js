/**
 * 库存
 */
var helper= require('Svc').HttpHelper;
exports.get = function (req,res){
    var t=req.query['t'];
    switch (t){
        case 'stock':
            res.render('storage/stock.ejs',{Org:req.currentUser.Org} );
            break;
        case 'storage':
            res.render('storage/storage.ejs',{Org:req.currentUser.Org});
            break;
    }
}