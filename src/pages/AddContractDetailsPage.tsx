// src/pages/AddContractDetailsPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Domain, Product } from '../index';
import '../../css/AddContractDetailsPage.css';

interface AddContractDetailsPageProps {
    products: Product[];
    domains: Domain[];
    onSaveContract: (data: any) => Promise<boolean>;
    loading: boolean;
    fetchContracts: () => void;
}

const AddContractDetailsPage: React.FC<AddContractDetailsPageProps> = ({
    products,
    domains,
    onSaveContract,
    loading,
    fetchContracts
}) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        identificacion: '',
        version: '0.0.1',
        estado: '',
        dominio: '',
        producto: '',
        responsable: '',
        uso: '',
        proposito: '',
        limitaciones: ''
    });

    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setError(null);
        const camposObligatorios = ['nombre', 'identificacion', 'version', 'estado', 'dominio', 'producto', 'responsable'];

        for (const campo of camposObligatorios) {
            if (!formData[campo as keyof typeof formData]) {
                setError('Todos los campos son obligatorios.');
                return;
            }
        }

        const payload = {
            id_producto_dato: parseInt(formData.producto),
            id_dominio_consumidor: parseInt(formData.dominio),
            nombre_contrato_dato: formData.nombre,
            descripcion_contrato_dato: `ID: ${formData.identificacion} | Versión: ${formData.version} | Estado: ${formData.estado} | Responsable: ${formData.responsable}`,
            uso: formData.uso,
            proposito: formData.proposito,
            limitaciones: formData.limitaciones
        };

        const success = await onSaveContract(payload);
        if (success) {
            fetchContracts();
            navigate('/contratos');
        } else {
            setError('No se pudo guardar el contrato.');
        }
    };

    return (
        <div className="add-contract-page">
            {/* Fundamentos */}
            <div className="fundamentals-section">
                <h4>Fundamentos</h4>
                <p>Especifica los metadatos del contrato de datos.</p>
            </div>

            <div className="contract-form-section">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="contract-form-group">
                    <label htmlFor="nombre" className="required">Nombre</label>
                    <input name="nombre" id="nombre" value={formData.nombre} onChange={handleChange} />
                    <small>Nombre del contrato de datos.</small>
                </div>

                <div className="contract-form-group">
                    <label htmlFor="identificacion" className="required">Identificación</label>
                    <input name="identificacion" id="identificacion" value={formData.identificacion} onChange={handleChange} />
                    <small>Identificador técnico único, como UUID o URN.</small>
                </div>

                <div className="contract-form-group">
                    <label htmlFor="version" className="required">Versión</label>
                    <input name="version" id="version" value={formData.version} onChange={handleChange} />
                    <small>Versión del documento del contrato.</small>
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
                    <label htmlFor="dominio" className="required">Propietario</label>
                    <select name="dominio" id="dominio" value={formData.dominio} onChange={handleChange}>
                        <option value="">Seleccione equipo...</option>
                        {domains.map(d => (
                            <option key={d.id_dominio} value={d.id_dominio}>{d.nombre_dominio}</option>
                        ))}
                    </select>
                    <small>Equipo responsable de este contrato.</small>
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

                <div className="contract-form-group">
                    <label htmlFor="responsable" className="required">Responsable</label>
                    <input name="responsable" id="responsable" value={formData.responsable} onChange={handleChange} />
                </div>

                {/* Descripción Extendida */}
                <div className="description-section-container">
                    <div className="description-info">
                        <h4>Descripción</h4>
                        <p>Objeto que contiene las descripciones adicionales.</p>
                    </div>
                    <div className="description-fields">
                        <div className="mb-3">
                            <label htmlFor="uso" className="form-label">Uso</label>
                            <textarea
                                name="uso"
                                id="uso"
                                className="form-control"
                                value={formData.uso}
                                onChange={handleChange}
                                placeholder="Describe el uso permitido de los datos"
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="proposito" className="form-label">Propósito</label>
                            <textarea
                                name="proposito"
                                id="proposito"
                                className="form-control"
                                value={formData.proposito}
                                onChange={handleChange}
                                placeholder="Describe el propósito del contrato"
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="limitaciones" className="form-label">Limitaciones</label>
                            <textarea
                                name="limitaciones"
                                id="limitaciones"
                                className="form-control"
                                value={formData.limitaciones}
                                onChange={handleChange}
                                placeholder="Limitaciones legales, técnicas, etc."
                            />
                        </div>
                    </div>
                </div>

                <button className="add-contract-button" disabled={loading} onClick={handleSubmit}>
                    + Agregar contrato de datos
                </button>
            </div>
        </div>
    );
};

export default AddContractDetailsPage;
