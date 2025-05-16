// src/pages/DatosOperativosPage.tsx
import React from 'react';
import { DatoOperativo } from '../index'; // Asume que AppProps también se exporta de index o que pasas las props directamente
import DatoOperativoForm from '../components/DatoOperativoForm'; // Importa el formulario

// Define las props que esta página espera de App.tsx
interface DatosOperativosPageProps {
    datosOperativos: DatoOperativo[];
    loading: boolean;
    error: string | null;
    onSave: (data: Partial<DatoOperativo>) => Promise<boolean>;
    onDelete: (id: number) => Promise<void>;
    // Props para manejar la visibilidad y datos del formulario
    showForm: boolean;
    currentDatoOperativo: Partial<DatoOperativo> | null;
    onAddNew: () => void;
    onEdit: (datoOp: DatoOperativo) => void;
    onCancelForm: () => void;
}

const DatosOperativosPage: React.FC<DatosOperativosPageProps> = ({
    datosOperativos, loading, error, onSave, onDelete,
    showForm, currentDatoOperativo, onAddNew, onEdit, onCancelForm
}) => {
    const pageLoading = loading && datosOperativos.length === 0;

    return (
        <div className="page-container">
            <h2>Datos Operativos ({datosOperativos.length})</h2>
            <button className="add-new" onClick={onAddNew} disabled={loading}>
                + Nuevo Dato Operativo
            </button>

            {showForm && (
                <DatoOperativoForm
                    initialData={currentDatoOperativo}
                    onSave={onSave}
                    onCancel={onCancelForm}
                    isLoading={loading}
                />
            )}

            {pageLoading && <div className="loading-message">Cargando datos operativos...</div>}
            {!pageLoading && error && <div className="error-message">Error: {error}</div>}
            {!pageLoading && !error && datosOperativos.length === 0 && !showForm && (
                <p>No hay datos operativos creados.</p>
            )}

            {!pageLoading && !error && datosOperativos.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {datosOperativos.map(dato => (
                        <li key={dato.id_dato_operativo} style={{ background: '#f9f9f9', border: '1px solid #ddd', marginBottom: '10px', padding: '10px 15px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>{dato.nombre_dato}</strong>
                                <span>Tipo: {dato.tipo_dato} {dato.largo_dato ? `(${dato.largo_dato})` : ''}</span>
                                <small>Descripción: {dato.descripcion_dato || 'N/A'}</small>
                                <small>Regla: {dato.regla_negocio || 'N/A'}</small>
                            </div>
                            <div className="actions">
                                <button className="edit" onClick={() => onEdit(dato)} disabled={loading}>E</button>
                                <button className="delete" onClick={() => onDelete(dato.id_dato_operativo)} disabled={loading}>X</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DatosOperativosPage;