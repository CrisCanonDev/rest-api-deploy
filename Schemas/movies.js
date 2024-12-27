const z = require('zod')

const moviesSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  year: z.number().int().min(1900).max(2025),
  director: z.string(),
  duration: z.number().int(),
  rate: z.number().min(0).max(10).optional(),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }),
  genre: z.array(
    z.enum(['Crime', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Sci-Fi'],
      {
        required_error: 'Movie genre is required',
        invalid_type_error: 'Movie genre must be an array of enum Genre'
      })
  )
})

function validateMovie (object) {
  return moviesSchema.safeParse(object) // Devuelve un objeto con un error y un valor
}
function validatePartialMovie (object) {
  return moviesSchema.partial().safeParse(object) // Pone a todos los campos como opcionales para que no falle si no vienen todos
}

module.exports = { validateMovie, validatePartialMovie }
