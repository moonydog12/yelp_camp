import bcrypt from 'bcryptjs'

import { Strategy as LocalStrategy } from 'passport-local'
import { dataSource } from '../db'
import { User } from '../models/User'

const userRepo = dataSource.getRepository(User)

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

function setDeserializeUser(user: any, done: CallableFunction) {
  if (!user) return
  dataSource
    .getRepository(User)
    .findOneBy({ id: user.id })
    .then((user) => {
      done(null, user)
    })
}

export { localStrategy, setSerializeUser, setDeserializeUser }
