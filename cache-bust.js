/**
 * Cache Busting Script para archivos CSS
 * Genera timestamps únicos para evitar problemas de caché en navegadores
 */

class CacheBuster {
    constructor() {
        this.timestamp = Date.now();
        this.version = '1.0.0';
    }

    /**
     * Genera una URL con timestamp para un archivo CSS
     * @param {string} cssFile - Nombre del archivo CSS
     * @returns {string} URL con timestamp
     */
    getCssUrl(cssFile) {
        return `${cssFile}?v=${this.timestamp}&version=${this.version}`;
    }

    /**
     * Carga un archivo CSS con cache busting
     * @param {string} cssFile - Nombre del archivo CSS
     * @param {string} pageId - ID de la página (opcional)
     */
    loadCss(cssFile, pageId = null) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = this.getCssUrl(cssFile);
            
            if (pageId) {
                link.id = `css-${pageId}`;
            }
            
            // Remover CSS anterior si existe
            const existingLink = document.getElementById(`css-${pageId}`);
            if (existingLink) {
                existingLink.remove();
            }
            
            // Event listeners para detectar cuando el CSS se carga
            link.onload = () => {
                console.log(`CSS cargado: ${cssFile} con timestamp: ${this.timestamp}`);
                resolve();
            };
            
            link.onerror = () => {
                console.error(`Error cargando CSS: ${cssFile}`);
                reject(new Error(`Error cargando CSS: ${cssFile}`));
            };
            
            document.head.appendChild(link);
        });
    }

    /**
     * Fuerza la recarga de todos los archivos CSS
     */
    async forceReload() {
        this.timestamp = Date.now();
        console.log(`Cache busting forzado. Nuevo timestamp: ${this.timestamp}`);
        
        // Recargar CSS de la página actual
        const currentPage = this.getCurrentPage();
        if (currentPage) {
            try {
                this.showLoadingScreen();
                await this.loadCss(`${currentPage}.css`, currentPage);
                await this.delay(1000);
                this.hideLoadingScreen();
            } catch (error) {
                console.error('Error recargando CSS:', error);
                this.hideLoadingScreen();
            }
        }
    }

    /**
     * Detecta la página actual basada en el nombre del archivo HTML
     * @returns {string|null} Nombre de la página actual
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        if (filename.includes('weeding')) return 'weeding';
        if (filename.includes('album')) return 'album';
        if (filename.includes('admin')) return 'admin';
        
        return null;
    }

    /**
     * Inicializa el cache busting para la página actual
     */
    async init() {
        const currentPage = this.getCurrentPage();
        if (currentPage) {
            try {
                // Mostrar pantalla de carga
                this.showLoadingScreen();
                
                // Cargar CSS
                await this.loadCss(`${currentPage}.css`, currentPage);
                
                // Simular tiempo mínimo de carga para mejor UX
                await this.delay(1500);
                
                // Ocultar pantalla de carga
                this.hideLoadingScreen();
                
            } catch (error) {
                console.error('Error cargando CSS:', error);
                // Ocultar pantalla de carga incluso si hay error
                this.hideLoadingScreen();
            }
        }
    }

    /**
     * Muestra la pantalla de carga
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.classList.remove('hidden');
        }
    }

    /**
     * Oculta la pantalla de carga
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            // Remover del DOM después de la animación
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            }, 800);
        }
    }

    /**
     * Utilidad para crear delays
     * @param {number} ms - Milisegundos de delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Método para desarrollo - permite forzar recarga con parámetro URL
     */
    checkForceReload() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('force-css') === 'true') {
            this.forceReload();
        }
    }
}

// Crear instancia global
window.cacheBuster = new CacheBuster();

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.cacheBuster.init();
    window.cacheBuster.checkForceReload();
});

// Exponer métodos globales para uso manual
window.forceCssReload = () => window.cacheBuster.forceReload();
window.loadCss = (cssFile, pageId) => window.cacheBuster.loadCss(cssFile, pageId);

// Para desarrollo: recargar CSS con Ctrl+Shift+R
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        window.cacheBuster.forceReload();
        console.log('CSS recargado manualmente');
    }
});
