ko.bindingHandlers.xzqh = {
    init: function (elm, vlu) {
        var _t = $(elm);
        _t.html('');
        _t.append('<select></select><select></select><select></select>');
        ko.bindingHandlers.xzqh.generateSlt(_t.children().eq(0), xzqh);
        $(elm).delegate('select', 'change', function () {
            var _slt = $(this);
            var _v = $('option:selected', _slt).val() || $('option:first', _slt).val();
            var _n = $('option:selected', _slt).text() || $('option:first', _slt).text();
            var _t = _v.substr(2, 4) == '0000' ? 'p' : _v.substr(4, 2) == '00' ? 'c' : 'd';
            switch (_t) {
                case 'p':
                    var _p = ko.bindingHandlers.xzqh.getPro(_v);
                    if (_p.items && _p.items.length) {
                        if (_slt.next().length == 0) {
                            _slt.parent().append('<select></select>');
                        }
                        ko.bindingHandlers.xzqh.generateSlt(_slt.next(), _p.items, vlu().Value());
                        _slt.next().change();
                    }
                    else {
                        _slt.siblings('select').remove();
                        vlu().Value(_v);
                        vlu().Name(_n);
                    }
                    break;
                case 'c':
                    var _c = ko.bindingHandlers.xzqh.getNo(_v);
                    _c = ko.bindingHandlers.xzqh.getPro(_v);
                    _c = ko.bindingHandlers.xzqh.getCity(_c, _v);
                    if (_slt.next().length == 0) {
                        _slt.parent().append('<select></select>');
                    }
                    ko.bindingHandlers.xzqh.generateSlt(_slt.next(), _c.items, vlu().Value());
                    _slt.next().change();
                    break;
                case 'd':
                    vlu().Value(_v);
                    vlu().Name(_n);
                    vlu().Name($('option:selected', _slt.parent().children().eq(1)).text() + ' ' + vlu().Name());
                    vlu().Name($('option:selected', _slt.parent().children().eq(0)).text() + ' ' + vlu().Name());
                    break;
            }
        });

    },
    update: function (elm, vlu) {
        var _ns = ko.bindingHandlers.xzqh.getNo(vlu().Value());
        var _t = $(elm);
        $('option[value="' + _ns.pn + '"]', _t.children().eq(0)).attr('selected', 'selected');
        _t.children().eq(0).change();

        if (_t.children().length > 1) {
            $('option[value="' + _ns.cn + '"]', _t.children().eq(1)).attr('selected', 'selected');
            _t.children().eq(1).change();
            $('option[value="' + _ns.dn + '"]', _t.children().eq(2)).attr('selected', 'selected');
            _t.children().eq(2).change();
        }
    },
    getL: function (id) {
        var _p = ko.bindingHandlers.xzqh.getPro.call(this, id);
        var _c = _p.items.length ? ko.bindingHandlers.xzqh.getCity(_p, id) || _p.items[0] : null;
        var _d = _c && _c.items.length ? ko.bindingHandlers.xzqh.getDv(_c, id) || _c.items[0] : null;
        return {p: _p, c: _c, d: _d}
    },
    getPro: function (id) {
        id = id.substr(0, 2) + '0000';
        return xzqh.filter(function (i) {
            return i._id == id;
        })[0];
    },
    getCity: function (p, id) {
        id = id.substr(0, 4) + '00';
        var _c = p.items.filter(function (i) {
            return i._id == id;
        });
        return _c && _c.length ? _c[0] : null;
    },
    getDv: function (c, id) {
        var _d = c.items.filter(function (i) {
            return i._id == id;
        });
        return _d && _d.length ? _d[0] : null;
    },
    getNo: function (id) {
        return {pn: id.substr(0, 2) + '0000', cn: id.substr(0, 4) + '00', dn: id}
    },
    generateSlt: function (jo, items) {
        jo.html('');
        items.forEach(function (i) {
            jo.append('<option value="' + i._id + '">' + i.name + '</option>');
        });
    }
};
var Bill = function (owner, creator) {
    this._id = ko.observable('');
    this.Owner = { Item1: ko.observable(owner ? owner.Item1 : ''), Item2: ko.observable(owner ? owner.Item2 : ''), Item3: ko.observable(owner ? owner.Item3 : '')  };
    this.Remark = ko.observable('');
    this.Items = ko.observableArray([]);
    this.CreateTime = Date.ToCreateTime();
    this.Creator = {Item1: ko.observable(creator ? creator.Item1 : ''), Item2: ko.observable(creator ? creator.Item2 : ''), Item3: ko.observable(creator ? creator.Item3 : '')};
    this.Status = ko.observable('');
    this.updateFromObj = function (obj) {
        delete obj.Sum;
        ko.mapping.fromJS(obj, this);
        this.Items.removeAll();
        obj.Items.forEach(function (i) {
            var ii = new BillItem(i.RelativeObj, i.UnitPrice, i.Amount, i.Model, i.Unit, true);
            ii.Remark(i.Remark);
            this.Items.push(ii);
        });
    };
};
Bill.prototype.Sum = ko.computed(function () {
    return this.Items().Sum(function (iii) {
        return iii.Sum();
    });
}, this);
Bill.generateFromObj = function (obj) {
    delete obj.Sum;
    delete obj.Items;
    var r = ko.mapping.fromJS(obj);
    r.Items = ko.observableArray([]);
    obj.Items.forEach(function (i) {
        var ii = new BillItem(i.RelativeObj, i.UnitPrice, i.Amount, i.Model, i.Unit, true);
        ii.Remark(i.Remark);
        r.Items.push(ii);
    });
    return r;
};
Bill.updateFromObj = function ( obj) {
    delete obj.Sum;
    ko.mapping.fromJS(obj, bill);
    this.Items.removeAll();
    obj.Items.forEach(function (i) {
        var ii = new BillItem(i.RelativeObj, i.UnitPrice, i.Amount, i.Model, i.Unit, true);
        ii.Remark(i.Remark);
        this.Items.push(ii);
    });
};
var BillItem = function (relativeObj, unitPrice, amount, model, unit, amountEditable) {
    this.RelativeObj = { Item1: ko.observable(relativeObj ? relativeObj.Item1 : ''), Item2: ko.observable(relativeObj ? relativeObj.Item2 : ''), Item3: ko.observable(relativeObj ? relativeObj.Item3 : ''), Item4: ko.observable(relativeObj ? relativeObj.Item4 : '') };
    this.UnitPrice = ko.observable(unitPrice || 0);
    this.Amount = ko.observable(amount || 0);
    this.Model = ko.observable(model || '');
    this.Unit = ko.observable(unit || '');
    this.AmountEditable = ko.observable(amountEditable || false);
    this.Deleteable = ko.observable(true);
    this.Remark = ko.observable('');
};
BillItem.prototype.Sum = ko.computed(function () {
    return Math.round(this.UnitPrice() * this.Amount(), 2);
}, this);
$.fn.BillTable = function (sltKoEvent,multSlt) {
    var _t = $(this);
    var ops = {sltKoEvent: sltKoEvent, multiSlt:arguments.length>1?arguments[1]:false};

    var _s = '<thead><tr>' + (ops.multiSlt ? '<td></td>' : '')
    '<td>单号</td><td>日期</td><td>内容</td><td>金额</td><td>状态</td></tr>' +
        '</thead><tbody data-bind="foreach:$data">' + '<tr data-bind="css:{\'even\':$index()%2!=0}">' +
        (ops.multiSlt ? '<td><input type="checkbox" data-bind="value:_id"/></td>' : '') +
        '<td>'+(ops.multiSlt?'<span  data-bind="text:RelativeObj.Item2"></span>':'<a data-bind="text:RelativeObj.Item2,click:'+ sltKoEvent+'"></a>')+'</td> <td data-bind = "text:Model" > </td> <td data-bind="text:Unit"></td> <td data-bind="text:Amount"></td> <td data-bind="text:UnitPrice"></td> <td data-bind="text:Sum"></td> </tr></tbody>' + (ops.multiSlt ? '<tfoot><tr><td colspan="6"><input type="button" value="全选"/><input type="button" value="取消全选" /></td></tr></tfoot>' : '');
    _t.append('_s');
    _t.getValues = function () {
        var _r = [];
        $('input[type=checkbox]:selected', _t).each(function () {
            _r.push(this.value);
        });
        return _r;
    }
    if (ops.multiSlt) {
        $('tfoot', _t).delegate('input', 'click', function () {
            $('tbody input', _t).attr('checked', (this.value.indexOf('取消') < 0));
        })
    }
    return _t;
};