// Footer Component
function initFooter() {
    console.log('🚀 Inicializando componente footer...');

    // Update copyright year
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = currentYear;
        console.log('✅ Año de copyright actualizado:', currentYear);
    }

    // Add click event to WhatsApp button
    const whatsappBtn = document.querySelector('.whatsapp-float');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function(e) {
            console.log('📱 Botón de WhatsApp clickeado');
        });
        console.log('✅ Evento de WhatsApp agregado');
    }

    // Verify footer styles are applied
    const footer = document.querySelector('.footer');
    if (footer) {
        console.log('✅ Footer element encontrado');
        console.log('🎨 Color de fondo del footer:', getComputedStyle(footer).backgroundColor);
        console.log('📝 Familia de fuente del footer:', getComputedStyle(footer).fontFamily);
    }

    console.log('🎉 Footer component completamente inicializado');
}

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', initFooter);
