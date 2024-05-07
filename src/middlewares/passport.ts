import bcrypt from 'bcryptjs'
import { Strategy as LocalStrategy } from 'passport-local'
import connection from '../configs/db'
import User from '../models/User'

const userRepo = connection.getRepository(User)

const localStrategy = new LocalStrategy(
  { usernameField: 'email', passReqToCallback: true },

  // 當請 passport 要驗證時，呼叫此 callback 函式，並帶入驗證資訊驗證
  async (req, username, password, cb) => {
    try {
      const user = await userRepo.findOneBy({ email: username })

      // 如果沒有在資料庫裡找到該位使用者，不提供 passport 任何使用者資訊
      if (!user) {
        return cb(null, false, { message: 'This email is not registered' })
      }

      // 如果從資料庫找到了該名使用者，但密碼錯誤時，不提供 passport 任何使用者資訊
      const isMatched = await bcrypt.compare(password, user.password)
      if (!isMatched) {
        return cb(null, false, { message: 'Email or password is incorrect' })
      }

      return cb(null, user)
    } catch (error) {
      // 如果伺服器端回傳錯誤訊息，提供 passport 錯誤訊息
      cb(error)
    }
  },
)

function setSerializeUser(user: any, done: CallableFunction) {
  done(null, user.id)
}

function setDeserializeUser(id: any, done: CallableFunction) {
  if (!id) return

  // 透過使用者 id 到 Postgres 資料庫尋找用戶完整資訊
  connection
    .getRepository(User)
    .findOneBy({ id })
    .then((data) => {
      done(null, data)
    })
}

export { localStrategy, setSerializeUser, setDeserializeUser }
