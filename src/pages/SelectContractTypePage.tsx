// src/pages/SelectContractTypePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SelectContractTypePage: React.FC = () => {
    const navigate = useNavigate();

    const handleSelectType = () => {
        navigate('/contratos/nuevo/detalles', {
            state: { contractType: 'Estándar de Contrato de Datos Abiertos' },
        });
    };

    return (
        <div className="container py-4">
            <h2 className="mb-3">Elija el tipo de contrato</h2>
            <p className="text-muted mb-4">
                A continuación se muestra el tipo de contrato disponible para crear un nuevo registro de datos.
            </p>

            <div className="row">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title">Estándar de Contrato de Datos Abiertos</h5>
                            <p className="card-text">
                                Crear un contrato de datos basado en el estándar de datos abiertos de Bitol.
                            </p>
                            <button className="btn btn-primary mt-auto" onClick={handleSelectType}>
                                Seleccionar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectContractTypePage;
