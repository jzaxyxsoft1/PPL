var Svc = require('Svc').Svc;
exports.bo = function (req, res) {
    var id = req.query['id'];
    var m = req.query['m'];
    m = m ? true : false;
    var bo = Svc.getDefine(id);
    res.render('admin/bo.ejs', {id: id, bo: bo, manageFlg: m});
}
exports.org = function (req, res) {
    res.render('admin/org.ejs');
}
exports.orgpost = function (req, res) {
    var t = req.body['t'].toLowerCase();
    switch (t) {
        case 'i':
            var obj = req.body['obj'];
            break;
        case 'u':
            var query = req.body['query'];
            var option = req.body['option'];
            break;
        case 'ixzqh':
            var objs = req.body['objs'];

            break;
    }
}
function orgTypeProcess() {

}
exports.get = function (req, res) {
    var t = req.query['t'].toLowerCase();
    var tp, id;
    switch (t) {
        case "delbo":
            break;
        default :
            break;
    }
};
exports.xzqhpost = function (req, res) {
   var obj=  (  req.body['obj']);
    var fs = require('fs');
    var path = require('path');
   var _p=  path.resolve('public/javascripts')+'\\xzqh.js';
    var xs ='var xzqh='+obj+';';
    fs.writeFileSync(_p, xs);
    res.json('done');
}

