/**
 * HopeCare General Hospital Portal Engineering Script
 * Fully Vanilla JS, Multi-View SPA Core Handling Architecture
 */

// --- CLINICAL DIRECTORY RECORD POOL (MOCK DATASET) ---
const DOCTORS_DATASET = [
    { id: 1, name: "Dr. Evelyn Rutherford", specialty: "cardiology", rank: "Chief of Cardiology", schedule: "Mon - Thu", room: "Clinic Block A, Rm 302" },
    { id: 2, name: "Dr. Marcus Vance", specialty: "neurology", rank: "Senior Neurosurgeon", schedule: "Tue - Fri", room: "Neuro-Suite 104" },
    { id: 3, name: "Dr. Aisha Rahman", specialty: "pediatrics", rank: "Consultant Pediatrician", schedule: "Mon - Fri", room: "West Wing Children's Hub" },
    { id: 4, name: "Dr. Silas Thorne", specialty: "orthopedics", rank: "Orthopedic Trauma Surgeon", schedule: "Wed - Sat", room: "Clinic Block B, Rm 112" },
    { id: 5, name: "Dr. Clara Mendoza", specialty: "oncology", rank: "Clinical Oncologist Research Lead", schedule: "Mon - Wed", room: "Onco-Care Center Rm 5" },
    { id: 6, name: "Dr. Julian Vance", specialty: "cardiology", rank: "Interventional Cardiologist", schedule: "Wed - Sat", room: "Clinic Block A, Rm 305" },
    { id: 7, name: "Dr. Sarah Jenkins", specialty: "pediatrics", rank: "Neonatal Care Expert", schedule: "Tue - Fri", room: "West Wing Neonatal ICU" },
    { id: 8, name: "Dr. Kenneth Choi", specialty: "neurology", rank: "Spinal Neurological Specialist", schedule: "Mon - Thu", room: "Neuro-Suite 108" }
];

// --- CORE SYSTEM APP STATE REGISTRY ---
const AppState = {
    currentView: 'home',
    filters: {
        searchQuery: '',
        department: 'all'
    }
};

// --- RUNTIME INITIALIZATION ENTRY POINT ---
document.addEventListener('DOMContentLoaded', () => {
    initNavigationEngine();
    initDirectoryEngine();
    initFormValidationEngine();
});

// --- ENGINE 1: SPA ROUTER & VIEW CONTROLLER ---
function initNavigationEngine() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const allNavLinks = document.querySelectorAll('[data-link]');

    // Toggle mobile drawer navigation frame layers
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('open');
    });

    // Intercept navigation link click streams
    allNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = link.getAttribute('data-link');
            
            switchView(targetView);

            // Force collapse responsive layout flyout lists on selection
            if (mainNav.classList.contains('open')) {
                mainNav.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Handle hash router state changes natively
    window.addEventListener('hashchange', () => {
        const routeHash = window.location.hash.replace('#', '');
        if (routeHash && document.getElementById(routeHash)) {
            switchView(routeHash);
        }
    });

    // Initial routing pass parse checkout
    if(window.location.hash) {
        switchView(window.location.hash.replace('#', ''));
    }
}

function switchView(viewId) {
    const targetSection = document.getElementById(viewId);
    if (!targetSection) return;

    // Remove active display configurations across view frames
    document.querySelectorAll('.page-view').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Activate the requested view
    targetSection.classList.add('active');
    AppState.currentView = viewId;

    // Track state on primary global link menus
    document.querySelectorAll(`.nav-menu [data-link="${viewId}"]`).forEach(link => {
        link.classList.add('active');
    });

    // Push state metrics safely to browser record frames
    if(window.location.hash !== `#${viewId}`) {
        history.pushState(null, null, `#${viewId}`);
    }

    // Scroll to the top of the newly loaded view
    window.scrollTo(0, 0);
}

// --- ENGINE 2: INTERACTIVE DIRECTORY INJECTION & FILTER SYSTEM ---
function initDirectoryEngine() {
    const doctorsGrid = document.getElementById('doctors-grid');
    const searchInput = document.getElementById('doctor-search');
    const deptFilter = document.getElementById('dept-filter');

    if (!doctorsGrid) return;

    // Generate directory view on startup
    renderDoctors(DOCTORS_DATASET);

    // Bind real-time search queries
    searchInput.addEventListener('input', (e) => {
        AppState.filters.searchQuery = e.target.value.toLowerCase().trim();
        executeDirectoryFiltering();
    });

    // Bind dropdown selectors
    deptFilter.addEventListener('change', (e) => {
        AppState.filters.department = e.target.value;
        executeDirectoryFiltering();
    });
}

