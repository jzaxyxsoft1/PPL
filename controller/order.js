/**
 *订单
 */
exports.get=function (req,res){
    var t=req.query['t'].toLowerCase();
    switch (t){
        case 'n': //新建订单
            res.render('order/n',{user:req.currentUser});
            break;
        case 's': //订单状态
            var st=req.query['st'];
            res.render('order/s',{user:req.currentUser,status:st });
            break;
    }

};