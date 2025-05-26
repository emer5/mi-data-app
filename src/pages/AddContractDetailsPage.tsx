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
    limitaciones: '',
    esquema_nombre: '',
    esquema_nombre_fisico: '',
    esquema_tipo: 'object',
    esquema_descripcion: '',
    canal_soporte: '', // ✅ ¡Con coma!
});

    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setError(null);
        const camposObligatorios = [
            'nombre',
            'identificacion',
            'version',
            'estado',
            'dominio',
            'producto',
            'responsable'
        ];

        for (const campo of camposObligatorios) {
            if (!formData[campo as keyof typeof formData]) {
                setError('Todos los campos obligatorios deben completarse.');
                return;
            }
        }

        const esquemaJSON = JSON.stringify({
            nombre: formData.esquema_nombre,
            nombre_fisico: formData.esquema_nombre_fisico,
            tipo: formData.esquema_tipo,
            descripcion: formData.esquema_descripcion
        });

const payload = {
    id_producto_dato: parseInt(formData.producto),
    id_dominio_consumidor: parseInt(formData.dominio),
    nombre_contrato_dato: formData.nombre,
    descripcion_contrato_dato: `ID: ${formData.identificacion} | Versión: ${formData.version} | Estado: ${formData.estado} | Responsable: ${formData.responsable}`,
    uso: formData.uso,
    proposito: formData.proposito,
    limitaciones: formData.limitaciones,
    esquema: esquemaJSON, // ✅ coma agregada
    canal_soporte: formData.canal_soporte
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
                    <small>Identificador único como UUID o URN.</small>
                </div>

                <div className="contract-form-group">
                    <label htmlFor="version" className="required">Versión</label>
                    <input name="version" id="version" value={formData.version} onChange={handleChange} />
                    <small>Versión del documento.</small>
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
                            <option key={d.id_dominio} value={d.id_dominio}>
                                {d.nombre_dominio}
                            </option>
                        ))}
                    </select>
                    <small>Equipo responsable del contrato.</small>
                </div>

                <div className="contract-form-group">
                    <label htmlFor="producto" className="required">Producto</label>
                    <select name="producto" id="producto" value={formData.producto} onChange={handleChange}>
                        <option value="">Seleccione producto...</option>
                        {products.map(p => (
                            <option key={p.id_producto_dato} value={p.id_producto_dato}>
                                {p.nombre_producto_dato}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="contract-form-group">
                    <label htmlFor="responsable" className="required">Responsable</label>
                    <input name="responsable" id="responsable" value={formData.responsable} onChange={handleChange} />
                </div>

                {/* Descripción */}
                <div className="description-section-container">
                    <div className="description-info">
                        <h4>Descripción</h4>
                        <p>Objeto que contiene las descripciones adicionales.</p>
                    </div>
                    <div className="description-fields">
                        <div className="mb-3">
                            <label htmlFor="uso">Uso</label>
                            <textarea
                                name="uso"
                                id="uso"
                                className="form-control"
                                placeholder="Describe el uso permitido de los datos"
                                value={formData.uso}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="proposito">Propósito</label>
                            <textarea
                                name="proposito"
                                id="proposito"
                                className="form-control"
                                placeholder="Describe el propósito del contrato"
                                value={formData.proposito}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="limitaciones">Limitaciones</label>
                            <textarea
                                name="limitaciones"
                                id="limitaciones"
                                className="form-control"
                                placeholder="Limitaciones legales, técnicas, etc."
                                value={formData.limitaciones}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Sección Esquema */}
                <div className="schema-section-container">
                    <div className="schema-info">
                        <h4>Esquema</h4>
                        <p>
                            En esta sección se describe el esquema del contrato de datos. Es el soporte para la calidad de los datos,
                            que se detalla en la siguiente sección. Schema admite tanto una representación empresarial de los datos como una
                            implementación física. Permite unirlos entre sí.
                        </p>
                    </div>

                    <div className="schema-fields">
                        <div className="schema-row">
                            <div className="schema-item">
                                <label htmlFor="esquema_nombre">Nombre</label>
                                <input
                                    type="text"
                                    name="esquema_nombre"
                                    value={formData.esquema_nombre}
                                    onChange={handleChange}
                                    placeholder="Nombre del elemento"
                                    pattern="[A-Za-z\s]+"
                                    title="Solo letras"
                                />
                                <small>Nombre del elemento.</small>
                            </div>

                            <div className="schema-item">
                                <label htmlFor="esquema_nombre_fisico">Nombre físico</label>
                                <input
                                    type="text"
                                    name="esquema_nombre_fisico"
                                    value={formData.esquema_nombre_fisico}
                                    onChange={handleChange}
                                    placeholder="Nombre físico"
                                    pattern="[A-Za-z\s]+"
                                    title="Solo letras"
                                />
                                <small>Nombre físico</small>
                            </div>

                            <div className="schema-item">
                                <label>Tipo lógico</label>
                                <input
                                    type="text"
                                    value="object"
                                    disabled
                                />
                                <small>Tipo lógico.</small>
                            </div>
                        </div>

                        <div className="schema-description">
                            <label htmlFor="esquema_descripcion">Descripción</label>
                            <textarea
                                name="esquema_descripcion"
                                value={formData.esquema_descripcion}
                                onChange={handleChange}
                                placeholder="Descripción"
                            />
                            <small>Descripción</small>
                        </div>

                        <h5>Propiedades</h5>
                        <div className="schema-prop-row">
                            <input type="text" placeholder="Nombre" />
                            <div className="label-group">
                                <span className="label-blue">R</span>
                                <span className="label-blue">U</span>
                            </div>
                            <select>
                                <option value="cuerda">cuerda</option>
                                <option value="fecha">fecha</option>
                                <option value="número">número</option>
                                <option value="entero">entero</option>
                                <option value="objeto">objeto</option>
                                <option value="arreglo">arreglo</option>
                                <option value="booleano">booleano</option>
                            </select>
                            <input type="text" placeholder="Tipo físico" />
                            <input type="text" placeholder="Descripción" />
                        </div>
                    </div>
                </div>

                <div className="contract-form-group">
                    <label htmlFor="canal_soporte">Canal de soporte</label>
                    <input
                        type="text"
                        id="canal_soporte"
                        name="canal_soporte"
                        value={formData.canal_soporte}
                        onChange={handleChange}
                        placeholder="Ej: soporte@miempresa.cl o canal de Slack"
                    />
                    <small>Contacto para soporte en caso de dudas del consumidor.</small>
                </div>


                <button className="add-contract-button" disabled={loading} onClick={handleSubmit}>
                    + Agregar contrato de datos
                </button>
            </div>
        </div>
    );
};

export default AddContractDetailsPage;
