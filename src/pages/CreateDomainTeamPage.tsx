import React, { useState, useEffect } from 'react';
import '/css/CreateDomainTeamPage.css'; 

interface Domain {
    id_dominio: number;
    nombre_dominio: string;
    // ... otras propiedades del dominio
}

const CreateDomainTeamPage: React.FC = () => {
    const [name, setName] = useState('');
    const [identification, setIdentification] = useState('');
    const [parentDomainId, setParentDomainId] = useState<number | null>(null);
    const [teamType, setTeamType] = useState<'Dominio' | 'Equipo'>('Dominio');
    const [domains, setDomains] = useState<Domain[]>([]);
    const [loadingDomains, setLoadingDomains] = useState(true);
    const [errorDomains, setErrorDomains] = useState<string | null>(null);

    // Lógica para obtener los dominios
    useEffect(() => {
        const fetchDomains = async () => {
            setLoadingDomains(true);
            setErrorDomains(null);
            try {
                const response = await fetch('/mi-data-app/api.php?action=get_domains'); // Ajusta la URL si es diferente
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setDomains(data);
                setLoadingDomains(false);
            } catch (error: any) {
                setErrorDomains(error.message);
                setLoadingDomains(false);
            }
        };

        fetchDomains();
    }, []);

    const handleSaveTeam = async () => {
        // Lógica para enviar los datos del nuevo equipo a tu API
        const teamData = {
            name,
            identification,
            parent_domain_id: parentDomainId,
            type: teamType
            // ... otros datos que necesites enviar
        };

        console.log('Datos del equipo a guardar:', teamData);

        try {
            const response = await fetch('/mi-data-app/api.php?action=add_domain_team', 
                {method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(teamData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error al guardar el equipo:', errorData);
                // Mostrar mensaje de error al usuario
            } else {
                const successData = await response.json();
                console.log('Equipo guardado exitosamente:', successData);
                // Redirigir a otra página o mostrar mensaje de éxito
            }
        } catch (error: any) {
            console.error('Error de red al guardar el equipo:', error.message);
            // Mostrar mensaje de error de red al usuario
        }
    };

    const handleCancel = () => {
        // Lógica para cancelar y posiblemente redirigir
        console.log('Cancelar creación de equipo');
    };

    return (
        <div className="create-domain-team-page-container">
            <h2 className="page-title">Agregar equipo</h2>
            <div className="form-layout">
                <div className="info-section">
                    <h3>Equipo</h3>
                    <p>Un equipo posee productos de datos, sistemas fuente, contratos de datos...</p>
                </div>
                <div className="form-section">
                    <div className="form-group">
                        <label htmlFor="name" className="required-label">Nombre</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="p. ej. Marketing"
                        />
                        <p className="help-text">Nombre para mostrar de un equipo.</p>
                    </div>
                    <div className="form-group">
                        <label htmlFor="identification" className="required-label">IDENTIFICACIÓN</label>
                        <input
                            type="text"
                            id="identification"
                            value={identification}
                            onChange={(e) => setIdentification(e.target.value)}
                            placeholder="p. ej. marketing"
                        />
                        <p className="help-text">Un identificador técnico único para toda la organización de un equipo, como un UUID, un URN, una cadena o un número.</p>
                    </div>
                    <div className="form-group">
                        <label htmlFor="parentDomain">Dominio principal</label>
                        <select
                            id="parentDomain"
                            value={parentDomainId === null ? 'Ninguno' : parentDomainId}
                            onChange={(e) => setParentDomainId(e.target.value === 'Ninguno' ? null : parseInt(e.target.value))}
                        >
                            <option value="Ninguno">Ninguno</option>
                            {loadingDomains ? (
                                <option disabled>Cargando dominios...</option>
                            ) : errorDomains ? (
                                <option disabled>Error al cargar dominios</option>
                            ) : (
                                domains.map((domain) => (
                                    <option key={domain.id_dominio} value={domain.id_dominio}>
                                        {domain.nombre_dominio}
                                    </option>
                                ))
                            )}
                        </select>
                        <p className="help-text">El dominio principal de este equipo. Opcional.</p>
                    </div>
                    <div className="form-group">
                        <label className="required-label">Tipo</label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="teamType"
                                    value="Dominio"
                                    checked={teamType === 'Dominio'}
                                    onChange={(e) => setTeamType(e.target.value as 'Dominio')}
                                />
                                Dominio
                                <span className="radio-description">Una unidad de negocio. Puede ser jerárquica. Los equipos pueden formar parte de un dominio.</span>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="teamType"
                                    value="Equipo"
                                    checked={teamType === 'Equipo'}
                                    onChange={(e) => setTeamType(e.target.value as 'Equipo')}
                                />
                                Equipo
                                <span className="radio-description">Un equipo de dominio/producto/función/desarrollo. Un equipo puede ser propietario de productos de datos.</span>
                            </label>
                        </div>
                    </div>
                    <div className="button-bar">
                        <button type="button" className="cancel-button" onClick={handleCancel}>
                            Cancelar
                        </button>
                        <button type="button" className="add-team-button" onClick={handleSaveTeam}>
                            + Agregar equipo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateDomainTeamPage;