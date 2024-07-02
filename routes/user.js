//[SECTION] Dependencies and Modules
const express = require("express");
const userController = require("../controllers/user.js");
const auth = require("../auth.js");
const passport = require('passport');

const {verify, verifyAdmin, errorHandler, isLoggedIn} = auth;

//[SECTION] Routing Component
const router = express.Router();


// [SECTION] User registration
router.post("/register", userController.registerUser);

// [SECTION] verifiy email
router.post("/verify-email", userController.verifyEmail);

// [SECTION] Resend Verification Code
router.post('/resend-verification-code/:userId',  userController.resendVerificationCode);


// [SECTION] User authentication
router.post("/login", userController.loginUser);


// [SECTION] Retrieve User Details
router.get("/details", verify, userController.getDetails);

//[SECTION] Get All user details
router.get("/users-details", verify, verifyAdmin ,userController.getAllDetails);


// [SECTION] Update User as Admin
router.patch("/:id/set-as-admin",verify, verifyAdmin, userController.updateAdmin);


// [SECTION] Update Password
router.patch("/update-password", verify, userController.updatePassword);

// [SECTION] Retrieve All Users
router.get('/all', userController.getAllUsers);



// [SECTION] Google Login
//[SECTION] Route for initiating the Google OAuth consent screen
router.get('/google', 
	passport.authenticate('google', {
		scope:['email', 'profile'],
		prompt: "select_account"
	}


));


//[SECTION] Route for callback URL for Google OAuth authentication
router.get('/google/callback', 
	passport.authenticate('google', {
		failureRedirect: '/users/failed',
	}),
	function(req, res){
		res.redirect('/users/success');
	}
 
);


// [SECTION] Route for failed Google OAuth authentication
router.get("/failed", (req, res) => {
	console.log('User is not authenticated');
	res.send("Failed");
})


// [SECTION] Route for successful Google OAuth authentication
router.get('/success', isLoggedIn, (req, res) => {
	console.log('You are logged in');
	console.log(req.user);
	res.send(`Welcome ${req.user.displayName}`)
})


// [SECTION] Route for successful Logging Out
router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if(err){
			console.log('Error while destroying session:', err);
		}else{
			req.logout(() => {
				console.log('You are logged out');
				res.redirect('/');
			})
		}
	})
})




module.exports = router;
