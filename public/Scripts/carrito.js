// Firebase imports
import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, getDocs, updateDoc, deleteDoc, increment } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCgaiQDFtx2IGviiepkWODRy_D_N-3o0QA",
    authDomain: "moovo-16a2e.firebaseapp.com",
    projectId: "moovo-16a2e",
    storageBucket: "moovo-16a2e.firebasestorage.app",
    messagingSenderId: "835927562635",
    appId: "1:835927562635:web:7c607169bb8f46ec78778e",
    measurementId: "G-CM1SBP592Q"
};

// Initialize Firebase
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

// Global variables
let currentUser = null;
let cartItems = [];
let selectedItems = new Set(); // Para trackear productos seleccionados

// Load cart items
async function cargarCarrito(userId) {
    try {
        console.log('Cargando carrito para usuario:', userId);
        
        const cartRef = collection(db, "carritos", userId, "items");
        const snapshot = await getDocs(cartRef);
        
        cartItems = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.cantidad > 0) {
                cartItems.push({
                    id: doc.id,
                    ...data
                });
            }
        });
        
        // Inicializar todos los productos como seleccionados por defecto
        selectedItems = new Set(cartItems.map(item => item.id));
        
        console.log('Items cargados:', cartItems.length);
        mostrarCarrito();
    } catch (error) {
        console.error('Error al cargar carrito:', error);
        mostrarError();
    }
}

// Toggle item selection
window.toggleItemSelection = function(itemId) {
    if (selectedItems.has(itemId)) {
        selectedItems.delete(itemId);
    } else {
        selectedItems.add(itemId);
    }
    
    // Actualizar la interfaz
    actualizarSeleccionVisual(itemId);
    actualizarTotales();
    actualizarBotonSelectAll();
};

// Select/deselect all items
window.toggleSelectAll = function() {
    const selectAllBtn = document.getElementById('select-all-btn');
    const selectAllText = document.getElementById('select-all-text');
    
    if (selectedItems.size === cartItems.length) {
        // Deseleccionar todos
        selectedItems.clear();
        selectAllText.textContent = 'Seleccionar todo';
        selectAllBtn.classList.remove('selected');
    } else {
        // Seleccionar todos
        selectedItems = new Set(cartItems.map(item => item.id));
        selectAllText.textContent = 'Deseleccionar todo';
        selectAllBtn.classList.add('selected');
    }
    
    // Actualizar toda la interfaz
    cartItems.forEach(item => {
        actualizarSeleccionVisual(item.id);
    });
    actualizarTotales();
};

// Update visual selection state
function actualizarSeleccionVisual(itemId) {
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
    const checkbox = itemElement.querySelector('.item-checkbox');
    const checkIcon = itemElement.querySelector('.check-icon');
    
    if (selectedItems.has(itemId)) {
        checkbox.checked = true;
        itemElement.classList.add('selected');
        checkIcon.style.display = 'flex';
    } else {
        checkbox.checked = false;
        itemElement.classList.remove('selected');
        checkIcon.style.display = 'none';
    }
}

// Update select all button state
function actualizarBotonSelectAll() {
    const selectAllBtn = document.getElementById('select-all-btn');
    const selectAllText = document.getElementById('select-all-text');
    
    if (selectedItems.size === cartItems.length && cartItems.length > 0) {
        selectAllText.textContent = 'Deseleccionar todo';
        selectAllBtn.classList.add('selected');
    } else {
        selectAllText.textContent = 'Seleccionar todo';
        selectAllBtn.classList.remove('selected');
    }
}

