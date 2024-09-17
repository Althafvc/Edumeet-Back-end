const bcrypt = require('bcrypt'); // Import bcrypt library for password hashing
const jwt = require('jsonwebtoken')
const mailOtp = require('../Middlewares/mailotp')
const otpMailer = require('../Utilities/otpmailer')
const studentModel = require('../Models/studentDetails');
const teacherDataModel = require('../Models/teacherDetails');
let givenOtp = ''

// Student Signup Function
exports.studentSignup = async (req, res) => {
    
    // Extract fields from the request body
    const { name, email, phone, qualification, password, confirmpassword, role} = req.body;
    
    // Define regex patterns for password and email validation
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    // Check if any field is empty
    if (name.trim() == '' || email.trim() == '' || qualification.trim() == '' || password.trim() == '' || confirmpassword.trim() == '') {
        return res.status(400).json({ success: false, message: 'All fields are mandatory' });
    }

    // Check if name is more than two characters
         if (name.length <= 2) {
        return res.status(400).json({ success: false, message: 'Name should be more than two characters' });

        // Check if phone number is exactly 10 digits
    } else if (!mobileRegex.test(phone)) {
        
        return res.status(400).json({ success: false, message: 'Phone number must be ten digits' });

        // Validate password against the regex pattern
    } else if (!passwordRegex.test(password)) {
        return res.status(400).json({ success: false, message: "Invalid password format" });

        // Validate email against the regex pattern
    } else if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email address" });

        // If all validations pass, proceed with saving the user
    } else {
        // Generate a salt for hashing the password
        const salting = await bcrypt.genSalt(10);

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, salting);

        // Create a new student document using the student model
        const newSchema = new studentModel({
            name, email, phone, qualification,
            password: hashedPassword,role
        });

        // Save the student document to the database
        givenOtp = mailOtp.otp
        otpMailer(givenOtp, email)
        await newSchema.save();
        // Respond with success status
        return res.status(200).json({ success: true });
    }
};

// Teacher Signup Function
exports.teacherSignup = async (req, res) => {
    // Extract fields from the request body
    const { name, email, phone, qualification, password, confirmpassword } = req.body;
    // Define regex patterns for password and email validation
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    // Check if any field is empty
    if (name.trim()== '' || email.trim()== '' || phone.trim()== '' || qualification.trim() == '' || password.trim() == '' || confirmpassword.trim() == '') {
        return res.status(400).json({ success: false, message: 'All fields are mandatory' });
    }

    // Check if name is more than two characters
    else if (name.length <= 2) {
        return res.status(400).json({ success: false, message: 'Name should be more than two characters' });

        // Check if phone number is exactly 10 digits
    } else if (phone.length != 10) {
        return res.status(400).json({ success: false, message: 'Phone number must be ten digits' });

        // Validate password against the regex pattern
    } else if (!passwordRegex.test(password)) {
        return res.status(400).json({ success: false, message: "Invalid password format" });

        // Validate email against the regex pattern
    } else if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email address" });

        // If all validations pass, proceed with saving the user
    } else {
        // Generate a salt for hashing the password
        const salting = await bcrypt.genSalt(10);

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, salting);

        // Create a new teacher document using the teacher model
        const newSchema = new teacherDataModel({
            name, email, phone, qualification,
            password: hashedPassword
        });

        // sending otp through nodemailer
        givenOtp = mailOtp.otp
        otpMailer(givenOtp, email)

        // Save the teacher document to the database
        await newSchema.save();

        // Respond with success status
        return res.status(200).json({ success: true });
    }
};

// Student Login Function
exports.studentLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the student document by email
        const studentDatas = await studentModel.findOne({ email });

        // If student is not found, respond with an error
        if (!studentDatas) {
            return res.status(400).json({ message: 'User not found' });
        } else if(email.trim()=='' || password.trim()=='') {
            return res.status(400).json({ message: 'All fields are mandatory' });

        }
        
        else {
            // Compare the provided password with the stored hashed password
            const passwordMatch = await bcrypt.compare(password, studentDatas.password);

            // If passwords do not match, respond with an error
            if (!passwordMatch) {
                return res.status(400).json({ message: "Incorrect password" });
            } else {
                const payload = {
                    userId: studentDatas._id,
                    email: studentDatas.email,
                    name: studentDatas.name,
                    role: 'student'
                }
                const token = jwt.sign(payload, process.env.JWT_SECRET)

                // If passwords match, respond with success status
                return res.status(200).json({ message: 'login successful', token });
            }
        }
    } catch (error) {
        // If an error occurs, respond with a server error message
        return res.status(500).json({ message: 'server error' });
    }
};

