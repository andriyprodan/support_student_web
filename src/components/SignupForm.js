import React, {useState} from 'react';

import axiosInstance from '../axiosApi';

export default function SignupForm(props) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState('');

    const handleUsernameChange = e => {
        setUsername(e.target.value)
    }

    const handleEmailChange = e => {
        setEmail(e.target.value)
    }

    const handlePasswordChange = e => {
        setPassword(e.target.value)
    }

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const resp = await axiosInstance.post('/users/create/', {
                username: username,
                email: email,
                password: password
            });
            // obtain a tokens for the newly created user
            const tokens_resp = await axiosInstance.post('/users/token/obtain/', {
                username: username,
                password: password
            });
            axiosInstance.defaults.headers['Authorization'] = 'JWT ' + tokens_resp.data.access;
            localStorage.setItem('access_token', tokens_resp.data.access);
            localStorage.setItem('refresh_token', tokens_resp.data.refresh);
            // set global App variable 'username'
            props.successfulAuthCallback(username);
            props.history.push('/');

        } catch (error) {
            console.log(error.stack);
            setErrors(error.response.data);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h4>Sign Up</h4> 
            <label htmlFor="username">Username</label>
            <input
                type="text"
                name="username"
                value={username}
                onChange={handleUsernameChange}
            />
            { errors.username ? errors.username : null}
            <label htmlFor="email">Email</label>
            <input
                type="text"
                name="email"
                value={email}
                onChange={handleEmailChange}
            />
            { errors.email ? errors.email : null}
            <label htmlFor="password">Password</label>
            <input
                type="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
            />
            { errors.password ? errors.password : null}
            <input type="submit" />
        </form>
    )
}