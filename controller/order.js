/**
 *订单
 */
exports.get=function (req,res){
    var t=req.query['t'];
    switch (t){
        case 'n': //新建订单
            break;
        case 's': //订单状态
            break;
    }

};
exports.post=function(req,res){
    var t= req.body['t'];
    var obj= req.body['obj'];
    switch (t){
        case 'sn':
            break;
        case '':
            break;
    }
};