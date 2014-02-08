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
    this.BillNum = ko.observable('');
    this.Remark = ko.observable('');
    this.Items = ko.observableArray([]);
    this.CreateTime = Date.ToCreateTime();
    this.Creator = {Item1: ko.observable(creator ? creator.Item1 : ''), Item2: ko.observable(creator ? creator.Item2 : ''), Item3: ko.observable(creator ? creator.Item3 : '')};
    this.Sum = ko.computed(function () {
        return this.Items().Sum(function (i) {
            return i.Sum()
        });
    }, this);
    this.Status = ko.observable('');
    this.updateFromObj = function (obj) {
        delete obj.Sum;
        var _t = this;
        _t.Owner.Item1(obj.Owner.Item1);
        _t.Owner.Item2(obj.Owner.Item2);
        _t.Owner.Item3(obj.Owner.Item3);
        _t.Creator.Item1(obj.Creator.Item1);
        _t.Creator.Item2(obj.Creator.Item2);
        _t.Creator.Item3(obj.Creator.Item3);
        _t.CreateTime = obj.CreateTime;
        _t.Status(obj.Status);
        _t.BillNum(obj.BillNum);
        _t.Remark(obj.Remark);
        _t._id(obj._id);
        _t.Items.removeAll();
        _.each(obj.Items,function (i){
            var ii = new BillItem(i.RelativeObj, i.UnitPrice, i.Amount, i.Model, i.Unit, true);
            ii.Remark(i.Remark);
            ii.Status(i.Status);
            _t.Items.push(ii);
        });

    };
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
    this.Sum = ko.computed(function () {
        return Math.round(this.UnitPrice() * this.Amount(), 2);
    }, this);
    this.Status = ko.observable('');
};
$.fn.BillTable = function (sltKoEvent, multSlt) {
    var _t = $(this);
    var ops = {sltKoEvent: sltKoEvent, multiSlt: arguments.length > 1 ? arguments[1] : false};

    var _s = '<thead><tr>' + (ops.multiSlt ? '<td></td>' : '') + '<td>单号</td><td>日期</td><td>内容</td><td>金额</td><td>状态</td><td>建单人</td></tr>' +
        '</thead><tbody data-bind="foreach:$data">' + '<tr data-bind="css:{\'even\':$index()%2!=0}">' +
        (ops.multiSlt ? '<td><input type="checkbox" data-bind="value:_id"/></td>' : '') +
        '<td>' + (ops.multiSlt ? '<span  data-bind="text:BillNum"></span>' : '<a data-bind="text:BillNum,click:' + sltKoEvent + '"></a>') + '</td> <td data-bind = "text:CreateTime.Item1" > </td> <td data-bind="foreach:Items" class="al"><b class="ml10" data-bind="text:RelativeObj.Item2"></b>:<span data-bind="text:Amount"></span></td> <td data-bind="text:Sum"></td> <td data-bind="text:Status"></td><td data-bind="text:Creator.Item2"></td> </tr></tbody>' + (ops.multiSlt ? '<tfoot><tr><td colspan="6"><input type="button" value="全选"/><input type="button" value="取消全选" /></td></tr></tfoot>' : '');
    _t.append(_s);
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
$.fn.BillDetail = function () {
  var _s = '<div class="mc mt10" style="width: 610px;"><div class="editor-label" > 单号: </div><div class="editor-field"><span data-bind="text:BillNum"></span> </div> <div class="editor-label">状态:</div><div class="editor-field"> <span data-bind="text:Status"></span></div><div class="editor-label">经销商:</div> <div class="editor-field"> <span data-bind="text:Owner.Item2"></span> </div> <div class="editor-label">建单时间:</div><div class="editor-field"> <span data-bind="text:CreateTime.Item1"></span></div><div class="editor-label">建单人:</div> <div class="editor-field"> <span data-bind="text:Creator.Item2"></span></div><div class="editor-label">金额:</div><div class="editor-field"><span data-bind="text:Sum"></span></div></div><div class = "hr"style = "height: 10px;" > </div><fieldset class="mc p10" style="width: 590px;"><legend><strong>订单内容:</strong></legend><table cellspacing="0" cellpadding="0" style="width:590px;"><thead><tr><td>产品</td> <td>规格</td><td>单位</td><td>数量</td> <td>单价</td><td>金额</td></tr> </thead><tbody data-bind="foreach:Items"> <tr data-bind="css:{\'even\':$index()%2!=0}"><td data-bind="text:RelativeObj.Item2"></td><td data-bind="text:Model"></td><td data-bind="text:Unit"></td><td data-bind="text:Amount"></td><td data-bind="text:UnitPrice"></td> <td data-bind="text:Sum"></td></tr></tbody></table></fieldset>';
    this.html(_s);
    return this;
};
var StockBill = function (billType, owner, creator) {
    this.n = Bill;
    this.n(owner, creator);
    delete this.n;
    this.BillType = ko.observable(billType || 'StockIn');
    this.OrderID = ko.observable('');
    this.Provider = {Item1: ko.observable(''), Item2: ko.observable(''), Item3: ko.observable('')};
    this.Cost = ko.computed(function () {
        return this.Items().Sum(function (i) {
            return i.Cost()
        })
    }, this);
    this.Status('未执行');
    this.updateFromObj = function (obj) {
        delete obj.Sum;
        var _t = this;
        _t.BillType(obj.BillType);
        _t.OrderID(obj.OrderID);
        _t.Provider.Item1(obj.Provider.Item1);
        _t.Provider.Item2(obj.Provider.Item2);
        _t.Provider.Item3(obj.Provider.Item3);
        _t.Owner.Item1(obj.Owner.Item1);
        _t.Owner.Item2(obj.Owner.Item2);
        _t.Owner.Item3(obj.Owner.Item3);
        _t.Creator.Item1(obj.Creator.Item1);
        _t.Creator.Item2(obj.Creator.Item2);
        _t.Creator.Item3(obj.Creator.Item3);
        _t.CreateTime = obj.CreateTime;
        _t.Status(obj.Status);
        _t.BillNum(obj.BillNum);
        _t.Remark(obj.Remark);
        _t._id(obj._id);
        _t.Items.removeAll();
        _.each(obj.Items,function (i){
            var ii = new StockBillItem(i.RelativeObj, i.UnitPrice, i.Amount, i.Model, i.Unit, true);
            ii.UnitCost(i.UnitCost);
            ii.Remark(i.Remark);
            ii.Provider.Item1(i.Provider.Item1);
            ii.Provider.Item2(i.Provider.Item2);
            ii.Provider.Item3(i.Provider.Item3);
            ii.Stock.Name(i.Stock.Name);
            ii.Stock.Value(i.Stock.Value);
            _t.Items.push(ii);
        });

    };
};
var StockBillItem = function (relativeObj, unitPrice, amount, model, unit, amountEditable) {
    this.n = BillItem;
    this.n();
    delete this.n;
    this.Provider = {Item1: ko.observable(''), Item2: ko.observable(''), Item3: ko.observable('')};
    this.UnitCost = ko.observable(0);
    this.Cost = ko.computed(function () {
        return Math.round(this.Amount() * this.UnitCost(), 2)
    }, this);
    this.Stock = {Name: ko.observable(''), Value: ko.observable('')}
    this.CompleteAmount=ko.observable(0);
    this.Status = ko.computed(function (){
        if(this.CompleteAmount()==0){ return '未执行'; }
        else if(this.CompleteAmount()<this.Amount()){ return '未完成';}
        else{ return '已完成';}
    },this);
};
$.fn.StockBillTable=function (sltCallback){
    var _s='<thead><tr><td>单号</td><td>日期</td><td>内容</td><td>金额</td><td>供应商</td><td>订单号</td><td>建单人</td></tr> <tr data-bind="css:{\'even\':$index()%2!=0}"> <td> <a data-bind="text:BillNum,click:' + sltCallback + '"></a> </td> <td data-bind = "text:CreateTime.Item1" > </td> <td data-bind="foreach:Items" class="al"><b class="ml10" data-bind="text:RelativeObj.Item2"></b>:<span data-bind="text:Amount"></span></td> <td data-bind="text:Sum"></td> <td data-bind="text:Provider.Item2"></td><td data-bind="text:OrderID"></td><td data-bind="text:Creator.Item2"></td> </tr></tbody>';
    this.html(_s);
    return this;
};
$.fn.StockBillDetail=function (){
    var _s='<div class="mc mt10"><div class="editor-label" > 单号: </div><div class="editor-field"><span data-bind="text:BillNum"></span> </div> <div class="editor-label">订单号:</div><div class="editor-field"> <span data-bind="text:OrderID"></span></div><div class="editor-label">供应商:</div> <div class="editor-field"> <span data-bind="text:Provider.Item2"></span> </div> <div class="editor-label">建单时间:</div><div class="editor-field"> <span data-bind="text:CreateTime.Item1"></span></div><div class="editor-label">建单人:</div> <div class="editor-field"> <span data-bind="text:Creator.Item2"></span></div><div class="editor-label">金额:</div><div class="editor-field"><span data-bind="text:Sum"></span></div></div><div class = "hr"style = "height: 10px;" > </div><fieldset class="mc pp1 wp98"><legend><strong>单据内容:</strong></legend><table cellspacing="0" cellpadding="0" class="wp98 mc"><thead><tr><td>产品</td> <td>规格</td><td>单位</td><td>数量</td> <td>单价</td><td>金额</td><td>完成数量</td><td>库房</td></tr> </thead><tbody data-bind="foreach:Items"> <tr data-bind="css:{\'even\':$index()%2!=0}"><td data-bind="text:RelativeObj.Item2"></td><td data-bind="text:Model"></td><td data-bind="text:Unit"></td><td data-bind="text:Amount"></td><td data-bind="text:UnitPrice"></td> <td data-bind="text:Sum"></td><td data-bind="text:CompleteAmount"></td><td data-bind="text:Stock.Name"></td></tr></tbody></table></fieldset>';
    this.html(_s);
    return this;
};