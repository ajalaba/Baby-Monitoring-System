const mongoose = require('mongoose');
module.exports = mongoose.model('Device', new mongoose.Schema({
id: String,
device_name: String,
user_name: String,
patient_name:String,
temp_data:Array,
humidity_data:Array,
sound_data:Array,
accelerometer_data:Array,
infrared_data:Array,
device_status:Boolean,
location_data:Array,
instructions:Array
}));