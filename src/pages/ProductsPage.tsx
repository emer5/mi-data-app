// src/pages/ProductsPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, Domain } from '../index';

interface ProductsPageProps {
    products: Product[];
    domains: Domain[];
    loading: boolean;
    error: string | null;
    onDelete: (id: number) => Promise<void>;
}

const ProductsPage: React.FC<ProductsPageProps> = ({
    products, domains, loading, error, onDelete
}) => {
    const pageLoading = loading && products.length === 0;
    const navigate = useNavigate();

    const handleGoToSelectType = () => { navigate('/productos/seleccionar-tipo'); };
    const handleEditProduct = (product: Product) => { alert("Edición no implementada."); };

    const renderTags = (tagsString: string | null | undefined) => {
        if (!tagsString) return null;
        const tagsArray = tagsString.split(',').map(t => t.trim()).filter(Boolean);
        if (tagsArray.length === 0) return null;
        return tagsArray.map((tag, index) => (
            <span key={index} className="tag-badge">
                <span className="table-icon">[tg]</span> {tag}
            </span>
        ));
    };

    const getProductIcon = (type: string | null | undefined): string => {
        if (!type) return '[?]';
        if (type.includes('Consumidor')) return '[C]';
        if (type.includes('Aplicación')) return '[A]';
        if (type.includes('Producto')) return '[D]';
        return '[P]';
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2>Productos ({products.length})</h2>
                <button className="add-new" onClick={handleGoToSelectType} disabled={loading || domains.length === 0}>
                    + Añadir Producto de Datos
                </button>
            </div>

            {domains.length === 0 && !loading && (
                <p><small style={{ color: 'orange' }}>Advertencia: Debes crear al menos un dominio.</small></p>
            )}

            {pageLoading && !error && <div className="loading-message">Cargando productos...</div>}
            {!pageLoading && products.length === 0 && !error && <p>No hay productos creados.</p>}

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
                                <th className="col-actions"></th>
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
                                            {product.owner_text || 'N/A'}
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
                                            {/* El botón de consumir contrato ha sido eliminado */}
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
        </div>
    );
};

export default ProductsPage;
