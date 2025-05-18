import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
// import '../css/index.css'; // Opcional: Si quieres cargar CSS global vía Webpack en lugar de index.html

// --- Importa tus páginas y componentes ---
import HomePage from './pages/HomePage';
import DomainsPage from './pages/DomainsPage';
import ProductsPage from './pages/ProductsPage';
import ContractsPage from './pages/ContractsPage';
import SelectProductTypePage from './pages/SelectProductTypePage';
import AddProductDetailsPage from './pages/AddProductDetailsPage';
import SelectContractTypePage from './pages/SelectContractTypePage'; // Nueva importación
import AddContractDetailsPage from './pages/AddContractDetailsPage';   // Nueva importación
import EditProductPage from './pages/EditProductPage';
import Navbar from './components/Navbar';

// --- Interfaces (sin cambios respecto a tu última versión) ---
export interface Domain {
    id_dominio: number;
    nombre_dominio: string;
    descripcion_dominio: string;
    identificacion_dominio?: string | null; // Nuevo
    id_dominio_padre?: number | null;       // Nuevo
    nombre_dominio_padre?: string | null;   // Nuevo (para mostrar en UI, vendrá de un JOIN en PHP)
    tipo_entidad: 'Dominio' | 'Equipo';     // Nuevo
}
export interface Product {
    id_producto_dato: number;
    nombre_producto_dato: string;
    owner_text?: string | null; // Para mostrar en UI, viene de un JOIN
    descripcion_producto_dato: string | null;
    fecha_de_creacion_producto_dato: string;
    id_dominio_propietario: number;
    nombre_dominio_propietario?: string; // Para mostrar en UI, viene de un JOIN
    tipo: string;
    identificador_unico?: string | null;
    estado?: string | null;
}
export interface Contract {
    id_contrato_dato: number;
    nombre_contrato_dato: string;
    descripcion_contrato_dato: string | null; // Puede ser null
    fecha_de_creacion_contrato_dato: string;
    id_producto_dato: number;
    id_dominio_consumidor: number;
    nombre_producto_dato?: string;      // Para mostrar en UI, viene de un JOIN
    nombre_dominio_consumidor?: string; // Para mostrar en UI, viene de un JOIN
}

// --- Interfaces para Props ---
export interface DomainFormProps {
    initialData: Partial<Domain> | null;
    onSave: (data: Partial<Domain>) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
    allDomains: Domain[]; // Nuevo: para el dropdown de dominio padre
}
export interface ProductDetailsFormProps {
    productType: string;
    domains: Domain[];
    onSave: (data: Partial<Product>, isEditing: boolean) => Promise<boolean>; // Modificado
    onCancel: () => void;
    isLoading: boolean;
    initialData?: Partial<Product> | null; // Ya estaba
}
export interface ConsumeProductModalProps { product: Product; domains: Domain[]; contractName: string; contractDescription: string; consumingDomainId: number | ''; onContractNameChange: (value: string) => void; onContractDescriptionChange: (value: string) => void; onConsumingDomainChange: (value: number | '') => void; onCreate: () => Promise<void>; onClose: () => void; isLoading: boolean; }

// --- Configuración API y Helper (sin cambios) ---
const API_URL = 'http://localhost/mi-data-app/api.php';
const noContieneNumeros = (value: string | null | undefined): boolean => {
    if (value === null || value === undefined) return true;
    return !/\d/.test(value.trim());
}

