var cookie = require('Svc').HttpHelper.Cookie;
var Svc = require('Svc').Svc;
exports.index = function (req, res) {
    res.render('index.ejs', { isMobile: req.query['m']=="1" ? true : false,msg:req.query['s']});
};
exports.m = function (req, res) {
    res.redirect('/index?m=1')
}
exports.postl = function (req, res) {
    var pn = req.body['pn'];
    var pwd = req.body['pwd'];
    var num = req.body['num'];
    var m = req.body['m'] == 'true' ? true : false;
    if (num == '0' && pn == 'Admin' && pwd == '9998') {
        setCurrentUser(res, {_id: '0', Name: 'Admin', Org: {Name: '全局管理', Value: '0'}});
        res.redirect('main?p=' + m);
    }
    else {
        Svc.db.Org.findOne({OrgNum: num, flag: 1}, function (e, org) {
            if (org == null) {
                res.redirect('/index?s=1&m='+m);
            }
            else {
                Svc.db.User.findOne({Name: pn, Pwd: pwd, 'Org.Value': org._id}, function (e, d) {
                    if (d) {
                        setCurrentUser(res, {_id: d._id, Name: d.Name, Org: d.Org});
                        res.redirect('main');
                    }
                    else {
                        res.redirect('/index?s=2&m='+m)
                    }
                });
            }
        });
    }
};
exports.main = function (req, res) {
    var u = cookie.get(req, cookie.defaultUserCookieName);
    res.render('main.ejs', {isMobile: req.query['p'] =='true'? true : false });
}
function setCurrentUser(res, iuser) {
    cookie.set(res, cookie.defaultUserCookieName, iuser);
}
