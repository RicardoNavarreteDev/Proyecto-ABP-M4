import Tarea from "./Tarea.js";

class GestorTareas {
    constructor(tareas = []) {
        this.tareas = tareas.map((tarea) =>
            tarea instanceof Tarea ? tarea : Tarea.desdeObjeto(tarea)
        );
    }

    crearTarea(descripcion, fechaLimite = null, datos = {}) {
        const nuevaTarea = new Tarea(descripcion, fechaLimite, datos);
        this.tareas.push(nuevaTarea);
        return nuevaTarea;
    }

    agregarTareas(...tareas) {
        const idsExistentes = new Set(this.tareas.map(({ id }) => id));
        const nuevasTareas = tareas
            .map((tarea) => (tarea instanceof Tarea ? tarea : Tarea.desdeObjeto(tarea)))
            .filter(({ id }) => {
                if (idsExistentes.has(id)) return false;
                idsExistentes.add(id);
                return true;
            });

        this.tareas.push(...nuevasTareas);
        return nuevasTareas;
    }

    obtenerTareas() {
        return [...this.tareas];
    }

    obtenerTareaPorId(id) {
        const idNormalizado = String(id);
        return this.tareas.find(({ id: tareaId }) => tareaId === idNormalizado) ?? null;
    }

    filtrarTareas({ termino = "", estado = "all", prioridad = "all" } = {}) {
        const terminoNormalizado = termino.trim().toLocaleLowerCase("es");
        return this.tareas.filter((tarea) => {
            const coincideTexto = !terminoNormalizado
                || tarea.descripcion.toLocaleLowerCase("es").includes(terminoNormalizado)
                || tarea.estado.includes(terminoNormalizado);
            const coincideEstado = estado === "all" || tarea.estado === estado;
            const coincidePrioridad = prioridad === "all" || tarea.prioridad === prioridad;
            return coincideTexto && coincideEstado && coincidePrioridad;
        });
    }

    editarTarea(id, cambios) {
        const tarea = this.obtenerTareaPorId(id);
        if (!tarea) throw new Error("No se encontró la tarea que deseas editar.");
        return tarea.editar(cambios);
    }

    cambiarEstado(id, nuevoEstado) {
        const tarea = this.obtenerTareaPorId(id);
        if (!tarea) throw new Error("No se encontró la tarea que deseas actualizar.");
        tarea.cambiarEstado(nuevoEstado);
        return tarea;
    }

    avanzarTarea(id) {
        const tarea = this.obtenerTareaPorId(id);
        if (!tarea) throw new Error("No se encontró la tarea que deseas actualizar.");
        tarea.avanzarEstado();
        return tarea;
    }

    retrocederTarea(id) {
        const tarea = this.obtenerTareaPorId(id);
        if (!tarea) throw new Error("No se encontró la tarea que deseas actualizar.");
        tarea.retrocederEstado();
        return tarea;
    }

    eliminarTarea(id) {
        const indice = this.tareas.findIndex(({ id: tareaId }) => tareaId === String(id));
        if (indice === -1) return false;
        this.tareas.splice(indice, 1);
        return true;
    }
}

export default GestorTareas;
