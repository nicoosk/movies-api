import 'dotenv/config'
import { Pool } from 'pg'


const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false
  }
});

export class MovieModel {
  static async getAll ({ genre }) {
    if (genre) {
      const genreRes = await pool.query(
        'SELECT id FROM genres WHERE name = $1', [genre.charAt(0).toUpperCase() + genre.slice(1)]
      )

      if (genreRes.rowCount === 0) return []

      const movieRes = await pool.query(
        `SELECT m.id::text, m.title, m.year, m.director, m.duration, m.poster, m.rate
        FROM movies m
        JOIN movie_genres mg ON mg.movie_id = m.id
        WHERE mg.genre_id = $1`,
        [genreRes.rows[0].id]
      )

      if (movieRes.rowCount === 0) return []

      return movieRes.rows
    }

    const movies = await pool.query(
      'SELECT id::text, title, year, director, duration, poster, rate FROM movies'
    )

    if (movies.rowCount === 0) return []

    return movies.rows
  }

  static async getById ({ id }) {
    const movie = await pool.query(
      'SELECT id::text, title, year, director, duration, poster, rate FROM movies WHERE id = $1', [id]
    )
    if (movie.rowCount === 0) return null

    return movie.rows[0]
  }

  static async create ({ input }) {
    const {
      title,
      year,
      duration,
      director,
      rate,
      poster
    } = input

    const newMovie = await pool.query(
      `INSERT INTO movies (title, year, duration, director, rate, poster)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id::text, title, year, duration, director, rate, poster`, [title, year, duration, director, rate, poster]
    )

    if (newMovie.rowCount === 0) return []

    return newMovie.rows[0]
  }

  static async delete ({ id }) {
    const res = await pool.query(
      'DELETE FROM movies WHERE id = $1', [id]
    )

    return res.rowCount > 0
  }

  static async update ({ id, input }) {
    const entries = Object.entries(input)
    if (entries.length === 0) return null

    const sets = entries.map(([col], index) => `"${col}" = $${index + 1}`)

    const values = entries.map(([, value]) => value)

    values.push(id)

    const updatedMovie = await pool.query(
      `UPDATE movies 
      SET ${sets.join(', ')}
      WHERE id = $${values.length}
      RETURNING id::text, title, year, duration, director, rate, poster`, values
    )
    if (updatedMovie.rowCount === 0) return null

    return updatedMovie.rows[0]
  }
}
