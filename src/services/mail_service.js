const nodemailer = require("nodemailer");


const sendMail = async (email , tokenUrl) => {
    let transporter=nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user:process.env.EMAIL,
            pass:process.env.PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    await transporter.sendMail({
        from: 'YAKIT ASİSTAN <info@yakitasistan.com>',
        to: email,
        subject:'TOKENINIZLA MAİLİNİZİ AKTİFLEŞTİRİN!',
        text:"EBAY SOFTWARE olarak verilerimize ulaşmak isteyenleri kimliklendirip, kimlerle veri paylaştığımızı bilmek istiyoruz.Bu nedenle üyeliklerde kişisel tokenlarınızla mail adresinizi onaylamanız gerekmektedir. Mailinizi onaylamak için :  "+tokenUrl,
    },(err,info)=>{
        if(err){
            console.log(err);
            console.log('mail gönterilemedi!');
        }else{
            console.log('mail gonderildi!');
        }
        transporter.close();
    });
}



module.exports = {
    sendMail
}