import React from 'react';
import { useNavigate } from 'react-router-dom';
// Asegúrate que la interfaz Product importada incluya owner_text y nombre_dominio_propietario
import { Product, Domain, Contract, ConsumeProductModalProps } from '../index';

interface ProductsPageProps {
    products: Product[];
    domains: Domain[];
    loading: boolean;
    error: string | null;
    onDelete: (id: number) => Promise<void>;
    onConsume: (product: Product) => void;
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
    showConsumeModal, productToConsume, consumingDomainId, contractName, contractDescription,
    onConsumingDomainChange, onContractNameChange, onContractDescriptionChange,
    onCreateContract, onCloseConsumeModal,
    ConsumeProductModalComponent
}) => {
    const pageLoading = loading && products.length === 0;
    const navigate = useNavigate();

    const handleGoToSelectType = () => { navigate('/productos/seleccionar-tipo'); };
    const handleEditProduct = (product: Product) => { alert("Edición no implementada."); };

    // Función helper para icono de producto
    const getProductIcon = (type: string | null | undefined): string => {
        if (!type) return '[?]';
        if (type.includes('Consumidor')) return '[C]';
        if (type.includes('Aplicación')) return '[A]';
        if (type.includes('Producto')) return '[D]';
        return '[P]';
    }

    return (
        <div className="page-container">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                 <h2>Productos ({products.length})</h2>
                 {/* Texto del botón cambiado para coincidir con imagen objetivo */}
                 <button className="add-new" onClick={handleGoToSelectType} disabled={loading || domains.length === 0}>
                     + Añadir Producto de Datos
                 </button>
             </div>
            {domains.length === 0 && !loading && <p><small style={{color: 'orange'}}>Advertencia: Debes crear al menos un dominio.</small></p>}

            {pageLoading && !error && <div className="loading-message">Cargando productos...</div>}
            {!pageLoading && products.length === 0 && !error && <p>No hay productos creados.</p>}

            {/* --- ESTRUCTURA DE TABLA --- */}
            {!pageLoading && products.length > 0 && (
                <div className="table-container">
                    <table className="products-table data-mesh-table"> {/* Clase específica añadida */}
                        <thead>
                            <tr>
                                <th className="col-data-product">Producto de Datos</th>
                                <th className="col-owner">Dominio</th>
                                <th className="col-type">Tipo</th>
                                <th className="col-status">Estado</th>
                                <th className="col-output-ports">Puertos de Salida</th>
                                <th className="col-actions">Acciones</th> {/* Cabecera acciones vacía */}
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id_producto_dato}>
                                    {/* Data Product */}
                                    <td>
                                        <div className="cell-content">
                                            <span className="table-icon">{getProductIcon(product.tipo)}</span>
                                            <span className="product-name">{product.nombre_producto_dato}</span>
                                        </div>
                                    </td>
                                    {/* Owner */}
                                    <td>
                                        <div className="cell-content">
                                            <span className="table-icon">[u]</span>
                                            {/* Usar owner_text si existe, sino N/A */}
                                            {product.owner_text || 'N/A'}
                                        </div>
                                    </td>
                                    {/* Type */}
                                    <td>
                                         <div className="cell-content">
                                            <span className="table-icon">[d]</span>
                                            {product.tipo || 'N/A'}
                                        </div>
                                    </td>
                                    {/* Status */}
                                    <td>
                                        <div className="cell-content">
                                            <span className="table-icon">[t]</span>
                                            <span className={`status-text status-${(product.estado || 'na').toLowerCase().replace(/[^a-z0-9]/g, '')}`}>
                                                {product.estado || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    {/* Output Ports (Placeholder) */}
                                    <td><div className="cell-content">-</div></td>
                                    {/* Acciones */}
                                    <td className="actions-cell">
                                        <div className="actions">
                                             <button className="edit" onClick={() => handleEditProduct(product)} disabled={loading} title="Editar Producto">E</button>
                                             <button className="delete" onClick={() => onDelete(product.id_producto_dato)} disabled={loading} title="Eliminar Producto">X</button>
                                         </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* --- FIN ESTRUCTURA DE TABLA --- */}

            {/* Modal de Consumir */}
            {showConsumeModal && productToConsume && (
               <ConsumeProductModalComponent
                   product={productToConsume} domains={domains.filter(d => d.id_dominio !== productToConsume.id_dominio_propietario)}
                   contractName={contractName} contractDescription={contractDescription} consumingDomainId={consumingDomainId}
                   onContractNameChange={onContractNameChange} onContractDescriptionChange={onContractDescriptionChange} onConsumingDomainChange={onConsumingDomainChange}
                   onCreate={onCreateContract} onClose={onCloseConsumeModal} isLoading={loading}
               />
            )}
        </div>
    );
};

export default ProductsPage;