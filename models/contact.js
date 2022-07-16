// const fs = require('fs/promises')
const { model, Schema } = require('mongoose');


const contactSchema = new Schema({
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
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
}, { versionKey: false });


const Contact = model(
  'Contact',
  contactSchema,
);


module.exports = (
  Contact
);
