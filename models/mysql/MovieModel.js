import mysql from 'mysql2/promise'

const config = {
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: '',
  database: 'moviesdb'
}

const connection = await mysql.createConnection(config)

export class MovieModel {
  static async getAll ({ genre }) {
    if (genre) {
      const [genres] = await connection.query(
        'SELECT id FROM genres WHERE name = ?', [genre]
      )
      if (genres.length === 0) return []

      const [movieGenres] = await connection.query(
        'SELECT movie_id FROM movie_genres WHERE genre_id = ?', [genres[0].id]
      )

      if (movieGenres.length === 0) return []

      const [movies] = await connection.query(
        'SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movies WHERE id IN (?)', [movieGenres[0].movie_id]
      )

      if (movies.length === 0) return []

      return movies[0]
    }

    const [movies] = await connection.query(
      'SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movies'
    )

    if (movies.length === 0) return []

    return movies
  }

  static async getById ({ id }) {
    const [movie] = await connection.query(
      `SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM
      movies WHERE id = UUID_TO_BIN(?)`, [id]
    )

    if (movie.length === 0) return null

    return movie[0]
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

    const [uuidResult] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuidResult

    try {
      await connection.query(
        'INSERT INTO movies (id, title, year, duration, director, rate, poster) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?);',
        [uuid, title, year, duration, director, rate, poster]
      )
    } catch (err) {
      throw new Error('Error creating movie')
    }

    const [movies] = await connection.query(
      'SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movies WHERE id = UUID_TO_BIN(?)', [uuid]
    )
    return movies[0]
  }

  static async delete ({ id }) {
    const [result] = await connection.query(
      'DELETE FROM movies WHERE id = UUID_TO_BIN(?)', [id]
    )

    if (result.affectedRows === 0) return false

    return true
  }

  static async update ({ id, input }) {
    const entries = Object.entries(input)
    if (entries.length === 0) return null

    const sets = entries.map(([key]) => `\`${key}\` = ?`)
    const values = entries.map(([, value]) => value)

    const [result] = await connection.query(
      `UPDATE movies SET ${sets.join(', ')} WHERE id = UUID_TO_BIN(?)`, [values, id]
    )

    if (result.affectedRows === 0) return null
    const [movies] = await connection.query(
      'SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movies WHERE id = UUID_TO_BIN(?)', [id]
    )
    if (movies.length === 0) return null

    return movies[0]
  }
}
