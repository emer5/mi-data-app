import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contract } from '../index';

interface ContractsPageProps {
    contracts: Contract[] | any;
    loading: boolean;
    error: string | null;
}

const ContractsPage: React.FC<ContractsPageProps> = ({ contracts, loading, error }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    if (!Array.isArray(contracts) && !loading) {
        return (
            <div className="page-container">
                <h2>Contratos (Error)</h2>
                <div className="error-message">Error: Los datos de contratos no se pudieron cargar correctamente.</div>
                <button className="add-new" onClick={() => navigate('/contratos/nuevo')} style={{ marginTop: '15px' }}>
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
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Contratos ({Array.isArray(contracts) ? contracts.length : 0})</h2>
                <button className="add-new" onClick={() => navigate('/contratos/nuevo')}>
                    + Agregar Contrato
                </button>
            </div>

            <input
                type="text"
                style={{ width: 'calc(100% - 22px)', padding: '10px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '4px' }}
                placeholder="Buscar contratos por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {pageLoading && <div className="loading-message">Cargando contratos...</div>}
            {!pageLoading && filteredContracts.length === 0 && !error && (
                <p>No hay contratos que coincidan con tu búsqueda o no hay contratos creados.</p>
            )}

            <div className="row">
                {filteredContracts.map(contract => (
                    <div key={contract.id_contrato_dato} className="col-md-6 mb-4">
                        <div className="card shadow-sm border-start border-4 border-primary p-3 contract-card">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-uppercase text-muted mb-1 fw-bold">DATA CONTRACT</h6>
                                    <h4 className="fw-semibold">{contract.nombre_contrato_dato}</h4>
                                    <div className="mb-2">
                                        <span className="badge bg-light text-dark me-1">
                                            {contract.nombre_producto_dato || 'Sin producto'}
                                        </span>
                                    </div>
                                    <p className="text-muted small">
                                        {contract.descripcion_contrato_dato}
                                    </p>
                                </div>
                            </div>
                            <div className="d-flex flex-wrap gap-2 small mt-2">
                                <span className="badge bg-primary">{contract.nombre_dominio_consumidor}</span>
                                <span className="badge bg-secondary">
                                    {new Date(contract.fecha_de_creacion_contrato_dato).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContractsPage;
