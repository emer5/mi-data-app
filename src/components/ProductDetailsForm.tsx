// src/components/ProductDetailsForm.tsx (NUEVO ARCHIVO)
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Necesitas instalar uuid: npm install uuid @types/uuid
import { Domain, Product } from '../index'; // Ajusta ruta

// Definir los posibles estados
const STATUS_OPTIONS = ['Development', 'Testing', 'Production', 'Deprecated', 'Archived'];

interface ProductDetailsFormProps {
    productType: string; // Tipo recibido de la página anterior
    domains: Domain[];
    onSave: (data: Partial<Product>) => Promise<boolean>;
    onCancel: () => void;
    isLoading: boolean;
    // initialData?: Partial<Product> | null; // Para reutilizar en edición (futuro)
}

const ProductDetailsForm: React.FC<ProductDetailsFormProps> = ({
    productType,
    domains,
    onSave,
    onCancel,
    isLoading,
    // initialData = null // Para edición futura
}) => {
    // Estados para cada campo del formulario
    const [nombre, setNombre] = useState('');
    const [identificador] = useState<string>(uuidv4()); // Generar UUID al montar
    const [ownerDomainId, setOwnerDomainId] = useState<number | ''>('');
    const [status, setStatus] = useState<string>('');
    const [descripcion, setDescripcion] = useState('');
    const [tags, setTags] = useState<string>(''); // Almacenar como string CSV

    // Preseleccionar el primer dominio si existe
    useEffect(() => {
        if (domains.length > 0 && ownerDomainId === '') {
            setOwnerDomainId(domains[0].id_dominio);
        }
        // Preseleccionar estado por defecto si se desea
        // if (status === '' && STATUS_OPTIONS.length > 0) {
        //     setStatus(STATUS_OPTIONS[0]);
        // }
    }, [domains, ownerDomainId]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ownerDomainId) {
            alert("Seleccione un dominio propietario.");
            return;
        }
        // Crear el objeto con los datos del formulario
        const formData: Partial<Product> = {
            nombre_producto_dato: nombre,
            identificador_unico: identificador, // Enviamos el UUID generado
            id_dominio_propietario: Number(ownerDomainId),
            estado: status || null, // Enviar null si no se seleccionó
            descripcion_producto_dato: descripcion,
            tags: tags.trim() || null, // Enviar null si está vacío
            // El 'tipo' se añadirá en AddProductDetailsPage antes de llamar a onSave
        };
        await onSave(formData); // Llamar a la función save pasada por props
    };

    return (
         // Aplica estilos CSS para que se parezca al screenshot
        <form onSubmit={handleSubmit} className="detailed-product-form">
            {/* 1. Nombre */}
            <div>
                <label htmlFor="product-name">Nombre <span style={{color:'red'}}>*Requerido</span></label>
                <input
                    id="product-name" type="text" value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    maxLength={50} required disabled={isLoading}
                    placeholder="The display name of this data product"
                />
            </div>

            {/* 2. ID (Mostrar, no editable) */}
             <div>
                <label htmlFor="product-id">ID <span style={{color:'red'}}>*Requerido</span></label>
                <input
                    id="product-id" type="text" value={identificador}
                     readOnly disabled // Hacerlo read-only y deshabilitado visualmente
                    style={{ backgroundColor: '#eee', cursor: 'not-allowed' }}
                />
            </div>

            {/* 3. Owner Domain */}
            <div>
                <label htmlFor="product-owner">Dominio<span style={{color:'red'}}>*Required</span></label>
                <select
                    id="product-owner" value={ownerDomainId}
                    onChange={(e) => setOwnerDomainId(Number(e.target.value))}
                    required disabled={isLoading || domains.length === 0}
                >
                     <option value="" disabled>Seleccionar Dominio...</option>
                     {domains.map(domain => (
                        <option key={domain.id_dominio} value={domain.id_dominio}>
                            {domain.nombre_dominio}
                        </option>
                    ))}
                </select>
                {domains.length === 0 && <small style={{color: 'red'}}>No domains available.</small>}
             </div>

            {/* 4. Status */}
            <div>
                <label htmlFor="product-status">Estado</label>
                <select
                    id="product-status" value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isLoading}
                >
                    <option value="" disabled>Seleccionar Estado</option>
                    {STATUS_OPTIONS.map(stat => (
                        <option key={stat} value={stat}>{stat}</option>
                    ))}
                </select>
                <small>The current stage in the lifecycle.</small>
            </div>

            {/* 5. Archetype (Mostrar tipo seleccionado, no editable aquí) */}
            <div>
                <label htmlFor="product-archetype">Archetype</label>
                <input
                    id="product-archetype" type="text" value={productType}
                    readOnly disabled style={{ backgroundColor: '#eee', cursor: 'not-allowed' }}
                />
                <small>The classification of domain data.</small>
            </div>

            {/* 6. Description */}
            <div>
                <label htmlFor="product-desc">Description</label>
                <textarea
                    id="product-desc" value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    maxLength={300} /* Ajusta si es necesario */
                    disabled={isLoading}
                    rows={4}
                />
            </div>

            {/* 7. Tags (Implementación simple con CSV) */}
            <div>
                 <label htmlFor="product-tags">Tags</label>
                <input
                    id="product-tags" type="text" value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    disabled={isLoading}
                    placeholder="Add tags separated by commas (e.g., finance, report, monthly)"
                />
                <small>Add a tag.</small> {/* Podrías añadir un botón "Add" si quieres una UI más compleja */}
            </div>

            {/* Acciones */}
            <div className="form-actions">
                 <button type="submit" className='add-new' disabled={isLoading || domains.length === 0}>
                    {isLoading ? 'Saving...' : 'Save Product'}
                </button>
                <button type="button" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ProductDetailsForm;