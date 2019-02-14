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
        }), "https://remix-mythx-plugin.herokuapp.com/");

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
        window.parent.postMessage(JSON.stringify(message), "https://remix-mythx-plugin.herokuapp.com/");
    }

    render(){

        var rows = [];

        for (let message in this.props.results[0].messages) {
            rows.push(
                <div key={message}>
                    <p><strong>{this.props.results[0].messages[message].message}</strong></p>
                    <button style={{"backgroundColor": "#f0f0f0"}} onClick={() => {this.highlight(message)}}>Lines {this.props.results[0].messages[message].line + " "} 
                        to {this.props.results[0].messages[message].endLine}, 
                        Cols {this.props.results[0].messages[message].column + " "} 
                        to  {this.props.results[0].messages[message].endCol}
                    </button>
                    <p>Severity: {this.props.results[0].messages[message].mythXseverity}</p>
                </div>
            );
        }

        return(
            <div>
                <p>Errors: {this.props.results[0].errorCount}. Fixable Errors: {this.props.results[0].fixableErrorCount}</p>
                <p>Warnings: {this.props.results[0].warningCount}. Fixable Warnings: {this.props.results[0].fixableWarningCount}</p>
                {rows}
            </div>
        );
    }
}

export default Results;