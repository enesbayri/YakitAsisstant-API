const mongoose=require("mongoose");


mongoose.connect(
    process.env.DATABASE,
    {useUnifiedTopology:true,useNewUrlParser:true}
    )
    .then(()=>{
        console.log("Veritabanı aktif!");
    })
    .catch(()=>{console.log("Veritabanına bağlanılamadı!")});



const reqSchema=new mongoose.Schema({_id:String, name:String,email:String,apiRights:Number});
const Request=mongoose.model("requests",reqSchema);



const createRequest = async (userId,name,email,apiRights)=>{
    const req = new Request({_id:userId,name:name,email:email,apiRights:apiRights});
    req.save().then((sonuc)=>{console.log(`${sonuc} eklendi!`);}).catch((err)=>{console.log(`kaydedilemedi! ${err}`);});
}


const getAllRequest = async ()=>{
    return await Request.find({})
}

const deleteRequest = async (userId)=>{
    await Request.findOneAndDelete({_id:userId});
    
}

module.exports={
    createRequest,
    deleteRequest,
    getAllRequest,
}
