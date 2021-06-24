import React, {useState, useEffect, useCallback, useContext} from 'react';

import { UserContext } from '../App';
import './CreateQuestion.css';
import TextEditor from './TextEditor/TextEditor';
import SubjectsList from './SubjectsList';

import { default as axiosInstance, baseURL } from '../axiosApi';

function CreateQuestion(props) {
    const [data, setData] = useState(null);
    const user = useContext(UserContext);

    function contentChangeCallback(new_content) {
        setData({...data, 'content': new_content});
    };

    function handleTitleChange(e) {
        setData({...data, 'title': e.target.value});
    }

    function handlePointsChange(e) {
        setData({...data, 'points': e.target.value});
    }

    function handleSubjectChange(subj) {
        setData({...data, 'subject_id': subj});
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const resp = await axiosInstance.post('/questions/', {
                ...data,
                author_id: user.id.toString()
            });
            props.history.push(`/question/${resp.data.id}`)
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <form className="create-question-form">
            <div className="form-group">
                <label htmlFor="question-title">Question Title</label>
                <input 
                    type="text" 
                    value={data?.title} 
                    onChange={handleTitleChange} 
                    className="form-control" 
                    id="question-title"
                />
            </div>
            <div className="form-group">
                <TextEditor 
                    label="Question content"
                    name="question-content"
                    contentChangeCallback={contentChangeCallback}
                    axiosInstance={axiosInstance}
                    uploadImagesURL={baseURL + 'upload_question_image/'}
                    minHeight="400px"
                />
            </div>
            <div className="form-group">
                <SubjectsList subject={data?.subject} subjectChangeCallback={handleSubjectChange}/>
            </div>
            <div className="form-group">
                <label htmlFor="question-points">Points for the accepted answer(You have {user?.profile.points} points):</label>
                <input 
                    type="number" 
                    className="form-control" 
                    id="question-points" 
                    max={user?.profile.points}
                    value={data?.points}
                    onChange={handlePointsChange}
                />
            </div>
            <div className="form-group d-flex justify-content-center">
                <button className="btn btn-success" onClick={handleSubmit}>Submit</button>
            </div>
        </form>
    )
}

export default CreateQuestion;