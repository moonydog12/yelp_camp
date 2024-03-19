import bcrypt from 'bcryptjs'
import { Strategy as LocalStrategy } from 'passport-local'
import connection from '../configs/db'
import User from '../models/User'

const userRepo = connection.getRepository(User)

const localStrategy = new LocalStrategy(
  { usernameField: 'email', passReqToCallback: true },
  async (req, username, password, cb) => {
    try {
      const user = await userRepo.findOneBy({ email: username })
      if (!user) {
        return cb(null, false, { message: 'This email is not registered' })
      }
      const isMatched = await bcrypt.compare(password, user.password)
      if (!isMatched) {
        return cb(null, false, { message: 'Email or password is incorrect' })
      }

      return cb(null, user)
    } catch (error) {
      cb(error)
    }
  },
)

function setSerializeUser(user: any, done: CallableFunction) {
  done(null, user.id)
}

function setDeserializeUser(id: any, done: CallableFunction) {
  if (!id) return
  connection
    .getRepository(User)
    .findOneBy({ id })
    .then((data) => {
      done(null, data)
    })
}

export { localStrategy, setSerializeUser, setDeserializeUser }
