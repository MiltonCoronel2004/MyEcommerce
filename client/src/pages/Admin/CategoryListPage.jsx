import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import useAuthStore from "../../store/authStore";
import CategoryFormModal from "../../components/Admin/CategoryFormModal"; // Import the modal

const CategoryListPage = () => {
  const { token } = useAuthStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message || "Error al cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleSave = async (formData) => {
    const isEditing = !!editingCategory;
    const url = isEditing
      ? `http://localhost:3000/api/categories/${editingCategory.id}`
      : "http://localhost:3000/api/categories";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || (isEditing ? "Error al actualizar" : "Error al crear"));
      }

      setSuccess(`Categoría ${isEditing ? "actualizada" : "creada"} con éxito.`);
      handleCloseModal();
      fetchCategories(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta categoría?")) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to delete category");
      }
      setSuccess("Categoría eliminada con éxito.");
      fetchCategories(); // Refresh the list
    } catch (err) {
      setError(err.message || "Error al eliminar la categoría.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-white tracking-tight">Gestionar Categorías</h2>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all"
            >
              <PlusCircle size={20} />
              Nueva Categoría
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3 mb-6">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-start gap-3 mb-6">
              <CheckCircle className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-emerald-400 text-sm">{success}</p>
            </div>
          )}

          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 text-center">
                      No hay categorías disponibles.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {category.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {category.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="text-emerald-400 hover:text-emerald-300 mr-3"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default CategoryListPage;

