import app from './app'
import { connectToDB } from './db'

app.listen(process.env.PORT, () => {
  connectToDB()
  console.log(`listening on port ${process.env.PORT}`)
})
