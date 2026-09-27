document.getElementById("miFormulario").addEventListener("submit",function(event){
event.preventDefault();
let nombre=document.getElementById("nombre").value.trim();
let foto = document.getElementById("foto").files[0];
let colorPrincipal=document.getElementById("colorPrincipal").value;
let coloresAdicionales=Array.from(document.querySelectorAll("input[name='colores']:checked"));
//nombrr
if(nombre===""){
    alert("Es necesario añadir nombre.");
    return;
  }
//foto
if(!foto){
    alert("Falta foto.");
    return;
  }
  let formatosPermitidos=["image/jpeg", "image/png", "image/webp"];
  if(!formatosPermitidos.includes(foto.type)){
    alert("FORMATO DE IMAGEN NO VALIDO.\n Use JPG, PNG o WEBP");
    return;
  }
//color1
if (colorPrincipal===""){
    alert("Es necesario elegir un color principal.")
    return;
  }
//color2
if (coloresAdicionales.length>2){
    alert("Seleccione maximo 2 colores adicionales.")
    return;
  }
//fecha, se agrega la de sysdate
let fechaRegistro = new Date().toISOString();
console.log("Fecha de registro:", fechaRegistro);
alert("Gracias por tu registro\nPronto "+nombre+" encontrara un hogar!");


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