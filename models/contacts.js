// const fs = require('fs/promises')
const { model, Schema } = require('mongoose');


const ContactSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Set name for contact'],
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    favorite: {
        type: Boolean,
        enum: [true, false],
        default: false,
    },
}, { versionKey: false });


const Contact = model(
    'Contact',
    ContactSchema,
);


module.exports = (
    Contact
);
