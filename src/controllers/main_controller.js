const fuelRepo = require("../repository/fuel_repo"); 


const home = async (req,res,next) => {
    const user_repo = require("../repository/user_repo");
    const token_service = require("../services/token_service");
    let decodeToken = token_service.verify_token(req.session.user);
    if(decodeToken){
        let user = await user_repo.queryUserFromId(decodeToken.userId);
        if(user){
            if(user.role == "user"){
                if(req.session.msg){
                    let msg = req.session.msg
                    req.session.msg=undefined;
                    res.render("user_page",{user:user,msgDanger:msg});
                }else{
                    res.render("user_page",{user});
                }
            }else if(user.role == "admin"){
                let users = await user_repo.getAllUsers();
                if(req.session.msg){
                    let msg = req.session.msg
                    req.session.msg=undefined;
                    res.render("admin_page",{users:users,msgDanger:msg,current:user._id});
                }else{
                    res.render("admin_page",{users:users,current:user._id});
                }
            }else{
                req.session.msg = " Geçersiz kullanıcı tipi!";
                res.redirect("/login");
            }
            
            
        }else{
            req.session.msg = " Kullanıcı geçersiz!";
            res.redirect("/login");
        }
    }else{
        req.session.msg = " Lütfen giriş yapın!";
        res.redirect("/login");
    }
}

const documentation_page = (req,res,next) => {
    res.render("docs_overview_page",{"server_url":process.env.SERVER_URL});
}
const docs_response_page = (req,res,next) => {
    res.render("docs_response_page",{"server_url":process.env.SERVER_URL});
}
const docs_usage_page = (req,res,next) => {
    res.render("docs_usage_page",{"server_url":process.env.SERVER_URL});
}


const invalid_url_page = (req,res,next) => {
    res.render("invalid_url_page");
}

const login_page = (req,res,next) => {
    if(req.session.msg){
        let msg = req.session.msg
        req.session.msg=undefined;
        res.render("login_page",{layout:"./layout/credential_layout.ejs",msgDanger:msg});
    }else{
        res.render("login_page",{layout:"./layout/credential_layout.ejs"});
    }
}

const register_page = (req,res,next) => {
    if(req.session.msg){
        let msg = req.session.msg
        req.session.msg=undefined;
        res.render("register_page",{layout:"./layout/credential_layout.ejs",msgDanger:msg});
    }else{
        res.render("register_page",{layout:"./layout/credential_layout.ejs"});
    }
    
}

const request_api_rights_page = async (req,res,next) => {
    const user_repo = require("../repository/user_repo");
    const token_service = require("../services/token_service");
    let decodeToken = token_service.verify_token(req.session.user);
    if(decodeToken){
        let user = await user_repo.queryUserFromId(decodeToken.userId);
        if(user){
            if(user.role == "admin"){
                const req_repo = require("../repository/request_repo");
                let reqs = await req_repo.getAllRequest();
                if(req.session.msg){
                    let msg = req.session.msg
                    req.session.msg=undefined;
                    res.render("req_api_rights_page",{reqs:reqs,msgDanger:msg});
                }else{
                    res.render("req_api_rights_page",{reqs});
                }
            }else{
                req.session.msg = " Geçersiz kullanıcı tipi!";
                res.redirect("/login");
            }
            
            
        }else{
            req.session.msg = " Kullanıcı geçersiz!";
            res.redirect("/login");
        }
    }else{
        req.session.msg = " Lütfen giriş yapın!";
        res.redirect("/login");
    }
}






const login = async (req,res,next) => {

    const validate=require("../tools/user_validator");

    let loginValidate = validate.login_validator(req.body.email,req.body.password);

    if(loginValidate){
        const userRepo = require("../repository/user_repo");
        let user = await userRepo.loginUser(req.body.email,req.body.password);
        if(user){
            if(user.isEmailActive){
                const token_service = require("../services/token_service");
                let token = token_service.create_token({userId : user._id});
                req.session.user = token;
                res.redirect("/");
            }else{
                req.session.msg = "Lütfen önce mail adresinizi onaylayın";
                res.redirect("/login");
            }
        }else{
            req.session.msg = "E-mail yada şifre hatalı!";
            res.redirect("/login");
        }
        
    }else{
        req.session.msg = "Bilgileri Doldurunuz!";
        res.redirect("/login");
    }
    
}

