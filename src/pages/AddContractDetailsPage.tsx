import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Domain, Product } from '../index';

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
        limitaciones: '',
        precio_monto: '',
        precio_moneda: '',
        precio_unitario: ''
    });

    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setError(null);
        const camposObligatorios = [
            'nombre', 'identificacion', 'version', 'estado', 'dominio',
            'producto', 'responsable', 'uso', 'proposito', 'limitaciones',
            'precio_monto', 'precio_moneda', 'precio_unitario'
        ];

        for (const campo of camposObligatorios) {
            if (!formData[campo as keyof typeof formData]) {
                setError('Todos los campos son obligatorios.');
                return;
            }
        }

        const descripcion =
            `ID: ${formData.identificacion} | Versión: ${formData.version} | Estado: ${formData.estado} | Responsable: ${formData.responsable} | ` +
            `Uso: ${formData.uso} | Propósito: ${formData.proposito} | Limitaciones: ${formData.limitaciones}`;

        const payload = {
            id_producto_dato: parseInt(formData.producto),
            id_dominio_consumidor: parseInt(formData.dominio),
            nombre_contrato_dato: formData.nombre,
            descripcion_contrato_dato: descripcion,
            uso: formData.uso,
            proposito: formData.proposito,
            limitaciones: formData.limitaciones,
            precio_monto: parseFloat(formData.precio_monto),
            precio_moneda: formData.precio_moneda,
            precio_unitario: formData.precio_unitario
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
        <div className="container py-4">
            <h2>Agregar contrato de datos</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            {/* FUNDAMENTOS */}
            <h5 className="mt-4 mb-2">Fundamentos</h5>
            <div className="mb-3">
                <label className="form-label">Nombre del contrato</label>
                <input name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} />
            </div>
            <div className="mb-3">
                <label className="form-label">Identificador del Producto (manual)</label>
                <input name="identificacion" className="form-control" value={formData.identificacion} onChange={handleChange} />
            </div>
            <div className="mb-3">
                <label className="form-label">Versión</label>
                <input name="version" className="form-control" value={formData.version} onChange={handleChange} />
            </div>
            <div className="mb-3">
                <label className="form-label">Estado</label>
                <select name="estado" className="form-select" value={formData.estado} onChange={handleChange}>
                    <option value="">Seleccione un estado…</option>
                    <option value="Propuesto">Propuesto</option>
                    <option value="Activo">Activo</option>
                    <option value="Obsolescente">Obsolescente</option>
                    <option value="Jubilado">Jubilado</option>
                </select>
            </div>

            {/* RESPONSABLE Y VÍNCULOS */}
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

            {/* DESCRIPCIÓN */}
            <h5 className="mt-4 mb-2">Descripción</h5>
            <div className="mb-3">
                <label className="form-label">Uso</label>
                <textarea name="uso" className="form-control" value={formData.uso} onChange={handleChange} />
            </div>
            <div className="mb-3">
                <label className="form-label">Propósito</label>
                <textarea name="proposito" className="form-control" value={formData.proposito} onChange={handleChange} />
            </div>
            <div className="mb-3">
                <label className="form-label">Limitaciones</label>
                <textarea name="limitaciones" className="form-control" value={formData.limitaciones} onChange={handleChange} />
            </div>

            {/* PRECIOS */}
            <h5 className="mt-4 mb-2">Precios</h5>
            <div className="mb-3">
                <label className="form-label">Monto</label>
                <input type="number" name="precio_monto" className="form-control" value={formData.precio_monto} onChange={handleChange} />
            </div>
            <div className="mb-3">
                <label className="form-label">Moneda</label>
                <input name="precio_moneda" className="form-control" value={formData.precio_moneda} onChange={handleChange} />
            </div>
            <div className="mb-3">
                <label className="form-label">Unidad</label>
                <input name="precio_unitario" className="form-control" value={formData.precio_unitario} onChange={handleChange} />
            </div>

            <button className="btn btn-primary" disabled={loading} onClick={handleSubmit}>
                + Agregar contrato de datos
            </button>
        </div>
    );
};

export default AddContractDetailsPage;
