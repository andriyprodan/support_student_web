import { useState, useEffect,  } from "react";
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import axiosInstance from '../axiosApi';
import './Question.css';

export default function Question() {
    let params = useParams();
    const [question, setQuestion] = useState(null);

    useEffect(() => {
        async function getQuestion() {
            let resp = await axiosInstance.get(`/questions/${params.id}`);
            setQuestion(resp.data);
        }

        getQuestion();
    }, [])

    return (
        <div class="question">
            <h2 className="title">{question?.title}</h2>
            <div className="content">
                <ReactMarkdown 
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    children={question?.content}
                />
            </div>
        </div>
    )
}