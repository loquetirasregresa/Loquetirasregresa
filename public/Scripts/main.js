import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getApps, getApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgaiQDFtx2IGviiepkWODRy_D_N-3o0QA",
  authDomain: "moovo-16a2e.firebaseapp.com",
  projectId: "moovo-16a2e",
  storageBucket: "moovo-16a2e.firebasestorage.app",
  messagingSenderId: "835927562635",
  appId: "1:835927562635:web:7c607169bb8f46ec78778e",
  measurementId: "G-CM1SBP592Q"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
  // Cargar componentes HTML
  function loadHTML(id, url) {
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.text();
      })
      .then(html => {
        const placeholder = document.getElementById(id);
        if (placeholder) {
          placeholder.innerHTML = html;

          if (id === 'header-placeholder') {
            // Esperar a que el DOM del header cargue
            onAuthStateChanged(auth, (user) => {
              const nameSpan = document.getElementById("user-name");
              const nameSpanMobile = document.getElementById("user-name-mobile");
              const avatar = document.querySelector(".user-avatar");

              if (nameSpan && avatar) {
                if (user) {
                  const displayName = user.displayName || user.email;
                  nameSpan.textContent = displayName;
                  if (nameSpanMobile) nameSpanMobile.textContent = displayName;
                  
                  nameSpan.style.cursor = "pointer";
                  avatar.style.cursor = "pointer";

                  nameSpan.addEventListener("click", () => {
                    window.location.href = "perfil.html";
                  });

                  avatar.addEventListener("click", () => {
                    window.location.href = "perfil.html";
                  });
                } else {
                  nameSpan.textContent = "";
                  if (nameSpanMobile) nameSpanMobile.textContent = "";
                  
                  avatar.addEventListener("click", () => {
                    window.location.href = "login.html";
                  });
                }
              }
            });

            // Inicializar funcionalidades del header
            activateHeaderLinks();
            initializeMobileMenu();
            initializeSearchModal();
            initializeMobileActions();

            setTimeout(() => {
            applyTransparentHeader();
          }, 100);
          }
        }
      })
      .catch(error => console.error(`Error cargando el componente ${id} desde ${url}:`, error));
  }

  // Detectar si es móvil y cargar el header correspondiente
  function loadAppropriateHeader() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      loadHTML('header-placeholder', 'includes/mobile-header.html');
    } else {
      loadHTML('header-placeholder', 'includes/header.html');
    }
  }
  
  // Cargar header inicial
  loadAppropriateHeader();
  loadHTML('footer-placeholder', 'includes/footer.html');
  
  // Recargar header apropiado cuando cambie el tamaño de ventana
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wasMobile = document.querySelector('.header-mobile') !== null;
      const isMobile = window.innerWidth <= 768;
      
      if (wasMobile !== isMobile) {
        loadAppropriateHeader();
      }
    }, 250);
  });
});

function applyTransparentHeader() {
  // Define las páginas donde quieres el header transparente
  const transparentPages = [
    'index.html',
    'multimedia.html',
    'tienda.html',
    'medios_fisicos.html',
    'nosotros.html'
    // Agrega más páginas según necesites
  ];
  
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const header = document.querySelector('.header');
  
  if (header && transparentPages.includes(currentPage)) {
    header.classList.add('transparent');
    
    // Opcional: Agregar efecto de scroll para hacer opaco al hacer scroll
  }
}

// Activa la clase .active en el link correspondiente al archivo actual
function activateHeaderLinks() {
  const currentPageUrl = window.location.href;
  const navLinks = document.querySelectorAll('.nav-desktop .nav-link, .nav-mobile .nav-link-mobile');

  navLinks.forEach(link => {
    const linkUrlClean = link.href.endsWith('/') ? link.href.slice(0, -1) : link.href;
    const currentUrlClean = currentPageUrl.endsWith('/') ? currentPageUrl.slice(0, -1) : currentPageUrl;

    const linkFileName = link.pathname.split('/').pop();
    const currentPageFileName = window.location.pathname.split('/').pop();

    if (linkUrlClean === currentUrlClean || (linkFileName === currentPageFileName && linkFileName !== '')) {
      link.classList.add('active');
    }
  });
}

// Inicializar menú móvil
function initializeMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Cerrar menú al hacer clic en un enlace
    const mobileLinks = document.querySelectorAll('.nav-link-mobile');
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
    
    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', (e) => {
      if (!mobileMenuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
        closeMobileMenu();
      }
    });
    
    // Cerrar menú al redimensionar la ventana
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      }
    });
  }
}

// Toggle del menú móvil
function toggleMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.classList.toggle('active');
    mobileNav.classList.toggle('active');
    
    // Prevenir scroll del body cuando el menú está abierto
    if (mobileNav.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
}

// Cerrar menú móvil
function closeMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.classList.remove('active');
    mobileNav.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Inicializar acciones del menú móvil
function initializeMobileActions() {
  const searchBtnMobile = document.getElementById('searchBtnMobile');
  const cartBtnMobile = document.getElementById('cartBtnMobile');
  const userBtnMobile = document.getElementById('userBtnMobile');
  
  if (searchBtnMobile) {
    searchBtnMobile.addEventListener('click', () => {
      openSearchModal();
      closeMobileMenu();
    });
  }
  
  if (cartBtnMobile) {
    cartBtnMobile.addEventListener('click', () => {
      window.location.href = 'car.html';
    });
  }
  
  if (userBtnMobile) {
    userBtnMobile.addEventListener('click', () => {
      // Verificar si el usuario está autenticado
      onAuthStateChanged(auth, (user) => {
        if (user) {
          window.location.href = 'perfil.html';
        } else {
          window.location.href = 'login.html';
        }
      });
    });
  }
}

// Inicializar modal de búsqueda
function initializeSearchModal() {
  // Las funciones del modal de búsqueda se mantienen globales para ser llamadas desde onclick
  window.openSearchModal = function() {
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput');
    
    if (searchModal) {
      searchModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Focus en el input después de un pequeño delay
      setTimeout(() => {
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };
  
  window.closeSearchModal = function() {
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (searchModal) {
      searchModal.style.display = 'none';
      document.body.style.overflow = '';
      
      // Limpiar búsqueda
      if (searchInput) searchInput.value = '';
      if (searchSuggestions) searchSuggestions.innerHTML = '';
    }
  };
  
  window.handleSearch = function(query) {
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (!searchSuggestions) return;
    
    // Limpiar sugerencias anteriores
    searchSuggestions.innerHTML = '';
    
    if (query.length < 2) return;
    
    // Aquí puedes implementar la lógica de búsqueda
    // Por ahora, mostraremos sugerencias de ejemplo
    const suggestions = [
      'Películas de acción',
      'Música pop',
      'Documentales',
      'Series de Netflix',
      'Álbumes de rock'
    ].filter(item => item.toLowerCase().includes(query.toLowerCase()));
    
    suggestions.forEach(suggestion => {
      const suggestionElement = document.createElement('div');
      suggestionElement.className = 'search-suggestion-item';
      suggestionElement.textContent = suggestion;
      suggestionElement.addEventListener('click', () => {
        // Implementar acción al seleccionar sugerencia
        console.log('Búsqueda seleccionada:', suggestion);
        window.closeSearchModal();
      });
      searchSuggestions.appendChild(suggestionElement);
    });
  };
  
  // Cerrar modal con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeSearchModal();
      closeMobileMenu();
    }
  });
}