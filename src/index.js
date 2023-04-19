const express = require('express')
const app = express()

const route = require('./Routes/route')

app.use(express.json())

app.use('/', route)

app.listen(3500, function () {
    console.log("Express app is running on port 3500")
})




