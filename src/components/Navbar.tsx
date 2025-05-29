import React from 'react';
import { NavLink } from 'react-router-dom'; // NavLink resalta el enlace activo

const Navbar: React.FC = () => {
    // Estilo para el enlace activo (puedes personalizarlo)
    const activeStyle = {
        fontWeight: 'bold',
        color: '#0056b3',
        textDecoration: 'underline',
    };

    return (
        <nav className="main-nav">
            <NavLink to="/" style={({ isActive }) => isActive ? activeStyle : undefined} end>
                Inicio
            </NavLink>
            <NavLink to="/dominios" style={({ isActive }) => isActive ? activeStyle : undefined}>
                Dominios
            </NavLink>
            <NavLink to="/productos" style={({ isActive }) => isActive ? activeStyle : undefined}>
                Productos
            </NavLink>
            <NavLink to="/contratos" style={({ isActive }) => isActive ? activeStyle : undefined}>
                Contratos
            </NavLink>
             <NavLink to="/productos/malla" style={({ isActive }) => isActive ? activeStyle : undefined}>
                Malla de Datos
            </NavLink>
        </nav>
    );
};

export default Navbar;