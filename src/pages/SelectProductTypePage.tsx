// src/pages/SelectProductTypePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Importa el CSS específico si lo creas, o asegúrate que las clases estén en index.css
import '../../css/SelectProductTypePage.css'; // <--- NUEVO: Crearemos este archivo CSS

// Constantes para tipos (sin cambios)
const TYPE_DATA_PRODUCT = 'Producto de Datos';
const SUBTYPE_SOURCE_ALIGNED = 'Alineado con el origen';
const SUBTYPE_AGGREGATE = 'Agregado';
const SUBTYPE_CONSUMER_ALIGNED = 'Alineado con el consumidor';
const TYPE_DATA_CONSUMER = 'Consumidor de Datos';
const TYPE_APPLICATION = 'Aplicación';

const SelectProductTypePage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedMainType, setSelectedMainType] = useState<string>('');
    const [selectedSubType, setSelectedSubType] = useState<string>('');

    // Handlers y lógica interna (sin cambios)
    const handleMainTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedMainType(event.target.value);
        setSelectedSubType('');
    };
    const handleSubTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedSubType(event.target.value);
    };
    const getFinalProductType = (): string => {
        if (selectedMainType === TYPE_DATA_PRODUCT) {
            return selectedSubType ? `${TYPE_DATA_PRODUCT} - ${selectedSubType}` : '';
        }
        return selectedMainType;
    };
    const canProceed = (): boolean => {
        if (!selectedMainType) return false;
        if (selectedMainType === TYPE_DATA_PRODUCT && !selectedSubType) return false;
        return true;
    };
    const handleNext = () => {
        if (!canProceed()) return;
        const finalType = getFinalProductType();
        navigate('/productos/nuevo/detalles', { state: { productType: finalType } });
    };
    const handleCancel = () => {
        navigate('/productos');
    };

    return (
        // Usamos page-container para consistencia, y select-product-type para estilos específicos
        <div className="page-container select-product-type">
            <h2>Seleccionar tipo de producto</h2>
            <p className="page-description">Seleccione el tipo que mejor se adapte a su sistema.</p>

            {/* Contenedor principal para las opciones */}
            <div className="type-selection-container">

                {/* --- Bloque: Producto de Datos --- */}
                <div className={`type-block ${selectedMainType === TYPE_DATA_PRODUCT ? 'selected' : ''}`}>
                    <label className="main-type-label">
                        <input
                            type="radio" name="mainType" value={TYPE_DATA_PRODUCT}
                            checked={selectedMainType === TYPE_DATA_PRODUCT} onChange={handleMainTypeChange}
                        />
                        <span className="type-icon">[D]</span> {/* Placeholder Icono */}
                        <span className="type-name">{TYPE_DATA_PRODUCT}</span>
                    </label>
                    <p className="type-description">
                        ”Un producto de datos es una unidad lógica que agrupa los activos de datos en torno a un concepto de negocio y contiene todos los componentes para procesar datos de dominio y proporcionarlos a través de puertos de salida bajo un contrato de datos.”
                    </p>
                    {/* Subtipos solo si Producto de Datos está seleccionado */}
                    {selectedMainType === TYPE_DATA_PRODUCT && (
                        <div className="subtypes">
                            <label className={`subtype-label ${selectedSubType === SUBTYPE_SOURCE_ALIGNED ? 'selected' : ''}`}>
                                <input type="radio" name="subType" value={SUBTYPE_SOURCE_ALIGNED} checked={selectedSubType === SUBTYPE_SOURCE_ALIGNED} onChange={handleSubTypeChange}/>
                                {SUBTYPE_SOURCE_ALIGNED}
                                <span className="subtype-description">”Datos estrechamente alineados con los sistemas de origen...”</span>
                            </label>
                            <label className={`subtype-label ${selectedSubType === SUBTYPE_AGGREGATE ? 'selected' : ''}`}>
                                <input type="radio" name="subType" value={SUBTYPE_AGGREGATE} checked={selectedSubType === SUBTYPE_AGGREGATE} onChange={handleSubTypeChange} />
                                {SUBTYPE_AGGREGATE}
                                <span className="subtype-description">”Datos que se han procesado, agregado o enriquecido...”</span>
                            </label>
                            <label className={`subtype-label ${selectedSubType === SUBTYPE_CONSUMER_ALIGNED ? 'selected' : ''}`}>
                                <input type="radio" name="subType" value={SUBTYPE_CONSUMER_ALIGNED} checked={selectedSubType === SUBTYPE_CONSUMER_ALIGNED} onChange={handleSubTypeChange} />
                                {SUBTYPE_CONSUMER_ALIGNED}
                                <span className="subtype-description">”Productos de datos diseñados y optimizados para casos de uso específicos...”</span>
                             </label>
                        </div>
                    )}
                </div>

                {/* --- Bloque: Consumidor de Datos --- */}
                <div className={`type-block ${selectedMainType === TYPE_DATA_CONSUMER ? 'selected' : ''}`}>
                     <label className="main-type-label">
                         <input
                            type="radio" name="mainType" value={TYPE_DATA_CONSUMER}
                            checked={selectedMainType === TYPE_DATA_CONSUMER} onChange={handleMainTypeChange}
                        />
                        <span className="type-icon">[C]</span> {/* Placeholder Icono */}
                        <span className="type-name">{TYPE_DATA_CONSUMER}</span>
                    </label>
                    <p className="type-description">
                        ”Un sistema que consume datos de productos de datos, pero no proporciona datos por sí mismo...”
                    </p>
                </div>

                 {/* --- Bloque: Aplicación --- */}
                <div className={`type-block ${selectedMainType === TYPE_APPLICATION ? 'selected' : ''}`}>
                     <label className="main-type-label">
                        <input
                            type="radio" name="mainType" value={TYPE_APPLICATION}
                            checked={selectedMainType === TYPE_APPLICATION} onChange={handleMainTypeChange}
                        />
                        <span className="type-icon">[A]</span> {/* Placeholder Icono */}
                         <span className="type-name">{TYPE_APPLICATION}</span>
                    </label>
                    <p className="type-description">
                        ”Un sistema o software que implementa procesos de negocio y genera o consume datos...”
                    </p>
                </div>
            </div>

            {/* Acciones al final */}
            <div className="page-actions">
                {/* Mantener nombres originales si prefieres Cancelar/Siguiente */}
                <button type="button" onClick={handleCancel}>
                    Cancelar
                </button>
                <button type="button" onClick={handleNext} disabled={!canProceed()} className="add-new">
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default SelectProductTypePage;