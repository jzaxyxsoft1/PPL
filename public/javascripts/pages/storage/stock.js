function bindList() {
    $.getJSON('/base/getobjs', {tp: 'Stock', query: {'Org.Value': org.Value}, option: {Name: 1}}, function (d) {
        if (GV.List) {
            ko.mapping.fromJS(d, GV.List);
        }
        else {
            GV.List = ko.mapping.fromJS(d);
            ko.applyBindings(GV.List, document.getElementById('d_list'));
        }
    });
}
function edit(id) {
    if (id == 0) {
        bindObj({_id: '', Name: '', Org: org})
    }
    else {
        id = id._id();
        $.getJSON('/base/getobj', {tp: 'Stock', query: {_id: id}}, bindObj);
    }
}
function bindObj(obj) {
    if (GV.mdl) {
        ko.mapping.fromJS(obj, GV.mdl);
    }
    else {
        GV.mdl = ko.mapping.fromJS(obj);
        ko.applyBindings(GV.mdl, document.getElementById('d_edit'));
    }
    $('#d_edit').show();
}
function save() {
    var m = ko.mapping.toJS(GV.mdl);
    var msg = '';
    if (!m.Name) {
        msg = '请输入库房名称!\r';
    }
    if (msg) {
        alert(msg);
        return;
    }
    $.post('/base/postsave', {tp: 'Stock', obj: JSON.stringify(m)}, function (r) {
        if (r.error) {
            alert(r.error)
        }
        else {
            alert('保存成功!');
            GV.mdl._id(r.ID);
            bindList();
        }
    });
}
function del() {
    if(window.confirm('是否删除?')){
        $.getJSON('/base/delete',{tp:'Stock',query:{_id:GV.mdl._id()}},function(d){
            alert(d.error?d.error:'删除完成!');
            if(d.msg){
                bindList();
                $('#d_edit').hide();
            }
        });
    }
}
bindList();
