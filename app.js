
// env settings
const dotenv = require("dotenv").config();



// server modules
const express = require("express");
const app = express();



// router
const main_router = require("./src/routers/main_router"); 



// middlewares
const route_error_middleware = require("./src/middlewares/router_error_middleware");



// Ejs modules
const ejs = require("ejs");
const express_layouts = require("express-ejs-layouts");
const path = require("path");




// cron modules
const cron = require("node-cron");
cron.schedule('10 0 * * *', () => { // her gün saat 00.10 da çalışacak
    const newFuelDataScrap = require("./src/services/scrap_data_service");
    newFuelDataScrap();
}, {
    scheduled: true,
    timezone: "Europe/Istanbul" // Zaman dilimini 
})




// ejs configs
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname,"./src/views"));




// server static link
app.use(express.static("public"));





// server post request settings
app.use(express.urlencoded({extended:true}));
app.use(express.json());



// session configs
const session = require("express-session");
app.use(session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: true,
    cookie: {  }
}));




// server configs
app.use(express_layouts);
app.use("/",main_router);
app.use(route_error_middleware);








// start server
app.listen( process.env.PORT , async() => {
    console.log(process.env.PORT + " Port server aktif!");
} );