const register = async (req,res,next) => {

    const validate=require("../tools/user_validator");

    let loginValidate = validate.register_validator(req.body.email,req.body.password);

    if(loginValidate){

        const userRepo = require("../repository/user_repo");
        let isEmailAllready = await userRepo.isEmailAllready(req.body.email);
        
        if(isEmailAllready){
            req.session.msg = " Email zaten kullanımda!"
            res.redirect("/register");
        }else{
            let passwordValidate = validate.register_password_validator(req.body.password);
            if(passwordValidate){

                
                await userRepo.registerUser(req.body.name,req.body.surname,req.body.email,req.body.password);
                req.session.msg = " Email adresinizi onaylayın!"
                res.redirect("/login");
            }
            else{
                req.session.msg = " - Şifreler en az 1 büyük/küçük karakter , en az 1 sayı ve en az 8 karakterden oluşmalıdır!";
                res.redirect("/register");
            }
        }

    }else{
        req.session.msg = " Bilgileri Doldurunuz!";
        res.redirect("/register");
    }
}

const logout = async (req,res,next) => {
    req.session.destroy();
    res.redirect("/");
}



const email_activation = async (req,res,next) => {
    let token = req.query.id
    if(token){
        const token_service = require("../services/token_service");
        let tokenContent = token_service.verify_token(token);
        if(tokenContent){
            const userRepo = require("../repository/user_repo");
            await userRepo.userEmailActived(tokenContent.userId);
            req.session.msg= " Mail adresiniz onaylandı lütfen giriş yapın!";
            res.redirect("/login");
        }else{
            req.session.msg= " Token Geçersiz";
            res.redirect("/login");
        }
    } else {
        res.redirect("/login");
    }
}


const request_api_right = async (req,res,next) => {
    const token_service = require("../services/token_service");
    const user_repo = require("../repository/user_repo");
    let decodeToken = token_service.verify_token(req.session.user);
    if(decodeToken){
        const req_repo = require("../repository/request_repo");
        let user = await user_repo.queryUserFromId(decodeToken.userId);
        await req_repo.createRequest(user._id,user.name,user.email,user.apiRights);
        req.session.msg = " Apikey kullanım hakkı isteğiniz alındı!"
        res.redirect("/");
       
    }else{
        req.session.msg = " Lütfen giriş yapın!";
        res.redirect("/login");
    }
}

const reject_request = async (req,res,next) => {
    console.log("redd çalıştııııı");
    console.log(req.params.id);
    const req_repo = require("../repository/request_repo");
    await req_repo.deleteRequest(req.params.id);

    req.session.msg = " Apikey kullanım hakkı isteği silindi!";
    res.redirect("/all-request");
   
}

const accept_request = async (req,res,next) => {
    console.log("kabul çalıştııııı");
    console.log(req.params.id);
    const user_repo = require("../repository/user_repo");
    await user_repo.updateApiKeyRights(req.params.id)
    const req_repo = require("../repository/request_repo");
    await req_repo.deleteRequest(req.params.id);

    req.session.msg = " Apikey kullanım hakkı isteği kabul edildi!";
    res.redirect("/all-request");
   
}






