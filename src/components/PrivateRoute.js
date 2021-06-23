import React, {useContext} from 'react';
import { Redirect, Route } from 'react-router-dom';

import { UserContext } from '../App';

const PrivateRoute = ({ component: Component, ...rest }) => {

    // Add your own authentication on the below line.
    const user = useContext(UserContext);
    console.log(user)
    return (
        <Route
            {...rest}
            render={props =>
                user ? (
                    <Component {...props} />
                ) : (
                    <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
                )
            }
        />
    )
}

export default PrivateRoute;