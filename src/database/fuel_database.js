const mongoose=require("mongoose");


mongoose.connect(
    process.env.DATABASE,
    {useUnifiedTopology:true,useNewUrlParser:true}
    )
    .then(()=>{
        console.log("Veritabanı aktif!");
    })
    .catch(()=>{console.log("Veritabanına bağlanılamadı!")});



const fuelSchema=new mongoose.Schema({company:String,costs:String});
const Fuel=mongoose.model("petrols",fuelSchema);

const addData=(company,cost)=>{
    //const istasyon= Petrol({petrol:firmaAdi,fiyatlar:guncelFiyatlar});

    //istasyon.save().then((sonuc)=>{console.log(`${sonuc} eklendi!`);}).catch((err)=>{console.log(`kaydedilemedi! ${err}`);});

    Fuel.updateOne({company:company},{costs:cost}).then(result=>console.log(result));
}

const getData=async (company)=>{
    let dataObject= await Fuel.findOne({company:company});
    const data=JSON.parse(dataObject.costs);
    
    return data;
}

module.exports={
    addData,
    getData,
}
