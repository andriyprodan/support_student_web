import React, {useState} from 'react';

import axiosInstance from '../axiosApi';

export default function LoginForm(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleUsernameChange = e => {
        setUsername(e.target.value);
    }

    const handlePasswordChange = e => {
        setPassword(e.target.value);
    }

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const resp = await axiosInstance.post('/users/token/obtain/', {
                username: username,
                password: password
            });
            axiosInstance.defaults.headers['Authorization'] = 'JWT ' + resp.data.access;
            localStorage.setItem('access_token', resp.data.access);
            localStorage.setItem('refresh_token', resp.data.refresh);
            // set global App variable 'username'
            props.successfulAuthCallback(username);
            props.history.push('/');

        } catch(error) {
            throw error;
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h4>Log In</h4> 
            <label htmlFor="username">Username</label>
            <input
                type="text"
                name="username"
                value={username}
                onChange={handleUsernameChange}
            />
            <label htmlFor="password">Password</label>
            <input
                type="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
            />
            <input type="submit" />
        </form>
    )
}