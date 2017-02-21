import React from 'react';
import "../stylesheets/main.scss";

export default class UserQuestion extends React.Component {
    render() {
        return (
            <div className="col-md-12 user-question-col">
                <div className="user-tile">
                    <div className="text-center">
                        <div>
                            <h3>Questionnaire</h3>
                        </div>
                        <div className="question-container">
                            <p>How personal is too personal?</p>
                            <div className="form-group">
                                <div className="col-md-12 question-text-box">
                                    <input type="text" placeholder="Answer here" className="form-control" id="input-question-area"></input>
                                </div>
                            </div>
                            <button className="btn btn-default">Submit</button>
                        </div>
                    </div>
                </div>
            </div>
            );
    }
}
