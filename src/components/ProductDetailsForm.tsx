// src/components/ProductDetailsForm.tsx (NUEVO ARCHIVO)
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Necesitas instalar uuid: npm install uuid @types/uuid
import { Domain, Product } from '../index'; // Ajusta ruta

// Definir los posibles estados
const STATUS_OPTIONS = ['Desarrollo','Pruebas','Producción','Obsoleto','Archivado'];

interface ProductDetailsFormProps {
    productType: string; // Tipo recibido de la página anterior
    domains: Domain[];
    onSave: (data: Partial<Product>,isEditing: boolean) => Promise<boolean>;
    onCancel: () => void;
    isLoading: boolean;
    initialData?: Partial<Product> | null; // Para reutilizar en edición
}

const ProductDetailsForm: React.FC<ProductDetailsFormProps> = ({
    productType,
    domains,
    onSave,
    onCancel,
    isLoading,
    initialData = null // Para edición futura
}) => {
    // Estados para cada campo del formulario
    const isEditing = !!initialData?.id_producto_dato;

    const [nombre, setNombre] = useState('');
    // Si estamos editando, usamos el ID existente. Si no, generamos UUID.
    // El identificador_unico no debería cambiar una vez creado.
    const [identificador, setIdentificador] = useState<string>('');
    const [ownerDomainId, setOwnerDomainId] = useState<number | ''>('');
    const [status, setStatus] = useState<string>('');
    const [descripcion, setDescripcion] = useState('');
    // El tipo del producto se establecerá desde initialData o productType
    const [currentProductType, setCurrentProductType] = useState<string>('');


    // Preseleccionar el primer dominio si existe
    useEffect(() => {
        if (initialData) {
            setNombre(initialData.nombre_producto_dato || '');
            // IMPORTANTE: El identificador_unico no debería cambiar después de la creación.
            // Lo tomamos del initialData y lo hacemos read-only.
            setIdentificador(initialData.identificador_unico || '');
            setOwnerDomainId(initialData.id_dominio_propietario || '');
            setStatus(initialData.estado || '');
            setDescripcion(initialData.descripcion_producto_dato || '');
            setCurrentProductType(initialData.tipo || ''); // Usar el tipo del producto existente
        } else {
            // Para un nuevo producto
            setIdentificador(uuidv4()); // Generar UUID nuevo
            setCurrentProductType(productType); // Usar el tipo pasado para nuevo
            if (domains.length > 0 && ownerDomainId === '') {
                // setOwnerDomainId(domains[0].id_dominio); // Opcional: preseleccionar
            }
        }
    }, [initialData, domains, productType, ownerDomainId]); // ownerDomainId quitado de deps si no se preselecciona para nuevo

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ownerDomainId) {
            alert("Seleccione un dominio propietario.");
            return;
        }
        // Crear el objeto con los datos del formulario
        const formData: Partial<Product> = {
            // Incluir id_producto_dato si estamos editando
            ...(isEditing && initialData && { id_producto_dato: initialData.id_producto_dato }),
            nombre_producto_dato: nombre,
            identificador_unico: identificador, // Se envía, pero el backend no debería permitir cambiarlo en update
            id_dominio_propietario: Number(ownerDomainId),
            estado: status || null,
            descripcion_producto_dato: descripcion,
            tipo: currentProductType, // Usar el tipo actual (del producto existente o el seleccionado para nuevo)
        };
        await onSave(formData, isEditing);
    };

     return (
        <form onSubmit={handleSubmit} className="detailed-product-form">
            <h2>{isEditing ? 'Editar Producto' : `Añadir Producto: ${currentProductType}`}</h2>
            {/* 1. Nombre */}
            <div>
                <label htmlFor="product-name">Nombre <span style={{color:'red'}}>*Requerido</span></label>
                <input
                    id="product-name" type="text" value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    maxLength={50} required disabled={isLoading}
                    placeholder="El nombre del Producto de datos"
                />
            </div>

            {/* 2. ID (Mostrar, no editable) */}
             <div>
                <label htmlFor="product-id">ID (Identificador Único) <span style={{color:'red'}}>*Requerido</span></label>
                <input
                    id="product-id" type="text" value={identificador}
                     readOnly disabled // Siempre read-only y deshabilitado visualmente
                    style={{ backgroundColor: '#eee', cursor: 'not-allowed' }}
                />
                 <small>Identificador técnico único. No se puede cambiar después de la creación.</small>
            </div>

            {/* 3. Owner Domain */}
            <div>
                <label htmlFor="product-owner">Dominio <span style={{color:'red'}}>*Requerido</span></label>
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
                    <option value="">Seleccionar Estado</option>
                    {STATUS_OPTIONS.map(stat => (
                        <option key={stat} value={stat}>{stat}</option>
                    ))}
                </select>
                <small>The current stage in the lifecycle.</small>
            </div>

            {/* 5. Archetype/Tipo (Mostrar, no editable si se edita, o el tipo seleccionado si es nuevo) */}
            <div>
                <label htmlFor="product-archetype">Archetype/Tipo</label>
                <input
                    id="product-archetype" type="text" value={currentProductType}
                    readOnly disabled={isEditing} // No editable si se está editando. Si es nuevo, viene de la selección previa.
                    style={{ backgroundColor: isEditing ? '#eee' : '#fff', cursor: isEditing ? 'not-allowed' : 'default' }}
                />
                <small>Clasificación del producto de datos. No se puede cambiar después de la creación.</small>
            </div>

            {/* 6. Description */}
            <div>
                <label htmlFor="product-desc">Description</label>
                <textarea
                    id="product-desc" value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    maxLength={300}
                    disabled={isLoading}
                    rows={4}
                />
            </div>

            {/* Acciones */}
            <div className="form-actions">
                 <button type="submit" className='add-new' disabled={isLoading || (isEditing ? false : domains.length === 0) }>
                    {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Guardar Producto')}
                </button>
                <button type="button" onClick={onCancel} disabled={isLoading}>
                    Cancelar
                </button>
            </div>
        </form>
    );
};

export default ProductDetailsForm;