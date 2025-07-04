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

const PRODUCTS_GAP = 30;

// Función para generar estrellas de rating
function generateStars(rating = 0) {
    const maxStars = 5;
    let starsHTML = '';
    
    for (let i = 1; i <= maxStars; i++) {
        if (i <= rating) {
            starsHTML += '<span class="star star-filled">★</span>';
        } else {
            starsHTML += '<span class="star star-empty">☆</span>';
        }
    }
    
    return starsHTML;
}

// Función para generar rating aleatorio (entre 3 y 5)
function getRandomRating() {
    return Math.floor(Math.random() * 3) + 3; // 3, 4, o 5 estrellas
}

function renderProduct(product) {
    const card = document.createElement('div');
    card.className = 'product-card-all';

    const rating = getRandomRating();
    const starsHTML = generateStars(rating);

    card.innerHTML = `
        <div class="product-image">
            <img src="${product.imagen || 'placeholder.jpg'}" alt="${product.nombre || 'Producto'}" class="product-img" />
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.nombre || 'Nombre de Producto'}</h3>
            <p class="product-description">${product.descripcion || 'Descripción del producto.'}</p>
            <div class="product-rating-price">
                <div class="product-rating">
                    ${starsHTML}
                    <span class="rating-text">(${rating}.0)</span>
                </div>
                <div class="product-price">$${(product.precio || 0).toFixed(2)}</div>
            </div>
            <div class="product-footer">
                <button class="buy-btn" data-id="${product.id}">Comprar</button>
            </div>
        </div>
    `;
    return card;
}

function getRandomElements(arr, num) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

function updateCenteredCard() {
    const cards = container.querySelectorAll('.product-card');
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestCard = null;
    let minDistance = Infinity;

    cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(containerCenter - cardCenter);

        if (cardRect.right > containerRect.left && cardRect.left < containerRect.right) {
            if (distance < minDistance) {
                minDistance = distance;
                closestCard = card;
            }
        }
    });

    cards.forEach(card => {
        card.classList.remove('is-centered');
    });

    if (closestCard) {
        closestCard.classList.add('is-centered');
    }
}

function setupCarousel(containerId, productsData) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`Contenedor ${containerId} no encontrado.`);
        return;
    }

    const DUPLICATION_FACTOR = 3;

    function loadProductsIntoCarousel() {
        if (productsData.length === 0) {
            container.innerHTML = '<p>No hay productos disponibles en esta categoría.</p>';
            return;
        }
        container.innerHTML = '';

        for (let i = 0; i < DUPLICATION_FACTOR; i++) {
            productsData.forEach(product => {
                const card = renderProduct(product);
                container.appendChild(card);
            });
        }
    }

    let isScrolling = null;

    function updateCenteredCard() {
        const cards = container.querySelectorAll('.product-card');
        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;

        let closestCard = null;
        let minDistance = Infinity;

        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(containerCenter - cardCenter);

            if (cardRect.right > containerRect.left && cardRect.left < containerRect.right) {
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCard = card;
                }
            }
        });

        cards.forEach(card => {
            card.classList.remove('is-centered');
        });

        if (closestCard) {
            closestCard.classList.add('is-centered');
        }
    }

    loadProductsIntoCarousel();
    setTimeout(updateCenteredCard, 100); 

    container.addEventListener('scroll', () => {
        clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            updateCenteredCard();
        }, 50); 
    });

    window.addEventListener('resize', () => {
        updateCenteredCard();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    db.collection('productos').get()
        .then(snapshot => {
            const allAvailableProducts = [];
            snapshot.forEach(doc => {
                allAvailableProducts.push({ id: doc.id, ...doc.data() });
            });
            const loMasPedidoProducts = getRandomElements(allAvailableProducts, 6);
            setupCarousel('loMasPedidoContainer', loMasPedidoProducts);
        })
        .catch(error => {
            console.error('Error al cargar productos "Lo Más Pedido":', error);
        });

    db.collection('productos').where('categoria', '==', 'Camisa').get()
        .then(snapshot => {
            const camisetasProducts = [];
            snapshot.forEach(doc => {
                camisetasProducts.push({ id: doc.id, ...doc.data() });
            });
            setupCarousel('camisetasContainer', camisetasProducts);
        })
        .catch(error => {
            console.error('Error al cargar productos "Camisetas":', error);
        });
});

function renderProduct2(product) {
    const card = document.createElement('div');
    card.className = 'product-item';

    const rating = getRandomRating();
    const starsHTML = generateStars(rating);

    card.innerHTML = `
        <div class="product-image">
            <img src="${product.imagen || 'placeholder.jpg'}" alt="${product.nombre || 'Producto'}" class="product-img" />
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.nombre || 'Nombre de Producto'}</h3>
            <p class="product-description">${product.descripcion || 'Descripción del producto.'}</p>
            <div class="product-rating-price">
                <div class="product-rating">
                    ${starsHTML}
                    <span class="rating-text">(${rating}.0)</span>
                </div>
                <div class="product-price">$${(product.precio || 0).toFixed(2)}</div>
            </div>
            <div class="product-footer">
                <button class="buy-btn" data-id="${product.id}">Comprar</button>
            </div>
        </div>
    `;
    return card;
}

async function loadProductsToGrid(containerId, collectionQuery, limitCount = 4) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Contenedor con ID "${containerId}" no encontrado.`);
        return;
    }

    container.innerHTML = '<p>Cargando productos...</p>';

    try {
        const q = collectionQuery.limit(limitCount);
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            container.innerHTML = '<p>No hay productos disponibles en esta categoría.</p>';
            return;
        }

        container.innerHTML = '';

        querySnapshot.forEach(doc => {
            const productData = { id: doc.id, ...doc.data() };
            const productElement = renderProduct2(productData);
            container.appendChild(productElement);
        });

    } catch (error) {
        console.error(`Error al cargar productos para "${containerId}":`, error);
        container.innerHTML = '<p>Error al cargar productos.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProductsToGrid('pinesContainer', db.collection('productos').where('categoria', '==', 'Pin'), 4);
    loadProductsToGrid('stickersContainer', db.collection('productos').where('categoria', '==', 'Sticker'), 4);
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('buy-btn')) {
    const productId = e.target.dataset.id;
    if (productId) {
      window.location.href = `buy_product.html?id=${productId}`;
    }
  }
});