require("dotenv").config()
require("./db")
const express = require("express")

const app = express()
require("./config")(app)

const indexRoutes = require("./routes/index.routes")
app.use("/api", indexRoutes)

const authRoutes = require("./routes/auth.routes")
app.use("/api/v1/auth", authRoutes)

const feedRoutes = require("./routes/feed.routes")
app.use("/api/feed", feedRoutes)

const userProfileRoutes = require("./routes/userProfile.routes")
app.use("/api/my-profile", userProfileRoutes)

const uploadRoutes = require("./routes/upload.routes")
app.use("/api/upload", uploadRoutes)

const userRoutes = require("./routes/users.routes")
app.use("/api/user", userRoutes)

require("./error-handling")(app)

module.exports = app
