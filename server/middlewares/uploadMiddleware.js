import multer from "multer";
import path from "path";

/**
 * Configuración del almacenamiento para Multer.
 * Define dónde y con qué nombre se guardarán los archivos subidos.
 */
const storage = multer.diskStorage({
  // Establece la carpeta de destino para los archivos.
  destination: "./uploads/",
  /**
   * Define el nombre del archivo.
   * Se construye un nombre único para evitar colisiones, combinando el nombre del campo,
   * la fecha y hora actual (timestamp), y la extensión original del archivo.
   */
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

/**
 * Valida que el archivo subido sea una imagen.
 * Comprueba tanto la extensión del archivo como su tipo MIME.
 * @param {object} file - El objeto 'file' de Multer.
 * @param {function} cb - El callback para devolver el resultado.
 */
function checkFileType(file, cb) {
  // Define las extensiones y tipos de archivo permitidos.
  const filetypes = /jpeg|jpg|png|gif/;
  // Comprueba la extensión del archivo.
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Comprueba el tipo MIME del archivo.
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    // Si ambas validaciones son correctas, se acepta el archivo.
    return cb(null, true);
  } else {
    // Si no, se rechaza con un mensaje de error.
    cb("Error: Solo se permiten imágenes (jpeg, jpg, png, gif).");
  }
}

/**
 * Middleware de Multer para gestionar la subida de archivos.
 * Utiliza la configuración de 'storage' y 'fileFilter' definida anteriormente.
 */
const upload = multer({
  storage: storage,
  // Opcional: se pueden establecer límites, como el tamaño del archivo.
  // limits: { fileSize: 1000000 }, // Límite de 1MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  // Define que se aceptará un único archivo del campo 'image' en el formulario.
}).single("image");

export default upload;
