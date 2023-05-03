const { User } = require('../models');
const { AuthenticationErr } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

// Define the resolvers object, which maps to the Query and Mutation types in the typedefs.js schema
const resolvers = {
  Query: {
    // Defines a resolver for the query and returns the current user's login information
    me: async (parent, args, context) => {
      if (context.user) {
        // retrieves the logged in user's data from the database and returns it
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
        return userData;
      }
      // If the user is not logged in, throw the Authentication Error
      throw new AuthenticationErr('user not logged in');
    }
  },
  Mutation: {
    // Defines a resolver for the mutation addUser which creates a new user in the database
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    // Defines a resolver for the  mutation login which logs in a user with an email and password
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        // If no user is found with the given email, throw the Authentication Error
        throw new AuthenticationErr('Username and/or password is incorrect')
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        // If the password is incorrect, throw the Authentication Error
        throw new AuthenticationErr('username and/or password is incorrect')
      }
      const token = signToken(user);
      return { token, user };
    },
    // Define a resolver for the mutation saveBook which adds a book to the current user's list of saved books
    saveBook: async (parent, { book }, context) => {
      if (context.user) {
        //Add the book to the logged in user's savedBooks array and return the updated user
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book } },
          { new: true }
        )
        return updatedUser;
      }
      // If the user is not logged in, throw the Authentication Error
      throw new AuthenticationErr('Please log in first!')
    },
    // Define a resolver for the mutationn removeBook which removes a book from the current user's list of saved books
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        // Removes the book with the given ID from the logged in user's savedBooks array and return the updated user
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        )
        return updatedUser;
      }
    }
  }
};

module.exports = resolvers;