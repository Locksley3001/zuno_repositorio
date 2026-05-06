// Scripts y funciones JavaScript

console.log('Script cargado correctamente');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM completamente cargado');
    
    // ===== Configuración editable del efecto typewriter =====
    const typewriterSettings = {
        text: 'Bienvenido a Zuno\nDonde las ideas se convierten en resultados', // Texto principal con salto de línea \n
        typingSpeed: 60, // Milisegundos por carácter. Ajusta este valor para cambiar la velocidad de escritura.
        startDelay: 350, // Milisegundos antes de comenzar la animación.
        cursorSymbol: '|', // Símbolo que aparece como cursor.
        cursorBlinkSpeed: 800, // Duración del parpadeo del cursor en milisegundos.
        descriptionDelay: 260, // Retraso antes de mostrar la descripción después de terminar el título.
    };
    
    const typewriterText = document.getElementById('typewriterText');
    const typewriterCursor = document.getElementById('typewriterCursor');
    const heroDescription = document.getElementById('heroDescription');
    const heroActions = document.getElementById('heroActions');

    if (typewriterText && typewriterCursor) {
        typewriterCursor.textContent = typewriterSettings.cursorSymbol;
        typewriterCursor.style.animationDuration = `${typewriterSettings.cursorBlinkSpeed}ms`;
        
        // Mover el cursor dentro del mismo span de texto para que siempre siga el flujo.
        typewriterText.appendChild(typewriterCursor);
        
        let currentIndex = 0;
        const fullText = typewriterSettings.text;

        function appendCharacter(character) {
            if (character === '\n') {
                // Inserta un salto de línea antes del cursor.
                typewriterCursor.insertAdjacentHTML('beforebegin', '<br>');
            } else {
                // Añade texto antes del cursor para mantenerlo al final.
                typewriterCursor.insertAdjacentText('beforebegin', character);
            }
        }

        function typeNextCharacter() {
            if (currentIndex < fullText.length) {
                appendCharacter(fullText[currentIndex]);
                currentIndex += 1;
                setTimeout(typeNextCharacter, typewriterSettings.typingSpeed);
            } else {
                // La animación de escritura termina una sola vez.
                typewriterCursor.classList.add('cursor-finished');

                // Mostrar la descripción y los botones después de terminar el título.
                setTimeout(function() {
                    if (heroDescription) {
                        heroDescription.classList.add('visible');
                    }
                    if (heroActions) {
                        heroActions.classList.add('visible');
                    }
                }, typewriterSettings.descriptionDelay);
            }
        }

        setTimeout(typeNextCharacter, typewriterSettings.startDelay);
    }
    
    // ===== Toggle del menú hamburguesa en móvil =====
    const navToggle = document.querySelector('.nav-toggle');
    const navbarGlass = document.querySelector('.navbar-glass');
    const mobileLinks = document.querySelectorAll('.nav-links a');

    if (navToggle && navbarGlass) {
        navToggle.addEventListener('click', function() {
            // Toggle mobile: abre/cierra el menu y sincroniza la X del icono.
            const isOpen = navbarGlass.classList.toggle('open');
            navToggle.classList.toggle('active', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
            navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menu' : 'Abrir menu');
        });
    }

    // Cierra el menú móvil al hacer clic en un enlace.
    mobileLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (navbarGlass && navbarGlass.classList.contains('open')) {
                navbarGlass.classList.remove('open');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-label', 'Abrir menu');
            }
        });
    });
    
    // ===== Botones de autenticación =====
    const btnLogin = document.querySelector('.btn-login');
    const btnRegister = document.querySelector('.btn-register');
    
    if (btnLogin) {
        btnLogin.addEventListener('click', function() {
            console.log('Iniciar sesión clickeado');
            // Redirige a la página de login sin cambiar el diseño existente.
            window.location.href = './login.html';
        });
    }
    
    if (btnRegister) {
        btnRegister.addEventListener('click', function() {
            console.log('Crear cuenta clickeado');
            // Redirige a la página de registro sin alterar la página principal.
            window.location.href = './register.html';
        });
    }
    
    // ===== Smooth scroll para los links de navegación =====
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});
