const mongoose = require('mongoose')

if (process.argv < 3) {
  console.log('please provider the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://usdm:${password}@firstclusterdb.uoniula.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url)

const peopleSchema = mongoose.Schema({
  name: String,
  number: Number,
  date: Date
})

const Person = mongoose.model('People', peopleSchema)

if (process.argv[3] && process.argv[4]) {
  const people = new Person({
    name: process.argv[3],
    number: process.argv[4],
    data: new Date()
  })

  people.save().then(result => {
    console.log(`the people saved is: ${people.name} ${people.number}`)
    mongoose.connection.close()
  })
} else {
  Person.find({}).then(result => {
    result.forEach(people => {
      console.log(people.name, people.number)
    })
    mongoose.connection.close()
  })
}

// in doc index.js

/* // Mongo Connection

const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.connect(url)
console.log('conected to DB')

const personSchema = mongoose.Schema({
  name: String,
  number: Number,
  date: Date
})

personSchema.set('toJSON', {
  transform: (doc, retObject) => {
    retObject.id = retObject._id.toString()
    delete retObject._id
    delete retObject.__v
  }
})

const People = mongoose.model('People', personSchema)
*/
