// Carrusel para la sección "¿A qué nos enfrentamos?"
class ChallengeCarousel {
  constructor() {
  this.slides = document.querySelectorAll('.challenge-slide');
  this.totalSlides = this.slides.length;
  this.currentSlide = Math.floor(this.totalSlides / 2); // iniciar en slide central
  this.slidesContainer = document.querySelector('.challenge-slides');
  this.indicators = [];
  
  this.init();
}

  
  init() {
    this.createControls();
    this.createIndicators();
    this.updateCarousel();
    this.addEventListeners();
    this.startAutoSlide();
  }
  
  createControls() {
    const carousel = document.querySelector('.challenge-carousel');
    
    // Botón anterior
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-controls carousel-prev';
    prevBtn.innerHTML = '‹';
    prevBtn.setAttribute('aria-label', 'Anterior');
    
    // Botón siguiente
    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-controls carousel-next';
    nextBtn.innerHTML = '›';
    nextBtn.setAttribute('aria-label', 'Siguiente');
    
    carousel.appendChild(prevBtn);
    carousel.appendChild(nextBtn);
    
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
  }
  
  createIndicators() {
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'challenge-indicators';
    
    for (let i = 0; i < this.totalSlides; i++) {
      const indicator = document.createElement('div');
      indicator.className = 'challenge-indicator';
      if (i === 0) indicator.classList.add('active');
      
      indicator.addEventListener('click', () => this.goToSlide(i));
      this.indicators.push(indicator);
      indicatorsContainer.appendChild(indicator);
    }
    
    document.querySelector('.challenge-section').appendChild(indicatorsContainer);
  }
  
updateCarousel() {
  const slideWidth = this.slides[0].offsetWidth + 20; // ancho + gap
  const containerWidth = document.querySelector('.challenge-carousel').offsetWidth;
  const offset = (slideWidth * this.currentSlide) - (containerWidth - slideWidth) / 2;

  this.slidesContainer.style.transform = `translateX(${-offset}px)`;

  // Actualizar indicadores
  this.indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === this.currentSlide);
  });
}

  
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateCarousel();
  }
  
  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.updateCarousel();
  }
  
  goToSlide(index) {
    this.currentSlide = index;
    this.updateCarousel();
  }
  
  addEventListeners() {
    this.prevBtn.addEventListener('click', () => {
      this.prevSlide();
      this.resetAutoSlide();
    });
    
    this.nextBtn.addEventListener('click', () => {
      this.nextSlide();
      this.resetAutoSlide();
    });
    
    // Touch/swipe support
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    this.slidesContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });
    
    this.slidesContainer.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    });
    
    this.slidesContainer.addEventListener('touchend', () => {
      if (!isDragging) return;
      
      const deltaX = startX - currentX;
      const threshold = 50;
      
      if (deltaX > threshold) {
        this.nextSlide();
      } else if (deltaX < -threshold) {
        this.prevSlide();
      }
      
      isDragging = false;
      this.resetAutoSlide();
    });
    
    // Soporte para mouse drag
    let mouseDown = false;
    let startXMouse = 0;
    let currentXMouse = 0;
    
    this.slidesContainer.addEventListener('mousedown', (e) => {
      mouseDown = true;
      startXMouse = e.clientX;
      this.slidesContainer.style.cursor = 'grabbing';
    });
    
    this.slidesContainer.addEventListener('mousemove', (e) => {
      if (!mouseDown) return;
      currentXMouse = e.clientX;
    });
    
    this.slidesContainer.addEventListener('mouseup', () => {
      if (!mouseDown) return;
      
      const deltaX = startXMouse - currentXMouse;
      const threshold = 50;
      
      if (deltaX > threshold) {
        this.nextSlide();
      } else if (deltaX < -threshold) {
        this.prevSlide();
      }
      
      mouseDown = false;
      this.slidesContainer.style.cursor = 'grab';
      this.resetAutoSlide();
    });
    
    this.slidesContainer.addEventListener('mouseleave', () => {
      mouseDown = false;
      this.slidesContainer.style.cursor = 'grab';
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevSlide();
        this.resetAutoSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
        this.resetAutoSlide();
      }
    });
    
    // Pause on hover
    const carousel = document.querySelector('.challenge-carousel');
    carousel.addEventListener('mouseenter', () => this.pauseAutoSlide());
    carousel.addEventListener('mouseleave', () => this.startAutoSlide());
  }
  
  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 10000); // Cambia cada 5 segundos
  }
  
  pauseAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }
  
  resetAutoSlide() {
    this.pauseAutoSlide();
    this.startAutoSlide();
  }
}

// Inicializar el carrusel cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si existe la sección challenge
  if (document.querySelector('.challenge-section')) {
    window.challengeCarousel = new ChallengeCarousel();
  }
});

// Manejar el redimensionamiento de la ventana
window.addEventListener('resize', () => {
  if (window.challengeCarousel) {
    window.challengeCarousel.updateCarousel();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".hero-bg");
  const dots = document.querySelectorAll(".hero-dots .dot");
  let currentSlide = 0;
  const intervalTime = 5000;
  let interval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
    currentSlide = index;
  }

  function nextSlide() {
    const nextIndex = (currentSlide + 1) % slides.length;
    showSlide(nextIndex);
  }

  // Cambio automático
  function startCarousel() {
    interval = setInterval(nextSlide, intervalTime);
  }

  function stopCarousel() {
    clearInterval(interval);
  }

  // Interacción con dots
  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const index = parseInt(dot.getAttribute("data-index"));
      stopCarousel();
      showSlide(index);
      startCarousel(); // reinicia el intervalo
    });
  });

  showSlide(0);
  startCarousel();
});

