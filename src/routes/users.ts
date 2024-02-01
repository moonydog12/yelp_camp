import { Router } from 'express'
import passport from 'passport'
import userController, { UserController } from '../controller/user'
import { storeReturnTo } from '../middlewares/auth'
import catchAsync from '../utils/catchAsync'

const router = Router()
const passportAuthConfig = {
  failureRedirect: '/login',
  failureMessage: true,
}

router
  .route('/login')
  .get(UserController.renderLogin)
  .post(
    storeReturnTo,
    passport.authenticate('local', passportAuthConfig),
    UserController.renderPreviousPage,
  )

router.get('/logout', UserController.logout)

router.get('/register', UserController.renderRegister)

router.post('/register', catchAsync(userController.register))

export default router
