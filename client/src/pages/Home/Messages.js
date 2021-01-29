// import React, { useEffect } from 'react'
// import { gql, useLazyQuery } from '@apollo/client'
// import { Col } from 'react-bootstrap'

// import { useMessageDispatch, useMessageState } from '../../context/message'

// const GET_MESSAGES = gql`
//   query getMessages($from: String!) {
//     getMessages(from: $from) {
//       uuid
//       from
//       to
//       content
//       createdAt
//     }
//   }
// `

// export default function Messages() {
//   const { users } = useMessageState()
//   const dispatch = useMessageDispatch()

//   const selectedUser = users?.find((u) => u.selected === true)
//   const messages = selectedUser?.messages

//   const [
//     getMessages,
//     { loading: messagesLoading, data: messagesData },
//   ] = useLazyQuery(GET_MESSAGES)

//   useEffect(() => {
//     if (selectedUser && !selectedUser.messages) {
//       getMessages({ variables: { from: selectedUser.username } })
//     }
//   }, [selectedUser])

//   useEffect(() => {
//     if (messagesData) {
//       dispatch({
//         type: 'SET_USER_MESSAGES',
//         payload: {
//           username: selectedUser.username,
//           messages: messagesData.getMessages,
//         },
//       })
//     }
//   }, [messagesData])

//   let selectedChatMarkup
//   if (!messages && !messagesLoading) {
//     selectedChatMarkup = <p>Select a friend</p>
//   } else if (messagesLoading) {
//     selectedChatMarkup = <p>Loading..</p>
//   } else if (messages.length > 0) {
//     selectedChatMarkup = messages.map((message) => (
//       <p key={message.uuid}>{message.content}</p>
//     ))
//   } else if (messages.length === 0) {
//     selectedChatMarkup = <p>You are now connected! send your first message!</p>
//   }

//   return <Col xs={8}>{selectedChatMarkup}</Col>
// }
import React, { Fragment, useEffect, useState } from "react";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { Col, Form } from "react-bootstrap";
import { useMessageDispatch, useMessageState } from "../../context/message";
import Message from "./Message";

const GET_MESSAGES = gql`
  query getMessages($from: String!) {
    getMessages(from: $from) {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation sendMessage($to: String!, $content: String!) {
    sendMessage(to: $to, content: $content) {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

const Messages = () => {
  const { users } = useMessageState();
  const dispatch = useMessageDispatch();
  const [content, setContent] = useState("");

  const selectedUser = users?.find((u) => u.selected === true);
  const messages = selectedUser?.messages;
  const [
    getMessages,
    { loading: messagesLoading, data: messagesData },
  ] = useLazyQuery(GET_MESSAGES);

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: (data) =>
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          username: selectedUser.username,
          message: data.sendMessage,
        },
      }),
    onError: (err) => console.log(err),
  });

  useEffect(() => {
    if (selectedUser && !selectedUser.messages) {
      getMessages({ variables: { from: selectedUser.username } });
    }
  }, [selectedUser]);

  useEffect(() => {
    if (messagesData) {
      dispatch({
        type: "SET_USER_MESSAGES",
        payload: {
          username: selectedUser.username,
          messages: messagesData.getMessages,
        },
      });
    }
  }, [messagesData]);

  const submitMessage = (e) => {
    e.preventDefault();

    if (content.trim() === "" || !selectedUser) return;

    setContent("");

    // mutation for sending the message
    sendMessage({ variables: { to: selectedUser.username, content } });
  };

  let selectedChatMarkup;
  if (!messages && !messagesLoading) {
    selectedChatMarkup = <p>Select a friend</p>;
  } else if (messagesLoading) {
    selectedChatMarkup = <p>Loading..</p>;
  } else if (messages.length > 0) {
    selectedChatMarkup = messages.map((message, index) => (
      <Fragment key={message.uuid}>
        <Message message={message} />
        {index === messages.length - 1 && (
          <div className="invisible">
            <hr className="m-0" />
          </div>
        )}
      </Fragment>
    ));
  } else if (messages.length === 0) {
    selectedChatMarkup = <p>You are now connected! send your first message!</p>;
  }

  return (
    <Col xs={10} md={8} className="p-0">
      <div className="messages-box d-flex flex-column-reverse p-3">
        {selectedChatMarkup}
      </div>
      <div className="px-3 py-2">
        <Form onSubmit={submitMessage}>
          <Form.Group className="d-flex align-items-center m-0">
            <Form.Control
              type="text"
              className="message-input rounded-pill p-4 bg-secondary border-0"
              placeholder="Type a message.."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <i
              className="fas fa-paper-plane fa-2x text-primary ml-2"
              onClick={submitMessage}
              role="button"
            ></i>
          </Form.Group>
        </Form>
      </div>
    </Col>
  );
};

export default Messages;
