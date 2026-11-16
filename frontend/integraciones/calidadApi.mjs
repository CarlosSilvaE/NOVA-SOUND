const API_URL = "http://127.0.0.1:8000/api/v1/calidad";

export const calidadApi = {
    // 1. Cargar el dashboard
    obtenerResumen: async () => {
        const respuesta = await fetch(`${API_URL}/resumen`);
        if (!respuesta.ok) throw new Error("Error al cargar el resumen de calidad");
        return await respuesta.json();
    },

    // 2. Buscar unidad por escáner
    buscarUnidad: async (numeroSerie) => {
        const respuesta = await fetch(`${API_URL}/unidades/${numeroSerie}`);
        if (respuesta.status === 404) throw new Error(`La unidad ${numeroSerie} no existe.`);
        if (!respuesta.ok) throw new Error("Error al buscar la unidad");
        return await respuesta.json();
    },

    // 3. Llenar el dropdown de defectos
    obtenerDefectos: async () => {
        const respuesta = await fetch(`${API_URL}/defectos`);
        if (!respuesta.ok) throw new Error("Error al cargar el catálogo de defectos");
        return await respuesta.json();
    },

    // 4. Guardar la decisión del inspector
    registrarInspeccion: async (datosInspeccion) => {
        const respuesta = await fetch(`${API_URL}/inspeccion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosInspeccion)
        });
        
        const data = await respuesta.json();
        if (!respuesta.ok) throw new Error(data.detail || "Error al registrar la inspección");
        return data;
    },

    // 5. Ver el historial completo
    obtenerTrazabilidad: async (numeroSerie) => {
        const respuesta = await fetch(`${API_URL}/trazabilidad/${numeroSerie}`);
        if (!respuesta.ok) throw new Error("Error al obtener la trazabilidad");
        return await respuesta.json();
    }
};