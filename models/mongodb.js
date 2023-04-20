const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const url = process.env.MONGODB_URI
console.log('connecting to MONGO DB')

mongoose.connect(url).then(
  result => {
    console.log('conected to MongoDB')
  }
)
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const peopleSchema = mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    unique: true,
    required: true
  },
  number: {
    type: String,
    minlength: 8,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
})

peopleSchema.plugin(uniqueValidator)

peopleSchema.set('toJSON', {
  transform: (doc, resObject) => {
    resObject.id = resObject._id
    delete resObject._id
    delete resObject.__v
  }
})

module.exports = mongoose.model('People', peopleSchema)
