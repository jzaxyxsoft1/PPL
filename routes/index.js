var cookie = require('Svc').HttpHelper.Cookie;
var Svc= require('Svc').Svc;
exports.index = function (req, res) {
    res.render('index.ejs', { title: 'Express', msg: '' });
};
exports.postl = function (req, res) {
    var pn = req.body['pn'];
    var pwd = req.body['pwd'];

    if (pn == 'Admin' && pwd == '9998') {
       setCurrentUser(res, {_id: '0', Name: 'Admin', Org:{Name:'全局管理',Value:'0'}});
        res.redirect('main');
    }
    else {

        res.render('index.ejs', {msg: '登录名或密码错误!'})
    }
};
exports.main = function (req, res) {
    var u = cookie.get(req,cookie.defaultUserCookieName);
    res.render('main.ejs');
}
function setCurrentUser(res,iuser){
    cookie.set(res, cookie.defaultUserCookieName, iuser);
}
