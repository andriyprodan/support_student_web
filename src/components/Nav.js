import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function Nav(props) {
    const loggedOutNav = (
        <ul>
            <li><Link to="/login">login</Link></li>
            <li><Link to="/signup">signup</Link></li>
        </ul>
    );

    const loggedInNav = (
        <ul>
            <li onClick={props.handleLogout}>logout</li>
        </ul>
    );

    return <div>{props.loggedIn ? loggedInNav : loggedOutNav}</div>;
}

export default Nav;

Nav.propTypes = {
    loggedIn: PropTypes.bool.isRequired,
};