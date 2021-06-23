import React, {useState, useEffect} from 'react';
import './App.css';
import {BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Nav from './components/Nav';
import CreateQuestion from './components/CreateQuestion';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';
import axiosInstance from './axiosApi';
import Question from './components/Question';

export const UserContext = React.createContext(null);

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axiosInstance.get('/users/current_user/').then(json => {
      setUser(json.data);
      setLoggedIn(true);
    }).catch(err => {
      console.log(err);
    })
  }, []);

  const successfulAuthCallback = () => {
    axiosInstance.get('/users/current_user/').then(json => {
      setUser(json.data);
      setLoggedIn(true);
    }).catch(err => {
      console.log(err);
    });
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
      setUser(null);
      
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <UserContext.Provider value={user}>
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
              <div>Hello, {user?.username}</div>
              <button className="btn btn-success">
                <Link to="/create-question">Ask Question</Link>
              </button>
            </Route>
            <Route path="/create-question" render={(props) => 
              <CreateQuestion {...props}
              />}
            />
            <Route 
              path="/question/:id" 
              render={(props) => {
                return <Question />;
              }}
            />
            <Route path="/login" render={(props) => 
              <LoginForm
                {...props}
                loggedIn={loggedIn}
                successfulAuthCallback={successfulAuthCallback}
              />}
            />
            <Route path="/signup" render={(props) => 
              <SignupForm
                {...props} 
                loggedIn={loggedIn} 
                successfulAuthCallback={successfulAuthCallback}
              />}
            />
          </main>
        </Switch>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
