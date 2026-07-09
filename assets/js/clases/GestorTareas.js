import Tarea from "./Tarea.js";

class GestorTareas {
    constructor() {
        this.tareas = [];
    }

    // C - Create: Añadir una nueva tarea
    crearTarea(descripcion) {
        if (!descripcion || descripcion.trim() === "") {
            throw new Error("La descripción no puede estar vacía.");
        }
        const nuevaTarea = new Tarea(descripcion);
        this.tareas.push(nuevaTarea);
        return nuevaTarea;
    }

    // R - Read: Obtener todas las tareas o una por su ID
    obtenerTareas() {
        return this.tareas;
    }

    obtenerTareaPorId(id) {
        return this.tareas.find(tarea => tarea.id === id) || null;
    }

    // U - Update: Actualizar el estado 
    actualizarTarea(id) {
        const tarea = this.obtenerTareaPorId(id);
        tarea.estado = !tarea.estado;
        return tarea;
    }

    // D - Delete: Eliminar una tarea por ID
    eliminarTarea(id) {
        const indice = this.tareas.findIndex(tarea => tarea.id === id);
        if (indice === -1) {
            console.warn(`No se pudo eliminar: Tarea con ID ${id} no encontrada.`);
            return false;
        }
        this.tareas.splice(indice, 1);
        return true;
    }
}

export default GestorTareas;