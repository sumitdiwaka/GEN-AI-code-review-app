const app = require("./src/app.js")
require("dotenv").config()

const PORT = process.env.PORT_NUM || 6001

app.listen(PORT, () => {
    console.log(`Server is starting on PORT ${PORT}...`)
})