/* ====================================
   SCRIPT PRINCIPAL DEL PRODUCTO
   ==================================== */

import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

/* ====================================
   CONFIGURACIÓN DE FIREBASE
   ==================================== */

const firebaseConfig = {
  apiKey: "AIzaSyCgaiQDFtx2IGviiepkWODRy_D_N-3o0QA",
  authDomain: "moovo-16a2e.firebaseapp.com",
  projectId: "moovo-16a2e",
  storageBucket: "moovo-16a2e.firebasestorage.app",
  messagingSenderId: "835927562635",
  appId: "1:835927562635:web:7c607169bb8f46ec78778e",
  measurementId: "G-CM1SBP592Q"
};

// Inicializar Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

/* ====================================
   VARIABLES GLOBALES
   ==================================== */

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

/* ====================================
   FUNCIONES PRINCIPALES
   ==================================== */

/**
 * Carga los datos del producto desde Firebase
 */
async function cargarProducto() {
  try {
    console.log(`Cargando producto con ID: ${productId}`);
    
    if (!productId) {
      console.error('No se encontró ID del producto en la URL');
      alert('Error: No se especificó un producto válido');
      return;
    }

    const docRef = doc(db, "productos", productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Actualizar elementos del DOM
      const imgProducto = document.getElementById("img-producto");
      const nombreProducto = document.getElementById("nombre-producto");
      const descripcionProducto = document.getElementById("descripcion-producto");
      
      if (imgProducto) imgProducto.src = data.imagen || '';
      if (nombreProducto) nombreProducto.textContent = data.nombre || 'Producto sin nombre';
      if (descripcionProducto) descripcionProducto.textContent = data.detalles || 'Sin descripción disponible';
      
      // Establecer precio original para el conversor de moneda
      if (typeof establecerPrecioOriginal === 'function') {
        establecerPrecioOriginal(data.precio || 0);
      } else {
        // Fallback si no está disponible la función del conversor
        const precioElement = document.getElementById("precio-producto");
        if (precioElement) {
          precioElement.textContent = (data.precio || 0).toFixed(2);
        }
      }

      // Cargar productos relacionados
      await cargarRelacionados(data.categoria, productId);
      
      console.log('Producto cargado exitosamente:', data.nombre);
    } else {
      console.error('El producto no existe en la base de datos');
      alert('Error: El producto solicitado no existe');
    }
  } catch (error) {
    console.error('Error al cargar el producto:', error);
    alert('Error al cargar el producto. Por favor, intenta de nuevo.');
  }
}

/**
 * Carga productos relacionados de la misma categoría
 * @param {string} categoria - Categoría del producto actual
 * @param {string} excluirId - ID del producto actual para excluirlo
 */
async function cargarRelacionados(categoria, excluirId) {
  try {
    console.log(`Cargando productos relacionados de categoría: ${categoria}`);
    
    if (!categoria) {
      console.warn('No se especificó categoría para productos relacionados');
      return;
    }

    const ref = collection(db, "productos");
    const q = query(ref, where("categoria", "==", categoria));
    const snap = await getDocs(q);

    const contenedor = document.getElementById("carrusel-relacionados");
    if (!contenedor) {
      console.warn('No se encontró el contenedor de productos relacionados');
      return;
    }

    // Limpiar contenedor
    contenedor.innerHTML = '';
    
    let productosAgregados = 0;
    snap.forEach(docSnapshot => {
      if (docSnapshot.id !== excluirId && productosAgregados < 6) { // Límite de 6 productos
        const p = docSnapshot.data();
        const div = document.createElement("div");
        div.classList.add("carrusel-item");
        
        div.innerHTML = `
          <img src="${p.imagen || 'placeholder.jpg'}" width="100" alt="${p.nombre || 'Producto'}" loading="lazy">
          <p>${p.nombre || 'Producto sin nombre'}</p>
          <span class="precio-relacionado">$${(p.precio || 0).toFixed(2)}</span>
        `;
        
        div.onclick = () => {
          window.location.href = `buy_product.html?id=${docSnapshot.id}`;
        };
        
        // Añadir efecto hover
        div.style.cursor = 'pointer';
        div.addEventListener('mouseenter', () => {
          div.style.transform = 'scale(1.05)';
          div.style.transition = 'transform 0.2s ease';
        });
        
        div.addEventListener('mouseleave', () => {
          div.style.transform = 'scale(1)';
        });
        
        contenedor.appendChild(div);
        productosAgregados++;
      }
    });
    
    console.log(`${productosAgregados} productos relacionados cargados`);
  } catch (error) {
    console.error('Error al cargar productos relacionados:', error);
  }
}

/**
 * Maneja la adición del producto al carrito
 */
async function manejarAgregarCarrito() {
  try {
    const cantidadInput = document.getElementById("cantidad");
    const cantidad = parseInt(cantidadInput?.value || '1', 10);
    
    if (cantidad <= 0) {
      alert('Por favor, selecciona una cantidad válida');
      return;
    }

    console.log(`Intentando agregar ${cantidad} unidades al carrito`);

    // Verificar autenticación
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("Debes iniciar sesión para agregar productos al carrito");
        // Opcional: redirigir a página de login
        // window.location.href = '/login.html';
        return;
      }

      try {
        // Obtener datos del producto
        const prodRef = doc(db, "productos", productId);
        const prodSnap = await getDoc(prodRef);
        
        if (!prodSnap.exists()) {
          alert("Error: El producto no se encontró en la base de datos");
          return;
        }

        const data = prodSnap.data();
        const itemRef = doc(db, "carritos", user.uid, "items", productId);

        // Crear/actualizar item en el carrito
        await setDoc(itemRef, {
          nombre: data.nombre || 'Producto sin nombre',
          precio: data.precio || 0,
          imagenURL: data.imagen || data.imagenURL || '',
          categoria: data.categoria || 'sin-categoria',
          cantidad: 0,
          fechaAgregado: new Date().toISOString()
        }, { merge: true });

        // Incrementar cantidad
        await updateDoc(itemRef, {
          cantidad: increment(cantidad),
          ultimaActualizacion: new Date().toISOString()
        });

        // Mostrar mensaje de éxito
        if (typeof mostrarMensajeExito === 'function') {
          mostrarMensajeExito();
        } else {
          // Fallback
          alert("Producto agregado al carrito");
        }
        
        console.log(`Producto agregado exitosamente: ${data.nombre} (${cantidad} unidades)`);
      } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        alert('Error al agregar el producto al carrito. Por favor, intenta de nuevo.');
      }
    });
  } catch (error) {
    console.error('Error en manejarAgregarCarrito:', error);
    alert('Error inesperado. Por favor, recarga la página e intenta de nuevo.');
  }
}

/* ====================================
   INICIALIZACIÓN
   ==================================== */

/**
 * Inicializa la página del producto
 */
function inicializarPagina() {
  console.log('Inicializando página del producto...');
  
  // Event listener para el botón de agregar al carrito
  const btnAgregar = document.getElementById("btn-agregar-carrito");
  if (btnAgregar) {
    btnAgregar.addEventListener("click", manejarAgregarCarrito);
    console.log('Event listener agregado al botón de carrito');
  } else {
    console.warn('No se encontró el botón de agregar al carrito');
  }
  
  // Cargar datos del producto
  cargarProducto();
}

/* ====================================
   AUTO-INICIALIZACIÓN
   ==================================== */

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarPagina);
} else {
  inicializarPagina();
}