// Controller function to handle OTP verification for student
exports.studentOtp = async (req, res) => {
    // Extract OTP and email from request body
    const { otp, email,role } = req.body;

    // Combine OTP array into a single string and trim any whitespace
    const receivedOtp = otp.join('').trim();
    const actualOtp = givenOtp.toString().trim(); // Assuming `givenOtp` is defined elsewhere

    try {
        // classifying the data based on the role
        if (role=='student') {

            // Find student by email
        const student = await studentModel.findOne({ email });

        // Check if student exists
        if (!student) {
            return res.status(401).json({ msg: 'User not found' });

        // Check if received OTP matches the actual OTP
        } else if (receivedOtp !== actualOtp) {
            return res.status(400).json({ msg: 'Invalid OTP' });

        } else {
            try {
                // Update student record to set `verified` to true
                await studentModel.updateOne({ email }, { $set: { verified: true } });

                // Return success response
                return res.status(200).json({ msg: 'OTP verified successfully' });
            } catch (err) {
                // Log error and return server error response if update fails
                return res.status(500).json({ msg: 'Server error' });
            }
        }
        } else {
            // Find teacher by email
        const teacher = await teacherDataModel.findOne({ email });

        // Check if teacher exists
        if (!teacher) {
            return res.status(401).json({ msg: 'User not found' });

        // Check if received OTP matches the actual OTP
        } else if (receivedOtp !== actualOtp) {
            return res.status(400).json({ msg: 'Invalid OTP' });

        } else {
            try {
                // Update teacher record to set `verified` to true
                await teacherDataModel.updateOne({ email }, { $set: { verified: true } });

                // Return success response
                return res.status(200).json({ msg: 'OTP verified successfully' });
            } catch (err) {
                // Log error and return server error response if update fails
                return res.status(500).json({ msg: 'Server error' });
            }
        }
        }
        
    } catch (err) {
        // Log error and return server error response if email lookup fails
        return res.status(500).json({ msg: 'Server error'});
    }
};


