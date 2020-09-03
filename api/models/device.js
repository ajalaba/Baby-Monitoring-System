const mongoose = require('mongoose');
module.exports = mongoose.model('Device', new mongoose.Schema({
id: String,
device_name: String,
user_name: String,
sensor_data: Array
}));