
const router = require("express").Router();
const main_controller = require("../controllers/main_controller");
const authentication = require("../middlewares/authentication_middleware");



router.get("/",authentication,main_controller.home);

router.get("/invalid-url",main_controller.invalid_url_page);

router.get("/documentation",main_controller.documentation_page);
router.get("/documentation/response",main_controller.docs_response_page);
router.get("/documentation/usage",main_controller.docs_usage_page);


router.get("/login",main_controller.login_page);
router.get("/register",main_controller.register_page);


router.post("/login",main_controller.login);
router.post("/register",main_controller.register);
router.get("/logout",main_controller.logout);


router.get("/email-activation",main_controller.email_activation)

router.get("/update-api-rights",authentication,main_controller.request_api_right);

router.get("/all-request",authentication,main_controller.request_api_rights_page);

router.get("/accept_request/:id",authentication,main_controller.accept_request);
router.get("/reject_request/:id",authentication,main_controller.reject_request);


router.get("/po",main_controller.getPo);
router.get("/aytemiz",main_controller.getAytemiz);
router.get("/opet",main_controller.getOpet);
router.get("/shell",main_controller.getShell);
router.get("/go",main_controller.getGo);
router.get("/moil",main_controller.getMoil);
router.get("/tp",main_controller.getTp);
router.get("/soil",main_controller.getSoil);
router.get("/city-list",main_controller.getCityList);






module.exports = router;