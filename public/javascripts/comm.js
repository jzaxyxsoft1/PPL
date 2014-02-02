var GV = {};
GV.NodeSvcUrl = "http://www.jzaxyx.com:9777/";
GV.BSDExtUrl = "http://www.jzaxyx.com:8888";
$.ajaxSetup({ cache: false });
window.onunload=function(){var n;for(jQuery("*").each(function(n,t){(events=jQuery.data(this,"events"))&&jQuery.each(events,function(n){jQuery(t).unbind(n+".*"),jQuery(t).off(n+".*")}),jQuery.event.remove(this),jQuery.removeData(this)}),GV.clrfrms=document.getElementsByTagName("iframe"),n=0;n<GV.clrfrms.length;n++)GV.clrPrnt=GV.clrfrms[n].parentNode,GV.clrfrms[n].contentWindow.document.write(""),GV.clrfrms[n].src="about:blank",GV.clrfrms[n].contentWindow&&GV.clrfrms[n].contentWindow.close(),GV.clrPrnt.removeChild(GV.clrfrms[n]),GV.clrPrnt.innerHTML="";for(n in GV)GV[n]=null;GV=null;for(n in jQuery.cache)delete jQuery.cache[n];navigator.appName.indexOf("Microsoft")>0&&setTimeout(CollectGarbage,1)}
$.fn.loadFrame = function (u) {
    var tt = $(this)
    var _t = tt[0];
    GV.tmphtml = _t.outerHTML;
    GV.tmpid = _t.id;
    GV.clrPrnt = _t.parentNode;
    _t.contentWindow.document.write('');
    _t.src = 'about:blank';
    _t.contentWindow.close();
    GV.tmpcc = GV.clrPrnt.removeChild(_t);
    GV.clrPrnt.innerHTML = GV.tmphtml;
    document.getElementById(GV.tmpid).src = u;
    delete GV.tmphtml;
    delete GV.tmpid;
    GV.tmpcc = null;
    GV.clrPrnt = null;
    if (CollectGarbage) { setTimeout(CollectGarbage, 10); }
    return tt;
};
var WS = { w: $(window).width(), h: $(window).height(), clos: Math.floor($(window).width / 300) };
$(window).resize(function () { WS = { w: $(window).width(), h: $(window).height() }; });

