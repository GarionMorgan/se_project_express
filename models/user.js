const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    required: [true, "The avatar field is required"],
    validate: {
      validator: (value) => validator.isURL(value),
      message: (props) => `${props.value} is not a valid URL!`,
    },
  },
  email: {
    type: String,
    required: [true, "The email field is required"],
    unique: true, // ensures no duplicates
    lowercase: true,
    trim: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: "Please enter a valid email address",
    },
  },
  password: {
    type: String,
    required: [true, "The password field is required"],
    select: false, // prevents password from being returned by default
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        throw new Error("Invalid email or password");
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new Error("Invalid email or password");
        }

        return user;
      });
    });
};

module.exports = mongoose.model("user", userSchema);
