import React, {useState, useEffect} from 'react';
import './App.css';
import {BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Nav from './components/Nav';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import axiosInstance from './axiosApi';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    axiosInstance.get('/users/current_user/').then(json => {
      setUsername(json.data.username);
      setLoggedIn(true);
    })
  })

  const handleSuccessfulAuth = (username) => {
    setLoggedIn(true);
    setUsername(username);
  }

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post('users/blacklist/', {
        'refresh_token': localStorage.getItem('refresh_token')
      });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      axiosInstance.defaults.headers['Authorization'] = null;
      setLoggedIn(false);
      setUsername('');
      
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <Router>
      <Nav
        loggedIn={loggedIn}
        handleLogout={handleLogout}
      />
      <Switch>
        <Route exact path="/">Hello, {username}</Route>
        <Route path="/login" render={(props) => 
          <LoginForm 
            {...props} 
            loggedIn={loggedIn} 
            successfulAuthCallback={handleSuccessfulAuth}
          />}
        />
        <Route path="/signup" render={(props) => 
          <SignupForm 
            {...props} 
            loggedIn={loggedIn} 
            successfulAuthCallback={handleSuccessfulAuth}
          />}
        />
      </Switch>
    </Router>
  );
}

export default App;
