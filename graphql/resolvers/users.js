const bcrypt = require("bcryptjs");
const { UserInputError, AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { Message, User } = require("../../models");
const { JWT_SECRET } = require("../../config/env.json");
const path = require("path");
const fs = require("fs");

module.exports = {
  Query: {
    getUsers: async (_, __, { user }) => {
      try {
        if (!user) throw new AuthenticationError("인증 오류");

        let users = await User.findAll({
          attributes: ["username", "imageUrl", "createdAt"],
          where: { username: { [Op.ne]: user.username } },
        });
        // console.log(users[0].username);

        const allUserMessages = await Message.findAll({
          where: {
            [Op.or]: [{ from: user.username }, { to: user.username }],
          },
          order: [["createdAt", "DESC"]],
        });

        // console.log(allUserMessages);
        users = users.map((otherUser) => {
          //find함수는 주어진 판별 조건에서 만족하는 첫번째 요소의 값을 반환한다.
          const latestMessage = allUserMessages.find(
            (m) => m.from === otherUser.username || m.to === otherUser.username
          );

          otherUser.latestMessage = latestMessage;
          return otherUser;
        });

        return users;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    login: async (_, args) => {
      const { username, password } = args;
      let errors = {};

      try {
        if (username.trim() === "") errors.username = "유저명 입력해줘";
        if (password.trim() === "") errors.password = "패스워드 입력해줘";

        if (Object.keys(errors).length > 0) {
          throw new UserInputError("유저오류", { errors });
        }

        const user = await User.findOne({
          where: { username },
        });

        if (!user) {
          errors.username = "유저없어요";
          throw new UserInputError("유저오류", { errors });
        }

        const correctPassword = await bcrypt.compare(password, user.password);

        if (!correctPassword) {
          errors.password = "잘못된 패스워드";
          throw new UserInputError("패스워드오류", { errors });
        }

        const token = jwt.sign(
          {
            username,
          },
          JWT_SECRET,
          { expiresIn: 60 * 60 }
        );

        user.token = token;

        return {
          ...user.toJSON(),
          createdAt: user.createdAt.toISOString(),
          token,
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    hello: () => "Hello world",
  },
  Mutation: {
    register: async (_, args) => {
      // # 아래 해쉬해준다고 비번바뀌니 let으로 선언
      let { username, email, password, confirmPassword } = args;
      let errors = {};
      try {
        // 인풋 유효성 검사
        if (email.trim() === "") errors.email = "email must not be empty";
        if (username.trim() === "")
          errors.username = "username must not be empty";
        if (password.trim() === "")
          errors.password = "password must not be empty";
        if (confirmPassword.trim() === "")
          errors.confirmPassword = "confirmPassword must not be empty";

        if (password !== confirmPassword)
          errors.confirmPassword = "패스워드 안맞아";

        // // 이메일 유저네임 존재 여부 확인 ~ 근데 테이블 타입이 유니크여서 굳이 안해도됨
        // const userByUsername = await User.findOne({ where: { username } });
        // const userByEmail = await User.findOne({ where: { email } });

        // if (userByUsername) errors.username = "이미있는 유저이름입니다.";
        // if (userByEmail) errors.email = "이미있는 이메일입니다";

        if (Object.keys(errors).length > 0) {
          throw errors;
        }
        //비번 해쉬
        password = await bcrypt.hash(password, 6);

        // 유저 생성
        const user = await User.create({
          username,
          email,
          password,
        });

        // 리턴 유저
        return user;
      } catch (err) {
        console.log(err);
        if (err.name === "SequelizeUniqueConstraintError") {
          err.errors.forEach(
            (e) => (errors[e.path] = `${e.path} 는 이미 있어요`)
          );
        } else if (err.name === "SequelizeValidationError") {
          err.errors.forEach((e) => (errors[e.path] = e.message));
        }
        throw new UserInputError("잘못된 인풋", { errors });
      }
    },
    uploadFile: async (parent, { file }) => {
      const { createReadStream, filename, mimetype, encoding } = await file;
      console.log(file);
      const stream = createReadStream();
      const pathName = path.join(__dirname, `/public/images/${filename}`);
      console.log("패스네임", pathName);
      await stream.pipe(fs.createWriteStream(pathName));

      return {
        url: `http://localhost:4000/images/${filename}`,
      };
    },
  },
};
