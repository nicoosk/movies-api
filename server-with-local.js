import { createApp } from './app.js'

import { MovieModel } from './models/local-file-system/MovieModel.js'

createApp({ movieModel: MovieModel })
