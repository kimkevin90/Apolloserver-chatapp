const userResolvers = require("./users");
const messageResolvers = require("./messages");

module.exports = {
  //메시지의 시간 설정 바꾸기
  Message: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  // User: {
  //   createdAt: (parent) => parent.createdAt.toISOString(),
  // },
  Query: {
    ...userResolvers.Query,
    ...messageResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
  Subscription: {
    ...messageResolvers.Subscription,
  },
};
