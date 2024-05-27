const bcrypt = require('bcrypt')
const studentModel = require('../Models/studentDetails')

exports.defaultRoute = async (req, res) => {
    const { name, email, phone, qualification, password, confirmpassword } = req.body;
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

         if (!passwordRegex.test(password)) {
            return res.status(400).json({ success: false, message: "Invalid password format" });
        } else if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email address"});
        }else {
            const salting = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salting)
            const newSchema = new studentModel({
                name, email, phone, qualification,
                password:hashedPassword
            })
            await newSchema.save()
            return res.status(200).json({success:true})
        }
  
};
