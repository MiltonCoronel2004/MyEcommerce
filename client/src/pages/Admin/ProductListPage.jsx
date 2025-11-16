import React, { useEffect, useState } from "react";
import apiClient from "../../services/api";
import ProductFormModal from "../../components/Admin/ProductFormModal";
import { Plus, Edit, Trash2, Package } from "lucide-react";

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/products");
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSave = async (productData) => {
    try {
      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct.id}`, productData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await apiClient.post("/products", productData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save product:", error);
      alert(`Failed to save product: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await apiClient.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert(`Failed to delete product: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 border border-red-500/20 rounded-lg p-6 max-w-md">
          <p className="text-red-400 text-center">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
              <Package className="text-emerald-400" size={36} />
              Product Management
            </h1>
            <p className="text-slate-400">Manage your product catalog</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/30"
          >
            <Plus size={20} />
            Create New Product
          </button>
        </div>

        {isModalOpen && <ProductFormModal product={editingProduct} onClose={handleCloseModal} onSave={handleSave} />}

        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-600">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">SKU</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Price</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Stock</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-slate-400 text-sm">{product.id}</td>
                      <td className="px-6 py-4 text-white font-medium">{product.name}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{product.sku}</td>
                      <td className="px-6 py-4 text-emerald-400 font-semibold">${product.price}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stock > 10
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : product.stock > 0
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      No products found. Create your first product to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
