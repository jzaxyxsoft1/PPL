/**
 *用户
 */

var Svc = require('Svc').Svc;
exports.m = function (req, res) {
    var t = req.query['t'].toLowerCase();
    switch (t) {
        case 'm':
            //用户管理
            res.render('user/m.ejs', {Org:req.currentUser.Org});
            break;
        case 'l':
            //用户列表
            res.render('user/l.ejs', {Org: req.currentUser.Org,cb:req.query['cb']});
            break;
        case 'changepwd':
            //更改密码
            res.render('user/changePwd.ejs', {Org: req.currentUser.Org});
            break;
        case 'resetpwd':
            //密码重置
            var id = req.query['id'];
            Svc.update('User', {_id: id}, {$set: {Pwd: '8888'}}, function (e) {
                res.json(e == null);
            });
            break;
    }

};
