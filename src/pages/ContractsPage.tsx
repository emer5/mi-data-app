import React from 'react';
import { Contract } from '../index';


interface ContractsPageProps {
    contracts: Contract[];
    loading: boolean;
    error: string | null;
}

const ContractsPage: React.FC<ContractsPageProps> = ({ contracts, loading, error }) => {
    return (
        <div className="contracts-page">
            <div className="contracts-header">
                <h2>Contratos de Datos ({contracts.length})</h2>
            </div>

            {loading && <div className="loading">Cargando contratos...</div>}
            {error && <div className="error">{error}</div>}

            {!loading && !error && contracts.length === 0 && <p>No hay contratos disponibles.</p>}

            {!loading && !error && contracts.length > 0 && (
                <div className="contracts-grid">
                    {contracts.map((contract) => (
                        <div className="contract-card contract-card-modern" key={contract.id_contrato_dato}>
                            <div className="contract-badge">CONTRATO DE DATOS</div>
                            <div className="contract-main">
                                <div className="contract-icon">📜</div>
                                <div className="contract-content">
                                    <h3 className="contract-title-link">{contract.nombre_contrato_dato}</h3>
                                    <div className="contract-subtitle">
                                        <span>📁 {contract.nombre_dominio_consumidor || 'Dominio N/D'}</span>
                                        <span className="status">🟢 activo</span>
                                    </div>
                                    <p className="contract-description">
                                        {contract.descripcion_contrato_dato || 'Sin descripción'}
                                    </p>
                                    <div className="contract-footer">
                                        <span className="model-info">📄 {contract.nombre_producto_dato || 'Producto N/D'}</span>
                                        <span className="field-count">6 campos</span>
                                    </div>
                                    <div className="contract-tags">
                                        <span className="tag blue">Nombre lógico</span>
                                        <span className="tag green">Calidad</span>
                                        <span className="tag gray">Interno</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContractsPage;
