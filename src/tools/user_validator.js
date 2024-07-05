
const login_validator = (email , password) => {
    if(email!="" && password != ""){
        return true;
    }else {
        return false;
    }
}

const register_validator = (name,surname,email,password) => {
    if( name!= "" && surname != "" && email != "" && password != ""){
        return true;
    }else{
        return false;
    }
}

const register_password_validator = (password) => {
    const hasNumber = /\d/;  // Sayı içerip içermediğini kontrol eder
    const hasLowerCase = /[a-z]/;  // Küçük harf içerip içermediğini kontrol eder
    const hasUpperCase = /[A-Z]/;  // Büyük harf içerip içermediğini kontrol eder
    const minLength = 8;  // Minimum karakter sayısı

    return password.length >= minLength && hasNumber.test(password) && hasLowerCase.test(password) && hasUpperCase.test(password);

}


module.exports={
    login_validator,
    register_validator,
    register_password_validator,
}