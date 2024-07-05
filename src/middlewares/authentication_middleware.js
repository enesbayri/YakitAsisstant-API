
const Auth_middleware = (req,res,next) => {
    const token_service = require("../services/token_service");
    if(req.session.user){
        next();
    }else{
        req.session.msg=" Lütfen önce giriş yapın!";
        res.redirect("/login");
    }

    
}



module.exports = Auth_middleware;