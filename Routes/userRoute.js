const authController = require('express').Router()
const User = require("../Schema/userSchema")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

authController.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email})
        if(!user){
            throw new Error("Invalid credentials")
        }
        // if (user && (await user.matchPassword(password)))
        const comparePass = await user.matchPassword(req.body.password)
        if(!comparePass){
            throw new Error("Invalid credentials")
        }

        // const {...others} = user._doc
        const token = jwt.sign({id: user._id}, process.env.TOKEN, {expiresIn: '5h'})        
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
            sameSite: 'strict', // Prevent CSRF attacks
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          });
          const userdata={
            _id: user._id,
            name: user.name,
            email: user.email,
        }
        res.status(200).json({userdata,token})
        // return res.status(200).json({userinfo: userinfo, token})
    } catch (error) {
        return res.status(500).json(error.message) 
    }
})






authController.post('/logout', async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
      });
      res.status(200).json({ message: 'Logged out successfully' });
  
})
authController.post('/register', async (req, res) => {
    // const { name, email, password } = req.body;
try{
    const userExists = await User.findOne({ email :req.body.email});
  
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }
  
    const userdata = await User.create({...req.body});
    const {...others} = userdata._doc
    const token = jwt.sign({id:userdata._id}, process.env.TOKEN, {expiresIn: '5h'})
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    res.status(201).json({userdata: others, token})
}catch (error) {
        return res.status(500).json(error.message)
    }
  
})
authController.get('/getall', async (req, res) => {
    try {
      const users = await User.find()
      res.json({ users: users });
    } catch (error) {
      res.json({ error: error.message });
    }
  })
authController.get('/profile', async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
module.exports = authController