document.addEventListener('DOMContentLoaded', () => {
    const multimediaHeroSection = document.getElementById('multimedia-hero-section');
    
    const multimediaHeroCards = multimediaHeroSection ? multimediaHeroSection.querySelectorAll('.hero-card-multimedia') : [];
    
    // La imagen de fondo por defecto
    const defaultMultimediaBgImage = 'multimedia_documental.jpg'; 
    const imageBaseRoute = 'imagenes/';

    // Función para cambiar la imagen de fondo
    function changeHeroBackground(imageFileName) {
        if (multimediaHeroSection) {
            multimediaHeroSection.style.backgroundImage = `url('${imageBaseRoute}${imageFileName}')`;
        }
    }

    changeHeroBackground(defaultMultimediaBgImage);

    // Añadir event listeners a cada tarjeta
    if (multimediaHeroCards.length > 0) {
        multimediaHeroCards.forEach(card => {
            const bgImage = card.dataset.bgImage; // Obtener el nombre de archivo de la imagen del atributo data-bg-image

            if (bgImage) { 
                card.addEventListener('mouseenter', () => {
                    changeHeroBackground(bgImage);
                });
                card.addEventListener('mouseleave', () => {
                    changeHeroBackground(defaultMultimediaBgImage);
                });
            }
        });
    }

    const heroDots = multimediaHeroSection ? multimediaHeroSection.querySelectorAll('.hero-dots .dot') : [];
    if (multimediaHeroCards.length > 0 && heroDots.length > 0) {
        multimediaHeroCards.forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                heroDots.forEach(d => d.classList.remove('active'));
                if (heroDots[index]) {
                    heroDots[index].classList.add('active');
                }
            });
            card.addEventListener('mouseleave', () => {
                // Volver al primer punto activo o a la imagen por defecto
                heroDots.forEach(d => d.classList.remove('active'));
                if (heroDots[0]) { 
                    heroDots[1].classList.add('active');
                }
            });
        });
        heroDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                heroDots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
                if (multimediaHeroCards[index] && multimediaHeroCards[index].dataset.bgImage) {
                    changeHeroBackground(multimediaHeroCards[index].dataset.bgImage);
                }
            });
        });
        
    }
});