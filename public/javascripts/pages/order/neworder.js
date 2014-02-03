var bill = new Bill({Item1: org.Value, Item2: org.Name, Item3: 'Org'}, {Item1: u._id, Item2: u.Name, Item3: 'User'});
bill.Status('未提交');
ko.applyBindings(bill, document.getElementById('d_edit'));
function edit(d) {
    async.waterfall([
        function (cb) {
            if (d == 0) {
                cb(null, {
                    _id: '',
                    BillNum: '',
                    Owner: {Item2: org.Name, Item1: org.Value, Item3: 'Org'},
                    Creator: {Item1: u._id, Item2: u.Name, Item3: 'User'},
                    CreateTime: Date.ToCreateTime(),
                    Items: [],
                    Status: '未提交'});
            }
            else {
                cb(null, null);
            }
        },
        function (o, cb) {
            if (o) {
                cb(null, o);
            }
            else {
                $.getJSON('/base/getobj', {tp: 'Order', query: {_id: d}}, function (obj) {
                    cb(null, obj);
                });
            }
        }
    ], function (e, o) {
        Bill.updateFromObj(GV.mdl, o);
        showPnl('d_edit');
    });
}
function addItem() {
    var p = GV.products[0];
    var o = new BillItem({Item1: p._id, Item2: p.Name, Item3: 'Prodcut', Item4: ''}, p.Price, 1, p.Model, p.Unit, true);
    GV.mdl.Items.push(o);
}
function proChg(d) {
    var pro = GV.products.filter(function (i) {
        return i._id == d.RelativeObj.Item1();
    })[0];
    d.RelativeObj.Item2(pro.Name);
    d.RelativeObj.Item3('Product');
    d.RelativeObj.Item4('');
    d.Model(pro.Model);
    d.Unit(pro.Unit);
    d.UnitPrice(pro.Price);
}
function save(f) {
    if (f) {
        GV.mdl.Status('未付款');
    }
    var m = ko.mapping.toJS(GV.mdl);
    $.post('/base/postsave', {tp: 'Order', obj: JSON.stringify(m)}, function (d) {
        alm(d.error || '保存成功!');
        if (d.msg) {
            GV.mdl.BillNum(d.BillNum);
            bindList();
        }
    });
}
function del() {
    $.getJSON('/base/delete', {tp: 'Order', query: {_id: GV.mdl._id()}}, function (d) {
        alm(d.error || '删除完成!');
        if (d.msg) {
            bindList();
        }
    });
}
