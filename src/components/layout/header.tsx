import { NavLink } from "react-router-dom";
import type { UserHeader } from "../../utils/schemas";
import "./header.css";
import { useState } from "react";
import NotificationButton from "../ui/buttons/NotificationButton";

type HeaderProp = {
    userHeader: UserHeader | null;
    numberNotifs: number;
    setClosedNotifsPopup: (close: boolean) => void;
};

export default function Header({ userHeader, numberNotifs, setClosedNotifsPopup }: HeaderProp){
    const navClass = ({ isActive }: { isActive: boolean }) => isActive ? "nav-link active" : "nav-link";

    const [menuClosed, setMenuClosed] = useState<boolean>(true);

    return (
        <header>
            <nav>
                <div className="logo-section">
                    <NavLink to="/" className="nav-link" onClick={ () => setMenuClosed(true) }>
                        <img />
                        <h4 className="brand-title">Project Pickool</h4>
                    </NavLink>
                </div>
                <div className="notification-section">
                    <NotificationButton
                        onBtnClick={ () => setClosedNotifsPopup(false) }
                        numberNotifs={ numberNotifs }
                    />
                </div>
                <div className={`nav-section hidable ${menuClosed ? "" : "active"}`}>
                    <button
                        className="close-menu ui"
                        onClick={ () => setMenuClosed(!menuClosed) }
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 5L4.99998 19M5.00001 5L19 19" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <NavLink to="/" className={ navClass } onClick={ () => setMenuClosed(true) }><h5>Home</h5></NavLink>
                    <NavLink to="/clubs" className={ navClass } onClick={ () => setMenuClosed(true) }><h5>Clubs</h5></NavLink>
                    <NavLink to="/events" className={ navClass } onClick={ () => setMenuClosed(true) }><h5>Events</h5></NavLink>
                    <NavLink to="/search" className={ navClass } onClick={ () => setMenuClosed(true) }><h5>Explore</h5></NavLink>
                    <NavLink to="/courts" className={ navClass } onClick={ () => setMenuClosed(true) }><h5>Courts</h5></NavLink>
                    <NavLink 
                        to={ `/user/${userHeader?.id || "guest"}` } 
                        className={`profile-section ${navClass}`}
                        onClick={ () => setMenuClosed(true) }
                    >
                        <h5>{ userHeader?.username ?? "Guest" }</h5>
                        <img src={ userHeader?.profile_pic ? userHeader.profile_pic :  import.meta.env.VITE_DEFAULT_PROFILE_PIC } />
                    </NavLink>
                </div>
                <div className="nav-section burger">
                    <button 
                        className="ui"
                        onClick={ () => setMenuClosed(!menuClosed) }
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6H20M4 12H20M4 18H20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </nav>
        </header>
    );
}