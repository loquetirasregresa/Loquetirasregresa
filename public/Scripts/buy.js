import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCgaiQDFtx2IGviiepkWODRy_D_N-3o0QA",
    authDomain: "moovo-16a2e.firebaseapp.com",
    projectId: "moovo-16a2e",
    storageBucket: "moovo-16a2e.firebasestorage.app",
    messagingSenderId: "835927562635",
    appId: "1:835927562635:web:7c607169bb8f46ec78778e"
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

let currentUser = null;
let selectedItems = [];
let selectedPaymentMethod = 'diners';
let selectedShipping = 'standard';
let shippingCost = 1.00;

// Leer carrito desde sessionStorage
function loadCartFromSession() {
    const data = sessionStorage.getItem('selectedCartItems');
    if (!data) {
        alert('No hay productos seleccionados para pagar.');
        window.location.href = 'carrito.html';
        return;
    }

    const parsed = JSON.parse(data);
    selectedItems = parsed.items;
    shippingCost = parsed.shipping;
    displayOrderSummary(parsed);
}

// Mostrar resumen de pedido
function displayOrderSummary(data) {
    const orderItemsContainer = document.getElementById('order-items');
    const itemsSubtotal = document.getElementById('items-subtotal');
    const finalTotal = document.getElementById('final-total');
    const grandTotal = document.getElementById('grand-total');
    const shippingCostElement = document.getElementById('shipping-cost');

    orderItemsContainer.innerHTML = '';
    let subtotal = 0;

    selectedItems.forEach(item => {
        const totalItem = item.precio * item.cantidad;
        subtotal += totalItem;
        const itemElement = document.createElement('div');
        itemElement.className = 'summary-item';
        itemElement.innerHTML = `
            <span>${item.nombre} (${item.cantidad})</span>
            <span>$${totalItem.toFixed(2)}</span>
        `;
        orderItemsContainer.appendChild(itemElement);
    });

    itemsSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    finalTotal.textContent = `$${subtotal.toFixed(2)}`;
    shippingCostElement.textContent = shippingCost === 0 ? 'Gratis' : `$${shippingCost.toFixed(2)}`;
    grandTotal.textContent = `$${(subtotal + shippingCost).toFixed(2)}`;
}

// Manejo de métodos de pago y envío
document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', () => {
        document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
        method.classList.add('active');
        selectedPaymentMethod = method.dataset.method;
    });
});

document.querySelectorAll('.shipping-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.shipping-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        selectedShipping = option.dataset.shipping;
        shippingCost = parseFloat(option.dataset.price);
        displayOrderSummary(); // Recalcular con nuevo envío
    });
});

// Formateo de tarjeta y validación
document.getElementById('card-number').addEventListener('input', e => {
    let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
    e.target.value = value.match(/.{1,4}/g)?.join(' ') || value;
});

['cvv', 'cvv2'].forEach(id => {
    document.getElementById(id).addEventListener('input', e => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
});

// Procesar pago
document.getElementById('payment-form-alt').addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!currentUser) {
        alert('Debes iniciar sesión para continuar');
        return;
    }

    if (selectedItems.length === 0) {
        alert('No hay productos seleccionados');
        return;
    }

    document.getElementById('loading-overlay').style.display = 'flex';
    document.getElementById('confirm-payment').disabled = true;

    setTimeout(async () => {
        try {
            for (const item of selectedItems) {
                const itemRef = doc(db, "carritos", currentUser.uid, "items", item.id);
                await deleteDoc(itemRef);
            }

            document.getElementById('loading-overlay').style.display = 'none';
            document.getElementById('success-message').style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });

            sessionStorage.removeItem('selectedCartItems');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            document.getElementById('loading-overlay').style.display = 'none';
            document.getElementById('confirm-payment').disabled = false;
            alert('Error al procesar el pago. Intenta de nuevo.');
        }
    }, 2000);
});

// Inicializar autenticación y cargar datos
function initialize() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            document.getElementById('user-name').textContent = user.displayName || user.email;
            loadCartFromSession();
        } else {
            alert('Debes iniciar sesión para pagar');
            window.location.href = 'login.html';
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
