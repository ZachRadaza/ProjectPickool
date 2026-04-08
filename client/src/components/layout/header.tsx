import { NavLink } from "react-router-dom";
import type { UserHeader } from "../../utils/schemas";
import "./header.css";

type HeaderProp = {
    userHeader: UserHeader | null;
};

export default function Header({ userHeader }: HeaderProp){
    const navClass = ({ isActive }: { isActive: boolean }) => isActive ? "nav-link active" : "nav-link";

    return (
        <header>
            <nav>
                <div className="logo-section">
                    <NavLink to="/" className="nav-link">
                        <img />
                        <h4 className="brand-title">Project Pickool</h4>
                    </NavLink>
                </div>
                <div className="nav-section">
                    <NavLink to="/" className={ navClass }><h5>Home</h5></NavLink>
                    <NavLink to="/clubs" className={ navClass }><h5>Clubs</h5></NavLink>
                    <NavLink to="/events" className={ navClass }><h5>Events</h5></NavLink>
                    <NavLink to="/search" className={ navClass }><h5>Explore</h5></NavLink>
                    <NavLink to="/about" className={ navClass }><h5>About</h5></NavLink>
                </div>
                <div className="profile-section">
                    <NavLink to={ `/user/${userHeader?.id || "guest"}` } className="nav-link">
                        <h5>{ userHeader?.username ?? "Guest" }</h5>
                        <img src={ userHeader?.profile_pic ?? import.meta.env.VITE_DEFAULT_PROFILE_PIC } />
                    </NavLink>
                </div>
            </nav>
        </header>
    );
}