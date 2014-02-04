var db = require('DB').DB;
exports.get=function(req,res){
    var t=req.query['t'].toLowerCase();
    switch (t){
        case 'objs':
            var query=req.query['query'];
            var option=req.query['option']||{};
            option =typeof option == 'string'?JSON.parse(option):option;
            db.Product.find(query, option).toArray(function (e,ds){
                res.json(ds);
            });
            break;
        case 'obj':
            var query=req.query['query'];
            var option=req.query['option']||{};
            option = typeof option =='string'?JSON.parse(option):option;
            db.Product.findOne(query, option, function (e,d){res.json(d);});
            break;
    }
};
