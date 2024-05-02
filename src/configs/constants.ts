const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7

const SESSION_OPTION = {
  name: 'session',
  secret: 'password',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: new Date(Date.now() + SEVEN_DAYS),
    maxAge: SEVEN_DAYS,
  },
}

export default SESSION_OPTION
