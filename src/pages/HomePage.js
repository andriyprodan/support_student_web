import { useContext } from "react";
import { Link } from 'react-router-dom';

import { UserContext } from '../App';

export default function HomePage(props) {
    const user = useContext(UserContext);

    return (
        <div>
            <div>Hello, {user?.username}</div>
            <button className="btn btn-success">
                <Link to="/create-question">Ask Question</Link>
            </button>
        </div>
    )
}