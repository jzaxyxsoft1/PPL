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

        if(_t.children().length>1){
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
    this.Owner = { Item1: ko.observable(owner ? owner.Item1 : ''), Item2: ko.observable(owner ? owner.Item2 : ''), Item3: ko.observable(owner ? owner.Item3 : ''), Item4: ko.observable(owner ? owner.Item4 : '') };
    this.Remark = ko.observable('');
    this.Items = ko.observableArray([]);
    this.Sum = ko.computed(function () {
        return this.Items().Sum(function (iii) {
            return iii.Sum();
        });
    }, this);
    this.CreateTime = Date.ToCreateTime();
    this.Creator={Item1:ko.observable(creator?creator.Item1:''),Item2:ko.observable(creator?creator.Item2:''),Item3:ko.observable( creator?creator.Item3:'')};
};
var BillItem = function (relativeObj, unitPrice, amount,  model, unit, amountEditable) {
    this.RelativeObj = { Item1: ko.observable(relativeObj ? relativeObj.Item1 : ''), Item2: ko.observable(relativeObj ? relativeObj.Item2 : ''), Item3: ko.observable(relativeObj ? relativeObj.Item3 : ''), Item4: ko.observable(relativeObj ? relativeObj.Item4 : '') };
    this.UnitPrice = ko.observable(unitPrice || 0);
    this.Amount = ko.observable(amount || 0);
    this.Model = ko.observable(model || '');
    this.Unit = ko.observable(unit || '');
    this.Sum = ko.computed(function () {
        return Math.round(this.UnitPrice() * this.Amount(), 2);
    }, this);
    this.AmountEditable = ko.observable(amountEditable || false);
    this.Deleteable = ko.observable(true);
    this.Remark = ko.observable('');
};