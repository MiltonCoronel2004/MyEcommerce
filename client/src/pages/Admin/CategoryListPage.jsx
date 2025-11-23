import React, { useState, useEffect, useCallback } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import CategoryFormModal from "../../components/Admin/CategoryFormModal";

const CategoryListPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api("/categories");
      setCategories(data);
    } catch (err) {
      toast.error(err.message || "Error al cargar las categorías.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenModal = (category = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta categoría?")) {
      return;
    }
    try {
      await api(`/categories/${categoryId}`, {
        method: "DELETE",
      });
      toast.success("Categoría eliminada con éxito.");
      fetchCategories();
    } catch (err) {
      toast.error(err.message || "Error al eliminar la categoría.");
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{category.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{category.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleOpenModal(category)} className="text-emerald-400 hover:text-emerald-300 mr-3">
                          <Edit size={20} />
                        </button>
                        <button onClick={() => handleDelete(category.id)} className="text-red-400 hover:text-red-300">
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
      {isModalOpen && <CategoryFormModal category={editingCategory} onClose={handleCloseModal} onSaveSuccess={fetchCategories} />}
    </>
  );
};

export default CategoryListPage;
