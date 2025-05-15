import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Contract } from '../index';

interface ContractDetailPageProps {
    contracts: Contract[];
}

const ContractDetailPage: React.FC<ContractDetailPageProps> = ({ contracts }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const contrato = contracts.find(c => c.id_contrato_dato === Number(id));

    if (!contrato) {
        return (
            <div className="container mt-4">
                <h3>Contrato no encontrado</h3>
                <button className="btn btn-secondary mt-2" onClick={() => navigate('/contratos')}>Volver</button>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2>{contrato.nombre_contrato_dato}</h2>
            <p dangerouslySetInnerHTML={{ __html: contrato.descripcion_contrato_dato || '' }} />
            <div className="mt-3">
                <span className="badge bg-primary">{contrato.nombre_dominio_consumidor}</span>
                <span className="badge bg-secondary ms-2">
                    {new Date(contrato.fecha_de_creacion_contrato_dato).toLocaleDateString()}
                </span>
            </div>
            <button className="btn btn-outline-secondary mt-4" onClick={() => navigate('/contratos')}>
                ← Volver a contratos
            </button>
        </div>
    );
};

export default ContractDetailPage;
