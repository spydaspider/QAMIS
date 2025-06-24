const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const bcrypt = require('bcrypt');
const UserSchema = new Schema({
    username: {
        type: String, 
        required: true 
    },
    email: {
        type: String,
        required: true 
       },
    password: {
        type:String,
        required: true
    },
   /*  emailVerified: {
        type: Boolean,
        default: false
      }, */
      role:{
        type:String,
        required: true
      },
     /*  resetOTP: {
        type: String,
      },
      otpExpiresAt: {
        type: Date,
      },
      failedLoginAttempts: {
        type: Number,
        default: 0
      },
      loginLockUntil: {
        type: Date,
        default: null
      },
       */


},{timestamps: true})
UserSchema.statics.signup = async function(username, email, password, role,req){
    if(!username || !email || !password)
    {
        throw Error("Fill in all fields");
    }
    const usernameTaken = await this.findOne({username});
    const emailTaken = await this.findOne({email});

    if(usernameTaken)
    {
        throw Error('Username already taken');
    }
    if(emailTaken) 
    {
        throw Error('Email already taken');
    }
    if(!validator.isEmail(email))
    {
        throw Error('Enter a valid email address');
    }
    if(!validator.isStrongPassword(password))
    {
        throw Error('Password is weak');
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
  // Get client IP
  /* let ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  if (ip === '::1') ip = '127.0.0.1';

  // GeoIP lookup
  const geo = geoip.lookup(ip) || {};
  const [lat, lng] = Array.isArray(geo.ll) && geo.ll.length === 2 ? geo.ll : [0, 0];
  const now = new Date();
  const newUser = await this.create({
    username,
    email,
    password: hash,
    role,
    lastLogin: {
      ip,
      location: { type: 'Point', coordinates: [lng, lat] },
      city:    geo.city    || 'Unknown',
      region:  geo.region  || 'Unknown',
      country: geo.country || 'Unknown',
      at: now
    }
  }); */
   const newUser = await this.create({
    username,
    email,
    password: hash,
    role,
   });

    return newUser;

    

}
UserSchema.statics.login = async function(email, password,req){
  /* let ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '')
  .split(',')[0]
  .trim();
if (ip === '::1') ip = '127.0.0.1';
const loginLog = new LoginLog({
  email,
  ip,           // e.g. from req.headers or req.socket.remoteAddress
  success: false // default until we know the password check result
}); */
   
    if(!email || !password)
    {
        throw Error('Enter email and password');
    }
    const isCorrectEmail = await this.findOne({email});
    
    if(!isCorrectEmail)
    {
        throw Error('Email is not found');
    }
    //check to see if system is locked

    /* if(isCorrectEmail.loginLockUntil && isCorrectEmail.loginLockUntil > new Date())
    {
        const minutes = Math.ceil((isCorrectEmail.loginLockUntil - new Date())/(60 * 1000));
        const err = new Error(`Account is locked. Try again in ${minutes} minute(s).`);
        err.loginLockUntil = isCorrectEmail.loginLockUntil;
        throw err;

    } */

    
    const isCorrectPassword = await bcrypt.compare(password, isCorrectEmail.password);
    if(!isCorrectPassword)
    {/* 
        isCorrectEmail.failedLoginAttempts += 1;
        LoginLog.success = false;
        await loginLog.save();
    
        await isCorrectEmail.save();
        console.log("Failed");
        console.log("login failed attemptps", isCorrectEmail.failedLoginAttempts);
        if(isCorrectEmail.failedLoginAttempts >= 5){
            console.log("greater than 5");
              isCorrectEmail.loginLockUntil = new Date(Date.now() + 1 * 60 * 1000);
            isCorrectEmail.failedLoginAttempts = 0;
            await isCorrectEmail.save();
            const err = new Error('Password is not correct. Your account is locked for 1 minute.');
            err.loginLockUntil = isCorrectEmail.loginLockUntil;
        
            const emailTemplate = `
            
                <p>Failed multiple login attempts, we have locked the account for 1 minute, reset your password</p>
                
                
              `;
             
            // Call the Brevo email function
            
            await sendBrevoEmail({
            subject: 'Failed login Attempts',
            to: [{ email, name: isCorrectEmail.username }],
            emailTemplate,
            });  
         
           
 
            throw err;         

            
    
        } */
        

        throw Error('Password is not correct');

    }
    
    //get the location

  /*  
    const geo = geoip.lookup(ip)||{};
    const now = new Date();
  const coords = Array.isArray(geo.ll) && geo.ll.length === 2
    ? [geo.ll[1], geo.ll[0]]  // [lng, lat]
    : [0, 0];
    const currentLogin = {
      ip,
      location:   { type: 'Point', coordinates: coords },
      city:       geo.city    || 'Unknown',
      region:     geo.region  || 'Unknown',
      country:    geo.country || 'Unknown',
      at:         now          // ← include timestamp here
    };
   */


  


// Save current login


/*  isCorrectEmail.lastLogin = currentLogin;
 */ await isCorrectEmail.save();
return isCorrectEmail;
    
};
module.exports = mongoose.model('User', UserSchema);
