const API_BASE_URL = window.PERRITOS_API_BASE_URL || "http://localhost:8000/api";
const defaultLocation = [25.438, -100.973];
const registrationForm = document.getElementById("miFormulario");
const dogList = document.getElementById("listaPerritos");
const mapContainer = document.getElementById("mapContainer");
const mapToggle = document.getElementById("toggleMapa");
const latitudeInput = document.getElementById("latitud");
const longitudeInput = document.getElementById("longitud");
const locationText = document.getElementById("ubicacion");
const colorPrincipalSelect = document.getElementById("colorPrincipal");
const checksAdicionales = Array.from(document.querySelectorAll("input[name='colores']"));
const submitButton = document.getElementById("btnSubmit");
const submitStatus = document.getElementById("estadoEnvio");

// 1. Clave de Idempotencia por sesión de formulario
function generarUUID() {
    if (crypto.randomUUID) return crypto.randomUUID();
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
let mapaGlobal;
let marcadoresGlobales = [];

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
document.getElementById("usarUbicacion").addEventListener("click", obtenerUbicacion);

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
actualizarReglasColores();

document.querySelectorAll("[data-open-dialog]").forEach(button => {
    button.addEventListener("click", async () => {
        const dialog = document.getElementById(button.dataset.openDialog);
        dialog.showModal();
        if (dialog.id === "perritosDialog") {
            await cargarPerritosEnMapa();
            if (mapaGlobal) mapaGlobal.invalidateSize();
        }
    });
});

document.querySelectorAll("[data-close-dialog]").forEach(button => {
    button.addEventListener("click", () => button.closest("dialog").close());
});

registrationForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const foto = document.getElementById("foto").files[0];
    const razaId = document.getElementById("raza").value;
    const colorPrincipal = colorPrincipalSelect.value;
    const latitud = latitudeInput.value;
    const longitud = longitudeInput.value;
    const adicionales = Array.from(document.querySelectorAll("input[name='colores']:checked"))
                             .map(el => el.value);

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
    if (adicionales.length > 2) {
        alert("Seleccione máximo dos colores adicionales.");
        return;
    }

    // Preparar carga multipart
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("color_principal", colorPrincipal);
    formData.append("colores_adicionales", adicionales.join(","));
    formData.append("latitud", latitud);
    formData.append("longitud", longitud);
    formData.append("foto", foto);
    if (razaId) {
        formData.append("id_raza", razaId);
    }

    submitButton.disabled = true;
    submitStatus.textContent = "Registrando perrito en el servidor...";
    submitStatus.style.color = "#1e89e0";

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
            submitStatus.textContent = `Registro exitoso. Folio: ${resultado.id_perrito}`;
            submitStatus.style.color = "green";

            // Renovar clave de idempotencia para permitir un nuevo registro futuro
            currentIdempotencyKey = generarUUID();
            document.getElementById("miFormulario").reset();
            document.getElementById("nombreArchivoFoto").textContent = "";
            setLocation(defaultLocation[0], defaultLocation[1]);

            // Recargar pines en el mapa
            if (document.getElementById("perritosDialog").open) {
                await cargarPerritosEnMapa();
                if (mapaGlobal) mapaGlobal.invalidateSize();
            }
        } else {
            submitStatus.textContent = `Error: ${resultado.detail || "No se pudo registrar"}`;
            submitStatus.style.color = "red";
        }
    } catch (err) {
        submitStatus.textContent = "Error al conectar con el backend. Verifique su conexión.";
        submitStatus.style.color = "red";
    } finally {
        submitButton.disabled = false;
    }
});

async function cargarPerritosEnMapa() {
    try {
        const res = await fetch(`${API_BASE_URL}/perritos`);
        if (!res.ok) {
            dogList.textContent = "No fue posible cargar los registros.";
            return;
        }
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

        dogList.replaceChildren();

        if (perritos.length === 0) {
            dogList.textContent = "Todavía no hay perritos registrados.";
            return;
        }

        perritos.forEach(p => {
            const urlFoto = new URL(p.foto_url, API_BASE_URL).href;
            const pin = L.marker([p.latitud, p.longitud]).addTo(mapaGlobal);
            const popup = document.createElement("div");
            const popupName = document.createElement("strong");
            popupName.textContent = p.nombre;
            const popupDetails = document.createElement("p");
            popupDetails.textContent = `Raza: ${p.raza} | Color: ${p.color_principal}`;
            popup.append(popupName, popupDetails);
            pin.bindPopup(popup);
            marcadoresGlobales.push(pin);

            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-perro";
            const image = document.createElement("img");
            image.src = urlFoto;
            image.alt = `Foto de ${p.nombre}`;
            image.className = "mini-foto";
            const info = document.createElement("div");
            info.className = "info-perro";
            const name = document.createElement("h3");
            name.textContent = p.nombre;
            const breed = document.createElement("p");
            breed.textContent = `Raza: ${p.raza}`;
            const colors = document.createElement("p");
            colors.textContent = `Colores: ${[p.color_principal, p.colores_adicionales].filter(Boolean).join(", ")}`;
            info.append(name, breed, colors);
            tarjeta.append(image, info);
            dogList.append(tarjeta);
        });

    } catch (e) {
        console.error("No se pudieron cargar los registros:", e);
        dogList.textContent = "Error al conectar con el servidor.";
    }
}

document.getElementById("foto").addEventListener("change", event => {
    const file = event.target.files[0];
    document.getElementById("nombreArchivoFoto").textContent = file ? `Archivo seleccionado: ${file.name}` : "";
});