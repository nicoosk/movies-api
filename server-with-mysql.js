import { createApp } from './app.js'

import { MovieModel } from './models/mysql/MovieModel.js'

createApp({ movieModel: MovieModel })
