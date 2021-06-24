import React, {useState, useEffect} from 'react';
import './App.css';
import {BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Nav from './components/Nav';
import HomePage from './pages/HomePage';
import CreateQuestion from './components/CreateQuestion';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';
import axiosInstance from './axiosApi';
import Question from './components/Question';
import PrivateRoute from './components/PrivateRoute';

export const UserContext = React.createContext(null);

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [successfullyAuthentificated, setSuccessfullyAuthentificated] = useState(false);

  useEffect(() => {
    axiosInstance.get('/users/current_user/').then(json => {
      setUser(json.data);
      setLoggedIn(true);
    }).catch(err => {
      console.log(err);
    })
  }, [successfullyAuthentificated]);

  const successfulAuthCallback = () => {
    setSuccessfullyAuthentificated(true);
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
            <div className="logo"><Link to="/">Logo</Link></div>
            <div>{user?.username}</div>
            <Nav
              loggedIn={loggedIn}
              handleLogout={handleLogout}
            />
          </div>
        </header>
        <Switch>
          <main className="container">
            <div className="ask-q-container">
              <button className="btn btn-primary ask-q-btn">
                <Link to="/create-question">Ask Question</Link>
              </button>
            </div>
            <Route
              exact
              path="/"
              render={(props) => {
                return <HomePage {...props}/>
              }} 
            />
            <PrivateRoute
              path="/create-question"
              component={CreateQuestion}
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
