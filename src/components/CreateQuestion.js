import React, {useState, useEffect} from 'react';

import TextEditor from './TextEditor'

function CreateQuestion() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    return (
        <form className="create-question-form">
            <div className="form-group">
                <label htmlFor="question-title">Question Title</label>
                <input type="text" className="form-control" id="question-title"/>
            </div>
            <TextEditor label="Question content" name="question-content" />
        </form>
    )
}

export default CreateQuestion;