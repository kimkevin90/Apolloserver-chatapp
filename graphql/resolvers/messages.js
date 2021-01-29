const {
  UserInputError,
  AuthenticationError,
  withFilter,
} = require("apollo-server");
const { Op } = require("sequelize");
const { Message, User } = require("../../models");
// const { PubSub } = require("apollo-server");

// const pubsub = new PubSub();
module.exports = {
  Query: {
    getMessages: async (parent, { from }, { user }) => {
      try {
        if (!user) throw new AuthenticationError("인증 오류");

        const otherUser = await User.findOne({
          where: { username: from },
        });

        if (!otherUser) throw new UserInputError("유저를 찾을수 없어");

        const usersnames = [user.username, otherUser.username];

        const messages = await Message.findAll({
          where: {
            from: { [Op.in]: usersnames },
            to: { [Op.in]: usersnames },
          },
          order: [["createdAt", "DESC"]],
        });

        return messages;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    sendMessage: async (parent, { to, content }, { user, pubsub }) => {
      try {
        if (!user) throw new AuthenticationError("인증 오류");

        const recipient = await User.findOne({ where: { username: to } });

        if (!recipient) {
          throw new UserInputError("수령할 유저없어");
        } else if (recipient.username === user.username) {
          throw new UserInputError("너자신한테는 못보내");
        }

        if (content.trim() === "") {
          throw new UserInputError("Message가 비었어요");
        }

        const message = await Message.create({
          from: user.username,
          to,
          content,
        });

        pubsub.publish("NEW_MESSAGE", { newMessage: message });

        return message;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Subscription: {
    newMessage: {
      subscribe: (_, __, { pubsub, user }) => {
        if (!user) throw new AuthenticationError("인증오류펍섭");
        return pubsub.asyncIterator(["NEW_MESSAGE"]);
      },
    },
  },
};