// Display cart
function mostrarCarrito() {
    const loadingState = document.getElementById('loading-state');
    const cartContent = document.getElementById('cart-content');
    const emptyCart = document.getElementById('empty-cart');
    const cartItemsContainer = document.getElementById('cart-items');

    loadingState.style.display = 'none';

    if (cartItems.length === 0) {
        cartContent.style.display = 'none';
        emptyCart.style.display = 'block';
        return;
    }

    emptyCart.style.display = 'none';
    cartContent.style.display = 'block';

    // Crear header con botón de seleccionar todo
    const headerHTML = `
        <div class="cart-header-controls">
            <button id="select-all-btn" class="select-all-btn selected" onclick="toggleSelectAll()">
                <div class="select-all-checkbox">
                    <i class="fas fa-check"></i>
                </div>
                <span id="select-all-text">Deseleccionar todo</span>
            </button>
            <span class="items-count">${cartItems.length} producto${cartItems.length !== 1 ? 's' : ''}</span>
        </div>
    `;

    // Render items
    cartItemsContainer.innerHTML = headerHTML;
    
    cartItems.forEach(item => {
        const isSelected = selectedItems.has(item.id);
        const itemElement = document.createElement('div');
        itemElement.className = `cart-item ${isSelected ? 'selected' : ''}`;
        itemElement.setAttribute('data-item-id', item.id);
        itemElement.innerHTML = `
            <div class="item-selector">
                <input type="checkbox" class="item-checkbox" ${isSelected ? 'checked' : ''} 
                       onchange="toggleItemSelection('${item.id}')">
            </div>
            <div class="check-icon" style="display: ${isSelected ? 'flex' : 'none'}">
                <i class="fas fa-check"></i>
            </div>
            <div class="item-image">
                ${item.imagenURL ? 
                    `<img src="${item.imagenURL}" alt="${item.nombre}">` : 
                    `<i class="fas fa-image" style="color: white; font-size: 24px;"></i>`
                }
            </div>
            <div class="item-details">
                <div class="item-name">${item.nombre}</div>
                <div class="item-price">Precio: $${item.precio.toFixed(2)}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="cambiarCantidad('${item.id}', -1)">-</button>
                    <input type="number" class="quantity-input" value="${item.cantidad}" min="1" onchange="actualizarCantidad('${item.id}', this.value)">
                    <button class="quantity-btn" onclick="cambiarCantidad('${item.id}', 1)">+</button>
                </div>
            </div>
            <div class="item-total">$${(item.precio * item.cantidad).toFixed(2)}</div>
            <button class="delete-btn" onclick="eliminarItem('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    actualizarTotales();
    actualizarBotonSelectAll();
}

// Update totals (only for selected items)
function actualizarTotales() {
    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const shipping = selectedItems.size > 0 ? 1.00 : 0;
    const total = subtotal + shipping;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    
    // Actualizar contador de productos seleccionados
    const selectedCount = document.getElementById('selected-count');
    if (selectedCount) {
        selectedCount.textContent = `${selectedItems.size} producto${selectedItems.size !== 1 ? 's' : ''} seleccionado${selectedItems.size !== 1 ? 's' : ''}`;
    }
    
    // Habilitar/deshabilitar botón de pago
    const payBtn = document.querySelector('.pay-btn');
    if (payBtn) {
        payBtn.disabled = selectedItems.size === 0;
        payBtn.textContent = selectedItems.size === 0 ? 'Selecciona productos para pagar' : 'Pagar';
    }
}

// Change quantity
window.cambiarCantidad = async function(itemId, change) {
    if (!currentUser) return;

    try {
        const itemRef = doc(db, "carritos", currentUser.uid, "items", itemId);
        const newQuantity = Math.max(1, cartItems.find(item => item.id === itemId).cantidad + change);
        
        await updateDoc(itemRef, {
            cantidad: newQuantity,
            ultimaActualizacion: new Date().toISOString()
        });

        // Update local state
        const item = cartItems.find(item => item.id === itemId);
        if (item) {
            item.cantidad = newQuantity;
            mostrarCarrito();
        }
    } catch (error) {
        console.error('Error al cambiar cantidad:', error);
    }
};

// Update quantity directly
window.actualizarCantidad = async function(itemId, newQuantity) {
    if (!currentUser) return;

    const quantity = Math.max(1, parseInt(newQuantity) || 1);
    
    try {
        const itemRef = doc(db, "carritos", currentUser.uid, "items", itemId);
        await updateDoc(itemRef, {
            cantidad: quantity,
            ultimaActualizacion: new Date().toISOString()
        });

        // Update local state
        const item = cartItems.find(item => item.id === itemId);
        if (item) {
            item.cantidad = quantity;
            mostrarCarrito();
        }
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
    }
};

// Delete item
window.eliminarItem = async function(itemId) {
    if (!currentUser) return;

    if (confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
        try {
            const itemRef = doc(db, "carritos", currentUser.uid, "items", itemId);
            await deleteDoc(itemRef);

            // Update local state
            cartItems = cartItems.filter(item => item.id !== itemId);
            selectedItems.delete(itemId);
            mostrarCarrito();
        } catch (error) {
            console.error('Error al eliminar item:', error);
        }
    }
};

// Proceed to payment
window.procederPago = function() {
    if (selectedItems.size === 0) {
        alert('Debes seleccionar al menos un producto para proceder al pago');
        return;
    }
    
    // Obtener solo los productos seleccionados
    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    
    // Guardar los productos seleccionados en sessionStorage para la página de pago
    const paymentData = {
        items: selectedCartItems,
        subtotal: selectedCartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
        shipping: 1.00,
        total: selectedCartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0) + 1.00,
        timestamp: new Date().toISOString()
    };
    
    try {
        sessionStorage.setItem('selectedCartItems', JSON.stringify(paymentData));
        console.log('Productos seleccionados guardados para pago:', selectedCartItems);
        window.location.href = 'pay.html';
    } catch (error) {
        console.error('Error al guardar productos seleccionados:', error);
        alert('Error al proceder al pago. Inténtalo de nuevo.');
    }
};

// Show error
function mostrarError() {
    const loadingState = document.getElementById('loading-state');
    loadingState.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="color: #ff6b6b;"></i>
        <p>Error al cargar el carrito. <button onclick="location.reload()" style="background: none; border: none; color: #7cc7d8; cursor: pointer; text-decoration: underline;">Reintentar</button></p>
    `;
}

// Initialize
function inicializar() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            const userNameElement = document.getElementById('user-name');
            if (userNameElement) {
                userNameElement.textContent = user.displayName || user.email;
            }
            cargarCarrito(user.uid);
        } else {
            // User not logged in
            document.getElementById('loading-state').style.display = 'none';
            document.getElementById('empty-cart').innerHTML = `
                <i class="fas fa-user-lock"></i>
                <h2>Inicia sesión para ver tu carrito</h2>
                <p>Necesitas estar conectado para acceder a tu carrito de compras</p>
                <a href="login.html" class="continue-shopping">Iniciar sesión</a>
            `;
            document.getElementById('empty-cart').style.display = 'block';
        }
    });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}