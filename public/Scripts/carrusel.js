const firebaseConfig = {
    apiKey: "AIzaSyCgaiQDFtx2IGviiepkWODRy_D_N-3o0QA",
    authDomain: "moovo-16a2e.firebaseapp.com",
    projectId: "moovo-16a2e",
    storageBucket: "moovo-16a2e.firebasestorage.app",
    messagingSenderId: "835927562635",
    appId: "1:835927562635:web:7c607169bb8f46ec78778e",
    measurementId: "G-CM1SBP592Q"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const productsContainer = document.getElementById('productsContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let allProductsData = []; // Para almacenar los datos originales de los productos
let firstProductWidth = 0; // Almacenará el ancho de una tarjeta de producto 
const PRODUCTS_GAP = 30; 

const DUPLICATION_FACTOR = 3; 

// Función para generar estrellas aleatorias (entre 1 y 5)
function generateRandomStars() {
    return Math.floor(Math.random() * 5) + 1;
}

// Función para crear el HTML de las estrellas
function createStarsHTML(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHTML += '<span class="star star-filled">★</span>';
        } else {
            starsHTML += '<span class="star star-empty">☆</span>';
        }
    }
    return starsHTML;
}

// Función para renderizar cada producto (modificada para incluir estrellas)
function renderProduct(product) {
    const card = document.createElement('div');
    card.className = 'product-card-all';

    // Generar rating aleatorio para las estrellas
    const starRating = generateRandomStars();

    card.innerHTML = `
        <div class="product-image">
            <img src="${product.imagen || 'placeholder.jpg'}" alt="${product.nombre || 'Producto'}" class="product-img" />
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.nombre || 'Nombre de Producto'}</h3>
            <p class="product-description">${product.descripcion || 'Descripción del producto.'}</p>
            <div class="product-rating-price">
                <div class="product-rating">
                    ${createStarsHTML(starRating)}
                    <span class="rating-text">(${starRating}.0)</span>
                </div>
                <div class="product-price">$${(product.precio || 0).toFixed(2)}</div>
            </div>
            <div class="product-footer">
                <button class="buy-btn" data-id="${product.id}">Comprar</button>
            </div>
        </div>
    `;

    // Asignar comportamiento al botón "Comprar"
    const buyBtn = card.querySelector('.buy-btn');
    buyBtn.addEventListener('click', () => {
        window.location.href = `buy_product.html?id=${product.id}`;
    });

    return card;
}

function loadAndDuplicateProducts(products) {
    if (products.length === 0) {
        productsContainer.innerHTML = '<p>No hay productos disponibles.</p>';
        return;
    }

    productsContainer.innerHTML = ''; // Limpiamos el contenedor

    // Duplicar los productos DUPLICATION_FACTOR veces
    for (let i = 0; i < DUPLICATION_FACTOR; i++) {
        products.forEach(productData => {
            const card = renderProduct(productData);
            productsContainer.appendChild(card);
        });
    }

    // Calcular el ancho del primer producto para el desplazamiento de los botones
    setTimeout(() => {
        const firstCardElement = productsContainer.querySelector('.product-card-all');
        if (firstCardElement) {
            firstProductWidth = firstCardElement.offsetWidth + PRODUCTS_GAP;
        } else {
            console.error("No se encontró ningún .product-card para calcular el ancho.");
        }
    }, 0); // Pequeño retraso para asegurar que los elementos se han renderizado
}

// Obtener productos desde Firestore
db.collection('productos').get()
    .then(snapshot => {
        allProductsData = [];
        snapshot.forEach(doc => {
            allProductsData.push({
                id: doc.id,
                ...doc.data()
            });
        });
        console.log("¡Datos de Firebase obtenidos! Cantidad:", allProductsData.length);
        
        loadAndDuplicateProducts(allProductsData); 
    })
    .catch(error => {
        console.error('Error al cargar productos:', error);
    });

// Manejo de botones de navegación 
document.addEventListener('DOMContentLoaded', () => {
    prevBtn.addEventListener('click', () => {
        if (firstProductWidth > 0) {
            productsContainer.scrollBy({ left: -firstProductWidth, behavior: 'smooth' });
        }
    });

    nextBtn.addEventListener('click', () => {
        if (firstProductWidth > 0) {
            productsContainer.scrollBy({ left: firstProductWidth, behavior: 'smooth' });
        }
    });
});