// --- apiRequest Helper (sin cambios) ---
async function apiRequest<T>(action: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data: any = null): Promise<T> {
    const url = `${API_URL}?action=${encodeURIComponent(action)}`;
    const options: RequestInit = {
        method: method,
        headers: { ...((method === 'POST' || method === 'PUT' || method === 'DELETE') && data ? { 'Content-Type': 'application/json' } : {}) },
        ...((method === 'POST' || method === 'PUT' || method === 'DELETE') && data ? { body: JSON.stringify(data) } : {})
    };
    try {
        const response = await fetch(url, options);
        if (!response.ok) { // Primero chequear si la respuesta es OK
            const errorData = await response.json().catch(() => ({ message: `Error ${response.status} - Respuesta no es JSON válido o está vacía` }));
            throw new Error(errorData.message || `Error ${response.status}`);
        }
        // Si la respuesta es OK pero no tiene contenido (ej. 204 No Content)
        if (response.status === 204) {
            return {} as T; // O lo que sea apropiado para una respuesta vacía exitosa
        }
        const responseData = await response.json();
        return responseData as T;
    } catch (error) {
        console.error('API Request Failed:', { url, method, data, error });
        if (error instanceof Error) { throw error; }
        else { throw new Error('Error desconocido en la petición API'); }
    }
}


