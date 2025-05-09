import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    return (
        <div className="page-container">
            <h2>Bienvenido a la Gestión Data Mesh Simple</h2>
            <p>Selecciona una sección para empezar:</p>
            <ul>
                <li><Link to="/dominios">Gestionar Dominios</Link></li>
                <li><Link to="/productos">Gestionar Productos</Link></li>
                <li><Link to="/contratos">Ver Contratos</Link></li>
            </ul>
        </div>
    );
};

export default HomePage;