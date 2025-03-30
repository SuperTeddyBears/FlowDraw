import {Link} from "react-router-dom";

export function HomePage() {
  return (
    <div className='HomePage'>
      <div className='Register/LoginButtons'>
        <Link to="/register">
          <button>Register</button>
        </Link>
        <Link to="/login">
          <button className="Login">Login</button>
        </Link>
      </div>
      <div>
        <h1>Welcome to FlowDraw</h1>
        <p>Click below to start creating your diagrams!</p>
        <Link to="/app">
          <button>Go to App</button>
        </Link>
      </div>
    </div>
  );
}
