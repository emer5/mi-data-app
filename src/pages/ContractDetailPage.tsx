// src/pages/ContractDetailPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/ContractDetailPage.css';

const ContractDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate(`/contratos/editar/${id}`);
    };

    const handleDelete = async () => {
        const confirm = window.confirm("¿Estás seguro de que deseas eliminar este contrato?");
        if (confirm) {
            try {
                const response = await fetch('http://localhost/mi-data-app/api.php?action=delete_contract', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id_contrato_dato: parseInt(id!) })
                });

                const result = await response.json();
                alert(result.message);
                navigate('/contratos');
            } catch (error) {
                console.error('Error al eliminar contrato:', error);
                alert("Error al eliminar contrato.");
            }
        }
    };

    return (
        <div className="contract-detail">
            <div className="contract-detail-header">
                <h2>Detalle del Contrato ID {id}</h2>
                <div className="contract-detail-buttons">
                    <button className="edit-btn" onClick={handleEdit}>
                        Editar contrato de datos
                    </button>
                    <button className="delete-btn" onClick={handleDelete}>
                        Eliminar contrato de datos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContractDetailPage;
