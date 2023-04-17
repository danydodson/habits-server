const { Schema, model } = require("mongoose")

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
      unique: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required."],
    },

    userStatus: {
      type: String,
      enum: ['Admin', 'Mod', 'Regular'],
      default: 'Regular',
    },

    profileImg: {
      type: String,
      default: 'https://img.freepik.com/free-vector/organic-flat-people-meditating-illustration_23-2148906556.jpg'
    },

    goals: {
      type: String,
      default: 'No goals set yet'
    },

    myPreferences: [{
      type: String,
      enum: ['Health', 'Tech', 'Mindfulness', 'Finances', 'Self Confidence'] //Cross Check with Posts categories
    }],

    myPosts: [{
      type: Schema.Types.ObjectId,
      ref: 'Post'
    }],

    mySavedPosts: [{
      type: Schema.Types.ObjectId,
      ref: 'Post'
    }],

    myComments: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }],

    myUpVotes: [{
      type: Schema.Types.ObjectId,
      ref: 'Post'
    }],

    following: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],

    followers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],

    friends: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },

  {
    timestamps: true,
  }
)

const User = model("User", userSchema)

module.exports = User