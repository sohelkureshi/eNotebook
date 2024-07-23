const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const jwt_secret = process.env.JWT_SECRET;


// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser',
    [
        body('name', 'Provide a valid name').isLength({ min: 3 }),
        body('email', 'Provide a valid email').isEmail(),
        body('password', 'Password length must be atleast 8 characters').isLength({ min: 8 })
    ],
    async (req, res) => {
        let success = false;

        // if there are errors while validation of user inputs, return bad request and the errors
        const result = validationResult(req);
        if (!result.isEmpty()) {
            success = false;
            return res.status(400).json({ success, errors: result.array() });
        }

        try {
            // check whether the user with this email exists already
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                success = false;
                return res.status(400).json({ success, error: "Sorry, a user with this email already exists" });
            }

            // creating secured password with encryption and adding salt
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);

            // create a new user
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass
            })

            // taking user id as the searching parameter
            const data = {
                user: {
                    id: user.id
                }
            }

            // jwt sign to generate authToken
            const authToken = jwt.sign(data, jwt_secret);
            // console.log(jwtData);
            success = true;

            res.json({ success, authToken });

            // res.json(user);
        }
        catch (error) {
            success = false;
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    }
)


// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post('/login',
    [
        body('email', 'Provide a valid email').isEmail(),
        body('password', 'Password field cannot be blank').notEmpty()
    ],
    async (req, res) => {
        let success = false;
        
        // if there are errors while validation of user inputs, return bad request and the errors
        const result = validationResult(req);
        if (!result.isEmpty()) {
            success = false
            return res.status(400).json({ success, errors: result.array() });
        }

        const { email, password } = req.body;
        try {
            // comparing email with those in the database (returns true if there exists the email)
            const user = await User.findOne({ email });
            // show error for incorrect credentials
            if (!user) {
                success = false
                return res.status(400).json({ success, error: "Please try to login with correct credentials" })
            }

            // comparing the password (returns true if correct password)
            const passwordCompare = await bcrypt.compare(password, user.password);
            // show error for incorrect credentials
            if (!passwordCompare) {
                success = false
                return res.status(400).json({ success, error: "Please try to login with correct credentials" })
            }

            // now here credentials is completely correct
            // taking user id as the searching parameter
            const data = {
                user: {
                    id: user.id
                }
            }

            // jwt sign to generate authToken
            const authToken = jwt.sign(data, jwt_secret);
            success = true;

            res.json({ success, authToken });
        }
        catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    }
)


// ROUTE 3: Get logged-in user details using: POST "/api/auth/getuser". Login required
router.post('/getuser',
    fetchuser,
    async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select("-password");

            res.send(user);
        }
        catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    }
)

module.exports = router;