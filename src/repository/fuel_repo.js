
const database = require("../database/fuel_database");


const getFuelCost = async (company) => {
   return await database.getData(company);
}

const addFuelCost = (company,costs) => {
    database.addData(company,costs);
}



module.exports = {
    getFuelCost,
    addFuelCost,
}