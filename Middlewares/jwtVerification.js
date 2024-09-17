const jwt = require('jsonwebtoken')
const verifyToken = async(req,res)=>{
   try {
    const authHeader = req.headers['authorization']
    if(!authHeader){
        res.sendStatus(401)
    }
    const token = authHeader.split(' ')[1]

    const data = jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
        if(err){
            return res.sendStatus(403)
        }
        req.user = decoded
        next()
    })
   } catch (error) {
    console.log(error);
    return res.staus(500).json('Internal server error')
   }
}
module.exports = verifyToken