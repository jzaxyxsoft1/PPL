var async = require('async');
var _ = require('underscore');
var Svc = require('Svc').Svc;
exports.get = function (req, res) {
    res.render('sale/get');
}
exports.statistics = function (req, res) {
    res.render('sale/statistics.ejs', {u: req.currentUser});
}
exports.post = function (req, res) {
    var obj = JSON.parse(req.body['obj']);
    async.waterfall([
         function (cb) {
            Svc.db.Storage.findOne({'Org.Value':req.currentUser.Org.Value,'RelativeObj.Item1':obj.RelativeObj.Item1},function(e,storage){
                var am = storage.Amount-obj.Amount;
                var cst = storage.Cost - storage.UnitCost* obj.Amount;
                Svc.db.Storage.update({_id:storage._id},{$set:{Amount:am,Cost:cst}},function(e){
                    cb(e,storage.UnitCost);
                });
            });
        },
        function (unitCost,cb) {
            obj.Cost = unitCost*obj.Amount; //成本
            obj.Profit= obj.Sum - obj.Cost;  //利润
            if(obj._id==''){Svc.insert('SaleBill',obj,req.currentUser,function(e,d){
                cb(null,d[0]);
            })}
            else{
                var oid = obj._id;
                delete obj._id;
                Svc.update('SaleBill',{$set:obj},req.currentUser,function(e){
                    obj._id= oid;
                    cb(null,obj);
                })
            }
        }
   ], function (e, result) {
        res.json({msg: e == null, error: e, ID: result._id, BillNum: result.BillNum});
    });
}