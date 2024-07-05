
const jwt = require("jsonwebtoken");


const create_token = (content) => {
    return jwt.sign(content,process.env.SECRET_JWT_KEY);
}

const verify_token = (token) => {
    try {
        let decodedToken = jwt.verify(token,process.env.SECRET_JWT_KEY);
        return decodedToken;
    } catch (error) {
        return null;
    }
}


module.exports={
    create_token,
    verify_token,
}