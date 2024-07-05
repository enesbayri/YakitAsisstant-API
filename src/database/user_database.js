const mongoose=require("mongoose");


mongoose.connect(
    process.env.DATABASE,
    {useUnifiedTopology:true,useNewUrlParser:true}
    )
    .then(()=>{
        console.log("Veritabanı aktif!");
    })
    .catch(()=>{console.log("Veritabanına bağlanılamadı!")});



const userSchema=new mongoose.Schema({_id:String, name:String,surname:String,email:String,password:String,isEmailActive:{type:Boolean,default:false},apikey:String,apiRights:{type:Number,default:100},role:{type:String,default:"user"}});
const User=mongoose.model("users",userSchema);

const bcrypt_service = require("../services/bcrypt_service");

const registerUser = async (name,surname,email,password)=>{
    const token_service = require("../services/token_service");
    let hashPassword = bcrypt_service.hash_password(password);
    let userId = new mongoose.Types.ObjectId();
    let apikey= token_service.create_token({ userId : userId  })
    const user = new User({_id:userId,name:name,surname:surname,email:email,password:hashPassword,apikey:apikey});
    user.save().then((sonuc)=>{console.log(`${sonuc} eklendi!`);}).catch((err)=>{console.log(`kaydedilemedi! ${err}`);});
    await sendUserEmailActivation(user._id,email);
}


const isEmailAllready = async (email)=>{
    user=await User.findOne({email:email});
    if(user == null){
        return false;
    }else{
        return true;
    }
}



const loginUser = async (email,password) => {
    user=await User.findOne({email:email});
    if(user != null){
        if(bcrypt_service.compare_password(password,user.password)){
            return user;
        }else{
            return null;
        }
    }else{
        return null;
    }
}



const userEmailActived = async (userId) => {
    await User.findOneAndUpdate({_id:userId},{isEmailActive:true});
}


const sendUserEmailActivation = async ( id , email ) => {
    const token_service = require("../services/token_service");
    const mail_service = require("../services/mail_service");

    try {
        let token = token_service.create_token({ userId: id });
        let tokenUrl = process.env.SERVER_URL+"email-activation?id="+token;
        await mail_service.sendMail(email,tokenUrl);
    } catch (error) {
        console.log(error);
    }

    

}

const queryUserFromId = async ( userId ) => {
    user=await User.findOne({_id:userId});
    if(user == null){
        return null;
    }else{
        return user;
    }
}

const updateApiKeyRights = async ( userId  ) => {
    let user = await User.findOne({_id:userId});
    user.apiRights += 10;
    user.save();
}

const userApiRequest = async (userId) => {
    let user = await User.findOne({_id:userId});
    user.apiRights -= 1;
    user.save();
}


const getAllUsers = async () => {
    let users = await User.find({});
    console.log(users);
    return users;
}

module.exports={
    registerUser,
    isEmailAllready,
    loginUser,
    userEmailActived,
    queryUserFromId,
    updateApiKeyRights,
    userApiRequest,
    getAllUsers,
}