$(function () {
    $('input[type=text]').on('keydown', function (e) { if (e.keyCode == 13 || e.keyCode == 108) { if (window.event) { event.keyCode = 9; } else { e.which = 9; } } });
    $('.iconBt, .icon-button').hover(function () { $(this).addClass('iconBt-hover'); }, function () { $(this).removeClass('iconBt-hover'); });
    // $('input[type=button],input[type=submit]').blur();
    $('input[type=button],input[type=submit]').dblclick(function () { return false; });
});
function showPnl(id) {
    $("#" + id).show().siblings().hide();
};
String.format = function () { if (arguments.length == 0) return null; var str = arguments[0]; for (var i = 1; i < arguments.length; i++) { var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm'); str = str.replace(re, arguments[i]); } return str; };

String.prototype.isChs = function () { var rg = new RegExp('^([\\u4e00-\\u9fa5]+|[a-zA-Z0-9]+)$', 'g'); return rg.test(this); };
String.prototype.isCellPhone = function () { return /^1[3|5|8][0-9]\d{8}$/g.test(this); }
String.prototype.isTelePhone = function () { return /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/g.test(this); };
String.prototype.ToDate = function (s) { new Date(Date.parse(s.replace(/-/g, "/"))); };
String.prototype.Trim = function () { return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' '); };
Array.prototype.Insert = function (idx, obj) { this.splice(idx, 0, obj); };
Array.prototype.AddRange = function (s) { for (var _i = 0; _i < s.length; _i++) { this.push(s[_i]); } };
Array.prototype.Remove = function (p) { if (typeof p == "function") { for (var i = 0; i < this.length; i++) { if (p(this[i], i)) { return this.splice(i, 1); } } } else { return this.splice(p, 1); } };
Array.prototype.Max = function (p) { var r = 0; this.Foreach(function (o) { r = o[p] > r ? o[p] : r; }); return r; };
Array.prototype.Min = function (p) { var r = this[0][p]; this.Foreach(function (o) { r = o[p] < r ? o[p] : r; }); return r; };
Array.prototype.Sum = function (p) { var r = 0; for (var i = 0; i < this.length; i++) { if (typeof p == 'string') { if (typeof this[i][p] == 'number') { r += this[i][p]; } else { r += parseFloat(this[i][p]) || 0; } } else { r += p(this[i], i); } } return r; };
Array.prototype.Count = function (p) { if (p) { var r = 0; for (var i = 0; i < this.length; i++) { r += p(this[i]); } return r; } return this.length; };
Object.Clone = function (o) {
    if (typeof o == 'string' || typeof o=='number'||typeof o=='boolean'||o == null || o == undefined || o==NaN) {return o;}
    var r ;
    if(o instanceof Array){
         r= new Array;
        for(var i = 0; i< o.length;0++)
        {
            r.push(Object.Clone(o[i]));
        }
        return r;
    }
    else{ r = new Object(); for (var i in o) r[i] = Object.Clone(o[i]); return r; };
}
Date.ToDateTimeString = function (d, flg) {
    var n = d || new Date, t = n.getFullYear() + "/" + (n.getMonth() + 1) + "/" + n.getDate();
    return flg ? t : t + " " + n.getHours() + ":" + n.getMinutes() + ":" + n.getSeconds();
};
Date.ToCreateTime = function (d, flg) {
    var n = d || new Date;
    return{Item1: Date.ToDateTimeString(n, flg), Item2: n.getFullYear(), Item3: n.getMonth() + 1, Item4: n.getDate()};
};
function getDays(y, m) {
    var type;
    if (y % 4 == 0 || y % 100 == 0 || y % 400 == 0) { type = 3; } else { type = 4; }
    if (m == 1 || m == 3 || m == 5 || m == 7 || m == 8 || m == 10 || m == 12) { type = 1; }
    if (m == 4 || m == 6 || m == 9 || m == 11) { type = 2; }
    return type == 1 ? 31 : type == 2 ? 30 : type == 3 ? 28 : 29;
}
function getDayExp() {
    var y = new Date().getUTCFullYear(), m = new Date().getMonth(), d = new Date().getDay(), type;
    if (y % 4 == 0 || y % 100 == 0 || y % 400 == 0) { type = 3; } else { type = 4; }
    if (m == 1 || m == 3 || m == 5 || m == 7 || m == 8 || m == 10 || m == 12) { type = 1; }
    if (m == 4 || m == 6 || m == 9 || m == 11) { type = 2; }
    switch (type) { case 1: return ('^[1-9]{1}$|^[12]\\d$|^3[01]$'); case 2: return ('^[1-9]{1}$|^[12]\\d$|30$'); case 3: return ('^[1-9]{1}$|^1\\d$|^2[0-9]$'); case 4: return ('^[1-9]{1}$|^1\\d$|^2[0-8]$'); }
};
(function ($) {
    $.toJSON = function (o) {
        if (typeof (JSON) == 'object' && JSON.stringify)
            return JSON.stringify(o); var type = typeof (o); if (o === null)
                return "null"; if (type == "undefined")
                    return undefined; if (type == "number" || type == "boolean")
                        return o + ""; if (type == "string")
                            return $.quoteString(o); if (type == 'object') {
                                if (typeof o.toJSON == "function")
                                    return $.toJSON(o.toJSON()); if (o.constructor === Date) {
                                        var month = o.getUTCMonth() + 1; if (month < 10) month = '0' + month; var day = o.getUTCDate(); if (day < 10) day = '0' + day; var year = o.getUTCFullYear(); var hours = o.getUTCHours(); if (hours < 10) hours = '0' + hours; var minutes = o.getUTCMinutes(); if (minutes < 10) minutes = '0' + minutes; var seconds = o.getUTCSeconds(); if (seconds < 10) seconds = '0' + seconds; var milli = o.getUTCMilliseconds(); if (milli < 100) milli = '0' + milli; if (milli < 10) milli = '0' + milli; return '"' + year + '-' + month + '-' + day + 'T' +
                                                hours + ':' + minutes + ':' + seconds + '.' + milli + 'Z"';
                                    }
                                if (o.constructor === Array) {
                                    var ret = []; for (var i = 0; i < o.length; i++)
                                        ret.push($.toJSON(o[i]) || "null"); return "[" + ret.join(",") + "]";
                                }
                                var pairs = []; for (var k in o) {
                                    var name; var type = typeof k; if (type == "number")
                                        name = '"' + k + '"'; else if (type == "string")
                                            name = $.quoteString(k); else
                                            continue; if (typeof o[k] == "function")
                                                continue; var val = $.toJSON(o[k]); pairs.push(name + ":" + val);
                                }
                                return "{" + pairs.join(", ") + "}";
                            }
    };
    $.evalJSON = function (src) {
        if (typeof (JSON) == 'object' && JSON.parse)
            return JSON.parse(src); return eval("(" + src + ")");
    };
    $.secureEvalJSON = function (src) {
        if (typeof (JSON) == 'object' && JSON.parse)
            return JSON.parse(src); var filtered = src; filtered = filtered.replace(/\\["\\\/bfnrtu]/g, '@'); filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']'); filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, ''); if (/^[\],:{}\s]*$/.test(filtered))
                return eval("(" + src + ")"); else
                throw new SyntaxError("Error parsing JSON, source is not valid.");
    };
    $.quoteString = function (string) {
        if (string.match(_escapeable)) {
            return '"' + string.replace(_escapeable, function (a)
            { var c = _meta[a]; if (typeof c === 'string') return c; c = a.charCodeAt(); return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16); }) + '"';
        }
        return '"' + string + '"';
    };
    var _escapeable = /["\\\x00-\x1f\x7f-\x9f]/g; var _meta = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\' };
})(jQuery);

var GUID = { s4: function () { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); }, newID: function () { return (this.s4() + this.s4() +  this.s4() + "4" + this.s4().substr(0, 3) + this.s4() +  this.s4() + this.s4() + this.s4()).toLowerCase(); } };





