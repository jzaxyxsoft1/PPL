var Svc = require('Svc').Svc;
var cookie = require('Svc').HttpHelper.Cookie;
var async = require('async');
function convertObjValue(obj) {
    if (obj) {
        Object.keys(obj).forEach(function (i) {
            obj[i] = Number(obj[i]);
        })
    }
}
exports.getobjs = function (req, res) {
    var tp = req.query['tp'];
    var query = req.query['query'] || {};
    var option = req.query['option'] || {};
    var order = req.query['od'] || null;
    var pager = req.query['pg'] || null;
    if (Svc.IOrgObj[tp] && req.currentUser.Org.Value != '0') {
        query.Org.Value = req.currentUser.Org.Value;
    }
    convertObjValue(option);
    convertObjValue(order);
    convertObjValue(pager);
    var user = cookie.get(req, cookie.defaultUserCookieName);
    Svc.getObjs(tp, query, option, order, pager, function (e, ds) {
        if (e) {
            res.json({msg: false, error: e});
        }
        else {
            if (pager) {
                res.json({pg: pager, ds: ds})
            }
            else {
                res.json(ds.ds);
            }
        }
    });
}
exports.getobj = function (req, res) {
    var tp = req.query['tp'];
    var query = req.query['query'];
    var option = req.query['option'] || {};
    convertObjValue(option);
    if (Svc.IOrgObj[tp] && req.currentUser.Org.Value != '0') {
        query.Org.Value = req.currentUser.Org.Value;
    }
    Svc.getObj(tp, query, option, function (e, d) {
        if (e) {
            res.json({msg: false, error: e});
        }
        else {
            if (Svc.IBO[tp] && m) {
                d.Define = _.find(Svc.BODefine, function (i) {
                    return i._id == d.Define.Value;
                });
            }
            res.json(d);
        }
    });
};
exports.getobjsac = function (req, res) {
    var term = req.query['term'];
    var tp = req.query['tp'];
    var qo = {flag: 1, $or: [
        {Name: {$regex: term}}
    ]};
    var op = {Name: 1, TypeFullName: 1};
    if (Svc.IHI[tp]) {
        op.ValuePath = 1;
    }
    if (Svc.ISimcode[tp]) {
        qo['$or'].push({Simcode: {$regex: term.toUpperCase()}});
    }
    if (Svc.IBO[tp]) {
        op.Define = 1;
    }
    if (tp == 'Product') {
        op.Model = 1;
        op.Unit = 1;
        qo['$or'].push({Model: {$regex: term}});
    }
    Svc.db[tp].find(qo, op).toArray(function (e, ds) {
        if (ds && ds.length) {
            var _r;
            if (tp == 'Product') {
                _r = ds.map(function (i) {
                    return {_id: i._id, Name: i.Name, TypeFullName: i.TypeFullName, label: i.Name, value: i.Name, Model: i.Model, Unit: i.Unit, ValuePath: i.Define.ValuePath};
                });
            }
            else if (Svc.IBO[tp]) {
                _r = ds.map(function (i) {
                    return {_id: i._id, Name: i.Name, TypeFullName: i.TypeFullName, label: i.Name, value: i.Name, Define: i.Define, ValuePath: i.Define.ValuePath};
                });
            }
            else if (Svc.IHI[tp]) {
                _r = ds.map(function (i) {
                    return {_id: i._id, Name: i.Name, TypeFullName: i.TypeFullName, label: i.Name, value: i.Name, ValuePath: i.ValuePath};
                });
            }
            else {
                _r = ds.map(function (i) {
                    return {_id: i._id, Name: i.Name, TypeFullName: i.TypeFullName, label: i.Name, value: i.Name};
                });
            }
            res.json(_r);
        }
        else {
            res.json([
                {label: '--无记录--', value: '--无记录--', _id: '0'}
            ])
        }
    });
};
exports.postinsert = function (req, res) {

    var tp = req.body.tp;
    var obj = req.body.obj;
    obj = typeof  obj == 'string' ? JSON.parse(obj) : obj;
    Svc.insert(tp, obj, req.currentUser, function (e, ds) {
        var r = {   msg: e == null, error: e   };
        if (obj instanceof Array) {
            r.ds = ds
        }
        else {
            r.ID = ds[0]._id
        }
        res.json(r);
    });
};
exports.postupdate = function (req, res) {
    res.set({'Access-Control-Allow-Origin': '*'});
    var tp = req.body.tp;
    var m = req.body.m; //多重更新模式
    var option = req.body.option || {};
    var query = req.body.query;
    option = typeof option == 'string' ? JSON.parse(option) : option;
    query = typeof query == 'string' ? JSON.parse(query) : query;
    m = m ? JSON.parse(m) : {multi: false};
    var user = cookie.get(req, cookie.defaultUserCookieName);
    Svc.update(tp, query, option, user, function (e) {
        res.json({msg: e == null, error: e});
    });
};
exports.postsave = function (req, res) {
    var obj = req.body['obj'];
    var tp = req.body['tp'];
    obj = typeof obj == 'string' ? JSON.parse(obj) : obj;
    if (obj._id) {
        Svc.update(tp, {_id: obj._id}, obj, req.currentUser, function (e) {
            res.json({msg: e == null, error: e, ID: obj._id});
        });
    }
    else {
        Svc.insert(tp, obj, req.currentUser, function (e, ds) {
            res.json({msg: e == null, error: e, ID: ds[0]._id});
        });
    }
};
exports.delete = function (req, res) {
    var query = req.query['query'];
    var tp = req.query['tp'];
    Svc.remove(tp, query, req.currentUser, function (e) {
        res.json({msg: e == null, error: e});
    });
};
exports.tree = function (req, res) {
    var t = req.query['t'];
    var tp = req.query['tp'];
    var rid = req.query['rid'];
    if (t) {
        var root = req.query['root'];
        rid = root == 'source' ? rid : root;
        Svc.db[tp].find({'Parent.Value': rid}, {Name: 1, ValuePath: 1}).toArray(function (e, ds) {
            var rs = ds ? ds.map(function (i) {
                return {id: i._id, text: i.Name, ValuePath: i.ValuePath}
            }) : [];
            res.json(rs);
        });
    }
    else {
        var cb = req.query['cb'];
        Svc.getObj(tp, {_id: rid}, {Name: 1, ValuePath: 1}, function (e, rs) {
            res.render('tree.ejs', {rootId: rid, rootName: rs.Name, rootValuePath: rs.ValuePath, tp: tp, cb: cb});
        });
    }
}

