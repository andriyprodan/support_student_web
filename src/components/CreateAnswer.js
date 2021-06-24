import React, { useState, useEffect, useContext } from 'react';

import { default as axiosInstance, baseURL } from '../axiosApi';
import TextEditor from './TextEditor/TextEditor';
import { UserContext } from '../App';

export default function CreateAnswer(props) {
    const [answer, setAnswer] = useState(null);
    let user = useContext(UserContext);

    function contentChangeCallback(new_content) {
        setAnswer({...answer, 'content': new_content});
    };

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await axiosInstance.post('/answers/', {
                ...answer,
                author_id: user?.id.toString(),
                question_id: props.question_id.toString()
            });
            props.answerSubmitCallback();
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <form className="create-answer">
            <TextEditor
                vertical
                minHeight="250px"
                name="answer-content"
                contentChangeCallback={contentChangeCallback}
                axiosInstance={axiosInstance}
                uploadImagesURL={baseURL + 'upload_question_image/'}
            />
            <div className="form-group d-flex justify-content-center">
                <button className="btn btn-success" onClick={handleSubmit}>Submit</button>
            </div>
        </form>
    )
}