import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/ContractDetailPage.css';

interface ContractDetailPageProps {
    fetchContracts: () => void;
}

const ContractDetailPage: React.FC<ContractDetailPageProps> = ({ fetchContracts }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [contract, setContract] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const res = await fetch(`http://localhost/mi-data-app/api.php?action=get_contract&id=${id}`);
                const data = await res.json();

                if (res.ok && data) {
                    const esquema = data.esquema ? JSON.parse(data.esquema) : {};
                    setContract({ ...data, esquema });
                } else {
                    setError("No se encontró el contrato.");
                }
            } catch (err) {
                setError("Error al cargar el contrato.");
            }
        };

        fetchContract();
    }, [id]);

    const handleEdit = () => {
        navigate(`/contratos/editar/${id}`);
    };

    const handleDelete = async () => {
        const confirm = window.confirm("¿Estás seguro de que deseas eliminar este contrato?");
        if (confirm) {
            try {
                const response = await fetch('http://localhost/mi-data-app/api.php?action=delete_contract', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_contrato_dato: parseInt(id!) })
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Contrato eliminado correctamente.");
                    fetchContracts(); // 👈 recarga para limpiar la tarjeta
                    navigate('/contratos');
                } else {
                    alert(result.message || "No se pudo eliminar el contrato.");
                }
            } catch (error) {
                console.error('Error al eliminar contrato:', error);
                alert("Error al eliminar contrato.");
            }
        }
    };

    if (error) return <div className="error-message">{error}</div>;
    if (!contract) return <div>Cargando contrato...</div>;

    return (
        <div className="contract-detail">
            <div className="contract-detail-header">
                <h2>{contract.nombre_contrato_dato}</h2>
                <div className="contract-detail-buttons">
                    <button className="edit-btn" onClick={handleEdit}>
                        Editar contrato de datos
                    </button>
                    <button className="delete-btn" onClick={handleDelete}>
                        Eliminar contrato de datos
                    </button>
                </div>
            </div>

            <div className="contract-detail-info">
                <p><strong>ID:</strong> {contract.id_contrato_dato}</p>
                <p><strong>Descripción:</strong> {contract.descripcion_contrato_dato || "No especificado"}</p>
                <p><strong>Uso:</strong> {contract.uso || "No especificado"}</p>
                <p><strong>Propósito:</strong> {contract.proposito || "No especificado"}</p>
                <p><strong>Limitaciones:</strong> {contract.limitaciones || "No especificado"}</p>
                <p><strong>Canal de soporte:</strong> {contract.canal_soporte || "No especificado"}</p>
                <p><strong>Dominio de transferencia:</strong> {contract.nombre_dominio_transferencia || "No especificado"}</p>

                {contract.esquema && (
                    <>
                        <p><strong>Esquema:</strong></p>
                        <p>- Nombre: {contract.esquema.nombre || "No especificado"}</p>
                        <p>- Nombre físico: {contract.esquema.nombre_fisico || "No especificado"}</p>
                        <p>- Tipo lógico: {contract.esquema.tipo || "No especificado"}</p>
                        <p>- Descripción: {contract.esquema.descripcion || "No especificado"}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ContractDetailPage;

