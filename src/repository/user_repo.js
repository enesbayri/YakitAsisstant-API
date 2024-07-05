const db = require("../database/user_database");

const registerUser = async (name,surname,email,password)=>{
    await db.registerUser(name,surname,email,password);
}

const isEmailAllready = async (email)=>{
    return await db.isEmailAllready(email);
}

const loginUser = async (email,password) => {
    return await db.loginUser(email,password);
}

const userEmailActived = async (userId) => {
    await db.userEmailActived(userId);
}

const queryUserFromId = (userId) => {
    return db.queryUserFromId(userId);
}

const updateApiKeyRights = async ( userId  ) => {
    await db.updateApiKeyRights(userId);
}

const userApiRequest = async (userId) => {
    await db.userApiRequest(userId);
}

const getAllUsers = async () => {
    return await db.getAllUsers();
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
