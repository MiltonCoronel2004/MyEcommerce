import { useState, useEffect } from "react";
import { X, List, FileText } from "lucide-react";
import api from "../../services/api";
import { toast } from "react-toastify";

const CategoryFormModal = ({ category, onClose, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
      });
    }
  }, [category]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isEditing = !!category;
    const url = isEditing ? `/categories/${category.id}` : "/categories/create";
    const method = isEditing ? "PUT" : "POST";

    try {
      const data = await api(url, {
        method,
        body: JSON.stringify(formData),
      });
      if (data.error || data.errors) {
        if (Array.isArray(data.errors) && data.errors.length > 0)
          data.errors.forEach((e) => toast.error(typeof e === "string" ? e : e.msg || JSON.stringify(e)));
        else if (data.msg) toast.error(data.msg);
        else toast.error("Ocurrió un error desconocido");

        return;
      }

      toast.success(`Categoría ${isEditing ? "actualizada" : "creada"} con éxito.`);
      onSaveSuccess();
      onClose();
    } catch (err) {
      try {
        const errors = JSON.parse(err.message);
        if (Array.isArray(errors)) {
          errors.forEach((error) => toast.error(error.msg));
        } else {
          toast.error(err.message);
        }
      } catch (parseError) {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-lg w-full">
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <List className="text-emerald-400" size={24} />
            {category ? "Editar Categoría" : "Crear Categoría"}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Nombre de la Categoría *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <List className="text-slate-500" size={20} />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Introduce el nombre de la categoría"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Descripción
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="text-slate-500" size={20} />
              </div>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                placeholder="Introduce la descripción de la categoría"
              ></textarea>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/30 disabled:bg-slate-600 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "Guardar Categoría"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600 rounded-lg font-semibold transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
