const bcrypt = require('bcrypt');

module.exports = async function(req, res, next) {
    const hashed = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashed;
    next()
}