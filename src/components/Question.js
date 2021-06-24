import { useState, useEffect, useContext } from "react";
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import axiosInstance from '../axiosApi';
import './Question.css';

import { UserContext } from '../App';
import AuthorLabel from './AuthorLabel';
import CreateAnswer from './CreateAnswer';
import Answer from './Answer';

export default function Question() {
    let params = useParams();
    const [question, setQuestion] = useState(null);
    let user = useContext(UserContext);
    const [answerSubmitted, setAnswerSubmitted] = useState(false);

    useEffect(() => {
        async function getQuestion() {
            try{
                let resp = await axiosInstance.get(`/questions/${params.id}`);
                setQuestion(resp.data);
            } catch (e) {
                console.log(e);
            }
        }

        getQuestion();
    }, [params.id,answerSubmitted]);
    
    function handleAnswerSubmit() {
        setAnswerSubmitted(true);
    }

    const answerComponents = question?.answers.map(answer => {
        return (
            <Answer 
                key={answer.id} 
                {...answer} 
            />
        );
    });

    return (
        <>
            <div class="question">
                <h2 className="title">{question?.title}</h2>
                <hr />
                <div className="content">
                    <ReactMarkdown 
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        children={question?.content}
                    />
                </div>
                <hr />
                <div className="user-label-container">
                    <AuthorLabel user_id={question?.author_id}/>
                </div>
            </div>

            <div className="answers">
                {answerComponents}
            </div>

            <CreateAnswer question_id={question?.id} answerSubmitCallback={handleAnswerSubmit}/>
        </>
    )
}