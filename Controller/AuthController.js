// Import bcrypt library for password hashing
const bcrypt = require('bcrypt');

// Import student and teacher models
const studentModel = require('../Models/studentDetails');
const teacherDataModel = require('../Models/teacherDetails');

// Student Signup Function
exports.studentSignup = async (req, res) => {
    // Extract fields from the request body
    const { name, email, phone, qualification, password, confirmpassword } = req.body;

    // Define regex patterns for password and email validation
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    // Check if any field is empty
    if (name.trim() == '' || email.trim() == '' || phone.trim() == '' || qualification.trim() == '' || password.trim() == '' || confirmpassword.trim() == '') {
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

        // Create a new student document using the student model
        const newSchema = new studentModel({
            name, email, phone, qualification,
            password: hashedPassword
        });

        // Save the student document to the database
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
    if (name.trim() == '' || email.trim() == '' || phone.trim() == '' || qualification.trim() == '' || password.trim() == '' || confirmpassword.trim() == '') {
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
            return res.status(400).json({ message:'User not found' });
        } else {
            // Compare the provided password with the stored hashed password
            const passwordMatch = await bcrypt.compare(password, studentDatas.password);

            // If passwords do not match, respond with an error
            if (!passwordMatch) {
                return res.status(400).json({message:"Incorrect password"});
            } else {
                // If passwords match, respond with success status
                return res.status(200).json({message:'login successful'});
            }
        }
    } catch (error) {
        // If an error occurs, respond with a server error message
        return res.status(500).json({ message:'server error'});
    }
};
