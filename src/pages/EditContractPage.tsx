// src/pages/EditContractPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Domain, Product } from '../index';
import '../../css/AddContractDetailsPage.css';

interface EditContractPageProps {
    products: Product[];
    domains: Domain[];
    fetchContracts: () => void;
}

const EditContractPage: React.FC<EditContractPageProps> = ({ products, domains, fetchContracts }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const res = await fetch(`http://localhost/mi-data-app/api.php?action=get_contract&id=${id}`);
                const data = await res.json();
                if (!res.ok || !data.id_contrato_dato) throw new Error("No encontrado");

                const esquemaParsed = data.esquema ? JSON.parse(data.esquema) : {};
                const partes = (data.descripcion_contrato_dato || '').split('|');

                const identificacion = partes[0]?.replace('ID:', '').trim() || '';
                const version = partes[1]?.replace('Versión:', '').trim() || '0.0.1';
                const estado = partes[2]?.replace('Estado:', '').trim() || '';

                setFormData({
                    nombre: data.nombre_contrato_dato,
                    identificacion,
                    version,
                    estado,
                    dominio: data.id_dominio_transferencia,
                    dominio_transferencia: data.id_dominio_consumidor || '',
                    producto: data.id_producto_dato,
                    uso: data.uso || '',
                    proposito: data.proposito || '',
                    limitaciones: data.limitaciones || '',
                    esquema_nombre: esquemaParsed.nombre || '',
                    esquema_nombre_fisico: esquemaParsed.nombre_fisico || '',
                    esquema_tipo: esquemaParsed.tipo || 'object',
                    esquema_descripcion: esquemaParsed.descripcion || '',
                    canal_soporte: data.canal_soporte || ''
                });
            } catch {
                setError('Error al cargar el contrato.');
            }
        };

        fetchContract();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        const esquemaJSON = JSON.stringify({
            nombre: formData.esquema_nombre,
            nombre_fisico: formData.esquema_nombre_fisico,
            tipo: formData.esquema_tipo,
            descripcion: formData.esquema_descripcion
        });

        const payload = {
            id_contrato_dato: parseInt(id || '0'),
            id_producto_dato: parseInt(formData.producto),
            id_dominio_consumidor: parseInt(formData.dominio_transferencia || '0'),
            id_dominio_transferencia: parseInt(formData.dominio),
            nombre_contrato_dato: formData.nombre,
            descripcion_contrato_dato: `ID: ${formData.identificacion} | Versión: ${formData.version} | Estado: ${formData.estado}`,
            uso: formData.uso,
            proposito: formData.proposito,
            limitaciones: formData.limitaciones,
            esquema: esquemaJSON,
            canal_soporte: formData.canal_soporte
        };

        try {
            const res = await fetch('http://localhost/mi-data-app/api.php?action=update_contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Contrato actualizado correctamente');
                fetchContracts();
                navigate('/contratos', { replace: true });
            } else {
                const result = await res.json();
                setError(result.message || 'Error al actualizar');
            }
        } catch {
            setError('Error al enviar datos.');
        } finally {
            setLoading(false);
        }
    };

    if (error) return <div className="error-message">{error}</div>;
    if (!formData) return <div>Cargando datos del contrato...</div>;

    return (
        <div className="add-contract-page">
            <div className="fundamentals-section">
                <h4>Editar Contrato</h4>
                <p>Modifica los metadatos del contrato de datos.</p>
            </div>

            <div className="contract-form-section">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="contract-form-group">
                    <label htmlFor="nombre" className="required">Nombre</label>
                    <input name="nombre" id="nombre" value={formData.nombre} onChange={handleChange} />
                </div>

                <div className="contract-form-group">
                    <label htmlFor="identificacion" className="required">Identificación</label>
                    <input name="identificacion" id="identificacion" value={formData.identificacion} onChange={handleChange} />
                </div>

                <div className="contract-form-group">
                    <label htmlFor="version" className="required">Versión</label>
                    <input name="version" id="version" value={formData.version} onChange={handleChange} />
                </div>

                <div className="contract-form-group">
                    <label htmlFor="estado" className="required">Estado</label>
                    <select name="estado" id="estado" value={formData.estado} onChange={handleChange}>
                        <option value="">Seleccione un estado...</option>
                        <option value="Propuesto">Propuesto</option>
                        <option value="Activo">Activo</option>
                        <option value="Obsolescente">Obsolescente</option>
                        <option value="Jubilado">Jubilado</option>
                    </select>
                </div>

                <div className="contract-form-group">
                    <label htmlFor="dominio" className="required">Dominio principal</label>
                    <select name="dominio" id="dominio" value={formData.dominio} onChange={handleChange}>
                        <option value="">Seleccione equipo...</option>
                        {domains.map(d => (
                            <option key={d.id_dominio} value={d.id_dominio}>{d.nombre_dominio}</option>
                        ))}
                    </select>
                </div>

                <div className="contract-form-group">
                    <label htmlFor="dominio_transferencia">Dominio consumidor</label>
                    <select name="dominio_transferencia" id="dominio_transferencia" value={formData.dominio_transferencia} onChange={handleChange}>
                        <option value="">Seleccione dominio destino...</option>
                        {domains.map(d => (
                            <option key={d.id_dominio} value={d.id_dominio}>{d.nombre_dominio}</option>
                        ))}
                    </select>
                    <small>Dominio que consume el contrato.</small>
                </div>

                <div className="contract-form-group">
                    <label htmlFor="producto" className="required">Producto</label>
                    <select name="producto" id="producto" value={formData.producto} onChange={handleChange}>
                        <option value="">Seleccione producto...</option>
                        {products.map(p => (
                            <option key={p.id_producto_dato} value={p.id_producto_dato}>{p.nombre_producto_dato}</option>
                        ))}
                    </select>
                </div>

                <div className="description-section-container">
                    <div className="description-info">
                        <h4>Descripción</h4>
                        <p>Objeto que contiene las descripciones adicionales.</p>
                    </div>
                    <div className="description-fields">
                        <div className="mb-3">
                            <label htmlFor="uso">Uso</label>
                            <textarea name="uso" id="uso" className="form-control" value={formData.uso} onChange={handleChange} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="proposito">Propósito</label>
                            <textarea name="proposito" id="proposito" className="form-control" value={formData.proposito} onChange={handleChange} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="limitaciones">Limitaciones</label>
                            <textarea name="limitaciones" id="limitaciones" className="form-control" value={formData.limitaciones} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="schema-section-container">
                    <div className="schema-info">
                        <h4>Esquema</h4>
                        <p>Describe el esquema lógico y físico del contrato de datos.</p>
                    </div>
                    <div className="schema-fields">
                        <div className="schema-row">
                            <div className="schema-item">
                                <label htmlFor="esquema_nombre">Nombre</label>
                                <input type="text" name="esquema_nombre" value={formData.esquema_nombre} onChange={handleChange} />
                            </div>
                            <div className="schema-item">
                                <label htmlFor="esquema_nombre_fisico">Nombre físico</label>
                                <input type="text" name="esquema_nombre_fisico" value={formData.esquema_nombre_fisico} onChange={handleChange} />
                            </div>
                            <div className="schema-item">
                                <label>Tipo lógico</label>
                                <input type="text" value="object" disabled />
                            </div>
                        </div>
                        <div className="schema-description">
                            <label htmlFor="esquema_descripcion">Descripción</label>
                            <textarea name="esquema_descripcion" value={formData.esquema_descripcion} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="contract-form-group">
                    <label htmlFor="canal_soporte">Canal de soporte</label>
                    <input type="text" id="canal_soporte" name="canal_soporte" value={formData.canal_soporte} onChange={handleChange} placeholder="Ej: soporte@miempresa.cl" />
                </div>

                <button className="add-contract-button" disabled={loading} onClick={handleSubmit}>
                    Guardar cambios
                </button>
            </div>
        </div>
    );
};

export default EditContractPage;
