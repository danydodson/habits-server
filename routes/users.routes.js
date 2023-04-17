const express = require("express")
const router = express.Router()

const { isAuthenticated } = require("../middleware/jwt.middleware.js")


//Imported Models

const User = require("../models/User.model")

//get all users data

router.get("/all", isAuthenticated, async (req, res, next) => {

    try {
        const findAllUsers = await User.find()
        res.json(findAllUsers)
    }
    catch (err) {
        console.log(err)
    }
})


//get all our followers
router.get("/followers", isAuthenticated, async (req, res, next) => {
    const user = req.payload._id

    try {
        const findUser = await User.findById(user).populate("followers")
        res.json(findUser)
    }
    catch (err) {
        console.log(err)
    }
})

//get all the users we follow
router.get("/following", isAuthenticated, async (req, res, next) => {

    const user = req.payload._id

    try {
        const findUser = await User.findById(user).populate("following")
        res.json(findUser)
    }
    catch (err) {
        console.log(err)
    }
})

//get mutuals
router.get("/mutuals", isAuthenticated, async (req, res, next) => {
    const user = req.payload
    try {
        const mutuals = []
        const followingArray = user.following
        const followersArray = user.followers
        const followingData = []
        const followersData = []

        //following
        for (let i = 0; i < followingArray.length; i++) {
            const followingSearch = await User.findById(followingArray[i])
            followingData.push(followingSearch)
        }

        //followers
        for (let i = 0; i < followersArray.length; i++) {
            const followersSearch = await User.findById(followersArray[i])
            followersData.push(followersSearch)
        }

        followingData.map((follower) => {
            followersData.map((following) => {
                if (String(follower.id) === String(following.id)) {
                    return mutuals.push(following)
                }
            })
        })
        res.json(mutuals)

    } catch (error) {
        console.log(error)
    }
})

//get public info about user profile
router.get("/:userId", isAuthenticated, async (req, res, next) => {
    const user = req.payload._id

    try {
        const findUser = await User.findById(req.params.userId).populate("myPosts")
        res.json(findUser)
    }
    catch (err) {
        console.log(err)
    }
})

// /set following - active user adds visited user-id to Following-Array
router.put("/:userId/set-following", isAuthenticated, async (req, res, next) => {
    const user = req.payload._id
    const userToFollow = req.params.userId

    const findUser = await User.findById(user)
    const following = findUser.following
    if (!following.includes(userToFollow)) {
        await User.findByIdAndUpdate(user, { $push: { following: userToFollow } })
    } else {
        await User.findByIdAndUpdate(user, { $pull: { following: userToFollow } })
    }

    res.json(findUser)
})

// /set follower - visited user gets active user added to Follower-Array
router.put("/:userId/set-follower", isAuthenticated, async (req, res, next) => {
    const user = req.payload._id
    const userToFollow = req.params.userId

    const findUser = await User.findById(userToFollow)
    const follower = findUser.followers

    if (!follower.includes(user)) {
        await User.findByIdAndUpdate(userToFollow, { $push: { followers: user } })
    } else {
        await User.findByIdAndUpdate(userToFollow, { $pull: { followers: user } })
    }

    res.json(findUser)
})

// /follow
router.put("/:userId/follow", isAuthenticated, async (req, res, next) => {
    const user = req.payload._id
    const userToFollow = req.params.userId

    const currentUserData = await User.findByIdAndUpdate(user, { $push: { following: userToFollow } })
    const userData = await User.findByIdAndUpdate(userToFollow, { $push: { followers: user } })

    res.json({ currentUserData, userData })
})

// /unfollow
router.put("/:userId/unfollow", isAuthenticated, async (req, res, next) => {
    const user = req.payload._id
    const userToFollow = req.params.userId

    const currentUserData = await User.findByIdAndUpdate(user, { $pull: { following: userToFollow } })
    const userData = await User.findByIdAndUpdate(userToFollow, { $pull: { followers: user } })

    res.json({ currentUserData, userData })
})


module.exports = router