const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetchuser = require("../middleware/fetchuser");
const JWT_SECRET = "$hhItsASecret!"

//ROUTE #1 :: Create a user using POST "/api/auth/createuser". No login required
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters!").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //If there are error then return Bad Request along with the errors.
    if (!errors.isEmpty()) {
      console.log({error});
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        //Check whether the user with this email already exists
      let user = await User.findOne({ email: req.body.email });

      if (user) { //if user already exists in the database, then cannot be created, so return error.
        return res
          .status(400)
          .json({ error: "User with this email already exists!" });
      }

      //creating the user since the email id wasnt found in the db.
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const SecurePassword = await bcrypt.hash(req.body.password, salt);


      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: SecurePassword,
      });
      //   .then(user => res.json(user))
      //   .catch(err=> {console.log(err)
      // res.json({error: 'Please enter a unique value for email', message: err.message})});
      const data = {
        user: {
            id: user.id
        }
      }

      //Authentication token
      const token = jwt.sign(data, JWT_SECRET);
      res.json({token})

    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  }
)

//ROUTE #2 ::  Authenticating a user using POST "/api/auth/login". No login required
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank!").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //If there are error then return Bad Request along with the errors.
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {email, password} = req.body;
    try {
      //Check whether the user with this email exists.
      let user = await User.findOne({ email });
      if(!user){
        return res.status(400).json({errors: "Sorry! Wrong Credentials"}) 
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if(!passwordCompare){
        return res.status(400).json({errors: "Sorry! Wrong Credentials"}) 
      }

      const data = {
          user: {
              id: user.id
          }
      }

       //Authentication token
       const token = jwt.sign(data, JWT_SECRET);
       res.json({token});
      //  res.json({"message": "User successfully logged in!"});

    } catch (error) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  }
)

//ROUTE #3  :: Fetching the logged in user details using POST "/api/auth/fetchUser". Login required
router.post(
  "/fetchUser",
  fetchuser,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select("-password");
      res.send(user);
    } catch (error) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  }
)

module.exports = router;
