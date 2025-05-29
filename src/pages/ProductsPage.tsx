// src/pages/ProductsPage.tsx
import React from 'react'; // Eliminado useState, useEffect, useCallback si ya no se usan aquí
import { useNavigate, Link } from 'react-router-dom'; // Link añadido
import { Product, Domain, ConsumeProductModalProps } from '../index';
// NO MÁS importaciones de React Flow aquí

// NO MÁS CustomProductNode NI nodeTypes aquí (se movieron a MeshViewPage.tsx)

interface ProductsPageProps {
    products: Product[];
    domains: Domain[];
    loading: boolean;
    error: string | null;
    onDelete: (id: number) => Promise<void>;
    onConsume: (product: Product) => void; // Para el modal
    // ... (todas las props del modal de consumir)
    showConsumeModal: boolean;
    productToConsume: Product | null;
    consumingDomainId: number | '';
    contractName: string;
    contractDescription: string;
    onConsumingDomainChange: (value: number | '') => void;
    onContractNameChange: (value: string) => void;
    onContractDescriptionChange: (value: string) => void;
    onCreateContract: () => Promise<void>;
    onCloseConsumeModal: () => void;
    ConsumeProductModalComponent: React.FC<ConsumeProductModalProps>;
}

const ProductsPage: React.FC<ProductsPageProps> = ({
    products, domains, loading, error, onDelete, onConsume,
    // ... (destructuración de props del modal)
    showConsumeModal, productToConsume, consumingDomainId, contractName, contractDescription,
    onConsumingDomainChange, onContractNameChange, onContractDescriptionChange,
    onCreateContract, onCloseConsumeModal, ConsumeProductModalComponent
}) => {
    const pageLoading = loading && products.length === 0;
    const navigate = useNavigate();

    // --- Helpers (getProductIcon, getProductDomainName) se mantienen o se importan si se movieron a utils ---
     const getProductIcon = (type: string | null | undefined): string => {
        if (!type) return '[?]';
        if (type.includes('Consumidor')) return '[C]';
        if (type.includes('Aplicación')) return '[A]';
        if (type.includes('Producto')) return '[D]';
        return '[P]';
    }
    const getProductDomainName = (product: Product): string => {
        return product.nombre_dominio_propietario || product.owner_text || 'N/A';
    }
    // NO MÁS useEffect para nodos/edges de React Flow

    const handleGoToSelectType = () => { navigate('/productos/seleccionar-tipo'); };
    const handleEditProductClick = (productToEdit: Product) => {
        navigate(`/productos/editar/${productToEdit.id_producto_dato}`);
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2>Productos ({products.length})</h2>
                <div className="product-view-actions">
                    <button className="add-new" onClick={handleGoToSelectType} disabled={loading || domains.length === 0}>
                        + Añadir Producto de Datos
                    </button>
                </div>
            </div>
            {domains.length === 0 && !loading && <p><small style={{ color: 'orange' }}>Advertencia: Debes crear al menos un dominio.</small></p>}

            {pageLoading && !error && <div className="loading-message">Cargando productos...</div>}
            {!pageLoading && products.length === 0 && !error && <p>No hay productos creados.</p>}

            {/* VISTA DE TABLA (sin cambios significativos, solo se eliminó la lógica del viewMode) */}
            {!pageLoading && products.length > 0 && (
                <div className="table-container">
                    <table className="products-table data-mesh-table">
                        <thead>
                            <tr>
                                <th className="col-data-product">Producto de Datos</th>
                                <th className="col-owner">Dominio</th>
                                <th className="col-type">Tipo</th>
                                <th className="col-status">Estado</th>
                                <th className="col-output-ports">Puertos de Salida</th>
                                <th className="col-actions">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id_producto_dato}>
                                    <td>
                                        <div className="cell-content">
                                            <span className="table-icon">{getProductIcon(product.tipo)}</span>
                                            <span className="product-name">{product.nombre_producto_dato}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="cell-content">
                                            <span className="table-icon">[u]</span>
                                            {getProductDomainName(product)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="cell-content">
                                            <span className="table-icon">[d]</span>
                                            {product.tipo || 'N/A'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="cell-content">
                                            <span className="table-icon">[t]</span>
                                            <span className={`status-text status-${(product.estado || 'na').toLowerCase().replace(/[^a-z0-9]/g, '')}`}>
                                                {product.estado || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td><div className="cell-content">-</div></td>
                                    <td className="actions-cell">
                                        <div className="actions">
                                            {/* El botón de "Consumir" ahora es opcional aquí si solo quieres Editar/Eliminar en la tabla */}
                                            {/* Si lo mantienes, asegúrate que la lógica del modal funciona bien */}
                                            <button
                                                className="consume"
                                                onClick={() => onConsume(product)} // onClick={() => onConsume(product)}
                                                disabled={loading || domains.filter(d => d.id_dominio !== product.id_dominio_propietario).length === 0}
                                                title="Crear Contrato de Consumo"
                                            >
                                                C
                                            </button>
                                            <button className="edit" onClick={() => handleEditProductClick(product)} disabled={loading} title="Editar Producto">E</button>
                                            <button className="delete" onClick={() => onDelete(product.id_producto_dato)} disabled={loading} title="Eliminar Producto">X</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* NO MÁS VISTA DE MALLA AQUÍ */}

            {/* MODAL (sin cambios) */}
            {showConsumeModal && productToConsume && (
                <ConsumeProductModalComponent
                    product={productToConsume}
                    domains={domains.filter(d => d.id_dominio !== productToConsume.id_dominio_propietario)}
                    contractName={contractName}
                    contractDescription={contractDescription}
                    consumingDomainId={consumingDomainId}
                    onContractNameChange={onContractNameChange}
                    onContractDescriptionChange={onContractDescriptionChange}
                    onConsumingDomainChange={onConsumingDomainChange}
                    onCreate={onCreateContract}
                    onClose={onCloseConsumeModal}
                    isLoading={loading}
                />
            )}
        </div>
    );
};

export default ProductsPage;