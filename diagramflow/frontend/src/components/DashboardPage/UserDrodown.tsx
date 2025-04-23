import React, {useEffect, useRef, useState} from 'react';
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
        logout();
        navigate('/'); // Redirect to the main page after logout
    };

    // Close the dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) { // Check if the click is outside the dropdown
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        // Clean up the event listener on a component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []); // [] is the dependency array, meaning this effect runs once when the component mounts

    return (
        <div className="user-dropdown" ref={dropdownRef}>
            <div className="dropdown-trigger" onClick={toggleDropdown}>
                <div className="avatar">
                    {user?.image ? (
                        // <img
                        //     src={user.image || '/default-avatar.svg'}
                        //     alt={user.name || 'User'}
                        //     className="user-avatar"
                        //     onError={(e) => {
                        //         console.log("Nie udało się załadować obrazu:", user.image);
                        //         e.currentTarget.onerror = null;
                        //         e.currentTarget.src = '/default-avatar.svg';
                        //     }}
                        // />

                        <img
                            src={user.image}
                            alt="Avatar użytkownika"
                            className="avatar-image"
                            onError={(e) => {
                                e.currentTarget.onerror = null; // prevent infinite loop
                                const svgCode = `
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
                                        <circle cx="50" cy="50" r="50" fill="#e0e0e0" />
                                        <circle cx="50" cy="40" r="15" fill="#a0a0a0" />
                                        <path d="M50 60 C30 60 20 75 20 90 L80 90 C80 75 70 60 50 60 Z" fill="#a0a0a0" />
                                      </svg>
                                    `;
                                e.currentTarget.src = `data:image/svg+xml;base64,${btoa(svgCode)}`;
                            }}
                        />

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