function renderDoctors(dataset) {
    const doctorsGrid = document.getElementById('doctors-grid');
    doctorsGrid.innerHTML = '';

    if (dataset.length === 0) {
        doctorsGrid.innerHTML = `
            <div class="text-center py-5" style="grid-column: 1 / -1;">
                <h3>No specialists matched your criteria.</h3>
                <p class="text-muted">Try adjusting your keyword terms or choosing another medical specialty branch.</p>
            </div>`;
        return;
    }

    dataset.forEach(doctor => {
        const cardHtml = `
            <article class="card doctor-card">
                <div class="doc-avatar" aria-hidden="true">👩‍⚕️</div>
                <h3>${doctor.name}</h3>
                <span class="doc-dept">${doctor.specialty}</span>
                <p class="text-sm" style="font-weight:600; color:#4a5568;">${doctor.rank}</p>
                <hr style="border:0; border-top:1px solid var(--border-color); margin:0.75rem 0;">
                <p class="text-sm">🗓️ Availability: <strong>${doctor.schedule}</strong></p>
                <p class="text-sm text-muted">📍 Location: ${doctor.room}</p>
                <a href="#patient-services" class="btn btn-sm btn-primary mt-4" style="display:block;" data-link="patient-services" onclick="routeToBooking('${doctor.specialty}')">Book Consultation</a>
            </article>
        `;
        doctorsGrid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

function executeDirectoryFiltering() {
    const filteredDataset = DOCTORS_DATASET.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(AppState.filters.searchQuery) || 
                              doctor.rank.toLowerCase().includes(AppState.filters.searchQuery);
        
        const matchesDept = AppState.filters.department === 'all' || 
                            doctor.specialty === AppState.filters.department;

        return matchesSearch && matchesDept;
    });

    renderDoctors(filteredDataset);
}

// Global utility helper bridge allows cards inside the directory to configure form states
window.routeToBooking = function(deptValue) {
    switchView('patient-services');
    const selectFormElement = document.getElementById('appt-dept');
    if (selectFormElement) {
        // Capitalize standard string to align option value map
        const formatted = deptValue.charAt(0).toUpperCase() + deptValue.slice(1);
        selectFormElement.value = formatted;
    }
};

// --- ENGINE 3: CLIENT-SIDE ACCESSIBILITY FORM VALIDATOR ---
function initFormValidationEngine() {
    const appointmentForm = document.getElementById('appointment-form');
    const contactForm = document.getElementById('contact-form');

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateFormContainer(appointmentForm)) {
                // Successful client-side run simulated output actions
                document.getElementById('appt-success').classList.remove('hide');
                appointmentForm.reset();
                setTimeout(() => { document.getElementById('appt-success').classList.add('hide'); }, 7000);
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateFormContainer(contactForm)) {
                document.getElementById('contact-success').classList.remove('hide');
                contactForm.reset();
                setTimeout(() => { document.getElementById('contact-success').classList.add('hide'); }, 7000);
            }
        });
    }
}

function validateFormContainer(formElement) {
    let isFormValid = true;
    const itemsToVerify = formElement.querySelectorAll('input[required], select[required], textarea[required]');

    itemsToVerify.forEach(inputItem => {
        let isFieldValid = true;
        const formGroup = inputItem.closest('.form-group');

        // Check for empty string assignments
        if (!inputItem.value.trim()) {
            isFieldValid = false;
        } 
        // Validate regex structures for standard email frameworks
        else if (inputItem.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(inputItem.value)) isFieldValid = false;
        } 
        // Validate phone layouts
        else if (inputItem.type === 'tel') {
            const phoneRegex = /^\d{10,}$/; // Accept pure digit structures over 10 digits
            if (!phoneRegex.test(inputItem.value.replace(/[-() ]/g, ''))) isFieldValid = false;
        }
        // Prevent booking appointments for past dates
        else if (inputItem.type === 'date') {
            const targetedDate = new Date(inputItem.value);
            const today = new Date();
            today.setHours(0,0,0,0);
            if (targetedDate < today) isFieldValid = false;
        }

        // Toggle UI feedback classes based on validity
        if (!isFieldValid) {
            formGroup.classList.add('invalid');
            inputItem.setAttribute('aria-invalid', 'true');
            isFormValid = false;
        } else {
            formGroup.classList.remove('invalid');
            inputItem.setAttribute('aria-invalid', 'false');
        }
    });

    return isFormValid;
}