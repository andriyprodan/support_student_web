import React, {useState, useEffect} from 'react';

import './CreateQuestion.css';
import TextEditor from './TextEditor';

import { default as axiosInstance, baseURL } from '../axiosApi';

function CreateQuestion() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    return (
        <form className="create-question-form">
            <div className="form-group">
                <label htmlFor="question-title">Question Title</label>
                <input type="text" className="form-control" id="question-title"/>
            </div>
            <TextEditor 
                label="Question content"
                name="question-content"
                axiosInstance={axiosInstance}
                uploadImagesURL={baseURL + 'upload_question_image/'}
            />
        </form>
    )
}

export default CreateQuestion;