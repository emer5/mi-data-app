// src/pages/EditContractPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/AddContractDetailsPage.css';

const EditContractPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🔄 Cargar datos del contrato al entrar a esta página
    useEffect(() => {
        const fetchContract = async () => {
            try {
                const res = await fetch(`http://localhost/mi-data-app/api.php?action=get_contract&id=${id}`);

                const data = await res.json();
                if (data && data.id_contrato_dato) {
                    // Si hay datos, los cargamos al formulario
                    const esquemaParsed = data.esquema ? JSON.parse(data.esquema) : {};

                    setFormData({
                        ...data,
                        esquema_nombre: esquemaParsed.nombre || '',
                        esquema_nombre_fisico: esquemaParsed.nombre_fisico || '',
                        esquema_tipo: esquemaParsed.tipo || 'object',
                        esquema_descripcion: esquemaParsed.descripcion || '',
                    });
                } else {
                    setError('Contrato no encontrado.');
                }
            } catch (err) {
                setError('Error al cargar el contrato.');
            }
        };

        fetchContract();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        const esquemaJSON = JSON.stringify({
            nombre: formData.esquema_nombre,
            nombre_fisico: formData.esquema_nombre_fisico,
            tipo: 'object',
            descripcion: formData.esquema_descripcion
        });

        try {
            const res = await fetch('http://localhost/mi-data-app/api.php?action=update_contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    esquema: esquemaJSON
                })
            });

            const result = await res.json();
            if (res.ok) {
                alert('Contrato actualizado correctamente');
                navigate('/contratos');
            } else {
                setError(result.message || 'Error al actualizar');
            }
        } catch (err) {
            setError('Error al enviar datos.');
        } finally {
            setLoading(false);
        }
    };

    if (error) return <div className="error-message">{error}</div>;
    if (!formData) return <div>Cargando datos del contrato...</div>;

    return (
        <div className="add-contract-page">
            <h2>Editar Contrato</h2>

            <div className="contract-form-group">
                <label>Nombre del contrato</label>
                <input name="nombre_contrato_dato" value={formData.nombre_contrato_dato} onChange={handleChange} />
            </div>

            <div className="contract-form-group">
                <label>Identificación</label>
                <input name="descripcion_contrato_dato" value={formData.descripcion_contrato_dato} onChange={handleChange} />
            </div>

            <div className="contract-form-group">
                <label>Uso</label>
                <textarea name="uso" value={formData.uso} onChange={handleChange} />
            </div>

            <div className="contract-form-group">
                <label>Propósito</label>
                <textarea name="proposito" value={formData.proposito} onChange={handleChange} />
            </div>

            <div className="contract-form-group">
                <label>Limitaciones</label>
                <textarea name="limitaciones" value={formData.limitaciones} onChange={handleChange} />
            </div>

            <div className="contract-form-group">
                <label>Canal de soporte</label>
                <input name="canal_soporte" value={formData.canal_soporte || ''} onChange={handleChange} />
            </div>

            <div className="schema-section-container">
                <h4>Esquema</h4>
                <input
                    type="text"
                    placeholder="Nombre"
                    name="esquema_nombre"
                    value={formData.esquema_nombre}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    placeholder="Nombre físico"
                    name="esquema_nombre_fisico"
                    value={formData.esquema_nombre_fisico}
                    onChange={handleChange}
                />
                <textarea
                    placeholder="Descripción"
                    name="esquema_descripcion"
                    value={formData.esquema_descripcion}
                    onChange={handleChange}
                />
            </div>

            <button onClick={handleSubmit} disabled={loading}>
                Guardar cambios
            </button>
        </div>
    );
};

export default EditContractPage;
