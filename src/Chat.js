import React, { useState } from 'react';
import { useQuery, useMutation, useSubscription } from 'urql';

const GET_CHATS = `
  query GetChats {
    chats {
      id
      created_at
    }
  }
`;

const CREATE_CHAT = `
  mutation CreateChat {
    insert_chats_one(object: {}) {
      id
    }
  }
`;

function Chat() {
  const [selectedChat, setSelectedChat] = useState(null);

  const [chatsResult, reexecuteQuery] = useQuery({ query: GET_CHATS });
  const [createChatResult, createChat] = useMutation(CREATE_CHAT);

  const handleCreateChat = async () => {
    await createChat();
    reexecuteQuery();
  };

  if (chatsResult.fetching) {
    return <div>Loading...</div>;
  }

  if (chatsResult.error) {
    return <div>Error: {chatsResult.error.message}</div>;
  }

  return (
    <div>
      <h1>Chat</h1>
      <div>
        <h2>Chats</h2>
        <button onClick={handleCreateChat} disabled={createChatResult.fetching}>
          New Chat
        </button>
        <ul>
          {chatsResult.data.chats.map((chat) => (
            <li key={chat.id} onClick={() => setSelectedChat(chat.id)}>
              {chat.id}
            </li>
          ))}
        </ul>
      </div>
      <div>
        {selectedChat ? (
          <Messages chat_id={selectedChat} />
        ) : (
          <h3>Select a chat to start messaging</h3>
        )}
      </div>
    </div>
  );
}

function Messages({ chat_id }) {
  const GET_MESSAGES = `
    query GetMessages($chat_id: uuid!) {
      messages(where: {chat_id: {_eq: $chat_id}}, order_by: {created_at: asc}) {
        id
        message
        is_bot
        created_at
      }
    }
  `;

  const SEND_MESSAGE = `
    mutation SendMessage($chat_id: uuid!, $message: String!) {
      insert_messages_one(object: {chat_id: $chat_id, message: $message}) {
        id
      }
    }
  `;

  const NEW_MESSAGES = `
    subscription NewMessages($chat_id: uuid!) {
      messages(where: {chat_id: {_eq: $chat_id}}, order_by: {created_at: asc}) {
        id
        message
        is_bot
        created_at
      }
    }
  `;

  const SEND_ACTION = `
    mutation SendMessage($chat_id: uuid!, $message: String!) {
      sendMessage(chat_id: $chat_id, message: $message) {
        message
      }
    }
  `;

  const [message, setMessage] = useState('');

  const [messagesResult] = useQuery({ query: GET_MESSAGES, variables: { chat_id } });
  const [sendMessageResult, sendMessage] = useMutation(SEND_MESSAGE);
  const [sendActionResult, sendAction] = useMutation(SEND_ACTION);
  const [newMessagesResult] = useSubscription({ query: NEW_MESSAGES, variables: { chat_id } });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    await sendMessage({ chat_id, message });
    await sendAction({ chat_id, message });
    setMessage('');
  };

  if (messagesResult.fetching) {
    return <div>Loading...</div>;
  }

  if (messagesResult.error) {
    return <div>Error: {messagesResult.error.message}</div>;
  }

  const messages = newMessagesResult.data ? newMessagesResult.data.messages : (messagesResult.data ? messagesResult.data.messages : []);

  return (
    <div>
      <h2>Messages</h2>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            {msg.is_bot ? 'Bot' : 'User'}: {msg.message}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" disabled={sendMessageResult.fetching}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
