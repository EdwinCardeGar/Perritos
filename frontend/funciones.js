// URL base de tu backend FastAPI en la red local
const API_BASE_URL = "http://192.168.0.6:8000/api";

// 1. Clave de Idempotencia por sesión de formulario
function generarUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
let currentIdempotencyKey = generarUUID();

// 2. Control de ubicación del Formulario
let map;
let marker;
const mapContainer = document.getElementById("mapContainer");
const mapToggle = document.getElementById("toggleMapa");
const latitudeInput = document.getElementById("latitud");
const longitudeInput = document.getElementById("longitud");
const locationText = document.getElementById("ubicacion");
const defaultLocation = [25.438, -100.973]; // Ramos Arizpe / Saltillo

function setLocation(latitude, longitude) {
    latitudeInput.value = latitude;
    longitudeInput.value = longitude;
    locationText.textContent = `Latitud: ${Number(latitude).toFixed(6)}, Longitud: ${Number(longitude).toFixed(6)}`;

    if (marker) {
        marker.setLatLng([latitude, longitude]);
    }
    if (map) {
        map.setView([latitude, longitude], 15);
    }
}

// Inicializar coordenadas por defecto
setLocation(defaultLocation[0], defaultLocation[1]);

function toggleMapa() {
    const showMap = mapContainer.hidden;
    mapContainer.hidden = !showMap;
    mapToggle.setAttribute("aria-expanded", String(showMap));
    mapToggle.textContent = showMap ? "Ocultar mapa" : "Mostrar mapa para afinar ubicación";

    if (showMap) {
        if (!map) {
            const lat = Number(latitudeInput.value) || defaultLocation[0];
            const lng = Number(longitudeInput.value) || defaultLocation[1];
            map = L.map("map").setView([lat, lng], 14);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap"
            }).addTo(map);

            marker = L.marker([lat, lng], { draggable: true }).addTo(map);
            marker.on("dragend", function () {
                const coord = marker.getLatLng();
                setLocation(coord.lat, coord.lng);
            });

            map.on("click", function(e) {
                setLocation(e.latlng.lat, e.latlng.lng);
            });
        }
        setTimeout(() => map.invalidateSize(), 200);
    }
}
mapToggle.addEventListener("click", toggleMapa);

function obtenerUbicacion() {
    if (!navigator.geolocation) {
        alert("La geolocalización no está soportada en este navegador.");
        return;
    }
    locationText.textContent = "Obteniendo ubicación del GPS...";
    navigator.geolocation.getCurrentPosition(
        function (pos) {
            setLocation(pos.coords.latitude, pos.coords.longitude);
        },
        function (err) {
            alert("No se pudo obtener la ubicación: " + err.message);
            locationText.textContent = "Error al obtener GPS.";
        }
    );
}

// 3. Mostrar nombre del archivo seleccionado
document.getElementById("foto").addEventListener("change", function(e) {
    const archivo = e.target.files[0];
    const preview = document.getElementById("nombreArchivoFoto");
    if (archivo) {
        preview.textContent = `Archivo seleccionado: ${archivo.name}`;
    } else {
        preview.textContent = "";
    }
});

// 4. Regla de Colores: no repetir principal y máximo 2 secundarios
const colorPrincipalSelect = document.getElementById("colorPrincipal");
const checksAdicionales = document.querySelectorAll("input[name='colores']");

function actualizarReglasColores() {
    const principal = colorPrincipalSelect.value;
    let marcados = 0;

    checksAdicionales.forEach(chk => {
        if (chk.value === principal) {
            chk.checked = false;
            chk.disabled = true;
        } else {
            chk.disabled = false;
        }
        if (chk.checked) marcados++;
    });

    if (marcados >= 2) {
        checksAdicionales.forEach(chk => {
            if (!chk.checked) chk.disabled = true;
        });
    }
}
colorPrincipalSelect.addEventListener("change", actualizarReglasColores);
checksAdicionales.forEach(chk => chk.addEventListener("change", actualizarReglasColores));

