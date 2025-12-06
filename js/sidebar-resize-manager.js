/**
 * Mantik - Sidebar Resize Manager
 * Handles sidebar resizing functionality
 */

class SidebarResizeManager {
    constructor() {
        this.isResizing = false;
        this.startX = 0;
        this.startWidth = 0;
        this.minWidth = 240; // 15em minimum
        this.maxWidth = 600; // Maximum width
        this.resizeHandle = null;
        this.sidebarDrawer = null;
        this.sidebarContainer = null;
        this.mainContent = null;
    }

    initialize() {
        this.resizeHandle = document.querySelector('.sidebar-resize-handle');
        this.sidebarDrawer = document.querySelector('.sidebar-drawer');
        this.sidebarContainer = document.querySelector('.sidebar-container');
        this.mainContent = document.querySelector('.main');

        if (this.resizeHandle && this.sidebarDrawer) {
            this.setupResizeEvents();
            this.loadStoredWidth();
        }
    }

    setupResizeEvents() {
        // Mouse events
        this.resizeHandle.addEventListener('mousedown', (e) => this.startResize(e));
        document.addEventListener('mousemove', (e) => this.resize(e));
        document.addEventListener('mouseup', () => this.stopResize());

        // Touch events for mobile
        this.resizeHandle.addEventListener('touchstart', (e) => this.startResize(e));
        document.addEventListener('touchmove', (e) => this.resize(e));
        document.addEventListener('touchend', () => this.stopResize());

        // Prevent text selection during resize
        this.resizeHandle.addEventListener('selectstart', (e) => e.preventDefault());
    }

    startResize(e) {
        // Only allow resizing on desktop
        if (window.innerWidth <= 1008) { // 63em = 1008px
            return;
        }

        this.isResizing = true;
        this.startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        this.startWidth = this.sidebarDrawer.offsetWidth;

        this.resizeHandle.classList.add('resizing');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        // Prevent default behavior
        e.preventDefault();
    }

    resize(e) {
        if (!this.isResizing) return;

        const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const deltaX = currentX - this.startX;
        const newWidth = Math.max(this.minWidth, Math.min(this.maxWidth, this.startWidth + deltaX));

        this.setSidebarWidth(newWidth);
        this.adjustMainContent(newWidth);

        e.preventDefault();
    }

    stopResize() {
        if (!this.isResizing) return;

        this.isResizing = false;
        this.resizeHandle.classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        // Store the new width for persistence
        const currentWidth = this.sidebarDrawer.offsetWidth;
        this.sidebarDrawer.dataset.storedWidth = currentWidth;
        this.sidebarDrawer.dataset.currentWidth = currentWidth;

        // Save to localStorage
        localStorage.setItem('sidebarWidth', currentWidth.toString());
    }

    setSidebarWidth(width) {
        const sidebarDrawer = document.querySelector('.sidebar-drawer');
        if (sidebarDrawer) {
            sidebarDrawer.style.width = `${width}px`;
            sidebarDrawer.querySelector('.sidebar-container').style.width = `${width}px`;
            // Set the CSS variable for sidebar width, defaulting to 15em if not specified
            sidebarDrawer.style.setProperty('--sidebar-width', width ? `${width}px` : '15em');
        }
        this.adjustMainContent(width);
        localStorage.setItem('sidebarWidth', width);
    }

    adjustMainContent(sidebarWidth) {
        if (this.mainContent) {
            const navCheckbox = document.getElementById('__navigation');
            const isSidebarVisible = navCheckbox && navCheckbox.checked;

            if (isSidebarVisible) {
                const sidebarOffset = sidebarWidth + 32; // Reduced buffer for spacing
                this.mainContent.style.marginLeft = `${sidebarOffset}px`;
                this.mainContent.style.maxWidth = `calc(100% - ${sidebarOffset}px)`;
            } else {
                // If sidebar is not visible, remove inline styles to let CSS handle transitions
                this.mainContent.style.removeProperty('margin-left');
                this.mainContent.style.removeProperty('max-width');
            }
        }
    }

    loadStoredWidth() {
        const storedWidth = localStorage.getItem('sidebarWidth');
        if (storedWidth) {
            const width = parseInt(storedWidth);
            if (width >= this.minWidth && width <= this.maxWidth) {
                this.setSidebarWidth(width);
                this.sidebarDrawer.dataset.storedWidth = width;
                this.sidebarDrawer.dataset.currentWidth = width;
            }
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarResizeManager;
} 