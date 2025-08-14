import React from 'react';
import { useAuthenticationStatus } from '@nhost/react';
import { nhost } from './nhost';
import SignUp from './SignUp';
import SignIn from './SignIn';

import Chat from './Chat';

function App() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <SignUp />
        <SignIn />
      </div>
    );
  }

  return (
    <div>
      <Chat />
      <button onClick={() => nhost.auth.signOut()}>Sign out</button>
    </div>
  );
}

export default App;