// --- Componente Principal App ---
const App: React.FC = () => {
    // --- Estados (sin cambios) ---
    const [domains, setDomains] = useState<Domain[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showDomainForm, setShowDomainForm] = useState<boolean>(false);
    const [currentDomain, setCurrentDomain] = useState<Partial<Domain> | null>(null);
    const [showConsumeModal, setShowConsumeModal] = useState<boolean>(false);
    const [productToConsume, setProductToConsume] = useState<Product | null>(null);
    const [consumingDomainId, setConsumingDomainId] = useState<number | ''>('');
    const [contractName, setContractName] = useState<string>('');
    const [contractDescription, setContractDescription] = useState<string>('');

    // --- Carga inicial (sin cambios) ---
    const fetchData = useCallback(async (showLoadingIndicator = true) => {
        if (showLoadingIndicator) setLoading(true);
        setError(null);
        console.log("Fetching data...");
        try {
            const [domainsData, productsData, contractsData] = await Promise.all([
                apiRequest<Domain[]>('get_domains', 'GET'),
                apiRequest<Product[]>('get_products', 'GET'),
                apiRequest<Contract[]>('get_contracts', 'GET')
            ]);
            console.log("Data received:", { domainsData, productsData, contractsData });
            setDomains(Array.isArray(domainsData) ? domainsData : []);
            setProducts(Array.isArray(productsData) ? productsData : []);
            setContracts(Array.isArray(contractsData) ? contractsData : []);
        } catch (err) {
            console.error("Error fetching data:", err);
            const errorMsg = err instanceof Error ? err.message : 'Error al cargar datos';
            setError(errorMsg);
            // No resetear a [] si ya hay datos, para no perder la vista en caso de error de recarga
        } finally {
            if (showLoadingIndicator) setLoading(false);
            console.log("Fetching complete.");
        }
    }, []);
    useEffect(() => { fetchData(); }, [fetchData]);

    // --- Funciones CRUD Dominio (sin cambios) ---
    const handleSaveDomain = async (domainData: Partial<Domain>): Promise<void> => {
        setError(null);
        // Validación básica (puedes expandirla)
        if (!domainData.nombre_dominio?.trim() || !domainData.descripcion_dominio?.trim() || !domainData.identificacion_dominio?.trim() || !domainData.tipo_entidad) {
            setError("Nombre, descripción, identificación y tipo son requeridos."); return;
        }
        // ... (otras validaciones si son necesarias) ...
        // if (!noContieneNumeros(domainData.nombre_dominio) /*|| !noContieneNumeros(domainData.descripcion_dominio)*/) {
        //      setError("Nombre del dominio no debe contener números."); return;
        // }
        setLoading(true);
        try {
            const dataToSend: Partial<Domain> = {
                nombre_dominio: domainData.nombre_dominio,
                descripcion_dominio: domainData.descripcion_dominio,
                identificacion_dominio: domainData.identificacion_dominio,
                // CORRECCIÓN AQUÍ:
                // domainData.id_dominio_padre ya es number | null gracias al Form.
                id_dominio_padre: domainData.id_dominio_padre,
                tipo_entidad: domainData.tipo_entidad,
            };

            const action = currentDomain?.id_dominio ? 'update_domain' : 'add_domain';
            const method = currentDomain?.id_dominio ? 'PUT' : 'POST';
            const payload = currentDomain?.id_dominio ? { ...dataToSend, id_dominio: currentDomain.id_dominio } : dataToSend;

            await apiRequest(action, method, payload);
            setShowDomainForm(false); setCurrentDomain(null); await fetchData(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar entidad');
        } finally { setLoading(false); }
    };
    const handleDeleteDomain = async (id: number): Promise<void> => {
        if (!window.confirm('¿Seguro que quieres eliminar este dominio? Fallará si tiene productos asociados.')) return;
        setError(null); setLoading(true);
        try {
            await apiRequest('delete_domain', 'POST', { id_dominio: id }); // 'action' no es necesario en el body si se lee del GET/POST action
            await fetchData(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al eliminar dominio');
        } finally { setLoading(false); }
    };

    // --- Funciones CRUD Producto (sin cambios) ---
    const handleAddProduct = async (productData: Partial<Product>): Promise<boolean> => {
        setError(null); let success = false;
        // ... (tus validaciones para añadir un nuevo producto como estaban) ...
        if (!productData.nombre_producto_dato || !productData.id_dominio_propietario || !productData.tipo || !productData.identificador_unico) {
            // ...
            setError(`Faltan campos requeridos para nuevo producto.`); return false;
        }
        // ...
        setLoading(true);
        try {
            // Asegúrate que dataToSend SÓLO contenga los campos para un nuevo producto
            const dataToSend: Partial<Product> = {
                nombre_producto_dato: productData.nombre_producto_dato,
                descripcion_producto_dato: productData.descripcion_producto_dato?.trim() || null,
                id_dominio_propietario: productData.id_dominio_propietario,
                tipo: productData.tipo,
                identificador_unico: productData.identificador_unico, // Esencial para nuevo
                estado: productData.estado?.trim() || null,
            };
            await apiRequest('add_product', 'POST', dataToSend);
            await fetchData(false); success = true;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error desconocido al guardar producto';
            setError(`Error al guardar producto: ${errorMsg}`); success = false;
        } finally { setLoading(false); }
        return success;
    };

    // NUEVA función para ACTUALIZAR producto
    const handleUpdateProduct = async (productData: Partial<Product>, isEditing: boolean): Promise<boolean> => {
        if (!isEditing || !productData.id_producto_dato) {
            setError("Error: Faltan datos para la actualización del producto.");
            return false;
        }
        setError(null); let success = false;
        // Validaciones para actualizar (pueden ser diferentes a las de crear)
        if (!productData.nombre_producto_dato || !productData.id_dominio_propietario) {
            setError(`Nombre y Dominio Propietario son requeridos para actualizar.`); return false;
        }
        if (!noContieneNumeros(productData.nombre_producto_dato) || !noContieneNumeros(productData.descripcion_producto_dato)) {
            setError("Nombre y descripción del producto no deben contener números."); return false;
        }
        setLoading(true);
        try {
            // El backend NO debería permitir actualizar 'identificador_unico' ni 'tipo'.
            // Se envían, pero la lógica de la API debe ignorarlos o validarlos.
            const dataToSend: Partial<Product> = {
                id_producto_dato: productData.id_producto_dato, // Esencial para update
                nombre_producto_dato: productData.nombre_producto_dato,
                descripcion_producto_dato: productData.descripcion_producto_dato?.trim() || null,
                id_dominio_propietario: productData.id_dominio_propietario,
                // tipo: productData.tipo, // NO ACTUALIZAR TIPO
                // identificador_unico: productData.identificador_unico, // NO ACTUALIZAR IDENTIFICADOR
                estado: productData.estado?.trim() || null,
            };
            await apiRequest('update_product', 'POST', dataToSend); // Usar POST o PUT (PUT es más semántico para update)
            await fetchData(false); success = true;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error desconocido al actualizar producto';
            setError(`Error al actualizar producto: ${errorMsg}`); success = false;
        } finally { setLoading(false); }
        return success;
    };

    const handleDeleteProduct = async (id: number): Promise<void> => {
        if (!window.confirm('¿Seguro que quieres eliminar este producto? Se borrarán sus contratos asociados.')) return;
        setError(null); setLoading(true);
        try {
            await apiRequest('delete_product', 'POST', { id_producto_dato: id });
            await fetchData(false);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error desconocido al eliminar producto';
            setError(`Error al eliminar producto: ${errorMsg}`);
        } finally { setLoading(false); }
    };

    // --- Funciones CRUD Contrato ---
    // Para el modal de "Consumir Producto" (existente)
    const handleCreateContractFromModal = async (): Promise<void> => {
        setError(null);
        if (!consumingDomainId || !contractName.trim() || !contractDescription.trim() || !productToConsume) {
            setError("Dominio consumidor, nombre y descripción del contrato son requeridos."); return;
        }
        if (Number(consumingDomainId) === productToConsume.id_dominio_propietario) {
            setError("Un dominio no puede crear un contrato para consumir su propio producto."); return;
        }
        // La validación noContieneNumeros para el modal
        // if (!noContieneNumeros(contractName) || !noContieneNumeros(contractDescription)) {
        //     setError("Nombre y descripción del contrato (desde modal) no deben contener números."); return;
        // }
        setLoading(true);
        try {
            const payload = {
                id_producto_dato: productToConsume.id_producto_dato,
                id_dominio_consumidor: Number(consumingDomainId),
                nombre_contrato_dato: contractName,
                descripcion_contrato_dato: contractDescription,
            };
            await apiRequest('add_contract', 'POST', payload);
            setShowConsumeModal(false); setProductToConsume(null); setConsumingDomainId(''); setContractName(''); setContractDescription('');
            await fetchData(false);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error desconocido al crear contrato';
            setError(`Error al crear contrato (modal): ${errorMsg}`);
        } finally { setLoading(false); }
    };

    // Para la nueva página AddContractDetailsPage
    const handleSaveContractFromPage = async (data: any): Promise<boolean> => {
        setError(null); setLoading(true);
        try {
            // Validaciones específicas para este flujo, si son diferentes a la API, podrían ir aquí
            // o confiar en las validaciones de la API y manejar el error.
            // Por ejemplo, la validación de noContieneNumeros, si aplica a los campos de este form.
            // La página AddContractDetailsPage ya tiene su propia validación de campos obligatorios.

            await apiRequest('add_contract', 'POST', data);
            await fetchData(false); // Recargar datos sin indicador de carga principal
            return true;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error desconocido al guardar contrato';
            setError(`Error al guardar contrato (página): ${errorMsg}`);
            return false;
        } finally {
            setLoading(false);
        }
    };


    // --- Handlers para UI (sin cambios, excepto el nombre de la función de contrato) ---
    const handleEditDomain = (domain: Domain) => { setError(null); setCurrentDomain(domain); setShowDomainForm(true); };
    const handleAddNewDomain = () => { setError(null); setCurrentDomain(null); setShowDomainForm(true); };
    const handleCancelDomainForm = () => { setError(null); setShowDomainForm(false); setCurrentDomain(null); };
    const handleOpenConsumeModal = (product: Product) => {
        setError(null);
        if (domains.length < 2 && (!domains.find(d => d.id_dominio !== product.id_dominio_propietario))) {
            setError("Necesitas al menos un dominio diferente al propietario para crear un contrato."); return;
        }
        const otherDomains = domains.filter(d => d.id_dominio !== product.id_dominio_propietario);
        if (otherDomains.length === 0) { setError("No hay otros dominios disponibles para consumir este producto."); return; }
        setProductToConsume(product); setConsumingDomainId(''); setContractName(`Contrato para ${product.nombre_producto_dato}`); setContractDescription(''); setShowConsumeModal(true);
    };
    const handleCloseConsumeModal = () => { setError(null); setShowConsumeModal(false); setProductToConsume(null); };


    // --- Renderizado ---
    return (
        <BrowserRouter basename="/mi-data-app"> {/* Ajusta basename si tu app no está en la raíz del servidor */}
            <div>
                <h1>Gestión Data Mesh Simple (XAMPP/PHP)</h1>
                <Navbar />
                {error && <div className="error-message">{error} <button onClick={() => setError(null)} style={{ marginLeft: '10px', padding: '2px 5px', cursor: 'pointer', border: 'none', background: 'transparent', color: 'red', fontWeight: 'bold' }}>X</button></div>}
                {/* No mostrar "Cargando..." si solo se está recargando en segundo plano */}
                {loading && <div className="loading-message">Cargando...</div>}


                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dominios" element={
                        <DomainsPage
                            domains={domains} // 'domains' del estado de App, que ya se usa para el listado y el form
                            loading={loading} error={error}
                            onAddNew={handleAddNewDomain} onEdit={handleEditDomain} onDelete={handleDeleteDomain}
                            showForm={showDomainForm} currentDomain={currentDomain}
                            onSave={handleSaveDomain} onCancel={handleCancelDomainForm}
                            DomainFormComponent={DomainForm} // <--- Pasa el componente DomainForm directamente
                        />
                    } />
                    <Route path="/productos" element={
                        <ProductsPage
                            products={products} domains={domains} loading={loading} error={error}
                            onDelete={handleDeleteProduct} onConsume={handleOpenConsumeModal}
                            showConsumeModal={showConsumeModal} productToConsume={productToConsume}
                            consumingDomainId={consumingDomainId} contractName={contractName} contractDescription={contractDescription}
                            onConsumingDomainChange={setConsumingDomainId} onContractNameChange={setContractName} onContractDescriptionChange={setContractDescription}
                            onCreateContract={handleCreateContractFromModal} /* Cambiado para el modal */
                            onCloseConsumeModal={handleCloseConsumeModal}
                            ConsumeProductModalComponent={ConsumeProductModal}
                        />
                    } />
                    <Route path="/productos/seleccionar-tipo" element={<SelectProductTypePage />} />
                    <Route path="/productos/nuevo/detalles" element={
                        <AddProductDetailsPage
                            domains={domains}
                            onSaveProduct={handleAddProduct}
                            loading={loading}
                        />
                    } />

                    {/* NUEVA RUTA PARA EDITAR PRODUCTO */}
                    <Route path="/productos/editar/:idProducto" element={
                        <EditProductPage
                            products={products} // Pasa la lista completa para que encuentre el producto
                            domains={domains}
                            onUpdateProduct={handleUpdateProduct} // Nueva función para actualizar
                            loading={loading}
                            fetchProducts={() => fetchData(false)} // Para recargar la lista
                        />
                    } />

                    <Route path="/contratos" element={
                        <ContractsPage
                            contracts={contracts}
                            loading={loading}
                            error={error}
                        />}
                    />
                    {/* Nuevas Rutas para Contratos */}
                    <Route path="/contratos/nuevo" element={<SelectContractTypePage />} />
                    <Route
                        path="/contratos/nuevo/detalles"
                        element={
                            <AddContractDetailsPage
                                domains={domains}
                                products={products}
                                loading={loading}
                                onSaveContract={handleSaveContractFromPage} /* Cambiado para la página */
                                fetchContracts={() => fetchData(false)} // Pasar la función para recargar sin loading principal
                            />
                        }
                    />


                    <Route path="*" element={<div className="page-container"><h2>404 - Página no encontrada</h2><p><Link to="/">Volver al inicio</Link></p></div>} />
                    <Route path="*" element={<div className="page-container"><h2>404 - Página no encontrada</h2><p><Link to="/">Volver al inicio</Link></p></div>} />
                </Routes>
            </div>
        </BrowserRouter>
    );
};

// --- Renderizar la aplicación ---
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        // <React.StrictMode> // StrictMode puede causar doble renderizado en desarrollo, útil para detectar bugs.
        <App />
        // </React.StrictMode>
    );
}
else { console.error("FATAL: Elemento #root no encontrado en index.html"); }