const getPo = async (req,res,next) => {
    let apikey = req.query.apikey;
    if(apikey){
        const token_service = require("../services/token_service");
        decodeToken = token_service.verify_token(apikey);
        if(decodeToken){
            const user_repo = require("../repository/user_repo");
            let user = await user_repo.queryUserFromId(decodeToken.userId);
            if(user){
                if(user.apiRights > 0){
                    await user_repo.userApiRequest(user._id);
                    const costs = await fuelRepo.getFuelCost("po");
                    res.json({ "PO": costs });
                }else{
                    res.json({"app":"Yakit Asistan","code":"402","error":"required payment","msg":"Your Apikey request limit has expired. Please check your request and payment plan."});
                }
            }else{
                res.json({"app":"Yakit Asistan","code":"401","error":"invalid credential","msg":"Your credential could not be verified.Please check your membership! "+process.env.SERVER_URL+"register"});
            }
        }else{
            res.json({"app":"Yakit Asistan","code":"401","error":"invalid APIKEY","msg":"Your Apikey could not be verified.Please check your Apikey!"});
        }
    }else{
        res.json({"app":"Yakit Asistan","code":"406","error":"APIKEY required","msg":"Create a request with your Apikey. Your request format should be like this: '"+process.env.SERVER_URL+"/po?apikey=YourApiKey'."});
    }
    
}

const getAytemiz = async (req,res,next) => {
    let apikey = req.query.apikey;
    if(apikey){
        const token_service = require("../services/token_service");
        decodeToken = token_service.verify_token(apikey);
        if(decodeToken){
            const user_repo = require("../repository/user_repo");
            let user = await user_repo.queryUserFromId(decodeToken.userId);
            if(user){
                if(user.apiRights > 0){
                    await user_repo.userApiRequest(user._id);
                    const costs = await fuelRepo.getFuelCost("aytemiz");
                    const costsLpg= await fuelRepo.getFuelCost("aytemizLpg");
                    res.json({"Aytemiz": costs , "lpg": costsLpg});
                }else{
                    res.json({"app":"Yakit Asistan","code":"402","error":"required payment","msg":"Your Apikey request limit has expired. Please check your request and payment plan."});
                }
            }else{
                res.json({"app":"Yakit Asistan","code":"401","error":"invalid credential","msg":"Your credential could not be verified.Please check your membership! "+process.env.SERVER_URL+"register"});
            }
        }else{
            res.json({"app":"Yakit Asistan","code":"401","error":"invalid APIKEY","msg":"Your Apikey could not be verified.Please check your Apikey!"});
        }
    }else{
        res.json({"app":"Yakit Asistan","code":"406","error":"APIKEY required","msg":"Create a request with your Apikey. Your request format should be like this: '"+process.env.SERVER_URL+"/aytemiz?apikey=YourApiKey'."});
    }
    
}

const getOpet = async (req,res,next) => {
    let apikey = req.query.apikey;
    if(apikey){
        const token_service = require("../services/token_service");
        decodeToken = token_service.verify_token(apikey);
        if(decodeToken){
            const user_repo = require("../repository/user_repo");
            let user = await user_repo.queryUserFromId(decodeToken.userId);
            if(user){
                if(user.apiRights > 0){
                    await user_repo.userApiRequest(user._id);
                    const costs = await fuelRepo.getFuelCost("opet");
                    const costsLpg = await fuelRepo.getFuelCost("opetLpg");
                    res.json({"Opet": costs , "lpg" : costsLpg});
                }else{
                    res.json({"app":"Yakit Asistan","code":"402","error":"required payment","msg":"Your Apikey request limit has expired. Please check your request and payment plan."});
                }
            }else{
                res.json({"app":"Yakit Asistan","code":"401","error":"invalid credential","msg":"Your credential could not be verified.Please check your membership! "+process.env.SERVER_URL+"register"});
            }
        }else{
            res.json({"app":"Yakit Asistan","code":"401","error":"invalid APIKEY","msg":"Your Apikey could not be verified.Please check your Apikey!"});
        }
    }else{
        res.json({"app":"Yakit Asistan","code":"406","error":"APIKEY required","msg":"Create a request with your Apikey. Your request format should be like this: '"+process.env.SERVER_URL+"/opet?apikey=YourApiKey'."});
    }

}

