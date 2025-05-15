import React from 'react';
// Asegúrate que la interfaz Domain aquí sea la misma que en index.tsx (con los nuevos campos)
import '/css/CreateDomainTeamPage.css';
import { Domain, DomainFormProps } from '../index';

interface DomainsPageProps {
    domains: Domain[]; // Esta es la lista de dominios/equipos a mostrar Y para el dropdown del form
    loading: boolean;
    error: string | null;
    onAddNew: () => void;
    onEdit: (domain: Domain) => void;
    onDelete: (id: number) => Promise<void>;
    showForm: boolean;
    currentDomain: Partial<Domain> | null;
    onSave: (data: Partial<Domain>) => Promise<void>;
    onCancel: () => void;
    DomainFormComponent: React.FC<DomainFormProps>; // El tipo de la prop es correcto
}

const DomainsPage: React.FC<DomainsPageProps> = ({
    domains, loading, error, onAddNew, onEdit, onDelete,
    showForm, currentDomain, onSave, onCancel, DomainFormComponent
}) => {
    const pageLoading = loading && domains.length === 0;

    return (
        <div className="page-container">
            {/* Puedes cambiar el título si ahora son "Dominios / Equipos" */}
            <h2>Dominios / Equipos ({domains.length})</h2>
            <button className="add-new" onClick={onAddNew} disabled={loading}>+ Nuevo</button>

            {showForm && (
                <DomainFormComponent
                   initialData={currentDomain}
                   onSave={onSave}
                   onCancel={onCancel}
                   isLoading={loading}
                   allDomains={domains} // <--- AÑADE ESTA LÍNEA (usa la prop 'domains' de DomainsPage)
                />
            )}

            {pageLoading && <div className="loading-message">Cargando...</div>}

            {!pageLoading && domains.length === 0 && !error && <p>No hay dominios/equipos creados.</p>}

            {!pageLoading && domains.length > 0 && (
                <ul>
                    {domains.map(domain => (
                        <li key={domain.id_dominio}>
                            <div>
                                <strong>{domain.nombre_dominio}</strong> ({domain.tipo_entidad})
                                {domain.identificacion_dominio && <small style={{display: 'block', color: '#555'}}>ID: {domain.identificacion_dominio}</small>}
                                {/* La descripción puede seguir siendo descripción_dominio */}
                                <span>{domain.descripcion_dominio}</span>
                                {domain.nombre_dominio_padre && <small style={{display: 'block', color: '#777'}}>Principal: {domain.nombre_dominio_padre}</small>}
                            </div>
                            <div className="actions">
                                <button className="edit" onClick={() => onEdit(domain)} disabled={loading}>E</button>
                                <button className="delete" onClick={() => onDelete(domain.id_dominio)} disabled={loading}>X</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DomainsPage;