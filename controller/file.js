/**
 * Created by Administrator on 14-2-10.
 */
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
exports.post = function (req, res) {
    var _d = new Date();
    _d = (_d.getFullYear().toString() + (_d.getMonth() + 1) + _d.getDate());
    var p = req.body['p'];
    var fPath = "/upload/" + p + '/' + _d;
    if (!fs.existsSync(__dirname + '/../public' + fPath)) {
        fs.mkdirSync(__dirname + '/../public' + fPath);
    }

    var filePath = req.files.file.path;
    var extName = path.extname(req.files.file.name);
    //  var fileUrl = "/upload/" + p+'/'+_d + '/' + path.basename(filePath) + extName;
    var fileUrl = fPath +'/'+ path.basename(filePath) + extName;
    var newPath = __dirname + "/../public" + fileUrl;
    fs.readFile(filePath, function (err, data) {
        fs.writeFile(newPath, data, function (err) {
            fs.unlink(req.files.file.path, function (e) {})
            res.send(fileUrl);
        });
    });
}