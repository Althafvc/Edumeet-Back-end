const mongoose = require('mongoose')

const schema = {
    name: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    phone: {
        type: Number,
        required:true
    },
    qualification: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    role: {
        type:String,
        default:'teacher'
    },
    verified: {
        type:Boolean,
        default:false
    }
}

const teacherDataSchema = new mongoose.Schema(schema,{timestamps:true})
const teacherDataModel = new mongoose.model('TeacherDatas', teacherDataSchema)

module.exports = teacherDataModel;

