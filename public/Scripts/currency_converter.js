/* ====================================
   SISTEMA DE CONVERSIÓN DE MONEDAS
   ==================================== */

// Variables globales para manejo de moneda
let precioOriginalUSD = 5.50;
let tasasCambio = {};
let monedaActual = 'USD';

// Símbolos de moneda
const simbolosMoneda = {
  'USD': '$',
  'EUR': '€',
  'MXN': '$',
  'COP': '$',
  'ARS': '$',
  'PEN': 'S/',
  'CLP': '$',
  'BRL': 'R$',
  'GBP': '£',
  'JPY': '¥'
};

/* ====================================
   FUNCIONES DE CONVERSIÓN
   ==================================== */

/**
 * Obtiene las tasas de cambio actuales de la API
 */
async function obtenerTasasCambio() {
  try {
    console.log('Obteniendo tasas de cambio...');
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    tasasCambio = data.rates;
    tasasCambio.USD = 1; // USD como base
    
    console.log('Tasas de cambio obtenidas exitosamente');
    return true;
  } catch (error) {
    console.warn('Error al obtener tasas de cambio:', error.message);
    console.log('Usando tasas de cambio por defecto...');
    
    // Tasas por defecto actualizadas (aproximadas)
    tasasCambio = {
      'USD': 1,
      'EUR': 0.85,
      'MXN': 17.5,
      'COP': 4000,
      'ARS': 350,
      'PEN': 3.7,
      'CLP': 800,
      'BRL': 5.1,
      'GBP': 0.73,
      'JPY': 110
    };
    return false;
  }
}

/**
 * Convierte un precio de USD a otra moneda
 * @param {number} precioUSD - Precio en dólares americanos
 * @param {string} monedaDestino - Código de la moneda destino
 * @returns {number} - Precio convertido
 */
function convertirPrecio(precioUSD, monedaDestino) {
  const tasa = tasasCambio[monedaDestino] || 1;
  return precioUSD * tasa;
}

/**
 * Formatea un precio según la moneda
 * @param {number} precio - Precio a formatear
 * @param {string} moneda - Código de la moneda
 * @returns {string} - Precio formateado
 */
function formatearPrecio(precio, moneda) {
  // Monedas que no usan decimales
  const monedasSinDecimales = ['JPY', 'COP', 'CLP'];
  
  if (monedasSinDecimales.includes(moneda)) {
    return Math.round(precio).toLocaleString('es-ES');
  } else {
    return precio.toFixed(2);
  }
}

/**
 * Actualiza el precio mostrado en la interfaz
 * @param {string} nuevaMoneda - Código de la nueva moneda
 */
function actualizarPrecio(nuevaMoneda) {
  if (!precioOriginalUSD || !tasasCambio[nuevaMoneda]) {
    console.warn('No se puede actualizar el precio: datos faltantes');
    return;
  }

  const precioConvertido = convertirPrecio(precioOriginalUSD, nuevaMoneda);
  const simbolo = simbolosMoneda[nuevaMoneda] || '$';
  const precioFormateado = formatearPrecio(precioConvertido, nuevaMoneda);
  
  // Actualizar elementos del DOM
  const elementoSimbolo = document.getElementById('simbolo-moneda');
  const elementoPrecio = document.getElementById('precio-producto');
  const elementoCodigo = document.getElementById('codigo-moneda');
  
  if (elementoSimbolo) elementoSimbolo.textContent = simbolo;
  if (elementoPrecio) elementoPrecio.textContent = precioFormateado;
  if (elementoCodigo) elementoCodigo.textContent = nuevaMoneda;
  
  monedaActual = nuevaMoneda;
  
  console.log(`Precio actualizado: ${simbolo}${precioFormateado} ${nuevaMoneda}`);
}

/**
 * Establece el precio original desde Firebase
 * @param {number} precio - Precio original en USD
 */
function establecerPrecioOriginal(precio) {
  precioOriginalUSD = precio;
  actualizarPrecio(monedaActual);
}

/* ====================================
   FUNCIONES DE INTERFAZ
   ==================================== */

/**
 * Muestra el mensaje de éxito cuando se añade un producto
 */
function mostrarMensajeExito() {
  const mensaje = document.getElementById('mensaje-exito');
  if (mensaje) {
    mensaje.classList.add('mostrar');
    
    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
      cerrarMensaje();
    }, 4000);
  }
}

/**
 * Cierra el mensaje de éxito
 */
function cerrarMensaje() {
  const mensaje = document.getElementById('mensaje-exito');
  if (mensaje) {
    mensaje.classList.remove('mostrar');
  }
}

/* ====================================
   INICIALIZACIÓN
   ==================================== */

/**
 * Inicializa el sistema de conversión de monedas
 */
async function inicializarConversorMoneda() {
  console.log('Inicializando conversor de moneda...');
  
  // Obtener tasas de cambio
  await obtenerTasasCambio();
  
  // Event listener para el selector de moneda
  const selectorMoneda = document.getElementById('selector-moneda');
  if (selectorMoneda) {
    selectorMoneda.addEventListener('change', function(e) {
      const nuevaMoneda = e.target.value;
      console.log(`Cambiando moneda a: ${nuevaMoneda}`);
      actualizarPrecio(nuevaMoneda);
    });
  }
  
  // Actualizar precio inicial
  actualizarPrecio(monedaActual);
  
  console.log('Conversor de moneda inicializado correctamente');
}

/* ====================================
   AUTO-INICIALIZACIÓN
   ==================================== */

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarConversorMoneda);
} else {
  inicializarConversorMoneda();
}

/* ====================================
   EXPORTAR FUNCIONES (OPCIONAL)
   ==================================== */

// Si usas módulos ES6, puedes exportar estas funciones
// export { 
//   establecerPrecioOriginal, 
//   actualizarPrecio, 
//   mostrarMensajeExito, 
//   cerrarMensaje 
// };