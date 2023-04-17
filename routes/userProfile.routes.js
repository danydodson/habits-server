const express = require("express")
const router = express.Router()

const { isAuthenticated } = require("../middleware/jwt.middleware.js")


//Imported Models

const User = require("../models/User.model")
const Post = require("../models/Post.model")


//Get Routes

// /my-profile/
router.get("/", isAuthenticated, async (req, res, next) => {
    const user = req.payload._id

    const findUser = await User.findById(user)

    res.json(findUser)
})

// /my-profile/myposts
router.get("/my-posts", isAuthenticated, async (req, res, next) => {
    try {
        const user = req.payload._id
        const findUser = await User.findById(user).populate("myPosts")
        const myPostsArray = findUser.myPosts
        res.json(myPostsArray)
    }
    catch (err) { console.log(err) }
})

// /my-profile/library
router.get("/library", isAuthenticated, async (req, res, next) => {
    try {
        const user = req.payload._id
        const findUser = await User.findById(user).populate("mySavedPosts").populate({
            path: "mySavedPosts",
            populate: {
                path: "creator",
                model: "User"
            }
        })
        const mySavedPosts = findUser.mySavedPosts
        res.json(mySavedPosts)
    }
    catch (err) { console.log(err) }
})


//Put Routes 

// /my-profile/edit
router.put("/edit", isAuthenticated, async (req, res, next) => {
    const user = req.payload._id
    const { email, username, password, profileImg, goals, myPreferences } = req.body

    const editUser = await User.findByIdAndUpdate(user, { email: email, username: username, password: password, profileImg: profileImg, goals: goals, myPreferences: myPreferences })

    res.json(editUser)
})

// my-profile/library/:postId/delete

router.put("/library/:postId/delete", isAuthenticated, async (req, res, next) => {
    const user = req.payload._id
    const postId = req.params.postId
    const editUser = await User.findByIdAndUpdate(user, { $pull: { mySavedPosts: postId } })

    res.json("You have unsaved a post")
})

// my-profile/:postId/delete

router.put("/:postId/delete", isAuthenticated, async (req, res, next) => {
    const user = req.payload._id
    const postId = req.params.postId
    const deletePost = await Post.findByIdAndDelete(postId)
    const editUser = await User.findByIdAndUpdate(user, { $pull: { myPosts: postId } })

    res.json("You have deleted a post")
})


module.exports = router
