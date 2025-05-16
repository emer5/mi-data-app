// src/components/DatoOperativoForm.tsx
import React, { useState, useEffect } from 'react';
import { DatoOperativo } from '../index'; // Asumiendo que está en index.tsx

const TIPOS_DATO = ['Texto', 'Numerico']; // Podrías expandir esto

interface DatoOperativoFormProps {
    initialData: Partial<DatoOperativo> | null;
    onSave: (data: Partial<DatoOperativo>) => Promise<boolean>;
    onCancel: () => void;
    isLoading: boolean;
}

const DatoOperativoForm: React.FC<DatoOperativoFormProps> = ({ initialData, onSave, onCancel, isLoading }) => {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState<string>(TIPOS_DATO[0]);
    const [largo, setLargo] = useState<string>(''); // Como string para el input
    const [descripcion, setDescripcion] = useState('');
    const [regla, setRegla] = useState('');

    const isEditing = !!initialData?.id_dato_operativo;

    useEffect(() => {
        if (initialData) {
            setNombre(initialData.nombre_dato || '');
            setTipo(initialData.tipo_dato || TIPOS_DATO[0]);
            setLargo(initialData.largo_dato?.toString() || '');
            setDescripcion(initialData.descripcion_dato || '');
            setRegla(initialData.regla_negocio || '');
        } else {
            // Reset para nuevo
            setNombre('');
            setTipo(TIPOS_DATO[0]);
            setLargo('');
            setDescripcion('');
            setRegla('');
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !tipo.trim()) {
            alert("Nombre y Tipo son requeridos.");
            return;
        }
        const dataToSave: Partial<DatoOperativo> = {
            ...(isEditing && { id_dato_operativo: initialData!.id_dato_operativo }),
            nombre_dato: nombre,
            tipo_dato: tipo,
            largo_dato: largo ? parseInt(largo, 10) : null,
            descripcion_dato: descripcion.trim() || null,
            regla_negocio: regla.trim() || null,
        };
        const success = await onSave(dataToSave);
        if (success && !isEditing) { // Reset form si fue exitoso y es nuevo
             setNombre(''); setTipo(TIPOS_DATO[0]); setLargo(''); setDescripcion(''); setRegla('');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{marginTop: '20px', marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px'}}>
            <h3>{isEditing ? 'Editar' : 'Nuevo'} Dato Operativo</h3>
            <div>
                <label htmlFor="dato-op-nombre">Nombre:</label>
                <input id="dato-op-nombre" type="text" value={nombre} onChange={e => setNombre(e.target.value)} maxLength={100} required disabled={isLoading} />
            </div>
            <div>
                <label htmlFor="dato-op-tipo">Tipo de Dato:</label>
                <select id="dato-op-tipo" value={tipo} onChange={e => setTipo(e.target.value)} required disabled={isLoading}>
                    {TIPOS_DATO.map(t => <option key={t} value={t}>{t}</option>)}
                    {/* Añade más opciones si es necesario */}
                </select>
            </div>
            <div>
                <label htmlFor="dato-op-largo">Largo (opcional):</label>
                <input id="dato-op-largo" type="number" value={largo} onChange={e => setLargo(e.target.value)} min="0" disabled={isLoading} />
            </div>
            <div>
                <label htmlFor="dato-op-desc">Descripción:</label>
                <textarea id="dato-op-desc" value={descripcion} onChange={e => setDescripcion(e.target.value)} maxLength={300} disabled={isLoading} />
            </div>
            <div>
                <label htmlFor="dato-op-regla">Regla de Negocio Asociada:</label>
                <textarea id="dato-op-regla" value={regla} onChange={e => setRegla(e.target.value)} maxLength={500} disabled={isLoading} />
            </div>
            <div className="form-actions" style={{marginTop: '10px'}}>
                <button type="submit" className="add-new" disabled={isLoading}>{isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}</button>
                <button type="button" onClick={onCancel} disabled={isLoading}>Cancelar</button>
            </div>
        </form>
    );
};

export default DatoOperativoForm;