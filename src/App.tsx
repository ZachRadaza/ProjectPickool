import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './layouts/Layout';
import User from './pages/User';
import Search from './pages/Search';
import Clubs from './pages/Clubs';
import Events from './pages/Events';
import Home from './pages/Home';
import Courts from './pages/Courts';

export default function App(){
    return (
        <BrowserRouter>
            <Routes>
                <Route element={ <Layout /> }>
                    <Route path="/" element={ <Home />}/>
                    <Route path="/clubs" element={ <Clubs /> } />
                    <Route path="/events" element={ <Events /> } />
                    <Route path="/user/:id" element={ <User /> } />
                    <Route path="/search" element={ <Search /> } />
                    <Route path="/courts" element={ <Courts /> } />

                    <Route path="*" element={ <Home /> } />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}