const db = require("../database/request_database");

const createRequest = async (userId,name,email,apiRights)=>{
    await db.createRequest(userId,name,email,apiRights);
}


const getAllRequest = async () => {
    return await db.getAllRequest();
}

const deleteRequest = async (userId) => {
    await db.deleteRequest(userId);
}

module.exports={
    createRequest,
    getAllRequest,
    deleteRequest,
}
