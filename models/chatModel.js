const mongoose = require("mongoose");
const msgSchema = new mongoose.Schema({
    message: {
        type: String,
		required: true,
     },
     name:{
        type:String,
        required: true,
     },
     room: {
		type: String,
		required: true,
	},
     createdAt: {
		type: Date,
		default: Date.now,
	},
    select:{
        type: String,
        required: true,
    }
});

// const Msg=mongoose.model('msg',msgSchema);
// module.exports=Msg;
module.exports.Msg = mongoose.model('Msg', msgSchema);
