
const bcrypt = require("bcrypt");


const hash_password = (password) => {
    return bcrypt.hashSync(password,8);
}


const compare_password = (password , hash) => {
    return bcrypt.compareSync(password , hash);
}


module.exports = {
    hash_password,
    compare_password,
}