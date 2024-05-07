import { TypeormStore } from 'connect-typeorm'
import connection from '../configs/db'
import Session from '../models/Session'

const ONE_DAY = 1000 * 60 * 60 * 24
const sessionRepository = connection.getRepository(Session)
const SESSION_OPTION = {
  name: 'session',
  secret: 'password',
  resave: false, // required: force lightweight session keep alive (touch)
  saveUninitialized: false, // recommended: only save session when data exists
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: new Date(Date.now() + ONE_DAY),
    maxAge: ONE_DAY,
  },

  store: new TypeormStore({
    cleanupLimit: 2,
  }).connect(sessionRepository),
}

export default SESSION_OPTION
