import React, { useState, useEffect, } from 'react';

import axiosInstance from '../axiosApi';

export default function AuthorLabel(props) {
    const [author, setAuthor] = useState(null);


    useEffect(() => {
        async function getAuthor() {
            try {
                let resp = await axiosInstance.get(`users/user_label/${props.user_id}/`);
                setAuthor(resp.data);
            } catch (e) {
                console.log(e)
            }
        }
        if (props.user_id) {
            getAuthor();
        }
    }, [props.user_id]);


    return (
        <div className="user-label">
            <div>{author?.username}</div>
            <div>{author?.profile.points}</div>
        </div>
    )
}