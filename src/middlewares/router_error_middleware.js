
const router_error = (req,res,next) => {
    res.redirect("/invalid-url");
}


module.exports = router_error;