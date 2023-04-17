const express = require("express")
const router = express.Router()
const fileUploader = require("../config/cloudinary.config")

const { isAuthenticated } = require("../middleware/jwt.middleware.js")


router.post("/", fileUploader.single("image"), isAuthenticated, (req, res, next) => {

  if (!req.file) {
    next(new Error("No file uploaded!"))
    return
  }
  res.json({ fileUrl: req.file.path })
})

module.exports = router