// --- Definiciones COMPLETAS de los componentes (sin cambios, como estaban en tu último código) ---
const DomainForm: React.FC<DomainFormProps> = ({ initialData, onSave, onCancel, isLoading, allDomains }) => {
    const [nombre, setNombre] = useState(initialData?.nombre_dominio || '');
    const [descripcion, setDescripcion] = useState(initialData?.descripcion_dominio || '');
    const [identificacion, setIdentificacion] = useState(initialData?.identificacion_dominio || '');
    const [idPadre, setIdPadre] = useState<number | ''>(initialData?.id_dominio_padre || '');
    const [tipo, setTipo] = useState<'Dominio' | 'Equipo'>(initialData?.tipo_entidad || 'Dominio');

    useEffect(() => {
        setNombre(initialData?.nombre_dominio || '');
        setDescripcion(initialData?.descripcion_dominio || '');
        setIdentificacion(initialData?.identificacion_dominio || '');
        setIdPadre(initialData?.id_dominio_padre ?? ''); // Asegurar que sea string vacío si es null/undefined
        setTipo(initialData?.tipo_entidad || 'Dominio');
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave: Partial<Domain> = {
            nombre_dominio: nombre,
            descripcion_dominio: descripcion,
            identificacion_dominio: identificacion,
            id_dominio_padre: idPadre === '' ? null : Number(idPadre),
            tipo_entidad: tipo,
        };
        if (initialData?.id_dominio) {
            dataToSave.id_dominio = initialData.id_dominio;
        }
        onSave(dataToSave);
    };

    const parentDomainOptions = allDomains.filter(d => d.id_dominio !== initialData?.id_dominio);

    // Texto para la sección de información, basado en el tipo de entidad
    const infoTitle = tipo === 'Dominio' ? 'Dominio' : 'Equipo';
    const infoText = tipo === 'Dominio'
        ? 'Una unidad de negocio. Puede ser jerárquica. Los equipos pueden formar parte de un dominio.'
        : 'Un equipo posee productos de datos, sistemas fuente, contratos de datos...';

    return (
        // Usamos una clase similar a la de CreateDomainTeamPage para el layout del formulario.
        // Nota: El onSubmit ahora está en el <form> tag.
        <div className="create-domain-team-page-container"> {/* Similar a create-domain-team-page-container pero más específico para el form */}
            <form onSubmit={handleSubmit}>
                <h2 className="form-title">{initialData?.id_dominio ? 'Editar' : 'Agregar'} {infoTitle}</h2> {/* Título del formulario */}
                <div className="form-layout"> {/* Clase de CreateDomainTeamPage.tsx */}
                    <div className="info-section"> {/* Clase de CreateDomainTeamPage.tsx */}
                        <h3>{infoTitle}</h3>
                        <p>{infoText}</p>
                    </div>
                    <div className="form-section"> {/* Clase de CreateDomainTeamPage.tsx */}
                        <div className="form-group">
                            <label htmlFor="domain-name" className="required-label">Nombre</label>
                            <input
                                type="text"
                                id="domain-name"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="p. ej. Marketing"
                                required
                                disabled={isLoading}
                                maxLength={50}
                            />
                            <p className="help-text">Nombre para mostrar de un {tipo.toLowerCase()}.</p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="domain-identification" className="required-label">IDENTIFICACIÓN</label>
                            <input
                                type="text"
                                id="domain-identification"
                                value={identificacion}
                                onChange={(e) => setIdentificacion(e.target.value)}
                                placeholder="p. ej. marketing"
                                required
                                disabled={isLoading}
                                maxLength={100}
                            />
                            <p className="help-text">Un identificador técnico único para toda la organización, como un UUID, un URN, una cadena o un número.</p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="domain-desc" className="required-label">Descripción</label> {/* Asumiendo que descripción es requerida */}
                            <textarea
                                id="domain-desc"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                disabled={isLoading}
                                maxLength={300}
                                required
                            />
                            <p className="help-text">Descripción detallada.</p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="parentDomain">Principal ({tipo === 'Dominio' ? 'Dominio Padre' : 'Equipo Padre'})</label>
                            <select
                                id="parentDomain"
                                value={idPadre}
                                onChange={(e) => setIdPadre(e.target.value === '' ? '' : parseInt(e.target.value))}
                                disabled={isLoading}
                            >
                                <option value="">Ninguno</option>
                                {parentDomainOptions.map((domain) => (
                                    <option key={domain.id_dominio} value={domain.id_dominio}>
                                        {domain.nombre_dominio} ({domain.tipo_entidad})
                                    </option>
                                ))}
                            </select>
                            <p className="help-text">La entidad principal de esta. Opcional.</p>
                        </div>

                        <div className="form-group">
                            <label className="required-label">Tipo</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="entityType"
                                        value="Dominio"
                                        checked={tipo === 'Dominio'}
                                        onChange={(e) => setTipo(e.target.value as 'Dominio')}
                                        disabled={isLoading}
                                    />
                                    Dominio
                                    <span className="radio-description">Una unidad de negocio. Puede ser jerárquica.</span>
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="entityType"
                                        value="Equipo"
                                        checked={tipo === 'Equipo'}
                                        onChange={(e) => setTipo(e.target.value as 'Equipo')}
                                        disabled={isLoading}
                                    />
                                    Equipo
                                    <span className="radio-description">Un equipo de dominio/producto/función/desarrollo.</span>
                                </label>
                            </div>
                        </div>

                        <div className="button-bar"> {/* Clase de CreateDomainTeamPage.tsx */}
                            <button type="button" className="cancel-button" onClick={onCancel} disabled={isLoading}>
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="add-team-button" // Clase de CreateDomainTeamPage.tsx (o add-new si prefieres mantener la anterior)
                                disabled={isLoading || !nombre.trim() || !identificacion.trim() || !descripcion.trim()}
                            >
                                {isLoading ? 'Guardando...' : (initialData?.id_dominio ? 'Actualizar' : `+ Agregar ${tipo}`)}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

const ConsumeProductModal: React.FC<ConsumeProductModalProps> = ({ product, domains, contractName, contractDescription, consumingDomainId, onContractNameChange, onContractDescriptionChange, onConsumingDomainChange, onCreate, onClose, isLoading }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate();
    };
    const availableDomains = domains.filter(d => d.id_dominio !== product.id_dominio_propietario);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Crear Contrato para: {product.nombre_producto_dato}</h3>
                <p><small>Propietario: {product.nombre_dominio_propietario || 'N/A'}</small></p>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="consuming-domain-modal">Dominio Consumidor:</label>
                        <select
                            id="consuming-domain-modal"
                            value={consumingDomainId}
                            onChange={(e) => onConsumingDomainChange(e.target.value ? Number(e.target.value) : '')}
                            required
                            disabled={isLoading || availableDomains.length === 0}
                        >
                            <option value="" disabled>Seleccione...</option>
                            {availableDomains.map(domain => (<option key={domain.id_dominio} value={domain.id_dominio}>{domain.nombre_dominio}</option>))}
                        </select>
                        {availableDomains.length === 0 && <p><small style={{ color: 'red' }}>No hay otros dominios disponibles.</small></p>}
                    </div>
                    <div>
                        <label htmlFor="contract-name-modal">Nombre Contrato:</label>
                        <input id="contract-name-modal" type="text" value={contractName} onChange={(e) => onContractNameChange(e.target.value)} maxLength={50} required disabled={isLoading} />
                    </div>
                    <div>
                        <label htmlFor="contract-desc-modal">Descripción Contrato:</label>
                        <textarea id="contract-desc-modal" value={contractDescription} onChange={(e) => onContractDescriptionChange(e.target.value)} maxLength={300} required disabled={isLoading} />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className='consume' disabled={isLoading || availableDomains.length === 0}>{isLoading ? 'Creando...' : 'Crear Contrato'}</button>
                        <button type="button" onClick={onClose} disabled={isLoading}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};