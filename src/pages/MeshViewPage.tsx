// src/pages/MeshViewPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Para un posible botón de "Volver"
import { Product,Domain,Contract} from '../index'; // Asegúrate de que la ruta sea correcta

// Importaciones de React Flow
import ReactFlow, {
    Controls,
    Background,
    MiniMap, 
    useNodesState,
    useEdgesState,
    addEdge,
    Node,
    Edge,
    Connection,
    MarkerType,
    Position, 
    BackgroundVariant, 
    Handle,
} from 'reactflow';
import 'reactflow/dist/style.css'; // Estilos base de React Flow
// Asegúrate de que los estilos de los nodos personalizados estén accesibles
// Podrías importar index.css si están allí, o un CSS específico para la malla
// import '../../css/index.css'; // Si tus estilos de nodo están en index.css

// --- Interfaces para los datos de nuestros nodos personalizados ---
interface BaseNodeData {
    label: string;
    typeText: string; // Ej: "Dominio", "Producto", "Contrato"
}

interface ProductNodeData extends BaseNodeData {
    icon: string;
    archetype: string; // El tipo específico del producto
    productDomain: string; // Nombre del dominio propietario
}

interface DomainNodeData extends BaseNodeData {
    domainType: 'Dominio' | 'Equipo'; // Tipo de entidad del dominio
}

interface ContractNodeData extends BaseNodeData {
    consumingDomain: string;
    producingProduct: string;
}

// --- Componentes para Nodos Personalizados ---

// Nodo Genérico (opcional, para simplificar o si quieres un diseño base común)
const GenericMeshNode: React.FC<{ data: BaseNodeData, className?: string }> = ({ data, className }) => {
    return (
        <div className={`mesh-node-rf-content ${className || ''}`}>
            <div className="mesh-node-type-text">{data.typeText}</div>
            <div className="mesh-node-name" style={{ fontWeight: 'bold' }}>{data.label}</div>
        </div>
    );
};

const CustomProductNode: React.FC<{ data: ProductNodeData }> = ({ data }) => {
    return (
        <div className="mesh-node-rf-content product-node-color">
            {/* Handle para aristas ENTRANTES (target) a la izquierda */}
            <Handle type="target" position={Position.Left} id="product-target-handle" style={{ background: '#555' }} />

            <div className="mesh-node-archetype">{data.icon} {data.archetype}</div>
            <div className="mesh-node-name">{data.label}</div>
            <div className="mesh-node-domain">Dominio: {data.productDomain}</div>

            {/* Handle para aristas SALIENTES (source) a la derecha */}
            <Handle type="source" position={Position.Right} id="product-source-handle" style={{ background: '#555' }} />
        </div>
    );
};

const CustomDomainNode: React.FC<{ data: DomainNodeData }> = ({ data }) => {
    return (
        <div className="mesh-node-rf-content domain-node-color">
            {/* Handle para aristas ENTRANTES (target) a la izquierda */}
            <Handle type="target" position={Position.Left} id="domain-target-handle" style={{ background: '#555' }} />

            <div className="mesh-node-type-text">{data.domainType}</div>
            <div className="mesh-node-name" style={{ fontWeight: 'bold' }}>{data.label}</div>

            {/* Handle para aristas SALIENTES (source) a la derecha */}
            <Handle type="source" position={Position.Right} id="domain-source-handle" style={{ background: '#555' }} />
        </div>
    );
};

const CustomContractNode: React.FC<{ data: ContractNodeData }> = ({ data }) => {
    return (
        <div className="mesh-node-rf-content contract-node-color">
            <Handle type="target" position={Position.Left} id="contract-target-handle" style={{ background: '#555' }} />

            <div className="mesh-node-type-text">Contrato</div>
            <div className="mesh-node-name" style={{ fontWeight: 'bold' }}>{data.label}</div>
            <small>Producto: {data.producingProduct}</small>
            <small>Consumidor: {data.consumingDomain}</small>

            <Handle type="source" position={Position.Right} id="contract-source-handle" style={{ background: '#555' }} />
        </div>
    );
};

// Registrar nuestros tipos de nodos personalizados para React Flow
const nodeTypes = {
    productNode: CustomProductNode,
    domainNode: CustomDomainNode,
    contractNode: CustomContractNode,
    // genericMeshNode: GenericMeshNode, // Si decides usarlo
};

// --- Props para MeshViewPage ---
interface MeshViewPageProps {
    products: Product[];
    domains: Domain[];
    contracts: Contract[];
    loading: boolean;
    error: string | null;
}

