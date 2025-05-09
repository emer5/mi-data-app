// src/pages/ContractsPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contract } from '../index'; // Asume que index.tsx exporta esta interfaz

interface ContractsPageProps {
    contracts: Contract[] | any; // Se mantiene 'any' por si la API devuelve algo inesperado
    loading: boolean;
    error: string | null;
}

const ContractsPage: React.FC<ContractsPageProps> = ({ contracts, loading, error }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    // Si 'contracts' no es un array, muestra un mensaje de error y no intentes mapear.
    if (!Array.isArray(contracts) && !loading) { // No mostrar si está cargando
        // console.error("ContractsPage: 'contracts' prop is not an array.", contracts);
        return (
            <div className="page-container">
                 <h2>Contratos (Error)</h2>
                 <div className="error-message">Error: Los datos de contratos no se pudieron cargar correctamente. Por favor, revisa la consola.</div>
                 <button className="add-new" onClick={() => navigate('/contratos/nuevo')} style={{marginTop: '15px'}}>
                    + Agregar Contrato
                </button>
            </div>
        );
    }

    const filteredContracts = Array.isArray(contracts)
        ? contracts.filter(contract =>
            contract.nombre_contrato_dato?.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    const pageLoading = loading && (!Array.isArray(contracts) || contracts.length === 0);

    return (
        // Clases de Bootstrap (container, d-flex, etc.) necesitan Bootstrap CSS.
        // Reemplazadas por page-container y estilos inline/index.css para consistencia.
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Contratos ({Array.isArray(contracts) ? contracts.length : 0})</h2>
                <button className="add-new" onClick={() => navigate('/contratos/nuevo')}>
                    + Agregar Contrato
                </button>
            </div>

            <input
                type="text"
                // className="form-control mb-4" // Clase Bootstrap
                style={{ width: 'calc(100% - 22px)', padding: '10px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '4px' }}
                placeholder="Buscar contratos por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {pageLoading && <div className="loading-message">Cargando contratos...</div>}
            {/* El error global de App.tsx debería manejar los errores de API. */}
            {/* error && <div className="error-message">{error}</div> */}

            {!pageLoading && filteredContracts.length === 0 && !error && (
                 <p>No hay contratos que coincidan con tu búsqueda o no hay contratos creados.</p>
            )}

            {/* Estructura de lista similar a la original para mantener consistencia de estilos */}
            {!pageLoading && filteredContracts.length > 0 && (
                <ul>
                    {filteredContracts.map(contract => (
                        <li key={contract.id_contrato_dato}>
                            <div>
                                <strong>{contract.nombre_contrato_dato}</strong>
                                <span>{contract.descripcion_contrato_dato}</span>
                                <small>
                                    Producto: {contract.nombre_producto_dato || 'N/A'} <br />
                                    Dominio consumidor: {contract.nombre_dominio_consumidor || 'N/A'} <br />
                                    Creado: {new Date(contract.fecha_de_creacion_contrato_dato).toLocaleDateString()}
                                </small>
                            </div>
                            {/* Aquí podrías añadir acciones como ver detalles o eliminar si lo implementas */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ContractsPage;