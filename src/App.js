import React, { Component } from 'react';
import Login from './Login';

class App extends Component {
  render() {
    return (
      <div>
        <p>MythX Security Verification</p><br/>
        <p>Verify security of your smart contract on complilation. Sign up for a free account on https://mythx.io.</p><br/>
        <p>MythX API Credentials</p><br/>
        <Login />
      </div>
    );
  }
}

export default App;
