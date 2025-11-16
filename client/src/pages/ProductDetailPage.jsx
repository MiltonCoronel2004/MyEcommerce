import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import apiClient from '../services/api';
import useAuthStore from '../store/authStore';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchProductById = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProductById();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Please log in to add items to your cart.");
      navigate('/login');
      return;
    }
    try {
      await apiClient.post('/cart/add', { productId: product.id, quantity });
      alert(`${quantity} of ${product.name} added to cart!`);
    } catch (err) {
      alert(`Failed to add to cart: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)}>Back</button>
      <img src={`http://localhost:3000${product.imageUrl}`} alt={product.name} width="200" />
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <p>In Stock: {product.stock}</p>
      
      <div>
        <label htmlFor="quantity">Quantity:</label>
        <input 
            type="number" 
            id="quantity" 
            value={quantity} 
            onChange={(e) => setQuantity(Number(e.target.value))} 
            min="1" 
            max={product.stock} 
        />
        <button onClick={handleAddToCart} disabled={product.stock === 0}>
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
