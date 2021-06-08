import React, {useState, useEffect} from 'react';
import './App.css';
import {BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Nav from './components/Nav';
import CreateQuestion from './components/CreateQuestion';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';
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
      <header id="main-header">
        <div className="container">
          <div className="logo">Logo</div>
          <Nav
            loggedIn={loggedIn}
            handleLogout={handleLogout}
          />
        </div>
      </header>
      <Switch>
        <main className="container">
          <Route exact path="/">
            <div>Hello, {username}</div>
            <button className="btn btn-success">
              <Link to="/create-question">Create question</Link>
            </button>
          </Route>
          <Route path="/create-question">
            <CreateQuestion></CreateQuestion>
          </Route>
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
        </main>
      </Switch>
    </Router>
  );
}

export default App;
