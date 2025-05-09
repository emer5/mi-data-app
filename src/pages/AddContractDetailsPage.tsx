// 🧩 NUEVO ARCHIVO: src/pages/AddContractDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Domain, Product } from '../index';

interface AddContractDetailsPageProps {
    products: Product[];
    domains: Domain[];
    onSaveContract: (data: any) => Promise<boolean>;
    loading: boolean;
    fetchContracts: () => void; // ✅ Agregado para recargar contratos al volver
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
        estado: '',
        dominio: '',
        producto: '',
        responsable: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setError(null);
        if (Object.values(formData).some(f => !f)) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        const descripcion = `ID: ${formData.identificacion} | Versión: 0.0.1 | Estado: ${formData.estado} | Responsable: ${formData.responsable}`;
        const payload = {
            id_producto_dato: parseInt(formData.producto),
            id_dominio_consumidor: parseInt(formData.dominio),
            nombre_contrato_dato: formData.nombre,
            descripcion_contrato_dato: descripcion
        };

        const success = await onSaveContract(payload);
        if (success) {
            setSuccess(true);
            fetchContracts(); // ✅ Forzar recarga de contratos
            navigate('/contratos');
        } else {
            setError('No se pudo guardar el contrato.');
        }
    };

    return (
        <div className="container py-4">
            <h2>Agregar contrato de datos</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
                <label className="form-label">Nombre del contrato</label>
                <input name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} />
            </div>

            <div className="mb-3">
                <label className="form-label">Identificación</label>
                <input name="identificacion" className="form-control" value={formData.identificacion} onChange={handleChange} />
            </div>

            <div className="mb-3">
                <label className="form-label">Estado</label>
                <select name="estado" className="form-select" value={formData.estado} onChange={handleChange}>
                    <option value="">Seleccionar estado</option>
                    <option value="Propuesto">Propuesto</option>
                    <option value="Activo">Activo</option>
                    <option value="Obsolescente">Obsolescente</option>
                    <option value="Jubilado">Jubilado</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Dominio consumidor</label>
                <select name="dominio" className="form-select" value={formData.dominio} onChange={handleChange}>
                    <option value="">Seleccionar dominio</option>
                    {domains.map(d => (
                        <option key={d.id_dominio} value={d.id_dominio}>{d.nombre_dominio}</option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Producto</label>
                <select name="producto" className="form-select" value={formData.producto} onChange={handleChange}>
                    <option value="">Seleccionar producto</option>
                    {products.map(p => (
                        <option key={p.id_producto_dato} value={p.id_producto_dato}>{p.nombre_producto_dato}</option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Responsable (Arrendatario)</label>
                <input name="responsable" className="form-control" value={formData.responsable} onChange={handleChange} />
            </div>

            <button className="btn btn-primary" disabled={loading} onClick={handleSubmit}>
                + Agregar contrato de datos
            </button>
        </div>
    );
};

export default AddContractDetailsPage;
