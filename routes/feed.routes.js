const express = require("express")
const router = express.Router()

const { isAuthenticated } = require("../middleware/jwt.middleware.js")

//imported models
const User = require("../models/User.model")
const Post = require("../models/Post.model")
const Comment = require("../models/Comment.model")

//GET routes

// >> Most Popular Posts
router.get("/", isAuthenticated, async (req, res, next) => {
    let preferedPosts = []
    let sortedPosts
    try {

        //first, we check the user preferences
        const user = req.payload._id
        const findUser = await User.findById(user)
        const { myPreferences } = findUser

        //then, we find posts related to preferences
        const findPosts = await Post.find().populate("creator")
        findPosts.filter((post) => {
            post.categories.forEach((category) => {
                myPreferences.forEach((preference) => {
                    if (category === preference) {
                        preferedPosts.push(post)
                    }
                })

            })
        })

        //then, we sort the post based on ranking
        sortedPosts = [...preferedPosts].sort((a, b) => {
            if (a.ranking < b.ranking) return 1
            if (a.ranking > b.ranking) return -1
            return 0
        })
        const uniqueArray = [...new Set(sortedPosts)]
        res.json(uniqueArray)
    }
    catch (err) { console.log(err) }
})

// >> All posts
router.get("/all", isAuthenticated, async (req, res, next) => {
    try {
        const findAllPosts = await Post.find().populate("creator")

        allSortedPosts = [...findAllPosts].sort((a, b) => {
            if (a.createdAt < b.createdAt) return 1
            if (a.createdAt > b.createdAt) return -1
            return 0
        })
        res.json(allSortedPosts)
    } catch (error) {
        console.log(error)
    }

})

// >> People we follow Posts
router.get("/following", isAuthenticated, async (req, res, next) => {
    const user = req.payload._id
    const findUser = await User.findById(user)
    //find people we follow posts
    const myFriendsPosts = []
    const myFriends = findUser.following

    for (let i = 0; i < myFriends.length; i++) {
        const searchingPosts = await Post.find({ creator: myFriends[i] }).populate("creator")
        myFriendsPosts.push(searchingPosts)
    }
    //then we sort based on time created
    const allPosts = []
    myFriendsPosts.forEach((friend) => {
        friend.forEach((post) => {
            allPosts.push(post)
        })
    })

    friendSortedPosts = [...allPosts].sort((a, b) => {
        if (a.createdAt < b.createdAt) return 1
        if (a.createdAt > b.createdAt) return -1
        return 0
    })
    const uniqueArray = [...new Set(friendSortedPosts)]
    res.json(uniqueArray)
})

// >> Newest Posts
router.get("/fresh", isAuthenticated, async (req, res, next) => {
    let preferedPosts = []
    let sortedPosts
    try {

        //first, we check the user preferences
        const user = req.payload._id
        const findUser = await User.findById(user)
        const { myPreferences } = findUser

        //then, we find posts related to preferences
        const findPosts = await Post.find().populate("creator")
        findPosts.filter((post) => {
            post.categories.forEach((category) => {
                myPreferences.forEach((preference) => {
                    if (category === preference) {
                        preferedPosts.push(post)
                    }
                })

            })
        })

        //then, we sort the post based on date
        sortedPosts = [...preferedPosts].sort((a, b) => {
            if (a.createdAt < b.createdAt) return 1
            if (a.createdAt > b.createdAt) return -1
            return 0
        })

        //then we delete duplicates
        const uniqueArray = [...new Set(sortedPosts)]
        res.json(uniqueArray)
    }
    catch (err) { console.log(err) }
})

//Post Details
router.get("/:postId", async (req, res, next) => {
    try {
        const findPost = await Post.findById(req.params.postId).populate("creator").populate("commentsId").populate({
            path: 'commentsId',
            populate: {
                path: 'creator',
                model: 'User',
            }
        })
        res.json(findPost)
    }
    catch (err) {
        console.log(err)
    }
})

//PUT routes

//>>Save post

router.put("/:postId/save", isAuthenticated, async (req, res, next) => {
    try {
        const savedPostId = req.params.postId
        const user = req.payload._id
        const editUser = await User.findByIdAndUpdate(user, { $push: { mySavedPosts: savedPostId } })
        res.json(editUser)
    }
    catch (err) {
        console.log(err)
    }
})

//Unsave post
router.put("/:postId/unsave", isAuthenticated, async (req, res, next) => {
    try {
        const savedPostId = req.params.postId
        const user = req.payload._id
        const editUser = await User.findByIdAndUpdate(user, { $pull: { mySavedPosts: savedPostId } })
        res.json(editUser)
    }
    catch (err) {
        console.log(err)
    }
})

//Upvote post
router.put("/:postId/upvote", isAuthenticated, async (req, res, next) => {
    try {
        const postId = req.params.postId
        const user = req.payload._id

        const findPost = await Post.findById(postId)
        if (findPost.upvotes.indexOf(user) == -1) {
            const editPost = await Post.findByIdAndUpdate(postId, { $push: { upvotes: user } })
            res.json(editPost)
        }
    }
    catch (err) {
        console.log(err)
    }
})

//Downvote post
router.put("/:postId/downvote", isAuthenticated, async (req, res, next) => {
    try {
        const postId = req.params.postId
        const user = req.payload._id

        const findPost = await Post.findById(postId)
        if (findPost.downvotes.indexOf(user) == -1) {
            const editPost = await Post.findByIdAndUpdate(postId, { $push: { downvotes: user } })
            res.json(editPost)
        }
    }
    catch (err) {
        console.log(err)
    }
})

//POST routes

// create a comment on a post
router.post("/:postId/new-comment", isAuthenticated, async (req, res, next) => {
    const { content } = req.body
    const postId = req.params.postId
    const user = req.payload._id
    const newComment = await Comment.create({ creator: user, content: content, ofPost: postId })
    const editPost = await Post.findByIdAndUpdate(postId, { $push: { commentsId: newComment._id } }, { new: true })
    res.json(newComment)
})

//create a new post
router.post("/new-post", isAuthenticated, async (req, res, next) => {
    try {
        const user = req.payload._id
        const { title, description, categories, type, image } = req.body
        const newPost = await Post.create({ creator: user, title: title, description: description, categories: categories, type: type, image: image })
        const postId = newPost._id
        const editUser = await User.findByIdAndUpdate(user, { $push: { myPosts: postId } })
        res.json("Here you can make a post! Awesome, right?")
    }
    catch (err) {
        console.log(err)
    }
})

//DELETE routes

router.delete("/:commentId/delete", isAuthenticated, async (req, res, next) => {
    try {
        const commentId = req.params.commentId
        await Comment.findByIdAndDelete(commentId)
    } catch (error) {
        console.log(error)
    }
    res.json("deleted")
})


module.exports = router