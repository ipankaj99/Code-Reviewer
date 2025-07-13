const express=require('express');
const router=express.Router();
const jwt = require('jsonwebtoken'); 


const aiController=require('../controller/ai.controller');
router.get('/',  (req, res) => 
    {
        const token=req.cookies.token;
        try {
            // Decode the JWT to get the user data (like profile photo)
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            
            // Pass the user's profile photo to the view
            res.render('index', {
                decoded: {
                    username: decoded.username,
                    photoPath: decoded.profilePhoto // this should be something like /images/abc.jpg
                }
            });
        } catch (err) {
            console.log('Error decoding token: ', err);
            return res.redirect('/login');  // Redirect to login if token is invalid or expired
        }
});
  
router.post("/get-review", aiController.getReview);

module.exports=router;