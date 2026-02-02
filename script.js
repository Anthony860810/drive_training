document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Logic (Existing)
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // 2. Hero Text Rotation Logic
    const heroContent = document.querySelector('.hero p#hero-slogan');
    const heroDots = document.querySelectorAll('.hero .dot');
    let sloganTimer; // Define outside to be accessible

    if (heroContent) {
        const slogans_zh = [
            "<span style='font-size: 1.5em;'>原地</span>考照・<span style='font-size: 1.5em;'>專業</span>師資・<span style='font-size: 1.5em;'>TOYOTA</span>教練車",
            "最近<span style='font-size: 1.5em;'>岡山</span>市區・<span style='font-size: 1.5em;'>鄉親</span>第一選擇",
            "學車考照到<span style='font-size: 1.5em;'>同安</span>・事事順利皆<span style='font-size: 1.5em;'>平安</span>"
        ];
        // For English, we just want static text, but we can have an array of 1 if we wanted.
        // But the requirement is to stop rotation.

        let currentSlogan = 0;

        const updateHero = (index) => {
            // Only rotate if language is Chinese
            const currentLang = localStorage.getItem('preferredLanguage') || 'zh';
            if (currentLang !== 'zh') return;

            currentSlogan = index;

            // Update Text
            heroContent.style.opacity = 0;
            setTimeout(() => {
                heroContent.innerHTML = slogans_zh[currentSlogan];
                heroContent.style.opacity = 1;
            }, 300);

            // Update Dots
            heroDots.forEach((dot, idx) => {
                if (idx === currentSlogan) {
                    dot.classList.add('active');
                    dot.style.backgroundColor = 'white';
                } else {
                    dot.classList.remove('active');
                    dot.style.backgroundColor = 'rgba(255,255,255,0.5)';
                }
            });
        };

        const nextSlogan = () => {
            const currentLang = localStorage.getItem('preferredLanguage') || 'zh';
            if (currentLang === 'zh') {
                updateHero((currentSlogan + 1) % slogans_zh.length);
            }
        };

        const startSloganTimer = () => {
            if (sloganTimer) clearInterval(sloganTimer);
            sloganTimer = setInterval(nextSlogan, 4000);
        };

        // Start timer initially
        startSloganTimer();

        // Dot Interaction
        heroDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const currentLang = localStorage.getItem('preferredLanguage') || 'zh';
                if (currentLang === 'zh') {
                    clearInterval(sloganTimer);
                    updateHero(index);
                    startSloganTimer();
                }
            });
        });
    }

    // 3. Lightbox Implementation

    // Create Lightbox DOM
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-modal';
    lightbox.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <img class="lightbox-content" src="" alt="Enlarged Image">
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-content');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    // Select all target images
    // Feature images (Home), History slider images (About), & Gallery images (Facilities)
    const targetImages = document.querySelectorAll('.feature-icon img, .history-slider-track img, .gallery-img');

    targetImages.forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling issues
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('active');
            lightbox.style.display = 'flex'; // Ensure flex display when active
        });
    });

    // Close Lightbox Functions
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        setTimeout(() => {
            lightbox.style.display = 'none';
        }, 300); // Wait for transition
    };

    // Close on button click
    closeBtn.addEventListener('click', closeLightbox);

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // 4. Generic Carousel Logic (Facilities Page - Highlights & Maintenance)
    const initCarousel = (carouselContainer, intervalTime = 4000) => {
        if (!carouselContainer) return;

        const slides = carouselContainer.querySelectorAll('.carousel-slide');
        const dots = carouselContainer.querySelectorAll('.dot');
        let currentSlide = 0;
        let slideTimer;

        const showSlide = (index) => {
            // Remove active class from current
            if (slides[currentSlide]) slides[currentSlide].classList.remove('active');
            if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

            // Update current index
            currentSlide = index;
            if (currentSlide >= slides.length) currentSlide = 0;
            if (currentSlide < 0) currentSlide = slides.length - 1;

            // Add active class to new
            if (slides[currentSlide]) slides[currentSlide].classList.add('active');
            if (dots[currentSlide]) dots[currentSlide].classList.add('active');
        };

        const nextSlide = () => {
            showSlide(currentSlide + 1);
        };

        // Auto-play
        const startTimer = () => {
            if (slideTimer) clearInterval(slideTimer);
            slideTimer = setInterval(nextSlide, intervalTime);
        };

        startTimer();

        // Dot Click Interaction
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(slideTimer);
                showSlide(index);
                startTimer();
            });
        });

        // Pause on Hover
        carouselContainer.addEventListener('mouseenter', () => clearInterval(slideTimer));
        carouselContainer.addEventListener('mouseleave', startTimer);
    };

    // Initialize Facilities Highlight Carousel
    initCarousel(document.querySelector('.facilities-carousel'), 4000);

    // Initialize Maintenance Carousel
    initCarousel(document.querySelector('.maintenance-carousel'), 4000);

    // Initialize Activities Carousel
    initCarousel(document.querySelector('.activities-carousel'), 4000);
    // 5. Language Switcher Logic (Dropdown Replacement)
    const langBtn = document.getElementById('lang-switch');

    // Function to create dropdown
    const createLangDropdown = (currentLang) => {
        if (!langBtn) return;

        // Create Select Element
        const select = document.createElement('select');
        select.id = 'lang-select';
        select.className = 'lang-select'; // We will style this class

        const options = [
            { value: 'zh', text: '🇹🇼 繁體中文' },
            { value: 'en', text: '🇺🇸 English' },
            { value: 'vi', text: '🇻🇳 Tiếng Việt' },
            { value: 'th', text: '🇹🇭 ไทย' }
        ];

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.text = opt.text;
            if (opt.value === currentLang) option.selected = true;
            select.appendChild(option);
        });

        // Replace Button with Select
        langBtn.parentNode.replaceChild(select, langBtn);

        return select;
    };

    if (typeof translations !== 'undefined') {
        const setLanguage = (lang) => {
            const strings = translations[lang];
            if (!strings) return;

            // Update DOM Elements
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (strings[key]) {
                    el.innerHTML = strings[key];
                }
            });

            // Save Preference
            localStorage.setItem('preferredLanguage', lang);
            document.documentElement.lang = lang;

            // Logic to handle rotation visibility/state
            const heroDots = document.querySelectorAll('.hero .dot');
            const heroContent = document.querySelector('.hero p#hero-slogan');

            if (lang !== 'zh') {
                // Stop rotation and hide dots for non-Chinese
                if (heroDots) heroDots.forEach(d => d.style.display = 'none');
            } else {
                // Restart rotation and show dots for Chinese
                if (heroDots) heroDots.forEach(d => d.style.display = 'inline-block');
            }
        };

        // Initialize Language
        const savedLang = localStorage.getItem('preferredLanguage') || 'zh';
        setLanguage(savedLang);

        // Initialize Dropdown
        // Note: We check if button exists because on subsequent loads it might be replaced? 
        // Actually DOMContentLoaded runs once, but we need to find the element again if we replaced it?
        // No, we replace it once on load.

        const langSelect = createLangDropdown(savedLang);

        if (langSelect) {
            langSelect.addEventListener('change', (e) => {
                setLanguage(e.target.value);
            });
        }
    }
});
