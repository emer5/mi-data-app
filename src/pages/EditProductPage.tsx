// src/pages/EditProductPage.tsx (NUEVO ARCHIVO)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ProductDetailsForm from '../components/ProductDetailsForm';
import { Product, Domain } from '../index'; // Ajusta si es necesario

interface EditProductPageProps {
    products: Product[]; // Para encontrar el producto a editar
    domains: Domain[];
    onUpdateProduct: (data: Partial<Product>, isEditing: boolean) => Promise<boolean>; // Recibe isEditing
    loading: boolean;
    fetchProducts: () => void; // Para recargar productos después de editar
}

const EditProductPage: React.FC<EditProductPageProps> = ({
    products,
    domains,
    onUpdateProduct,
    loading,
    fetchProducts
}) => {
    const navigate = useNavigate();
    const { idProducto } = useParams<{ idProducto: string }>(); // Obtener el ID de la URL
    const [productToEdit, setProductToEdit] = useState<Partial<Product> | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (idProducto) {
            const foundProduct = products.find(p => p.id_producto_dato.toString() === idProducto);
            if (foundProduct) {
                setProductToEdit(foundProduct);
            } else {
                setError(`Producto con ID ${idProducto} no encontrado.`);
                // Opcionalmente, redirigir si no se encuentra
                // navigate('/productos');
            }
        }
    }, [idProducto, products, navigate]);

    const handleSave = async (formData: Partial<Product>, isEditing: boolean): Promise<boolean> => {
        setError(null);
        const success = await onUpdateProduct(formData, isEditing);
        if (success) {
            fetchProducts(); // Recargar la lista de productos
            navigate('/productos');
        } else {
            setError("Error al actualizar el producto. Revisa el mensaje principal si existe.");
        }
        return success;
    };

    const handleCancel = () => {
        navigate('/productos');
    };

    if (loading && !productToEdit) return <div className="loading-message">Cargando datos del producto...</div>;
    if (error) return <div className="error-message">{error} <button onClick={() => navigate('/productos')}>Volver a Productos</button></div>;
    if (!productToEdit) return <div className="page-container"><h2>Producto no encontrado</h2><p>El producto que intentas editar no existe o no se pudo cargar.</p></div>;

    return (
        <div className="page-container">
            {/* El título ya está dentro de ProductDetailsForm */}
            <ProductDetailsForm
                productType={productToEdit.tipo || ''} // productType no es tan relevante aquí, pero el form lo espera
                domains={domains}
                onSave={handleSave}
                onCancel={handleCancel}
                isLoading={loading}
                initialData={productToEdit}
            />
        </div>
    );
};

export default EditProductPage;