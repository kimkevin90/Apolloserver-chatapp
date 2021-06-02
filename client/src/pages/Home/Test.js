import React from 'react'
import { gql, useQuery, client, readQuery } from "@apollo/client";

const GET_USERS = gql`
  query getUsers {
    getUsers {
      username
      createdAt
      imageUrl
      latestMessage {
        uuid
        from
        to
        content
        createdAt
      }
    }
  }
`;

export default function Test() {
    const { todo } = client.readQuery({
        query: GET_USERS,
      });

      console.log(todo)
    return (
        <div>
            테스트
        </div>
    )
}
