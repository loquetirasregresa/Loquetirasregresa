const $ = selector => document.querySelector(selector);

        // Array de imágenes - Reemplaza con tus URLs de imágenes
        const carouselImages = [
            'imagenes/Valla1.webp',
            'imagenes/Valla2.webp',
            'imagenes/Valla3.webp',
            'imagenes/Valla1.webp',
            'imagenes/Valla3.webp'
        ];

        let currentIndex = 2; // Empezamos con el elemento central activo

        // Función para actualizar las clases de los elementos
        function updateCarousel() {
            const items = document.querySelectorAll('.list li');
            const classes = ['prev-far', 'prev', 'act', 'next', 'next-far'];
            
            items.forEach((item, index) => {
                // Remover todas las clases
                item.className = '';
                // Asignar la clase correspondiente
                item.classList.add(classes[index]);
                
                // Calcular el índice de imagen basado en la posición actual
                const imageIndex = (currentIndex - 2 + index + carouselImages.length) % carouselImages.length;
                item.style.backgroundImage = `url(${carouselImages[imageIndex]})`;
                item.style.backgroundSize = 'cover';
                item.style.backgroundPosition = 'center';
            });
            
            updateIndicators();
        }

        // Función para actualizar los indicadores
        function updateIndicators() {
            const indicators = document.querySelectorAll('.indicator');
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === (currentIndex % carouselImages.length));
            });
        }

        // Función para ir al siguiente
        function next() {
            currentIndex = (currentIndex + 1) % carouselImages.length;
            updateCarousel();
        }

        // Función para ir al anterior
        function prev() {
            currentIndex = (currentIndex - 1 + carouselImages.length) % carouselImages.length;
            updateCarousel();
        }

        // Función para ir a un índice específico
        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
        }

        // Event listeners - Solo para clicks en las imágenes
        const slider = $('.list');
        if (slider) {
            slider.onclick = event => {
                if (event.target && event.target.tagName === 'LI') {
                    const classes = event.target.classList;
                    if (classes.contains('next') || classes.contains('next-far')) {
                        next();
                    } else if (classes.contains('prev') || classes.contains('prev-far')) {
                        prev();
                    }
                }
            }
        }

        // Indicadores
        document.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.onclick = () => goToSlide(index);
        });

        // Auto-play (opcional)
        let autoPlayInterval;
        
        function startAutoPlay() {
            autoPlayInterval = setInterval(next, 4000); // Cambia cada 4 segundos
        }
        
        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }

        // Pausar auto-play al hacer hover
        const vallasSection = $('.vallas-section');
        vallasSection.addEventListener('mouseenter', stopAutoPlay);
        vallasSection.addEventListener('mouseleave', startAutoPlay);

        // Soporte para gestos táctiles básicos
        let startX = 0;
        let endX = 0;

        const swipeElement = $('.swipe');
        if (swipeElement) {
            swipeElement.addEventListener('touchstart', e => {
                startX = e.touches[0].clientX;
            });

            swipeElement.addEventListener('touchend', e => {
                endX = e.changedTouches[0].clientX;
                handleSwipe();
            });
        }

        function handleSwipe() {
            const diffX = startX - endX;
            const threshold = 50;

            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    next(); // Swipe left - ir al siguiente
                } else {
                    prev(); // Swipe right - ir al anterior
                }
            }
        }

        // Inicializar el carousel
        document.addEventListener('DOMContentLoaded', () => {
            updateCarousel();
            startAutoPlay();
        });