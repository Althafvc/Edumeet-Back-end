const bcrypt = require('bcrypt'); // Import bcrypt library for password hashing
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const mailOtp = require('./Middlewares/mailotp')
const otpMailer = require('../Utilities/otpmailer')
const studentModel = require('../Models/studentDetails');
const teacherDataModel = require('../Models/teacherDetails');
let givenOtp = ''

// Student Signup Function
exports.studentSignup = async (req, res) => {
    // Extract fields from the request body
    const { name, email, phone, qualification, password, confirmpassword } = req.body;
    
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
            password: hashedPassword
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
  console.log(req.body);
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
        console.log('yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy');
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
        } else {
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
                console.log(err, 'Verified field update failed');
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
                console.log(err, 'Verified field update failed');
                return res.status(500).json({ msg: 'Server error' });
            }
        }
        }
        
    } catch (err) {
        // Log error and return server error response if email lookup fails
        console.log(err, 'Email lookup failed');
        return res.status(500).json({ msg: 'Server error'});
    }
};

