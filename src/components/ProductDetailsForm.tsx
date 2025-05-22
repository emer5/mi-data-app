// src/components/ProductDetailsForm.tsx (NUEVO ARCHIVO)
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Necesitas instalar uuid: npm install uuid @types/uuid
import { Domain, Product, DatoOperativo } from '../index'; // Ajusta ruta

// Definir los posibles estados
const STATUS_OPTIONS = ['Desarrollo','Pruebas','Producción','Obsoleto','Archivado'];

interface ProductDetailsFormProps {
    productType: string; // Tipo recibido de la página anterior
    domains: Domain[];
    datosOperativos: DatoOperativo[];
    onSave: (data: Partial<Product> & { ids_datos_operativos?: number[] }, isEditing: boolean) => Promise<boolean>;
    onCancel: () => void;
    isLoading: boolean;
    initialData?: Partial<Product> & { ids_datos_operativos_asociados?: number[] } | null; // Modificado para incluir datos operativos asociados
}

const ProductDetailsForm: React.FC<ProductDetailsFormProps> = ({
    productType,
    domains,
    datosOperativos, 
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
    const [selectedDatosOperativosIds, setSelectedDatosOperativosIds] = useState<number[]>([]);

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
            setSelectedDatosOperativosIds(initialData.ids_datos_operativos_asociados || []);

        } else {
            // Para un nuevo producto
            setIdentificador(uuidv4()); // Generar UUID nuevo
            setCurrentProductType(productType); // Usar el tipo pasado para nuevo
            setSelectedDatosOperativosIds([]);
        }
    }, [initialData, domains, productType, ownerDomainId]); // ownerDomainId quitado de deps si no se preselecciona para nuevo
    
    const handleDatosOperativosChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => parseInt(option.value, 10));
        setSelectedDatosOperativosIds(selectedOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ownerDomainId) {
            alert("Seleccione un dominio propietario.");
            return;
        }
        const formData: Partial<Product> & { ids_datos_operativos?: number[] } = {
            ...(isEditing && initialData && { id_producto_dato: initialData.id_producto_dato }),
            nombre_producto_dato: nombre,
            identificador_unico: identificador,
            id_dominio_propietario: Number(ownerDomainId),
            estado: status || null,
            descripcion_producto_dato: descripcion,
            tipo: currentProductType,
            ids_datos_operativos: selectedDatosOperativosIds, // <-- AÑADIR IDs seleccionados
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
                <small>Identificador técnico único. No se puede cambiar después de la creación.</small>
                <input
                    id="product-id" type="text" value={identificador}
                     readOnly disabled // Siempre read-only y deshabilitado visualmente
                    style={{ backgroundColor: '#eee', cursor: 'not-allowed' }}
                />
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
                <small>El estado actual en el ciclo de vida</small>
                <select
                    id="Fproduct-status" value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isLoading}
                >
                    <option value="">Seleccionar Estado</option>
                    {STATUS_OPTIONS.map(stat => (
                        <option key={stat} value={stat}>{stat}</option>
                    ))}
                </select>
            </div>

            {/* 5. Archetype/Tipo (Mostrar, no editable si se edita, o el tipo seleccionado si es nuevo) */}
            <div>
                <label htmlFor="product-archetype">Archetype/Tipo</label>
                 <small>Clasificación del producto de datos. No se puede cambiar después de la creación.</small>
                <input
                    id="product-archetype" type="text" value={currentProductType}
                    readOnly disabled={isEditing} // No editable si se está editando. Si es nuevo, viene de la selección previa.
                    style={{ backgroundColor: isEditing ? '#eee' : '#fff', cursor: isEditing ? 'not-allowed' : 'default' }}
                />
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

             {/* NUEVO: Selector Múltiple para Datos Operativos */}
            <div>
                <label htmlFor="product-datos-operativos">Datos Operativos Asociados:</label>
                <select
                    id="product-datos-operativos"
                    multiple // Permite selección múltiple
                    value={selectedDatosOperativosIds.map(String)} // El valor debe ser un array de strings para <select multiple>
                    onChange={handleDatosOperativosChange}
                    disabled={isLoading || datosOperativos.length === 0}
                    size={datosOperativos.length > 5 ? 5 : datosOperativos.length} // Muestra 5 items, o menos si hay menos
                    style={{ minHeight: '100px', width: '100%' }} // Estilo básico
                >
                    {datosOperativos.length === 0 && <option disabled>No hay datos operativos disponibles.</option>}
                    {datosOperativos.map(datoOp => (
                        <option key={datoOp.id_dato_operativo} value={datoOp.id_dato_operativo.toString()}>
                            {datoOp.nombre_dato} (Tipo: {datoOp.tipo_dato})
                        </option>
                    ))}
                </select>
                <small>Mantén presionada la tecla Ctrl (o Cmd en Mac) para seleccionar múltiples opciones.</small>
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