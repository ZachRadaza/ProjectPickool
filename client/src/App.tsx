import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import About from './pages/About';
import User from './pages/User';
import Search from './pages/Search';
import Clubs from './pages/Clubs';
import Events from './pages/Events';

export default function App(){
    return (
        <BrowserRouter>
            <Routes>
                <Route element={ <Layout /> }>
                    <Route path="/" element={ <Home /> } />
                    <Route path="/about" element={ <About /> } />
                    <Route path="/clubs" element={ <Clubs /> } />
                    <Route path="/events" element={ <Events /> } />
                    <Route path="/user/:id" element={ <User /> } />
                    <Route path="/search" element={ <Search /> } />

                    <Route path="*" element={ <Home /> } />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}