exports.adminLogin = (req, res) => {
    // Extract email and secretkey from the request body
    const { email, secretkey } = req.body;

    // Regular expressions for validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const secretkeyRegex = /^\d{4}$/;

    try {
        // Check if the email is empty after trimming whitespace
        if (email.trim() === '') {
            return res.status(400).json({ success: false, message: 'Email is mandatory' });
        }

        // Check if the secretkey is empty after trimming whitespace
        else if (secretkey.trim() === '') {
            return res.status(400).json({ success: false, message: 'Secretkey is mandatory' });
        }

        // Validate the email format
        else if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        // Validate the secretkey format (must be 4 digits)
        else if (!secretkeyRegex.test(secretkey.trim())) {
            return res.status(400).json({ success: false, message: 'Secretkey must be 4 digits long' });
        }

        // Check if the email matches the stored admin email
        else if (email.trim() !== process.env.adminemail) {
            return res.status(400).json({ success: false, message: 'You have entered the incorrect email' });
        }

        // Check if the secretkey matches the stored secret key
        else if (secretkey.trim() !== process.env.secretkey) {
            return res.status(400).json({ success: false, message: 'You have entered the incorrect secretkey' });
        }

        // If all validations pass, respond with success
        else {
           return res.status(200).json({ success: true, message: 'Logged in successfully' });
        }
    } catch (err) {
        // Handle any server errors
       return  res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.teacherLogin = async (req , res) => {

    const {email, password} = req.body

    try {

        if(email.trim()=='' || password.trim()=='') {

            return res.status(400).json({ success:false, message: 'All fields are mandatory' });

         }else {

            const teacher = await teacherDataModel.findOne({email}) 

            if(!teacher) {
                return res.status(400).json({ success:false, message: 'user not found' });

            }else {
                const passwordMatch = await bcrypt.compare(password,teacher.password) 

                    if(!passwordMatch) {
                        return res.status(400).json({ success:false, message: 'Incorrect password' });

                    }else {
                        return res.status(200).json({ success:true, message: 'Login successfull' });

                    }
                }
            }
         } catch (error) {

            return res.status(500).json({ success:false, message: 'server error' });
    
        }
    } 
    


exports.verifyEmail = async (req,res)=> {
    const {email} = req.body
    const {role}= req.query
    const emailRegex =/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
 
        try {
            
            if(email.trim()==='') {
                
                return  res.status(400).json({success:false, message:'Plaese enter your email'})
                
            }else if(!emailRegex.test(email)) {
                
                return  res.status(400).json({success:false, message:'Invalid email format'})
                
            }else {
                
                
                if(role=='student') {
                    
                    const student = await studentModel.findOne({email})
                    if(!student) {
                        
                        return  res.status(400).json({success:false, message:'userdetails not found'})
                        
                    }else {
                        
                        givenOtp = mailOtp.otp
                        otpMailer(givenOtp, email)
                        return res.status(200).json({ success: true, message:'Email verified successfully', email,role});
                    }
                } else if(role=='teacher'){

                    const teacher= await teacherDataModel.findOne({email})

                    if(!teacher) {
                        return  res.status(400).json({success:false, message:'userdetails not found'})

                    }else {
                        givenOtp = mailOtp.otp
                        otpMailer(givenOtp, email)
                        return res.status(200).json({ success: true, message:'Email verified successfully', email,role});

                    }
                } else  {
                    return  res.status(400).json({success:false, message:'userdetails not found'})

                }

            }
        }catch(err) {
            return res.status(500).json({ message: 'server error' });
        }

}

exports.forgotOtp = async  (req,res)=> {
    const role = req.query.role
    const email = req.query.email
    const receivedOtp = req.body.join('').trim()
    const actualOtp = givenOtp.toString().trim()

    try {

        if(role=='student') {
            const student = await studentModel.findOne({ email });

            if(!student) {
                return  res.status(400).json({success:false, message:'userdetails not found'})
            }else if (receivedOtp != actualOtp){
                return res.status(400).json({ msg: 'Invalid OTP' });

            }else {
                return res.status(200).json({ success:false, message: 'Otp verification successfull' });
            }

        }else if(role==='teacher') {
            const teacher = await teacherDataModel.findOne({email})
            

            if(!teacher) {
             return  res.status(400).json({success:false, message:'userdetails not found'})

            } else if (receivedOtp != actualOtp){
                return res.status(400).json({ msg: 'Invalid OTP' });

            }else {
                return res.status(200).json({ success:false, message: 'Otp verification successfull' });
            }
        }

    }catch(err) {
                return res.status(500).json({ message: 'server error' });

    }
   
   
}


exports.changePassword = async (req,res)=> {

    const {password,confirmpassword} = req.body
    const {email, role} = req.query

    try {
        
        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;

        if(password.trim=='' || confirmpassword.trim()=='' ) {
            return res.status(400).json({success:false, message:'All fields are mandatory'})

        }else if (!passwordRegex.test(password) || !passwordRegex.test(confirmpassword)) {

            return res.status(400).json({success:false, message:'Invalid passsword format'})

        } else if (confirmpassword != password) {

            return res.status(400).json({success:false, message:'Plaese confirm your password correctly'})

        }else {

            if(role=='student') {

                const student = await studentModel.findOne({email}) 

                    if (!student) {
                        return res.status(400).json({ success:false, message: 'User not found' });


                    } else {
                        const salting = await bcrypt.genSalt(10)    
                        const hashedPassword = await bcrypt.hash(password,salting)
                        await studentModel.updateOne({email:email}, {$set:{password:hashedPassword}})
                        return res.status(200).json({success:true, message:'Pasword changed successfully'})
                    }

                } else if(role=='teacher') {
                    const teacher = await teacherDataModel.findOne({email})

                    if(!teacher) {
                    return res.status(400).json({ success:false, message: 'User not found' });

                    }else {
                        const salting = await bcrypt.genSalt(10)
                        const hashedPassword = await bcrypt.hash(password,salting)
                        await teacherDataModel.updateOne({email}, {$set:{password:hashedPassword}})
                     return res.status(200).json({ success:false, message: '' });

                    }
                }else {
                            return res.status(500).json({ message: 'server error'});
                }

        }

    }  catch(err) {
        return res.status(500).json({ message: 'server error' });

    } 
}












