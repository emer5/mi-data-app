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
                    setError("Contrato no encontrado.");
                }
            } catch {
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
                    fetchContracts();
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
                <h2>📝 {contract.nombre_contrato_dato}</h2>
                <div className="contract-detail-buttons">
                    <button className="edit-btn" onClick={handleEdit}>Editar contrato</button>
                    <button className="delete-btn" onClick={handleDelete}>Eliminar contrato</button>
                </div>
            </div>

            <div className="contract-detail-meta">
                <span className="badge bg-primary me-2">Versión: {contract.descripcion_contrato_dato?.split('|')[1]?.replace('Versión:', '').trim() || 'N/A'}</span>
                <span className="badge bg-success me-2">Estado: {contract.descripcion_contrato_dato?.split('|')[2]?.replace('Estado:', '').trim() || 'N/A'}</span>
                <span className="badge bg-secondary me-2">Responsable: {contract.descripcion_contrato_dato?.split('|')[3]?.replace('Responsable:', '').trim() || 'N/A'}</span>
                <span className="badge bg-warning text-dark me-2">Dominio transferencia: {contract.nombre_dominio_transferencia || 'No especificado'}</span>
            </div>

            <div className="contract-detail-section">
                <h4>🧾 Detalles del contrato</h4>
                <ul>
                    <li><strong>Uso:</strong> {contract.uso || "No especificado"}</li>
                    <li><strong>Propósito:</strong> {contract.proposito || "No especificado"}</li>
                    <li><strong>Limitaciones:</strong> {contract.limitaciones || "No especificado"}</li>
                    <li><strong>Canal de soporte:</strong> {contract.canal_soporte || "No especificado"}</li>
                </ul>
            </div>

            <div className="contract-detail-section">
                <h4>📦 Esquema</h4>
                <ul>
                    <li><strong>Nombre:</strong> {contract.esquema.nombre || "No especificado"}</li>
                    <li><strong>Nombre físico:</strong> {contract.esquema.nombre_fisico || "No especificado"}</li>
                    <li><strong>Tipo lógico:</strong> {contract.esquema.tipo || "No especificado"}</li>
                    <li><strong>Descripción:</strong> {contract.esquema.descripcion || "No especificado"}</li>
                </ul>
            </div>

            <div className="contract-detail-section">
                <h4>📊 Base de datos del contrato</h4>
                <table className="contract-db-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Fecha creación</th>
                            <th>Producto</th>
                            <th>Dominio consumidor</th>
                            <th>Dominio transferencia</th>
                            <th>Uso</th>
                            <th>Propósito</th>
                            <th>Limitaciones</th>
                            <th>Esquema</th>
                            <th>Soporte</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{contract.id_contrato_dato}</td>
                            <td>{contract.nombre_contrato_dato}</td>
                            <td>{contract.descripcion_contrato_dato}</td>
                            <td>{contract.fecha_de_creacion_contrato_dato}</td>
                            <td>{contract.id_producto_dato}</td>
                            <td>{contract.id_dominio_consumidor}</td>
                            <td>{contract.id_dominio_transferencia || "N/A"}</td>
                            <td>{contract.uso}</td>
                            <td>{contract.proposito}</td>
                            <td>{contract.limitaciones}</td>
                            <td>{contract.esquema ? JSON.stringify(contract.esquema) : "N/A"}</td>
                            <td>{contract.canal_soporte}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContractDetailPage;