// 5. Envío del Formulario al Backend con Idempotencia
document.getElementById("miFormulario").addEventListener("submit", async function(event) {
    event.preventDefault();
    const btn = document.getElementById("btnSubmit");
    const estado = document.getElementById("estadoEnvio");

    const nombre = document.getElementById("nombre").value.trim();
    const foto = document.getElementById("foto").files[0];
    const razaId = document.getElementById("raza").value;
    const colorPrincipal = colorPrincipalSelect.value;
    const latitud = latitudeInput.value;
    const longitud = longitudeInput.value;

    // Validaciones obligatorias de cliente
    if (!nombre) {
        alert("Es necesario añadir un nombre.");
        return;
    }
    if (!foto) {
        alert("Falta subir la foto.");
        return;
    }
    const formatosPermitidos = ["image/jpeg", "image/png", "image/webp"];
    if (!formatosPermitidos.includes(foto.type)) {
        alert("FORMATO DE IMAGEN NO VÁLIDO. Use JPG, PNG o WEBP.");
        return;
    }
    if (!colorPrincipal) {
        alert("Es necesario elegir un color principal.");
        return;
    }

    const adicionales = Array.from(document.querySelectorAll("input[name='colores']:checked"))
                             .map(el => el.value);

    // Preparar carga multipart
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("color_principal_id", colorPrincipal);
    formData.append("colores_adicionales", adicionales.join(","));
    formData.append("latitud", latitud);
    formData.append("longitud", longitud);
    formData.append("foto", foto);
    if (razaId) {
        formData.append("raza_id", razaId);
    }

    btn.disabled = true;
    estado.textContent = "Registrando perrito en el servidor...";
    estado.style.color = "#1e89e0";

    try {
        const respuesta = await fetch(`${API_BASE_URL}/perritos`, {
            method: "POST",
            headers: {
                "Idempotency-Key": currentIdempotencyKey
            },
            body: formData
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            estado.textContent = `¡Registro exitoso! ID: ${resultado.id}`;
            estado.style.color = "green";
            alert(`¡Gracias por registrar a ${nombre}!`);
            
            // Renovar clave de idempotencia para permitir un nuevo registro futuro
            currentIdempotencyKey = generarUUID();
            document.getElementById("miFormulario").reset();
            document.getElementById("nombreArchivoFoto").textContent = "";
            setLocation(defaultLocation[0], defaultLocation[1]);
            
            // Recargar pines en el mapa
            cargarPerritosEnMapa();
        } else {
            estado.textContent = `Error: ${resultado.detail || "No se pudo registrar"}`;
            estado.style.color = "red";
        }
    } catch (err) {
        estado.textContent = "Error al conectar con el backend. Verifique su conexión.";
        estado.style.color = "red";
    } finally {
        btn.disabled = false;
    }
});

// 6. Cargar el Mapa General y la Lista de Perritos
let mapaGlobal;
let marcadoresGlobales = [];

async function cargarPerritosEnMapa() {
    try {
        const res = await fetch(`${API_BASE_URL}/perritos`);
        if (!res.ok) return;
        const perritos = await res.json();

        // Inicializar mapa general si no existe
        if (!mapaGlobal) {
            mapaGlobal = L.map("mapaGeneral").setView(defaultLocation, 12);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap"
            }).addTo(mapaGlobal);
        }

        // Limpiar pines viejos
        marcadoresGlobales.forEach(m => mapaGlobal.removeLayer(m));
        marcadoresGlobales = [];

        const listaContainer = document.getElementById("listaPerritos");
        listaContainer.innerHTML = "";

        perritos.forEach(p => {
            const urlFoto = `http://192.168.0.6:8000${p.foto_url}`;
            
            // Pin en el mapa con popup completo
            const pin = L.marker([p.latitud, p.longitud]).addTo(mapaGlobal);
            pin.bindPopup(`
                <div style="text-align: center;">
                    <img src="${urlFoto}" style="width: 120px; height: 100px; object-fit: cover; border-radius: 6px;"><br>
                    <strong>${p.nombre}</strong><br>
                    <small>Raza: ${p.raza}</small><br>
                    <small>Colores: ${p.colores || "N/A"}</small>
                </div>
            `);
            marcadoresGlobales.push(pin);

            // Tarjeta en la lista inferior con miniatura
            const tarjeta = document.createElement("div");
            tarjeta.className = "tarjeta-perro";
            tarjeta.innerHTML = `
                <img src="${urlFoto}" alt="${p.nombre}" class="mini-foto">
                <div class="info-perro">
                    <h4>${p.nombre}</h4>
                    <p><strong>Raza:</strong> ${p.raza}</p>
                    <p><strong>Colores:</strong> ${p.colores || "N/A"}</p>
                </div>
            `;
            listaContainer.appendChild(tarjeta);
        });

    } catch (e) {
        console.error("No se pudieron cargar los registros:", e);
    }
}

// Cargar datos al abrir la pantalla
document.addEventListener("DOMContentLoaded", cargarPerritosEnMapa);