const getShell = async (req,res,next) => {
    let apikey = req.query.apikey;
    if(apikey){
        const token_service = require("../services/token_service");
        decodeToken = token_service.verify_token(apikey);
        if(decodeToken){
            const user_repo = require("../repository/user_repo");
            let user = await user_repo.queryUserFromId(decodeToken.userId);
            if(user){
                if(user.apiRights > 0){
                    await user_repo.userApiRequest(user._id);
                    const costs = await fuelRepo.getFuelCost("shell");
                    res.json({"Shell": costs });
                }else{
                    res.json({"app":"Yakit Asistan","code":"402","error":"required payment","msg":"Your Apikey request limit has expired. Please check your request and payment plan."});
                }
            }else{
                res.json({"app":"Yakit Asistan","code":"401","error":"invalid credential","msg":"Your credential could not be verified.Please check your membership! "+process.env.SERVER_URL+"register"});
            }
        }else{
            res.json({"app":"Yakit Asistan","code":"401","error":"invalid APIKEY","msg":"Your Apikey could not be verified.Please check your Apikey!"});
        }
    }else{
        res.json({"app":"Yakit Asistan","code":"406","error":"APIKEY required","msg":"Create a request with your Apikey. Your request format should be like this: '"+process.env.SERVER_URL+"/shell?apikey=YourApiKey'."});
    }
    
}

const getGo = async (req,res,next) => {
    let apikey = req.query.apikey;
    if(apikey){
        const token_service = require("../services/token_service");
        decodeToken = token_service.verify_token(apikey);
        if(decodeToken){
            const user_repo = require("../repository/user_repo");
            let user = await user_repo.queryUserFromId(decodeToken.userId);
            if(user){
                if(user.apiRights > 0){
                    await user_repo.userApiRequest(user._id);
                    const costs = await fuelRepo.getFuelCost("go");
                    res.json({"Go": costs });
                }else{
                    res.json({"app":"Yakit Asistan","code":"402","error":"required payment","msg":"Your Apikey request limit has expired. Please check your request and payment plan."});
                }
            }else{
                res.json({"app":"Yakit Asistan","code":"401","error":"invalid credential","msg":"Your credential could not be verified.Please check your membership! "+process.env.SERVER_URL+"register"});
            }
        }else{
            res.json({"app":"Yakit Asistan","code":"401","error":"invalid APIKEY","msg":"Your Apikey could not be verified.Please check your Apikey!"});
        }
    }else{
        res.json({"app":"Yakit Asistan","code":"406","error":"APIKEY required","msg":"Create a request with your Apikey. Your request format should be like this: '"+process.env.SERVER_URL+"/go?apikey=YourApiKey'."});
    }
    
}

const getMoil = async (req,res,next) => {
    let apikey = req.query.apikey;
    if(apikey){
        const token_service = require("../services/token_service");
        decodeToken = token_service.verify_token(apikey);
        if(decodeToken){
            const user_repo = require("../repository/user_repo");
            let user = await user_repo.queryUserFromId(decodeToken.userId);
            if(user){
                if(user.apiRights > 0){
                    await user_repo.userApiRequest(user._id);
                    const costs = await fuelRepo.getFuelCost("moil");
                    res.json({"Moil": costs });
                }else{
                    res.json({"app":"Yakit Asistan","code":"402","error":"required payment","msg":"Your Apikey request limit has expired. Please check your request and payment plan."});
                }
            }else{
                res.json({"app":"Yakit Asistan","code":"401","error":"invalid credential","msg":"Your credential could not be verified.Please check your membership! "+process.env.SERVER_URL+"register"});
            }
        }else{
            res.json({"app":"Yakit Asistan","code":"401","error":"invalid APIKEY","msg":"Your Apikey could not be verified.Please check your Apikey!"});
        }
    }else{
        res.json({"app":"Yakit Asistan","code":"406","error":"APIKEY required","msg":"Create a request with your Apikey. Your request format should be like this: '"+process.env.SERVER_URL+"/moil?apikey=YourApiKey'."});
    }
}

