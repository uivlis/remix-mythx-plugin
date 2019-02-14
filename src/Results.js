import React, { Component } from 'react';

class Results extends Component {

    constructor(props){
        super(props);
    }

    render(){

        var rows = [];

        console.log(this.props.results);

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
                {rows}
            </div>
        );
    }
}

export default Results;