import React, {useState, useEffect} from 'react';

import {default as axiosInstance} from '../axiosApi';

export default function SubjectsList(props) {
    const [subjects, setSubjects] = useState(null);

    useEffect(() => {
        const getSubjects = async() => {
            try {
                const resp = await axiosInstance.get('/subjects/');
                setSubjects(resp.data);
                let initialSubject = resp.data[0].id.toString();
                props.subjectChangeCallback(initialSubject);
            } catch (e) {
                console.log(e);
            }
        }
        getSubjects();
    }, []);

    const items = subjects?.map(subject => {
        return <option key={subject.id} value={subject.id}>{subject.name}</option>
    })

    function handleSubjectChange(e) {
        props.subjectChangeCallback(e.target.value);
    }

    return (
        <select class="form-control" onChange={handleSubjectChange} value={props.subject}>
            {items}
        </select>
    );
}