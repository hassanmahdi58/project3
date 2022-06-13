const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');

        return userData;
      }

      throw new AuthenticationError('Not logged in');
    },
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },
    saveMeal: async (parent, {mealInfo}, context) => {
      if(context.user){
          const MealArray = await User.findByIdAndUpdate({ _id: context.user._id }, 
              { $addToSet: { savedMeals: mealInfo } }, 
              { new: true, runValidators: true });
              return MealArray;
      }

      throw new AuthenticationError('You Must Be Logged In!');
  },
  removeMeal: async (parent, { mealId }, context) => {

    if(context.user){
    const deleteMeal = await User.findOneAndUpdate({ _id: context.user._id },
    { $pull: { savedMeals: { mealId } } },
    { new: true });
    return deleteMeal;
    }
    throw new AuthenticationError('You Must Be Logged In!');
},
},
};


module.exports = resolvers;