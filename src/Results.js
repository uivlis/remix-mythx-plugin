import React, { Component } from 'react';

class Results extends Component {

    constructor(props){
        super(props);
        
        this.highlight = this.highlight.bind(this);
    }

    highlight(m){

        window.parent.postMessage(JSON.stringify({
            action: "request",
            key: "editor",
            type: "discardHighlight",
            value: []
        }), "*");

        let message = {
            action: "request",
            key: "editor",
            type: "highlight",
            value: [
                JSON.stringify({
                    start: {
                        line: this.props.results[0].messages[m].line - 1,
                        column: this.props.results[0].messages[m].column
                    },
                    end:
                    {
                        line: this.props.results[0].messages[m].endLine - 1,
                        column: this.props.results[0].messages[m].endCol
                    }
                }),
                this.props.results[1],
                "#e0a0a0"
            ]
        };
        window.parent.postMessage(JSON.stringify(message), "*");
    }

    render(){

        var rows = [];

        for (let message in this.props.results[0].messages) {
            rows.push(
                <div key={message}  style={{fontSize: "12px"}}>
                    <p>{this.props.results[0].messages[message].message}</p>
                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" style={{fontSize: "12px"}} onClick={() => {this.highlight(message)}}>Lines {this.props.results[0].messages[message].line + " "} 
                        - {this.props.results[0].messages[message].endLine}, 
                        Cols {this.props.results[0].messages[message].column + " "} 
                        -  {this.props.results[0].messages[message].endCol}
                    </button>
                    <p>Severity: {this.props.results[0].messages[message].mythXseverity}</p>
                </div>
            );
        }

        return(
            <div style={{fontSize: "15px"}}>
                <p>Errors: <span style={{color: "crimson"}}>{this.props.results[0].errorCount}</span>. Fixable Errors: {this.props.results[0].fixableErrorCount}</p>
                <p>Warnings: <span style={{color: "#86651e"}}>{this.props.results[0].warningCount}</span>. Fixable Warnings: {this.props.results[0].fixableWarningCount}</p>
                {rows}
            </div>
        );
    }
}

export default Results;