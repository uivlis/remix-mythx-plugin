import React, { Component } from 'react';
import { MythXIssues } from 'truffle-security/lib/issues2eslint';
import Results from './Results.js';

class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ethAddress: "",
            password: "",
            jwt: {},
            refresh: null,
            loginState: "Logout successful",
            buttonValue: "Activate",
            results: {},
            loading: "Not loading"
        };
    
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.activate = this.activate.bind(this);
        this.handleAddressChange = this.handleAddressChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.getJwt = this.getJwt.bind(this);
        this.passMessageToMythX = this.passMessageToMythX.bind(this);
      }
    
      handleAddressChange(event){
        this.setState({
            ethAddress: event.target.value
          }
        );
      }

      handlePasswordChange(event){
        this.setState({
            password: event.target.value
          }
        );
      }

      getJwt(){
        fetch("https://api.mythx.io/v1/auth/login", {
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                "ethAddress": this.state.ethAddress,
                "password": this.state.password
            }),
            method: "POST"
        })
        .then(data => {
            return data.json();
        })
        .then(data => {
            this.setState({jwt: data});
            this.setState({loginState: "Login successful"});
        })
        .catch(error => {
            console.log(error);
        });
      }

      login() {
        this.setState({loading: "Not loading"});
        this.getJwt();
        const self = this;
        const refresh = setInterval(function(){
            fetch("https://api.mythx.io/v1/auth/refresh", {
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    "accessToken": self.state.jwt.access,
                    "refreshToken": self.state.jwt.refresh
                }),
                method: "POST"
            }).then(data => data.json())
            .then(data => self.setState({jwt: data}))
            .catch(error => console.log(error));
        }, /*each 10 minutes, the jwt tokens expire*/ 600000); 
        this.setState({refresh: refresh});
      }

      logout(){
        clearInterval(this.state.refresh);
        fetch("https://api.mythx.io/v1/auth/logout", {
                headers: {
                    "content-type": "application/json",
                    "Authorization":"Bearer " + this.state.jwt.access
                },
                body: JSON.stringify ({
                    "global": false
                }),
                method: "POST"
            }).then(data => data.json())
            .then(data => {
                this.setState({
                    loginState: "Logout successful",
                    buttonValue: "Activate"
                });
            })
            .catch(error => console.log(error));
        }

      componentDidMount() {
        window.addEventListener('message', this.passMessageToMythX, false);
      }

      passMessageToMythX(event){
        if (this.state.buttonValue === "Deactivate"){
            const trustedOrigins = [
                "http://remix-alpha.ethereum.org",
                "http://remix.ethereum.org",
                "https://remix-alpha.ethereum.org",
                "https://remix.ethereum.org"
            ];
            if (trustedOrigins.indexOf(event.origin) === -1) {
                return;
            }
            const { action, key, type, value } = JSON.parse(event.data);
            if (action === 'notification' && key === 'compiler') {
                if (type === 'compilationFinished') {
                    this.setState({loading: "Loading"});
                    this.setState({results: ""});
                    const success = value[0];
                    if (success) {
                        var bytecodes = [];
                        var files = value[1].contracts;
                        for (let file in files) {
                            if (files.hasOwnProperty(file)) {
                                for (let contract in files[file]) {
                                    if (files[file].hasOwnProperty(contract)) {
                                        bytecodes.push({
                                            "contractName": contract,
                                            "bytecode": files[file][contract].evm.bytecode.object,
                                            "sourceMap": files[file][contract].evm.bytecode.sourceMap,
                                            "compiler": {
                                                "version": JSON.parse(files[file][contract].metadata).compiler.version
                                            },
                                            "deployedBytecode": files[file][contract].evm.deployedBytecode.object,
                                            "deployedSourceMap": files[file][contract].evm.deployedBytecode.sourceMap,
                                            "source": value[2].sources[file].content,
                                            "remixPath": file
                                        });
                                    }
                                }
                            }
                        }
                        for (let bytecode in bytecodes){
                            fetch("https://api.mythx.io/v1/analyses", {
                                headers: {
                                    "content-type": "application/json",
                                    "Authorization": "Bearer " + this.state.jwt.access
                                },
                                body: JSON.stringify ({
                                    "data": {
                                        "contractName": bytecodes[bytecode].contractName,
                                        "analysisMode": "quick",
                                        "bytecode": "0x" + bytecodes[bytecode].bytecode
                                    }
                                }),
                                method: "POST"
                            }).then(data => data.json())
                            .then(data => {
                                bytecodes[bytecode].res = data;
                                var self = this;
                                var poll = setInterval(function (){
                                    fetch("https://api.mythx.io/v1/analyses/" + bytecodes[bytecode].res.uuid, {
                                        headers: {
                                            "content-type": "application/json",
                                            "Authorization": "Bearer " + self.state.jwt.access
                                        },
                                        method: "GET"
                                    }).then(data => data.json())
                                    .then(data => {
                                    if (data.status === "Finished"){
                                            fetch("https://api.mythx.io/v1/analyses/" + bytecodes[bytecode].res.uuid + "/issues", {
                                                headers: {
                                                    "content-type": "application/json",
                                                    "Authorization": "Bearer " + self.state.jwt.access
                                                },
                                                method: "GET"
                                            }).then(data => data.json())
                                            .then(data => {
                                                bytecodes[bytecode].res.issues = data;
                                                const issuesObject = new MythXIssues(bytecodes[bytecode]);
                                                var report = bytecodes[bytecode].res.issues[0];
                                                report.issues.map(issue => {
                                                    issue.sourceMap = issue.locations[0].sourceMap;
                                                    return issue;
                                                });
                                                const results = issuesObject.convertMythXReport2EsIssue(report);
                                                self.setState({results: [results, bytecodes[bytecode].remixPath]});
                                                self.setState({loading: "Loaded"});
                                            })
                                            .catch(error => console.log(error));
                                            clearInterval(poll);
                                        };
                                    })
                                    .catch(error => console.log(error));
                                }, 1000);
                            })
                            .catch(error => console.log(error));
                        }
                    } else {
                        console.log("Not as successful as hopeful.");
                    }
                }
            }    
        }
    }

      activate(){
        if(this.state.buttonValue === "Activate"){
            this.setState({buttonValue: "Deactivate"});
            this.setState({results: ""});
            this.setState({loading: "Not loading"});
        } else {
            this.setState({buttonValue: "Activate"});
            window.parent.postMessage(JSON.stringify({
                action: "request",
                key: "editor",
                type: "discardHighlight",
                value: []
            }), "*");
        }
      }
        

    render() {

        let results;

        if (this.state.loading === "Loading"){
            results = <div className="mdl-spinner mdl-js-spinner is-active"></div>;
        } else if (this.state.loading === "Loaded") {
            results = <Results results={this.state.results} />;
        } else {
            results = <p></p>;
        }

        let login;

        if (this.state.loginState === "Login successful"){
            login = <div id="activateSection">
                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"
                        type="button" onClick={this.activate} 
                        id="activate">{this.state.buttonValue}
                    </button>

                    <div id="activateRes">
                        {results}
                    </div>
                    </div> 
        } else {
            login = <p></p>;
        }

      return (

        <div>
            <div className="mdl-grid">
                <div className="mdl-cell mdl-cell--6-col">
                    <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                        <label className="mdl-textfield__label" for="ethAddress">Ethereum address</label>
                        <input className="mdl-textfield__input" type="text" id="ethAddress" value={this.state.ethAddress} onChange={this.handleAddressChange} />
                    </div>
                    <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                        <label className="mdl-textfield__label" for="password">Password</label>
                        <input className="mdl-textfield__input" type="password" id="password" value={this.state.password} onChange={this.handlePasswordChange} />
                    </div>
                </div>
                <div className="mdl-cell mdl-cell--4-col">
                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onClick={this.state.loginState === "Logout successful" ? this.login : this.logout} id="login">{this.state.loginState === "Logout successful" ? "Log In" : "Log Out"}</button>
                </div>
            </div>
            <div className="mdl-grid">
                <div className="mdl-cell mdl-cell--12-col">
                    {login}
                </div>
            </div>
        </div>
      );
    }
  }
  
  export default Login;
  