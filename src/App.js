import React, { Component } from 'react';
import Login from './Login';

class App extends Component {
  render() {
    return (
      <div>
        <div class="demo-card-wide mdl-card mdl-shadow--2dp">
          <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">Remix MythX Plugin</h2>
          </div>
          <div class="mdl-card__supporting-text">
            Verify security of your smart contract on complilation. 
          </div>
          <div class="mdl-card__actions mdl-card--border">
            <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" href="https://mythx.io">
              Get Started
            </a>
          </div>
        </div>
        <Login />
      </div>
    );
  }
}

export default App;