const MeshViewPage: React.FC<MeshViewPageProps> = ({
    products,
    domains,
    contracts,
    loading,
    error
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]); // Tipo any por ahora para simplificar
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const getProductIcon = useCallback((type: string | null | undefined): string => {
    // ... tu lógica
    if (!type) return '[?]';
    if (type.includes('Consumidor')) return '[C]';
    if (type.includes('Aplicación')) return '[A]';
    if (type.includes('Producto')) return '[D]';
    return '[P]';
    }, []);     

    useEffect(() => {
        // VERIFICACIÓN INICIAL DE PROPS
    if (!Array.isArray(products) || !Array.isArray(domains) || !Array.isArray(contracts) || loading) {
        // Si los datos no son arrays o todavía está cargando, no intentes generar la malla.
        // Limpiar nodos y aristas para evitar un estado inconsistente si ya había algo.
        setNodes([]);
        setEdges([]);
        console.warn("MeshViewPage useEffect: Datos no listos o cargando. products:", products, "domains:", domains, "contracts:", contracts, "loading:", loading);
        return; // Salir temprano
    }

    console.log("MeshViewPage useEffect: Generando malla con:", {
        numProducts: products.length,
        numDomains: domains.length,
        numContracts: contracts.length,
    });
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

          let yPos = 50;
        // Columnas X para mejor distribución visual inicial
        const xPositions = {
            domain: 100,
            product: 400,
            contract: 700,
        };
        // Contadores para espaciado vertical dentro de cada columna
        const yCounters = {
            domain: yPos,
            product: yPos,
            contract: yPos,
        };
        const ySpacing = 170; // Espacio vertical entre nodos de la misma columna

        // 1. Crear Nodos de Dominio
        domains.forEach((domain) => {
            newNodes.push({
                id: `d-${domain.id_dominio}`,
                type: 'domainNode',
                data: {
                    label: domain.nombre_dominio,
                    typeText: domain.tipo_entidad,
                    domainType: domain.tipo_entidad,
                } as DomainNodeData,
                position: { x: xPositions.domain, y: yCounters.domain },
            });
            yCounters.domain += ySpacing;
        });
        yCounters.domain = yPos; // Reset para posible layout futuro más complejo

        // 2. Crear Nodos de Producto
        products.forEach((product) => {
            const ownerDomain = domains.find(d => d.id_dominio === product.id_dominio_propietario);
            newNodes.push({
                id: `p-${product.id_producto_dato}`,
                type: 'productNode',
                data: {
                    label: product.nombre_producto_dato,
                    typeText: "Producto de Datos",
                    icon: getProductIcon(product.tipo),
                    archetype: product.tipo || 'Sin Tipo',
                    productDomain: ownerDomain?.nombre_dominio || 'N/A',
                } as ProductNodeData,
                position: { x: xPositions.product, y: yCounters.product },
            });
            yCounters.product += ySpacing;
            
             // LOG PARA DEPURAR
            console.log(`Procesando producto: "${product.nombre_producto_dato}" (ID: p-${product.id_producto_dato}), Propietario Esperado ID: ${product.id_dominio_propietario}`);
            if (ownerDomain) {
                console.log(`   Dominio propietario ENCONTRADO: "${ownerDomain.nombre_dominio}" (ID: d-${ownerDomain.id_dominio})`);
            } else {
                console.warn(`   Dominio propietario NO ENCONTRADO para producto "${product.nombre_producto_dato}". Se esperaba ID: ${product.id_dominio_propietario}`);
            }

            // --- CASO 1: Unión Producto -> Dominio (Propietario) ---
            if (ownerDomain) {
                const edgeId = `edge-p${product.id_producto_dato}-owned_by-d${ownerDomain.id_dominio}`;
                console.log(`   Intentando crear arista Producto->Dominio con ID: ${edgeId}, source: p-${product.id_producto_dato}, target: d-${ownerDomain.id_dominio}`);
                newEdges.push({
                    id: edgeId,
                    source: `p-${product.id_producto_dato}`,
                    target: `d-${ownerDomain.id_dominio}`,
                    sourceHandle: 'product-source-handle', // ID del Handle en CustomProductNode
                    targetHandle: 'domain-target-handle',   // ID del Handle en CustomDomainNode
                    label: 'es propiedad de',
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#6f42c1' },
                    style: { stroke: '#6f42c1', strokeWidth: 1.5 },
                    labelStyle: { fill: '#6f42c1', fontWeight: 'bold' },
                    labelBgPadding: [4, 4],
                    labelBgBorderRadius: 2,
                    labelBgStyle: { fill: '#f8f9fa', fillOpacity: 0.7 },
                });
            }
        });
        yCounters.product = yPos;

        // 3. Crear Nodos de Contrato y sus Uniones
        contracts.forEach((contract) => {
            const associatedProduct = products.find(p => p.id_producto_dato === contract.id_producto_dato);
            const consumingDomain = domains.find(d => d.id_dominio === contract.id_dominio_consumidor);
            // Para encontrar el dominio propietario del producto asociado al contrato
            const producingDomain = associatedProduct ? domains.find(d => d.id_dominio === associatedProduct.id_dominio_propietario) : undefined;

            newNodes.push({
                id: `c-${contract.id_contrato_dato}`,
                type: 'contractNode',
                data: {
                    label: contract.nombre_contrato_dato,
                    typeText: "Contrato",
                    producingProduct: associatedProduct?.nombre_producto_dato || 'N/A',
                    consumingDomain: consumingDomain?.nombre_dominio || 'N/A',
                } as ContractNodeData,
                position: { x: xPositions.contract, y: yCounters.contract },
            });
            yCounters.contract += ySpacing;

            // --- CASO 2.1: Unión Contrato -> Producto ---
            if (associatedProduct) {
                newEdges.push({
                    id: `edge-c${contract.id_contrato_dato}-accesses-p${associatedProduct.id_producto_dato}`,
                    source: `c-${contract.id_contrato_dato}`,        // Contrato
                    target: `p-${associatedProduct.id_producto_dato}`, // Producto
                    label: 'accede a',
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#007bff' }, // Color del producto
                    style: { stroke: '#007bff', strokeWidth: 2 },
                    labelStyle: { fill: '#007bff', fontWeight: 'bold' },
                    labelBgPadding: [4, 4],
                    labelBgBorderRadius: 2,
                    labelBgStyle: { fill: '#f8f9fa', fillOpacity: 0.7 },
                });
            }

            // --- CASO 2.2: Unión Contrato -> Dominio Consumidor ---
            // El contrato es establecido POR el dominio consumidor
            if (consumingDomain) {
                 newEdges.push({
                    id: `edge-d${consumingDomain.id_dominio}-establishes-c${contract.id_contrato_dato}`,
                    source: `d-${consumingDomain.id_dominio}`, // Dominio Consumidor
                    target: `c-${contract.id_contrato_dato}`,   // Contrato
                    label: 'establece',
                    type: 'smoothstep',
                    // Invertir la flecha visualmente si se quiere que el contrato "apunte" al consumidor
                    // markerStart: { type: MarkerType.ArrowClosed, color: '#20c997' },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#20c997' }, // Color del contrato
                    style: { stroke: '#20c997', strokeWidth: 1.5 },
                    labelStyle: { fill: '#20c997', fontWeight: 'bold' },
                    labelBgPadding: [4, 4],
                    labelBgBorderRadius: 2,
                    labelBgStyle: { fill: '#f8f9fa', fillOpacity: 0.7 },
                });
            }

            // --- CASO 2.3 (Implícito por el contrato): Unión Contrato -> Dominio Productor (del producto) ---
            // Esta unión es importante para visualizar quién provee los datos a través del contrato.
            if (producingDomain && associatedProduct) { // Asegurarse que el producto y su dominio propietario existen
                 newEdges.push({
                    id: `edge-p${associatedProduct.id_producto_dato}-provided_via-c${contract.id_contrato_dato}`, // Podrías también hacerla desde el contrato al dominio
                    source: `c-${contract.id_contrato_dato}`,      // Contrato
                    target: `d-${producingDomain.id_dominio}`,  // Dominio Productor (dueño del producto)
                    label: 'provisto por (vía producto)',
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#6f42c1' }, // Color del dominio
                    style: { stroke: '#6f42c1', strokeWidth: 1.5, strokeDasharray: '5,5' }, // Línea punteada para diferenciar
                    labelStyle: { fill: '#6f42c1', fontWeight: 'normal', fontSize: '0.8em'},
                    labelBgPadding: [4, 2],
                    labelBgBorderRadius: 2,
                    labelBgStyle: { fill: '#f8f9fa', fillOpacity: 0.7 },
                });
            }
        });

        setNodes(newNodes);
        setEdges(newEdges);

    }, [products, domains, contracts, setNodes, setEdges, getProductIcon]); // Añadido getProductIcon a las dependencias

    // ... (tu lógica de loading, error, no data)
    if (loading) {
        return <div className="loading-message page-container">Cargando malla de datos...</div>;
    }
    if (error) {
        return <div className="error-message page-container">Error al cargar datos: {error}</div>;
    }
    if ((!products || products.length === 0) && (!domains || domains.length === 0)) {
        return (
            <div className="page-container">
                <h2>Malla de Datos</h2>
                <p>No hay datos (dominios, productos, contratos) para mostrar en la malla.</p>
            </div>
        );
    }


    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Malla de Datos</h2>
                <Link to="/productos" className="add-new" style={{textDecoration: 'none'}}>Volver a la Lista de Productos</Link>
            </div>
            <div className="mesh-view-container-rf">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }} // Un poco más de padding
                >
                    <Controls />
                    <Background variant=
                    {BackgroundVariant.Dots}
                     gap={12} size={1} /> {/* Variante de fondo */}
                    <MiniMap nodeStrokeWidth={3} zoomable pannable /> {/* Minimapa */}
                </ReactFlow>
            </div>
        </div>
    );
};

export default MeshViewPage;