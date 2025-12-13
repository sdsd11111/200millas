document.addEventListener('DOMContentLoaded', function () {
    // 1. Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        /* Lightbox Styles */
        #visual-lightbox {
            display: none;
            position: fixed;
            z-index: 9999;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(5px);
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        #visual-lightbox.active {
            display: flex;
            opacity: 1;
        }

        #visual-lightbox img {
            max-width: 90%;
            max-height: 90vh;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }

        #visual-lightbox.active img {
            transform: scale(1);
        }

        #visual-lightbox-close {
            position: absolute;
            top: 20px;
            right: 30px;
            color: #fff;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
            transition: color 0.3s ease;
            z-index: 10000;
        }

        #visual-lightbox-close:hover {
            color: #E67E22;
        }

        /* Prevent scrolling when lightbox is open */
        body.lightbox-open {
            overflow: hidden;
        }

        /* Generic Cursor Pointer for Gallery Images */
        .gallery-item img, 
        .sopas-slide img, 
        .menu-item img, 
        .sidebar-image img,
        .featured-grid img,
        .dish-image img,
        .welcome-image img {
            cursor: pointer;
            transition: transform 0.3s ease;
        }

        .gallery-item img:hover, 
        .sopas-slide img:hover, 
        .menu-item img:hover, 
        .sidebar-image img:hover,
        .featured-grid img:hover,
        .dish-image img:hover,
        .welcome-image img:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
    `;
    document.head.appendChild(style);

    // 2. Inject HTML
    const lightboxContainer = document.createElement('div');
    lightboxContainer.id = 'visual-lightbox';
    lightboxContainer.innerHTML = `
        <span id="visual-lightbox-close">&times;</span>
        <img id="visual-lightbox-img" src="" alt="Lightbox Image">
    `;
    document.body.appendChild(lightboxContainer);

    // 3. Add Event Listeners
    const lightbox = document.getElementById('visual-lightbox');
    const lightboxImg = document.getElementById('visual-lightbox-img');
    const closeBtn = document.getElementById('visual-lightbox-close');

    // Open lightbox function
    function openLightbox(imgSrc) {
        lightboxImg.src = imgSrc;
        lightbox.classList.add('active');
        document.body.classList.add('lightbox-open');
    }

    // Close lightbox function
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.classList.remove('lightbox-open');
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300); // Clear source after transition
    }

    // Close button click
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

    // Delegate click event for images with class 'img-fluid', 'gallery-item img', or specific selectors
    // Adjust selectors to match your specific image classes across pages
    document.body.addEventListener('click', function (e) {
        const target = e.target;

        // Check if the clicked element is an image that should be legally lightbox-ed
        // We look for commonly used classes in the project or just check if it's an image inside a main content area
        const validClasses = ['img-fluid', 'lightbox-trigger'];
        const isImage = target.tagName === 'IMG';

        // Refined criteria: 
        // 1. Must be an relevant image (standard content images)
        // 2. Should NOT be a logo, icon, or structural image if possible.
        // 3. Often wrapped in standard containers.

        // Specific exclusion (logos, small icons)
        if (target.closest('#header-container') || target.closest('footer') || target.classList.contains('logo') || target.width < 100) {
            return;
        }

        if (isImage) {
            // Check if it has specific classes OR is inside a gallery/menu-item
            const hasClass = validClasses.some(cls => target.classList.contains(cls));
            const inGallery = target.closest('.gallery-item') || target.closest('.sopas-slide') || target.closest('.menu-item') || target.closest('.sidebar-image');

            if (hasClass || inGallery || target.classList.contains('img-fluid')) {
                // Prevent default action if it's inside a link, unless we want to override it?
                // Usually galleries might be links, but here they seem to be just images.
                // If it's a link, we might want to let it go, BUT often pure image galleries are just images.
                // For now, let's just open the lightbox.

                if (target.parentElement.tagName === 'A') {
                    e.preventDefault(); // Stop link navigation if we want lightbox
                }

                openLightbox(target.src);
            }
        }
    });
});