const getTp = async (req,res,next) => {
    let apikey = req.query.apikey;
    if(apikey){
        const token_service = require("../services/token_service");
        decodeToken = token_service.verify_token(apikey);
        if(decodeToken){
            const user_repo = require("../repository/user_repo");
            let user = await user_repo.queryUserFromId(decodeToken.userId);
            if(user){
                if(user.apiRights > 0){
                    await user_repo.userApiRequest(user._id);
                    const costs = await fuelRepo.getFuelCost("tp");
                    res.json({"Tp": costs });
                }else{
                    res.json({"app":"Yakit Asistan","code":"402","error":"required payment","msg":"Your Apikey request limit has expired. Please check your request and payment plan."});
                }
            }else{
                res.json({"app":"Yakit Asistan","code":"401","error":"invalid credential","msg":"Your credential could not be verified.Please check your membership! "+process.env.SERVER_URL+"register"});
            }
        }else{
            res.json({"app":"Yakit Asistan","code":"401","error":"invalid APIKEY","msg":"Your Apikey could not be verified.Please check your Apikey!"});
        }
    }else{
        res.json({"app":"Yakit Asistan","code":"406","error":"APIKEY required","msg":"Create a request with your Apikey. Your request format should be like this: '"+process.env.SERVER_URL+"/tp?apikey=YourApiKey'."});
    }
    
}

const getSoil = async (req,res,next) => {
    let apikey = req.query.apikey;
    if(apikey){
        const token_service = require("../services/token_service");
        decodeToken = token_service.verify_token(apikey);
        if(decodeToken){
            const user_repo = require("../repository/user_repo");
            let user = await user_repo.queryUserFromId(decodeToken.userId);
            if(user){
                if(user.apiRights > 0){
                    await user_repo.userApiRequest(user._id);
                    const costs = await fuelRepo.getFuelCost("soil");
                    const costsLpg = await fuelRepo.getFuelCost("soilLpg");
                    res.json({"Soil": costs , "lpg" : costsLpg });
                }else{
                    res.json({"app":"Yakit Asistan","code":"402","error":"required payment","msg":"Your Apikey request limit has expired. Please check your request and payment plan."});
                }
            }else{
                res.json({"app":"Yakit Asistan","code":"401","error":"invalid credential","msg":"Your credential could not be verified.Please check your membership! "+process.env.SERVER_URL+"register"});
            }
        }else{
            res.json({"app":"Yakit Asistan","code":"401","error":"invalid APIKEY","msg":"Your Apikey could not be verified.Please check your Apikey!"});
        }
    }else{
        res.json({"app":"Yakit Asistan","code":"406","error":"APIKEY required","msg":"Create a request with your Apikey. Your request format should be like this: '"+process.env.SERVER_URL+"/soil?apikey=YourApiKey'."});
    }
    
}

const getCityList = async (req,res,next) => {
    let apikey = req.query.apikey;
    if(apikey){
        const token_service = require("../services/token_service");
        decodeToken = token_service.verify_token(apikey);
        if(decodeToken){
            const user_repo = require("../repository/user_repo");
            let user = await user_repo.queryUserFromId(decodeToken.userId);
            if(user){
                const cityList = require("../tools/cityList.json");
                res.json({"City List" : cityList  });
            }else{
                res.json({"app":"Yakit Asistan","code":"401","error":"invalid credential","msg":"Your credential could not be verified.Please check your membership! "+process.env.SERVER_URL+"register"});
            }
        }else{
            res.json({"app":"Yakit Asistan","code":"401","error":"invalid APIKEY","msg":"Your Apikey could not be verified.Please check your Apikey!"});
        }
    }else{
        res.json({"app":"Yakit Asistan","code":"406","error":"APIKEY required","msg":"Create a request with your Apikey. Your request format should be like this: '"+process.env.SERVER_URL+"/soil?apikey=YourApiKey'."});
    }
}







module.exports = {
    home,

    invalid_url_page,
    documentation_page,
    docs_response_page,
    docs_usage_page,


    register_page,
    register,
    login,
    login_page,

    logout,

    email_activation,

    request_api_right,

    request_api_rights_page,

    accept_request,
    reject_request,


    getPo,
    getAytemiz,
    getOpet,
    getShell,
    getGo,
    getMoil,
    getTp,
    getSoil,
    getCityList,
}