const { gql } = require("apollo-server");

module.exports = gql`
  type User {
    username: String!
    email: String!
    createdAt: String!
    token: String
    imageUrl: String
    latestMessage: Message
  }
  type Query {
    # findall은 []로 감싸기
    getUsers: [User]!
    login(username: String!, password: String!): User!
    getMessages(from: String!): [Message]!
    hello: String!
  }
  type Message {
    uuid: String!
    content: String!
    from: String!
    to: String!
    createdAt: String!
  }
  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): User!
    sendMessage(to: String!, content: String!): Message!
    uploadFile(file: Upload!): File!
  }
  type Subscription {
    newMessage: Message!
  }
  type File {
    url: String!
  }
`;
