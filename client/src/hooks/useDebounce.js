import { useState, useEffect } from 'react';

/**
 * Hook personalizado para "debouncing".
 *
 * El "debouncing" es una técnica que retrasa la ejecución de una función
 * hasta que ha pasado un cierto tiempo sin que se haya llamado de nuevo.
 * Este hook es útil para optimizar el rendimiento en eventos que se disparan
 * con mucha frecuencia, como la escritura en un campo de búsqueda.
 *
 * @param {*} value - El valor que se quiere "retrasar". Típicamente, el estado de un input.
 * @param {number} delay - El tiempo en milisegundos que se debe esperar antes de actualizar el valor.
 * @returns {*} El valor "retrasado" (`debouncedValue`), que solo se actualizará cuando el `value` original
 *              deje de cambiar durante el tiempo especificado en `delay`.
 */
export default function useDebounce(value, delay) {
  // Estado para almacenar el valor "retrasado".
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Se configura un temporizador que actualizará el estado `debouncedValue`
    // después de que transcurra el `delay`.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Función de limpieza del efecto.
    // Se ejecuta cada vez que el `value` o el `delay` cambian, o cuando el componente se desmonta.
    // Su propósito es cancelar el temporizador anterior para reiniciar la cuenta.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // El efecto se vuelve a ejecutar solo si `value` o `delay` cambian.

  return debouncedValue;
}
