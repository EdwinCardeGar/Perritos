const STORAGE_KEY = "perritosRegistrados";
const registrationForm = document.getElementById("miFormulario");
const dogList = document.getElementById("listaPerritos");

function getRegisteredDogs() {
  try {
    const dogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(dogs) ? dogs : [];
  } catch {
    return [];
  }
}

function renderRegisteredDogs() {
  dogList.replaceChildren();
  const dogs = getRegisteredDogs();

  if (dogs.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-list";
    emptyMessage.textContent = "Todavía no hay perritos registrados en este navegador.";
    dogList.append(emptyMessage);
    return;
  }

  dogs.forEach((dog) => {
    const card = document.createElement("article");
    card.className = "dog-card";

    const name = document.createElement("h3");
    name.textContent = dog.nombre;
    card.append(name);

    const details = document.createElement("p");
    details.textContent = `Raza: ${dog.raza} | Color: ${dog.color}`;
    card.append(details);

    if (dog.colores.length > 0) {
      const additionalColors = document.createElement("p");
      additionalColors.textContent = `Colores adicionales: ${dog.colores.join(", ")}`;
      card.append(additionalColors);
    }

    if (dog.latitud !== null && dog.longitud !== null) {
      const location = document.createElement("p");
      location.textContent = `Ubicación: ${dog.latitud.toFixed(5)}, ${dog.longitud.toFixed(5)}`;
      card.append(location);
    }

    dogList.append(card);
  });
}

document.querySelectorAll("[data-open-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = document.getElementById(button.dataset.openDialog);
    if (dialog.id === "perritosDialog") {
      renderRegisteredDogs();
    }
    dialog.showModal();
  });
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

registrationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("nombre").value.trim();
  const photo = document.getElementById("foto").files[0];
  const breed = document.getElementById("raza");
  const color = document.getElementById("colorPrincipal");
  const additionalColors = Array.from(document.querySelectorAll("input[name='colores']:checked"));

  if (name === "") {
    alert("Es necesario añadir nombre.");
    return;
  }
  if (!photo) {
    alert("Falta foto.");
    return;
  }
  const allowedFormats = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedFormats.includes(photo.type)) {
    alert("FORMATO DE IMAGEN NO VALIDO.\nUse JPG, PNG o WEBP");
    return;
  }
  if (color.value === "") {
    alert("Es necesario elegir un color principal.");
    return;
  }
  if (additionalColors.length > 2) {
    alert("Seleccione máximo 2 colores adicionales.");
    return;
  }

  const latitude = document.getElementById("latitud").value;
  const longitude = document.getElementById("longitud").value;
  const dog = {
    nombre: name,
    raza: breed.options[breed.selectedIndex].text,
    color: color.options[color.selectedIndex].text,
    colores: additionalColors.map((input) => input.value),
    latitud: latitude === "" ? null : Number(latitude),
    longitud: longitude === "" ? null : Number(longitude),
    fechaRegistro: new Date().toISOString()
  };

  try {
    const dogs = getRegisteredDogs();
    dogs.unshift(dog);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dogs));
  } catch {
    alert("No fue posible guardar el registro en este navegador.");
    return;
  }

  alert(`Gracias por tu registro. Pronto ${name} encontrará un hogar.`);
});

let map;
let marker;
const mapContainer = document.getElementById("mapContainer");
const mapToggle = document.getElementById("toggleMapa");
const latitudeInput = document.getElementById("latitud");
const longitudeInput = document.getElementById("longitud");
const locationText = document.getElementById("ubicacion");
const defaultLocation = [25.438, -100.973];

function setLocation(latitude, longitude) {
  latitudeInput.value = latitude;
  longitudeInput.value = longitude;
  locationText.textContent = `Latitud: ${latitude.toFixed(6)}, Longitud: ${longitude.toFixed(6)}`;

  if (marker) {
    marker.setLatLng([latitude, longitude]);
    map.setView([latitude, longitude], 15);
  }
}

function toggleMapa() {
  const showMap = mapContainer.hidden;
  mapContainer.hidden = !showMap;
  mapToggle.setAttribute("aria-expanded", String(showMap));
  mapToggle.textContent = showMap ? "Ocultar mapa" : "Mostrar mapa para elegir ubicación";

  if (showMap) {
    if (!map) {
      const latitude = Number(latitudeInput.value) || defaultLocation[0];
      const longitude = Number(longitudeInput.value) || defaultLocation[1];
      map = L.map("map").setView([latitude, longitude], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
      marker.on("dragend", function () {
        const coordinates = marker.getLatLng();
        setLocation(coordinates.lat, coordinates.lng);
      });
    }

    map.invalidateSize();
  }
}

function obtenerUbicacion() {
  if (!navigator.geolocation) {
    alert("La geolocalización no está soportada en este navegador.");
    return;
  }

  navigator.geolocation.getCurrentPosition(function (position) {
    setLocation(position.coords.latitude, position.coords.longitude);
  }, function (error) {
    alert("No se pudo obtener la ubicación: " + error.message);
  });
}

mapToggle.addEventListener("click", toggleMapa);