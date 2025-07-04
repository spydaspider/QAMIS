const jwt = require("jsonwebtoken");
const User = require('../models/user.js');
const auth = async(req,res,next)=>{
    const { authorization } = req.headers;
    if(!authorization)
    {
        return res.status(400).json({error: 'No token'});
    }

    const token = authorization.split(' ')[1];
     try{
          const { _id } = jwt.verify(token, process.env.SECRET);
          req.user = await User.findOne({_id}).select('');
          next();
    }
    catch(error){
        return res.status(400).json({error:'Invalid token'});
    }
}
module.exports = auth;