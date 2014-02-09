exports.get = function (req, res) {
    res.render('sale/get');
}
exports.statistics = function (req, res) {
    res.render('sale/statistics.ejs', {u: req.currentUser});
}
exports.post = function (req, res) {
    res.json(null);
}