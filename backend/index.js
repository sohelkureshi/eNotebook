const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');

connectToMongo();

const app = express()
const port = 5000

app.use(cors())
app.use(express.json()) // to use req.body

app.get('/', (req, res) => {
  res.json({ status: true, message: "iNotebook backend running successfully" })
})

// available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`iNotebook backend listening on port ${port} at http://localhost:${port}`)
})
