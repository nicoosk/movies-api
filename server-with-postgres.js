import { createApp } from './app.js'

import { MovieModel } from './models/postgres/MovieModel.js'

createApp({ movieModel: MovieModel })
