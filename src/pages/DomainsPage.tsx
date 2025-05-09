import React from 'react';
import { Domain, DomainFormProps } from '../index'; // Eliminadas Product y Contract si no se usan aquí

interface DomainsPageProps {
    domains: Domain[];
    loading: boolean;
    error: string | null;
    onAddNew: () => void;
    onEdit: (domain: Domain) => void;
    onDelete: (id: number) => Promise<void>;
    showForm: boolean;
    currentDomain: Partial<Domain> | null;
    onSave: (data: Partial<Domain>) => Promise<void>;
    onCancel: () => void;
    DomainFormComponent: React.FC<DomainFormProps>;
}

const DomainsPage: React.FC<DomainsPageProps> = ({
    domains, loading, error, onAddNew, onEdit, onDelete,
    showForm, currentDomain, onSave, onCancel, DomainFormComponent
}) => {
    const pageLoading = loading && domains.length === 0;

    return (
        <div className="page-container">
            <h2>Dominios ({domains.length})</h2>
            <button className="add-new" onClick={onAddNew} disabled={loading}>+ Nuevo Dominio</button>

            {showForm && (
                <DomainFormComponent
                   initialData={currentDomain}
                   onSave={onSave}
                   onCancel={onCancel}
                   isLoading={loading}
                />
            )}

            {/* El error global de App.tsx ya lo maneja */}
            {/* {error && <div className="error-message">Error: {error}</div>} */}

            {pageLoading && <div className="loading-message">Cargando dominios...</div>}

            {!pageLoading && domains.length === 0 && !error && <p>No hay dominios creados.</p>}

            {!pageLoading && domains.length > 0 && (
                <ul>
                    {domains.map(domain => (
                        <li key={domain.id_dominio}>
                            <div>
                                <strong>{domain.nombre_dominio}</strong>
                                <span>{domain.descripcion_dominio}</span>
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