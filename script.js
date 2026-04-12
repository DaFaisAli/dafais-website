// Configuration
const imageFolder = 'photos/';
// List all your image filenames (update this list with your 37 photos)
// You can also dynamically read but since it's static, manually list them or use a pattern.
// For easier maintenance, you can name them 1.jpg to 37.jpg and generate array.
let imageNames = [];
// Generate 37 images (if you name them 1.jpg ... 37.jpg)
for (let i = 1; i <= 46; i++) {
    imageNames.push(`${i}.jpg`);
}
// If you have mixed names, replace above with array like:
// let imageNames = ["portrait1.jpg", "urban2.jpg", ...];

// Category mapping (you can edit this per image)
// By default all are 'color'; you can add exceptions for B&W images.
// Example: for images 5,12,20 are black & white
const bwIndices = [6, 7, 8, 12, 13, 23, 24, 25, 26, 27, 31, 35, 36]; // change these to actual indices (1-based)
// or use filenames: if filename contains "bw" then treat as bw.

let imagesData = [];

function buildImageData() {
    imagesData = [];
    imageNames.forEach((name, idx) => {
        let category = 'color';
        // check if this index is in bwIndices
        if (bwIndices.includes(idx+1)) category = 'bw';
        // Alternatively check filename:
        // if (name.toLowerCase().includes('bw')) category = 'bw';
        imagesData.push({
            id: idx,
            filename: name,
            category: category
        });
    });
}

// Load saved order from localStorage
function loadOrder() {
    const saved = localStorage.getItem('galleryOrder');
    if (saved) {
        const orderIds = JSON.parse(saved);
        // reorder imagesData according to orderIds
        const ordered = [];
        orderIds.forEach(id => {
            const found = imagesData.find(img => img.id === id);
            if (found) ordered.push(found);
        });
        // append any missing
        imagesData.forEach(img => {
            if (!ordered.find(o => o.id === img.id)) ordered.push(img);
        });
        imagesData = ordered;
    }
}

function saveOrder() {
    const orderIds = imagesData.map(img => img.id);
    localStorage.setItem('galleryOrder', JSON.stringify(orderIds));
}

// Render gallery with current filter
let currentFilter = 'all';

function renderGallery() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;
    const filtered = imagesData.filter(img => currentFilter === 'all' || img.category === currentFilter);
    gallery.innerHTML = '';
    filtered.forEach(img => {
        const item = document.createElement('div');
        item.className = 'masonry-item';
        item.setAttribute('data-id', img.id);
        const a = document.createElement('a');
        a.href = `${imageFolder}${img.filename}`;
        a.setAttribute('data-lightbox', 'gallery');
        const imgEl = document.createElement('img');
        imgEl.src = `${imageFolder}${img.filename}`;
        imgEl.alt = `Faisal Ali`;
        a.appendChild(imgEl);
        item.appendChild(a);
        gallery.appendChild(item);
    });
    // Re-init drag & drop after render
    initDragDrop();
}

// Drag & drop using SortableJS
let sortableInstance = null;
function initDragDrop() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;
    if (sortableInstance) sortableInstance.destroy();
    sortableInstance = new Sortable(gallery, {
        animation: 300,
        handle: '.masonry-item',
        onEnd: function() {
            // After drag, update imagesData order based on DOM order
            const newOrder = [];
            document.querySelectorAll('#gallery .masonry-item').forEach(item => {
                const id = parseInt(item.getAttribute('data-id'));
                const imgData = imagesData.find(img => img.id === id);
                if (imgData) newOrder.push(imgData);
            });
            // Rebuild imagesData preserving full objects
            imagesData = newOrder;
            saveOrder();
            // Re-apply filter? No, keep same filter but order changed
            // Re-render to maintain order? Actually DOM order is already correct.
            // But if filter active, drag only affects filtered set? We'll handle by re-rendering after drag to sync.
            // For simplicity, re-render with same filter.
            renderGallery();
        }
    });
}

// Filter buttons
function setupFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderGallery();
        });
    });
}

// Also init mini gallery for Z-card (if on that page)
function initMiniGallery() {
    const mini = document.getElementById('mini-gallery');
    if (!mini) return;
    
    // 👇 CUSTOMIZE THIS ARRAY with your favorite photo numbers
    const favoriteNumbers = [3, 11, 26, 21, 37, 39, 44, 46];
    
    // Find the actual image data for those numbers
    const previewImages = favoriteNumbers.map(num => {
        return imagesData.find(img => img.id === num - 1); // because array starts at 0
    }).filter(img => img); // remove any that don't exist
    
    mini.innerHTML = '';
    previewImages.forEach(img => {
        const item = document.createElement('div');
        item.className = 'masonry-item';
        const imgEl = document.createElement('img');
        imgEl.src = `${imageFolder}${img.filename}`;
        imgEl.style.width = '100%';
        item.appendChild(imgEl);
        mini.appendChild(item);
    });
}

// Contact form (prevent default)
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Demo: Your message would be sent. Add backend later.');
        });
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    buildImageData();
    loadOrder();
    renderGallery();
    setupFilters();
    initMiniGallery();
    initContactForm();
});