/*global setImmediate: false, setTimeout: false, console: false */
(function(){function k(n){var t=!1;return function(){if(t)throw new Error("Callback was already called.");t=!0;n.apply(r,arguments)}}var n={},r,b,h,c,l,a,v,y,p,w;r=this;r!=null&&(b=r.async);n.noConflict=function(){return r.async=b,n};var t=function(n,t){if(n.forEach)return n.forEach(t);for(var i=0;i<n.length;i+=1)t(n[i],i,n)},i=function(n,i){if(n.map)return n.map(i);var r=[];return t(n,function(n,t,u){r.push(i(n,t,u))}),r},d=function(n,i,r){return n.reduce?n.reduce(i,r):(t(n,function(n,t,u){r=i(r,n,t,u)}),r)},e=function(n){var t,i;if(Object.keys)return Object.keys(n);t=[];for(i in n)n.hasOwnProperty(i)&&t.push(i);return t};typeof process!="undefined"&&process.nextTick?(n.nextTick=process.nextTick,n.setImmediate=typeof setImmediate!="undefined"?setImmediate:n.nextTick):typeof setImmediate=="function"?(n.nextTick=function(n){setImmediate(n)},n.setImmediate=n.nextTick):(n.nextTick=function(n){setTimeout(n,0)},n.setImmediate=n.nextTick);n.each=function(n,i,r){if(r=r||function(){},!n.length)return r();var u=0;t(n,function(t){i(t,k(function(t){t?(r(t),r=function(){}):(u+=1,u>=n.length&&r(null))}))})};n.forEach=n.each;n.eachSeries=function(n,t,i){if(i=i||function(){},!n.length)return i();var r=0,u=function(){t(n[r],function(t){t?(i(t),i=function(){}):(r+=1,r>=n.length?i(null):u())})};u()};n.forEachSeries=n.eachSeries;n.eachLimit=function(n,t,i,r){var u=o(t);u.apply(null,[n,i,r])};n.forEachLimit=n.eachLimit;var o=function(n){return function(t,i,r){if(r=r||function(){},!t.length||n<=0)return r();var u=0,f=0,e=0;(function o(){if(u>=t.length)return r();while(e<n&&f<t.length)f+=1,e+=1,i(t[f-1],function(n){n?(r(n),r=function(){}):(u+=1,e-=1,u>=t.length?r():o())})})()}},u=function(t){return function(){var i=Array.prototype.slice.call(arguments);return t.apply(null,[n.each].concat(i))}},g=function(n,t){return function(){var i=Array.prototype.slice.call(arguments);return t.apply(null,[o(n)].concat(i))}},f=function(t){return function(){var i=Array.prototype.slice.call(arguments);return t.apply(null,[n.eachSeries].concat(i))}},s=function(n,t,r,u){var f=[];t=i(t,function(n,t){return{index:t,value:n}});n(t,function(n,t){r(n.value,function(i,r){f[n.index]=r;t(i)})},function(n){u(n,f)})};n.map=u(s);n.mapSeries=f(s);n.mapLimit=function(n,t,i,r){return h(t)(n,i,r)};h=function(n){return g(n,s)};n.reduce=function(t,i,r,u){n.eachSeries(t,function(n,t){r(i,n,function(n,r){i=r;t(n)})},function(n){u(n,i)})};n.inject=n.reduce;n.foldl=n.reduce;n.reduceRight=function(t,r,u,f){var e=i(t,function(n){return n}).reverse();n.reduce(e,r,u,f)};n.foldr=n.reduceRight;c=function(n,t,r,u){var f=[];t=i(t,function(n,t){return{index:t,value:n}});n(t,function(n,t){r(n.value,function(i){i&&f.push(n);t()})},function(){u(i(f.sort(function(n,t){return n.index-t.index}),function(n){return n.value}))})};n.filter=u(c);n.filterSeries=f(c);n.select=n.filter;n.selectSeries=n.filterSeries;l=function(n,t,r,u){var f=[];t=i(t,function(n,t){return{index:t,value:n}});n(t,function(n,t){r(n.value,function(i){i||f.push(n);t()})},function(){u(i(f.sort(function(n,t){return n.index-t.index}),function(n){return n.value}))})};n.reject=u(l);n.rejectSeries=f(l);a=function(n,t,i,r){n(t,function(n,t){i(n,function(i){i?(r(n),r=function(){}):t()})},function(){r()})};n.detect=u(a);n.detectSeries=f(a);n.some=function(t,i,r){n.each(t,function(n,t){i(n,function(n){n&&(r(!0),r=function(){});t()})},function(){r(!1)})};n.any=n.some;n.every=function(t,i,r){n.each(t,function(n,t){i(n,function(n){n||(r(!1),r=function(){});t()})},function(){r(!0)})};n.all=n.every;n.sortBy=function(t,r,u){n.map(t,function(n,t){r(n,function(i,r){i?t(i):t(null,{value:n,criteria:r})})},function(n,t){if(n)return u(n);var r=function(n,t){var i=n.criteria,r=t.criteria;return i<r?-1:i>r?1:0};u(null,i(t.sort(r),function(n){return n.value}))})};n.auto=function(i,r){var o;if(r=r||function(){},o=e(i),!o.length)return r(null);var u={},f=[],s=function(n){f.unshift(n)},h=function(n){for(var t=0;t<f.length;t+=1)if(f[t]===n){f.splice(t,1);return}},c=function(){t(f.slice(0),function(n){n()})};s(function(){e(u).length===o.length&&(r(null,u),r=function(){})});t(o,function(f){var o=i[f]instanceof Function?[i[f]]:i[f],a=function(i){var o=Array.prototype.slice.call(arguments,1),s;o.length<=1&&(o=o[0]);i?(s={},t(e(u),function(n){s[n]=u[n]}),s[f]=o,r(i,s),r=function(){}):(u[f]=o,n.setImmediate(c))},y=o.slice(0,Math.abs(o.length-1))||[],v=function(){return d(y,function(n,t){return n&&u.hasOwnProperty(t)},!0)&&!u.hasOwnProperty(f)},l;v()?o[o.length-1](a,u):(l=function(){v()&&(h(l),o[o.length-1](a,u))},s(l))})};n.waterfall=function(t,i){var u,r;if(i=i||function(){},t.constructor!==Array)return u=new Error("First argument to waterfall must be an array of functions"),i(u);if(!t.length)return i();r=function(t){return function(u){if(u)i.apply(null,arguments),i=function(){};else{var f=Array.prototype.slice.call(arguments,1),e=t.next();e?f.push(r(e)):f.push(i);n.setImmediate(function(){t.apply(null,f)})}}};r(n.iterator(t))()};v=function(n,t,i){if(i=i||function(){},t.constructor===Array)n.map(t,function(n,t){n&&n(function(n){var i=Array.prototype.slice.call(arguments,1);i.length<=1&&(i=i[0]);t.call(null,n,i)})},i);else{var r={};n.each(e(t),function(n,i){t[n](function(t){var u=Array.prototype.slice.call(arguments,1);u.length<=1&&(u=u[0]);r[n]=u;i(t)})},function(n){i(n,r)})}};n.parallel=function(t,i){v({map:n.map,each:n.each},t,i)};n.parallelLimit=function(n,t,i){v({map:h(t),each:o(t)},n,i)};n.series=function(t,i){if(i=i||function(){},t.constructor===Array)n.mapSeries(t,function(n,t){n&&n(function(n){var i=Array.prototype.slice.call(arguments,1);i.length<=1&&(i=i[0]);t.call(null,n,i)})},i);else{var r={};n.eachSeries(e(t),function(n,i){t[n](function(t){var u=Array.prototype.slice.call(arguments,1);u.length<=1&&(u=u[0]);r[n]=u;i(t)})},function(n){i(n,r)})}};n.iterator=function(n){var t=function(i){var r=function(){return n.length&&n[i].apply(null,arguments),r.next()};return r.next=function(){return i<n.length-1?t(i+1):null},r};return t(0)};n.apply=function(n){var t=Array.prototype.slice.call(arguments,1);return function(){return n.apply(null,t.concat(Array.prototype.slice.call(arguments)))}};y=function(n,t,i,r){var u=[];n(t,function(n,t){i(n,function(n,i){u=u.concat(i||[]);t(n)})},function(n){r(n,u)})};n.concat=u(y);n.concatSeries=f(y);n.whilst=function(t,i,r){t()?i(function(u){if(u)return r(u);n.whilst(t,i,r)}):r()};n.doWhilst=function(t,i,r){t(function(u){if(u)return r(u);i()?n.doWhilst(t,i,r):r()})};n.until=function(t,i,r){t()?r():i(function(u){if(u)return r(u);n.until(t,i,r)})};n.doUntil=function(t,i,r){t(function(u){if(u)return r(u);i()?r():n.doUntil(t,i,r)})};n.queue=function(i,r){function e(i,u,f,e){u.constructor!==Array&&(u=[u]);t(u,function(t){var u={data:t,callback:typeof e=="function"?e:null};f?i.tasks.unshift(u):i.tasks.push(u);i.saturated&&i.tasks.length===r&&i.saturated();n.setImmediate(i.process)})}r===undefined&&(r=1);var f=0,u={tasks:[],concurrency:r,saturated:null,empty:null,drain:null,push:function(n,t){e(u,n,!1,t)},unshift:function(n,t){e(u,n,!0,t)},process:function(){var n,t,r;f<u.concurrency&&u.tasks.length&&(n=u.tasks.shift(),u.empty&&u.tasks.length===0&&u.empty(),f+=1,t=function(){f-=1;n.callback&&n.callback.apply(n,arguments);u.drain&&u.tasks.length+f===0&&u.drain();u.process()},r=k(t),i(n.data,r))},length:function(){return u.tasks.length},running:function(){return f}};return u};n.cargo=function(r,u){var o=!1,e=[],f={tasks:e,payload:u,saturated:null,empty:null,drain:null,push:function(i,r){i.constructor!==Array&&(i=[i]);t(i,function(n){e.push({data:n,callback:typeof r=="function"?r:null});f.saturated&&e.length===u&&f.saturated()});n.setImmediate(f.process)},process:function s(){if(!o){if(e.length===0){f.drain&&f.drain();return}var n=typeof u=="number"?e.splice(0,u):e.splice(0),h=i(n,function(n){return n.data});f.empty&&f.empty();o=!0;r(h,function(){o=!1;var i=arguments;t(n,function(n){n.callback&&n.callback.apply(null,i)});s()})}},length:function(){return e.length},running:function(){return o}};return f};p=function(n){return function(i){var r=Array.prototype.slice.call(arguments,1);i.apply(null,r.concat([function(i){var r=Array.prototype.slice.call(arguments,1);typeof console!="undefined"&&(i?console.error&&console.error(i):console[n]&&t(r,function(t){console[n](t)}))}]))}};n.log=p("log");n.dir=p("dir");n.memoize=function(n,t){var r={},i={},u;return t=t||function(n){return n},u=function(){var f=Array.prototype.slice.call(arguments),e=f.pop(),u=t.apply(null,f);u in r?e.apply(null,r[u]):u in i?i[u].push(e):(i[u]=[e],n.apply(null,f.concat([function(){var t,n,f;for(r[u]=arguments,t=i[u],delete i[u],n=0,f=t.length;n<f;n++)t[n].apply(null,arguments)}])))},u.memo=r,u.unmemoized=n,u};n.unmemoize=function(n){return function(){return(n.unmemoized||n).apply(null,arguments)}};n.times=function(t,i,r){for(var f=[],u=0;u<t;u++)f.push(u);return n.map(f,i,r)};n.timesSeries=function(t,i,r){for(var f=[],u=0;u<t;u++)f.push(u);return n.mapSeries(f,i,r)};n.compose=function(){var t=Array.prototype.reverse.call(arguments);return function(){var i=this,r=Array.prototype.slice.call(arguments),u=r.pop();n.reduce(t,r,function(n,t,r){t.apply(i,n.concat([function(){var n=arguments[0],t=Array.prototype.slice.call(arguments,1);r(n,t)}]))},function(n,t){u.apply(i,[n].concat(t))})}};w=function(n,t){var i=function(){var r=this,i=Array.prototype.slice.call(arguments),u=i.pop();return n(t,function(n,t){n.apply(r,i.concat([t]))},u)},r;return arguments.length>2?(r=Array.prototype.slice.call(arguments,2),i.apply(this,r)):i};n.applyEach=u(w);n.applyEachSeries=f(w);n.forever=function(n,t){function i(r){if(r){if(t)return t(r);throw r;}n(i)}i()};typeof define!="undefined"&&define.amd?define([],function(){return n}):typeof module!="undefined"&&module.exports?module.exports=n:r.async=n})()
