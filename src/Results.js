import React, { Component } from 'react';

class Results extends Component {

    constructor(props){
        super(props);
    }

    render(){

        var rows = [];

        for (let message in this.props.results.messages) {
            rows.push(
                <div key={message}>
                    <p><strong>{this.props.results.messages[message].message}</strong></p>
                    <p>Lines {this.props.results.messages[message].line + " "} 
                        to {this.props.results.messages[message].endLine}, 
                        Cols {this.props.results.messages[message].column + " "} 
                        to  {this.props.results.messages[message].endCol}
                    </p>
                    <p>Severity: {this.props.results.messages[message].mythXseverity}</p>
                </div>
            );
        }

        return(
            <div>
                <p>Errors: {this.props.results.errorCount}. Fixable Errors: {this.props.results.fixableErrorCount}</p>
                <p>Warnings: {this.props.results.warningCount}. Fixable Warnings: {this.props.results.fixableWarningCount}</p>
                {rows}
            </div>
        );
    }
}

export default Results;