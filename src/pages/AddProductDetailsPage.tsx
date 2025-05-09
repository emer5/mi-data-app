// src/pages/AddProductDetailsPage.tsx (NUEVO ARCHIVO)
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Domain, Product } from '../index'; // Ajusta la ruta si moviste las interfaces
import ProductDetailsForm from '../components/ProductDetailsForm'; // <-- Nuevo componente de formulario

interface AddProductDetailsPageProps {
    domains: Domain[];
    onSaveProduct: (data: Partial<Product>) => Promise<boolean>;
    loading: boolean;
}

const AddProductDetailsPage: React.FC<AddProductDetailsPageProps> = ({
    domains,
    onSaveProduct,
    loading,
}) => {
    const navigate = useNavigate();
    const location = useLocation(); // Para obtener el estado de la ruta

    // Estado local para el error de esta página
    const [saveError, setSaveError] = useState<string | null>(null);

    // Obtener el tipo de producto del estado de la navegación
    const productType = location.state?.productType as string | undefined;

    useEffect(() => {
        // Si no hay tipo, redirigir a la selección (o a productos)
        if (!productType) {
            console.warn("No se recibió el tipo de producto, redirigiendo.");
            navigate('/productos/seleccionar-tipo');
        }
    }, [productType, navigate]);

    const handleSave = async (formData: Partial<Product>): Promise<boolean> => {
        setSaveError(null); // Limpiar error anterior
        // Añadir el tipo recibido al objeto a guardar
        const dataToSave: Partial<Product> = {
            ...formData,
            tipo: productType || '', // Asegurarse de que el tipo se incluya
        };

        const success = await onSaveProduct(dataToSave); // Llama a la función de App

        if (success) {
            navigate('/productos'); // Redirige a la lista si fue exitoso
        } else {
            // El error global en App ya debería mostrarse.
            // Puedes mostrar un error específico aquí si lo deseas.
            setSaveError("Error al guardar el producto. Revisa el mensaje principal.");
        }
        return success;
    };

    const handleCancel = () => {
        navigate('/productos'); // Vuelve a la lista
    };

    // Si aún no tenemos tipo o dominios (y no está cargando), mostrar mensaje
    if (!productType || (domains.length === 0 && !loading)) {
         return (
             <div className="page-container">
                 <h2>Añadir Detalles del Producto</h2>
                 <p>Cargando información necesaria o falta seleccionar el tipo...</p>
                 {/* Podrías mostrar advertencia de falta de dominios aquí también */}
                  <button onClick={() => navigate('/productos/seleccionar-tipo')}>Volver a Seleccionar Tipo</button>
             </div>
        );
    }


    return (
        <div className="page-container">
            {/* Podrías mostrar el título basado en el tipo */}
            <h2>Añadir Producto: {productType}</h2>

            {saveError && <div className="error-message">{saveError}</div>}

            <ProductDetailsForm // Pasamos el tipo al formulario
                productType={productType}
                domains={domains}
                onSave={handleSave}
                onCancel={handleCancel}
                isLoading={loading}
                // initialData es null porque es para un producto nuevo
            />
        </div>
    );
};

export default AddProductDetailsPage;