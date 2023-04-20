require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const People = require('./models/mongodb')

const app = express()
app.use(express.json())

app.use(express.static('build'))

// Midleware CORS

app.use(cors())

// Page initial

app.use(morgan(function (tokens, req, res) {
  if (req.method === 'GET' || req.method === 'DELETE') {
    return [
      tokens.method(req, res), 'url:',
      tokens.url(req, res), 'status:',
      tokens.status(req, res), 'content-length:',
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'

    ].join(' ')
  }
}))

app.get('/', (request, response) => {
  response.send('<h1>Wellcome to my api</h1>')
})

// Information of amount people step 1

app.get('/info', async (request, response) => {
  const countPeople = await People.estimatedDocumentCount()
  const date = new Date()

  response.send(`
    <div>
    <h1>Phonebook has info for ${countPeople} people</h1>
    <h3>${date}</h3>
    <div>
    `)
})

// Return all info of the people step 2

app.get('/api/persons', (request, response) => {
  People.find({}).then(person => {
    if (person) {
      console.log('geting all peoples')
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(err => {
    console.log('error in path to return info all people', err)
  })
})

// Return 1 person by his id step 3

app.get('/api/persons/:id', (request, response, next) => {
  People.findById(request.params.id).then(result => {
    if (result) {
      response.json(result)
    } else {
      response.status(404).end()
    }
  }).catch(err => {
    console.log('error in path to return 1 people')
    next(err)
  })
})

// Deleting 1 person by his id step 4

app.delete('/api/persons/:id', (request, response) => {
  People.findByIdAndRemove(request.params.id)
    .then(result => {
      if (result) {
        console.log('deleted', result)
        response.status('204').end()
      } else {
        response.status(404).end()
      }
    })
    .catch(err => {
      console.log('not faund in db the element to delete', err)
    })
})

// Add new person to persons step 5

app.use(morgan(function (tokens, req, res) {
  morgan.token('type', function (req, res) { return JSON.stringify(req.body) })

  if (req.method === 'POST') {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'

    ].join(' ')
  }
}))

// create new person in db

app.post('/api/persons', (request, res, next) => {
  const body = request.body

  const newPerson = new People({
    name: body.name,
    number: body.number,
    date: Date()
  })

  newPerson.save().then(result => {
    console.log('is save newPerson')
    res.status('201').json(result)
  }).catch(err => {
    next(err)
  })
})

// update a people already exist in db

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const updatePerson = {
    name: body.name,
    number: body.number
  }

  const opts = { runValidators: true, new: true }

  People.findByIdAndUpdate(req.params.id, updatePerson, opts)
    .then(result => {
      if (result) {
        res.json(result)
      } else {
        res.status(404).json({ error: 'the number you are trying to update not exixt in database' })
      }
    }).catch(error => next(error))
})

// errorHandler

const errorHandler = (err, req, res, next) => {
  console.log(err.message)
  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }
  next(err)
}

app.use(errorHandler)

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res), 'url:',
    tokens.url(req, res), 'status:',
    tokens.status(req, res), 'content-length:',
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'

  ].join(' ')
}))

app.get('*', (req, res) => {
  res.status('404').end()
})

const PORT = process.env.PORT || 3001
app.listen(`${PORT}`)
console.log(`server running on port ${PORT}`)
