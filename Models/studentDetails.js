const mongoose = require('mongoose');

const schema = {
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type:String,
        default:'student'
    },

    verified: {
        type: Boolean,
        default: false
    }
};

const studentDataSchema = new mongoose.Schema(schema, { timestamps: true });
const studentDataModel = mongoose.model('StudentDatas', studentDataSchema);

module.exports = studentDataModel;
