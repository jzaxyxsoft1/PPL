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
                    Org:{Name:org.Name,Value:org.Value},
                    ShipAddress: Cts.Address,
                    Tel: Cts.SMSNum,
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
                d = typeof d == 'string' ? d : d._id instanceof Function ? d._id() : d._id;
                $.getJSON('/base/getobj', {tp: 'Order', query: {_id: d}}, function (obj) {
                    cb(null, obj);
                });
            }
        },
        function (o, cb) {
            $.getJSON('/base/getobj', {tp: 'Org', query: {_id: o.Owner.Item1}}, function (d) {
                if (d) {
                    o.ShipAddress = d.ShipAddress;
                    o.Tel = d.SMSNum;
                }
                else {
                    o.ShipAddress = '';
                    o.Tel = '';
                }
                cb(null, o);
            });
        }
    ], function (e, o) {
        bill.updateFromObj(o);
        showPnl('d_edit');
    });
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
    d.UnitPrice(pro.PartnerPrice);
}
function save(f) {
    if (f) {
        bill.Status('未付款');
    }
    var m = ko.mapping.toJS(bill);
    _.each(m.Items,function (i){
        i.Amount=Number(i.Amount);
        i.UnitPrice= Number(i.UnitPrice);
    });
    if (_.any(m.Items, function (i) {return i.Amount == 0})) {
        alert('请输入订货数量!');
        return;
    }
    delete  m.updateFromObj;
    $.post('/order/postsave', {tp: 'Order', obj: JSON.stringify(m)}, function (d) {
        alm(d.error || '保存成功!');
        if (d.msg) {
            bill._id(d.ID);
            bill.BillNum(d.BillNum);
            bindList();
        }
    });
}
function del() {
    $.getJSON('/base/delete', {tp: 'Order', query: {_id: bill._id()}}, function (d) {
        alm(d.error || '删除完成!');
        if (d.msg) {
            bindList();
        }
    });
}
