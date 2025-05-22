import React , { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// Asegúrate que la interfaz Product importada incluya owner_text y nombre_dominio_propietario
import { Product, Domain, Contract, ConsumeProductModalProps } from '../index';

// Importaciones de React Flow
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Node,
    Edge,
    Connection,
    Position, // Para los Handles si los necesitaras para nodos más complejos
    MarkerType // Para las puntas de flecha en las aristas
} from 'reactflow';
import 'reactflow/dist/style.css'; // Estilos base de React Flow

// --- Interfaz para los datos de nuestro nodo personalizado ---
interface ProductNodeData {
    icon: string;
    archetype: string;
    name: string;
    domain: string;
    // id: string; // React Flow usa el id principal del nodo, no es necesario aquí
}

// --- Componente para el Nodo de Producto Personalizado ---
const CustomProductNode: React.FC<{ data: ProductNodeData }> = ({ data }) => {
    return (
        // La clase 'react-flow__node-productNode' se aplicará automáticamente
        // si el 'type' del nodo es 'productNode'.
        // Añadimos una clase interna para nuestros estilos específicos.
        <div className="mesh-node-rf-content">
            <div className="mesh-node-archetype">{data.icon} {data.archetype}</div>
            <div className="mesh-node-name">{data.name}</div>
            <div className="mesh-node-domain">Dominio: {data.domain}</div>
        </div>
    );
};

// Registrar nuestros tipos de nodos personalizados para React Flow
const nodeTypes = {
    productNode: CustomProductNode,
};

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
    const [viewMode, setViewMode] = useState<'table' | 'mesh'>('table');

    // --- Estados de React Flow ---
    const [nodes, setNodes, onNodesChange] = useNodesState<ProductNodeData>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Función para manejar nuevas conexiones (si permites que el usuario las cree, por ahora solo para completitud)
    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    // --- Helpers (getProductIcon, getProductDomainName) como los tenías ---
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

    // --- Efecto para transformar tus productos en Nodos y Aristas para React Flow ---
    useEffect(() => {
        if (viewMode === 'mesh' && products.length > 0) {
            const newNodes: Node<ProductNodeData>[] = products.map((product, index) => ({
                id: product.id_producto_dato.toString(), // ID único del nodo
                type: 'productNode',                     // Tipo de nodo (usará nuestro CustomProductNode)
                data: {                                  // Datos que pasaremos a CustomProductNode
                    icon: getProductIcon(product.tipo),
                    archetype: product.tipo || 'Sin Tipo',
                    name: product.nombre_producto_dato,
                    domain: getProductDomainName(product),
                },
                position: { x: index * 280 + 50, y: 100 }, // Posicionamiento horizontal simple
                // Podrías añadir sourcePosition y targetPosition si quieres más control
                // sourcePosition: Position.Right,
                // targetPosition: Position.Left,
            }));

            const newEdges: Edge[] = [];
            if (products.length > 1) {
                for (let i = 0; i < products.length - 1; i++) {
                    newEdges.push({
                        id: `e-${products[i].id_producto_dato}-to-${products[i + 1].id_producto_dato}`,
                        source: products[i].id_producto_dato.toString(),     // ID del nodo origen
                        target: products[i + 1].id_producto_dato.toString(), // ID del nodo destino
                        // type: 'smoothstep', // Para líneas curvas (opcional)
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#666' }, // Añade una flecha al final
                        style: { stroke: '#666', strokeWidth: 1.5 },
                    });
                }
            }
            setNodes(newNodes);
            setEdges(newEdges);
        } else {
            // Limpiar nodos y aristas si no estamos en modo malla o no hay productos
            setNodes([]);
            setEdges([]);
        }
    }, [products, viewMode, setNodes, setEdges]); // Dependencias del efecto

    const toggleViewMode = () => {
        setViewMode(prevMode => (prevMode === 'table' ? 'mesh' : 'table'));
    };

    const handleGoToSelectType = () => { navigate('/productos/seleccionar-tipo'); };
     const handleEditProductClick = (productToEdit: Product) => {
        // <<--- 4. USAR navigate --- >>
        navigate(`/productos/editar/${productToEdit.id_producto_dato}`);
    };


    return (
        <div className="page-container">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                 <h2>Productos ({products.length})</h2>
                 <div className="product-view-actions">
                    <button className="add-new" onClick={toggleViewMode} style={{ marginRight: '10px' }}>
                        {viewMode === 'table' ? 'Vista de Malla' : 'Vista de Tabla'}
                    </button>
                    <button className="add-new" onClick={handleGoToSelectType} disabled={loading || domains.length === 0}>
                        + Añadir Producto de Datos
                    </button>
                 </div>
             </div>
            {domains.length === 0 && !loading && <p><small style={{color: 'orange'}}>Advertencia: Debes crear al menos un dominio.</small></p>}

            {pageLoading && !error && <div className="loading-message">Cargando productos...</div>}
            {!pageLoading && products.length === 0 && !error && <p>No hay productos creados.</p>}

            {/* VISTA DE TABLA (sin cambios) */}
            {viewMode === 'table' && !pageLoading && products.length > 0 && (
                <div className="table-container">
                    {/* ... tu tabla existente ... */}
                    <table className="products-table data-mesh-table">
                        <thead>
                            <tr>
                                <th className="col-data-product">Producto de Datos</th>
                                <th className="col-owner">Dominio</th>
                                <th className="col-type">Tipo</th>
                                <th className="col-status">Estado</th>
                                <th className="col-output-ports">Puertos de Salida</th>
                                 <th>Datos Operativos Asociados</th> {/* <<--- NUEVA CABECERA DE COLUMNA */}
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
                                    <td>
                                        {product.nombres_datos_operativos_asociados || '-'} {/* Muestra los nombres o un guion */}
                                    </td>
                                    <td><div className="cell-content">-</div></td>
                                    <td className="actions-cell">
                                        <div className="actions">
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

            {/* VISTA DE MALLA con React Flow */}
            {viewMode === 'mesh' && !pageLoading && products.length > 0 && (
                <div className="mesh-view-container-rf"> {/* Contenedor con altura definida */}
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes} // Pasa nuestros tipos de nodo personalizados
                        fitView                   // Ajusta la vista para que todos los nodos sean visibles
                        // fitViewOptions={{ padding: 0.1 }} // Opcional: padding para fitView
                        // nodesDraggable={false} // Descomenta si no quieres que los nodos se puedan arrastrar
                        // nodesConnectable={false} // Descomenta si no quieres que se puedan conectar manualmente
                    >
                        <Controls /> {/* Controles de zoom y pan */}
                        <Background gap={16} color="#f0f0f0" /> {/* Fondo con rejilla */}
                    </ReactFlow>
                </div>
            )}

            {/* MODAL (sin cambios) */}
            {showConsumeModal && productToConsume && (
                // ... tu modal existente ...
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