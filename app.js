const express = require('express')
const movies = require('./movies.json')
const crypto = require('node:crypto')
const cors = require('cors')

const { validateMovie, validatePartialMovie } = require('./Schemas/movies')

const app = express()

app.use(express.json()) // Middleware para parsear el body de las peticiones
app.disable('x-powered-by') // Ocultar el header de express

// normal methods : GET,HEAD, POST
// special methods : PUT, PATCH, DELETE => CORS Preflight

// OPTIONS => CORS Preflight
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))
const ACCEPTED_ORGINS = [
  'https://myapp.com',
  'http://localhost:8080'
]

// All the resources that are MOVIES are identified by the /movies path
app.get('/movies', (req, res) => {
  const origin = req.header('Origin')
  if (ACCEPTED_ORGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  } const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movies => movies.id === id)
  if (movie) return res.json(movie)

  res.status(404).json({ error: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }

  // Esto no es RESTful, pero lo hacemos para simplificar ya que estamos guardando en memoria
  movies.push(newMovie)
  res.status(201).json(newMovie) // 201 es el status code de created & actualizar la cache del cliente
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex < 0) {
    return res.status(404).json({ error: 'Movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

const PORT = process.env.PORT || 3030
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
