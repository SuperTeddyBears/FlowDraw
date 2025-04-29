import React, {useState, useRef, useEffect} from 'react';
import {useAuth} from '../../contexts/AuthContext';
import {useNavigate} from "react-router-dom";
import "../../styles/UserDropdown.css";

const UserDropdown: React.FC = () => {
    const {user, logout} = useAuth();
    console.log("User data in dropdown:", user); // Log user data for debugging


    const [isOpen, setIsOpen] = useState(false); // State for dropdown visibility
    const dropdownRef = useRef<HTMLDivElement>(null); // Ref for the dropdown
    const navigate = useNavigate();

    const toggleDropdown = () => {
        console.log("Toggling dropdown, current state:", isOpen);
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
      // First navigate, then logout
      navigate('/', { replace: true });
      // Dirty solution to prevent ProtectedRoute from sending the user to the login page
      setTimeout(() => {
        logout();
      }, 100);
    };

    // Close the dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) { // Check if the click is outside the dropdown
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []); // [] is the dependency array, meaning this effect runs once when the component mounts

    return (
        <div className="user-dropdown" ref={dropdownRef}>
            <div className="dropdown-trigger" onClick={toggleDropdown}>
                <div className="avatar">
                    {user?.image ? (
                        <img src={user.image} alt="Avatar uzytkownika" className="avatar-image"/> // Avatar image
                    ) : (
                        <div className="avatar-placeholder">
                            {user?.name ? user.name.charAt(0) : '?'}
                        </div>
                    )}
                </div>
            </div>


            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">
                        <strong>{user?.name || 'Uzytkownik'}</strong>
                        <p>{user?.email || 'Brak emaila'}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={handleLogout}>
                        Wyloguj
                    </button>
                </div>
            )}
        </div>
    )
}

export default UserDropdown;