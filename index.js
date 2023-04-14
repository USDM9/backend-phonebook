const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const persons = require('./db')

const app = express()
app.use(express.json())

// Midleware CORS

app.use(cors())

// Page initial

app.get('/', (request, response) => {
  response.send('<h1>Wellcome to my api</h1>')
})

// Information of amount people step 1

app.get('/info', (request, response) => {
  const countPeople = persons.length
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
  response.json(persons)
})

// Return 1 person by his id step 3

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const getPerson = persons.find(person => person.id === id)

  !getPerson ? response.status('404').end() : response.json(getPerson)
})

// Deleting 1 person by his id step 4

app.delete('/api/persons/:id', (request, response) => {
  // const id = Number(request.params.id)
  // const nPersons = persons.filter(p => p.id !== id)

  response.status('204').end()
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
      tokens['response-time'](req, res), 'ms',
      tokens.type(req, res)

    ].join(' ')
  }
}))

function islastName (name, lastName) {
  if (lastName) {
    const temp = lastName.charAt(0).toUpperCase() + lastName.slice(1)
    const fullName = `${name} ${temp}`
    return fullName
  } else {
    return name
  }
}

app.post('/api/persons', (request, res) => {
  const body = request.body
  const name = body.name.charAt(0).toUpperCase() + body.name.slice(1)
  // Valindando datos step 6

  if (!body.number) res.status('400').json({ error: 'must be sent a number' }).end()

  if (!body.name) res.status(400).json({ error: 'must be sent a name' }).end()

  if (persons.find(p => p.name === body.name)) res.status('400').json({ error: 'name alredy exist, name must be unique' }).end()

  const newPerson = {
    id: Math.floor(Math.random() * 1000),
    name: islastName(name, body.lastName),
    number: body.number
  }

  persons.concat(newPerson)
  res.status('201').json(newPerson)
})

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

const PORT = process.env || 3001
app.listen(`${PORT}`)
console.log(`server running on port ${PORT}`)
