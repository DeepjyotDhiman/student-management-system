/* =========================================================
   Student Management System — script.js
   Vanilla JavaScript + LocalStorage. No backend, no libraries.
   ========================================================= */
'use strict';

/* =========================================================
   1. CONSTANTS & CONFIGURATION
   ========================================================= */
const STORAGE_KEY = 'students';                 // LocalStorage key for student records
const CURRENT_SEM_KEY = 'sms-current-semester';  // LocalStorage key for the "current semester" stat
const DEFAULT_CURRENT_SEM = '5';
const RECENT_DAYS = 7;                           // "Recently Added" = added within this many days
const RECENT_LIST_LIMIT = 5;                     // Number of students in "Recent Students"
const DAY_MS = 24 * 60 * 60 * 1000;
const IT_COURSE = 'Information Technology';

/** Courses / branches available in the form and filter. */
const COURSES = [
    'Information Technology',
    'Computer Engineering',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering'
];

/** Section ids (used in the URL hash) and their display titles. */
const SECTIONS = {
    dashboard: 'Dashboard',
    students: 'Students',
    add: 'Add Student',
    about: 'About'
};

/* =========================================================
   2. SAMPLE DATA  (first launch only)
   ---------------------------------------------------------
   To remove sample data later:
     - set USE_SAMPLE_DATA to false, OR
     - delete this block and the getSampleStudents() call in loadStudents().
   Existing users must also clear LocalStorage ("students" key).
   ========================================================= */
const USE_SAMPLE_DATA = true;

function getSampleStudents() {
    const now = Date.now();
    return [
        { id: 'STU001', name: 'Dhruv Patel',  email: 'dhruv.patel@example.com',  phone: '9876543210', course: 'Information Technology',      semester: '5', createdAt: now - 20 * DAY_MS },
        { id: 'STU002', name: 'Kavya Shah',   email: 'kavya.shah@example.com',   phone: '9825012345', course: 'Computer Engineering',        semester: '3', createdAt: now - 12 * DAY_MS },
        { id: 'STU003', name: 'Meet Patel',   email: 'meet.patel@example.com',   phone: '9898123456', course: 'Information Technology',      semester: '5', createdAt: now - 5 * DAY_MS },
        { id: 'STU004', name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '9712345678', course: 'Electronics & Communication', semester: '4', createdAt: now - 2 * DAY_MS },
        { id: 'STU005', name: 'Riya Desai',   email: 'riya.desai@example.com',   phone: '8866554433', course: 'Information Technology',      semester: '6', createdAt: now - 3 * 60 * 60 * 1000 }
    ];
}
/* ================= END OF SAMPLE DATA ================= */

/* =========================================================
   3. APPLICATION STATE
   ========================================================= */
let students = [];              // Array of student objects
let editingId = null;           // ID of the student being edited (null = add mode)
let pendingDeleteId = null;     // ID of the student awaiting delete confirmation
let activeModal = null;         // Currently open modal element
let lastFocusedElement = null;  // Element to re-focus after closing a modal / menu

/* =========================================================
   4. ICONS (inline SVG — no external icon library needed)
   ========================================================= */
const ICON_PATHS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    id: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 9h3"/><path d="M15 13h3"/><path d="M6 16c.5-1.5 1.7-2 3-2s2.5.5 3 2"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    trending: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    'arrow-right': '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    graduation: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/><path d="M22 10v5"/>',
    refresh: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'
};

/** Returns an inline SVG string for the given icon name. */
function icon(name) {
    const paths = ICON_PATHS[name] || '';
    return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
}

/** Fills every element with a data-icon attribute with its SVG. */
function hydrateIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach((el) => {
        if (!el.firstElementChild) el.innerHTML = icon(el.dataset.icon);
    });
}

/* =========================================================
   5. DOM REFERENCES
   ========================================================= */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const dom = {
    sidebar: $('#sidebar'),
    sidebarOverlay: $('#sidebarOverlay'),
    sidebarClose: $('#sidebarClose'),
    menuToggle: $('#menuToggle'),
    navLinks: $$('.nav-link'),
    navStudentCount: $('#navStudentCount'),
    topbarTitle: $('#topbarTitle'),
    todayDate: $('#todayDate'),
    footerYear: $('#footerYear'),
    sections: $$('.section'),

    // Dashboard
    statTotal: $('#statTotal'),
    statCurrentSem: $('#statCurrentSem'),
    statCurrentSemMeta: $('#statCurrentSemMeta'),
    statIT: $('#statIT'),
    statITMeta: $('#statITMeta'),
    statRecent: $('#statRecent'),
    currentSemSelect: $('#currentSemSelect'),
    recentList: $('#recentList'),

    // Students list
    searchInput: $('#searchInput'),
    searchClear: $('#searchClear'),
    filterCourse: $('#filterCourse'),
    filterSemester: $('#filterSemester'),
    sortSelect: $('#sortSelect'),
    resetFiltersBtn: $('#resetFiltersBtn'),
    resultsCount: $('#resultsCount'),
    tableCard: $('#tableCard'),
    tableBody: $('#studentTableBody'),
    cardsContainer: $('#studentCards'),
    studentsEmpty: $('#studentsEmpty'),

    // Form
    form: $('#studentForm'),
    formTitle: $('#formTitle'),
    formSubtitle: $('#formSubtitle'),
    saveBtnText: $('#saveBtnText'),
    resetBtn: $('#resetBtn'),
    resetBtnText: $('#resetBtnText'),
    fields: {
        id: $('#studentId'),
        name: $('#studentName'),
        email: $('#studentEmail'),
        phone: $('#studentPhone'),
        course: $('#studentCourse'),
        semester: $('#studentSemester')
    },

    // Modals
    viewModal: $('#viewModal'),
    viewAvatar: $('#viewAvatar'),
    viewModalTitle: $('#viewModalTitle'),
    viewSub: $('#viewSub'),
    viewId: $('#viewId'),
    viewName: $('#viewName'),
    viewEmail: $('#viewEmail'),
    viewPhone: $('#viewPhone'),
    viewCourse: $('#viewCourse'),
    viewSemester: $('#viewSemester'),
    viewEditBtn: $('#viewEditBtn'),
    deleteModal: $('#deleteModal'),
    deleteStudentName: $('#deleteStudentName'),
    deleteConfirmBtn: $('#deleteConfirmBtn'),

    toastContainer: $('#toastContainer')
};

/* =========================================================
   6. UTILITY HELPERS
   ========================================================= */

/** Escapes text so it can be safely inserted as HTML. */
function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Wraps search matches in <mark>, escaping everything else. */
function highlight(text, query) {
    const source = String(text ?? '');
    const q = query.trim();
    if (!q) return escapeHTML(source);

    const regex = new RegExp(escapeRegExp(q), 'gi');
    let result = '';
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(source)) !== null) {
        result += escapeHTML(source.slice(lastIndex, match.index));
        result += `<mark>${escapeHTML(match[0])}</mark>`;
        lastIndex = match.index + match[0].length;
    }
    return result + escapeHTML(source.slice(lastIndex));
}

/** "Dhruv Patel" → "DP" */
function getInitials(name) {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    const first = parts[0][0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
}

/** Picks a consistent avatar color class (c0–c7) from a string. */
function avatarClass(seed) {
    let hash = 0;
    for (const char of String(seed)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return `c${hash % 8}`;
}

/** "9876543210" → "98765 43210" */
function formatPhone(phone) {
    const digits = String(phone).replace(/\D/g, '');
    return digits.length === 10 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : String(phone);
}

/** Human-friendly relative time, e.g. "2 days ago". */
function timeAgo(timestamp) {
    if (!timestamp) return '';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function findStudent(id) {
    return students.find((student) => student.id === id) || null;
}

/** Suggests the next ID in the STU### series. */
function getNextStudentId() {
    let max = 0;
    students.forEach((student) => {
        const match = /^STU(\d+)$/i.exec(student.id);
        if (match) max = Math.max(max, parseInt(match[1], 10));
    });
    return `STU${String(max + 1).padStart(3, '0')}`;
}

/** Animates a number from its current value to the target value. */
function animateCount(element, target) {
    const start = parseInt(element.textContent, 10) || 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (start === target || reduceMotion) {
        element.textContent = target;
        return;
    }
    const duration = 450;
    const startTime = performance.now();
    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(start + (target - start) * eased);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

/* =========================================================
   7. LOCAL STORAGE
   ========================================================= */

/** Makes sure every stored record has the expected shape. */
function normalizeStudent(raw) {
    return {
        id: String(raw.id || '').trim(),
        name: String(raw.name || '').trim(),
        email: String(raw.email || '').trim(),
        phone: String(raw.phone || '').trim(),
        course: String(raw.course || '').trim(),
        semester: String(raw.semester || '').trim(),
        createdAt: Number(raw.createdAt) || 0,
        updatedAt: Number(raw.updatedAt) || undefined
    };
}

/**
 * Loads students from LocalStorage.
 * If nothing is stored yet (first launch), sample data is created.
 */
function loadStudents() {
    let stored = null;
    try {
        stored = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        stored = null;
    }

    // First launch → seed with sample students
    if (stored === null) {
        students = USE_SAMPLE_DATA ? getSampleStudents() : [];
        saveStudents();
        return;
    }

    try {
        const parsed = JSON.parse(stored);
        students = Array.isArray(parsed)
            ? parsed.filter((item) => item && item.id).map(normalizeStudent)
            : [];
    } catch (error) {
        students = [];
    }
}

/** Saves the current students array to LocalStorage. Returns true on success. */
function saveStudents() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
        return true;
    } catch (error) {
        showToast('Could not save data. Browser storage may be full or disabled.', 'error');
        return false;
    }
}

function getCurrentSemester() {
    try {
        return localStorage.getItem(CURRENT_SEM_KEY) || DEFAULT_CURRENT_SEM;
    } catch (error) {
        return DEFAULT_CURRENT_SEM;
    }
}

function setCurrentSemester(value) {
    try {
        localStorage.setItem(CURRENT_SEM_KEY, value);
    } catch (error) {
        /* ignore — the value still applies for this session */
    }
}

/* =========================================================
   8. NAVIGATION (hash based → works on GitHub Pages)
   ========================================================= */
function getSectionFromHash() {
    const name = window.location.hash.replace('#', '');
    return Object.prototype.hasOwnProperty.call(SECTIONS, name) ? name : null;
}

function handleRoute(isInitial = false) {
    const section = getSectionFromHash();
    // Ignore non-section hashes (e.g. the skip link) after first load
    if (!section && !isInitial) return;
    showSection(section || 'dashboard');
}

function navigateTo(section) {
    if (window.location.hash === `#${section}`) {
        showSection(section);
    } else {
        window.location.hash = section;
    }
}

/** Shows one section and hides the others. */
function showSection(name) {
    // Leaving the form while editing cancels edit mode
    if (name !== 'add' && editingId) resetForm();

    dom.sections.forEach((section) => {
        section.hidden = section.dataset.section !== name;
    });

    dom.navLinks.forEach((link) => {
        if (link.dataset.section === name) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });

    updateTopbarTitle(name);
    closeNav(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
}

function updateTopbarTitle(name = getSectionFromHash() || 'dashboard') {
    const title = name === 'add' && editingId ? 'Edit Student' : SECTIONS[name];
    dom.topbarTitle.textContent = title;
    document.title = name === 'dashboard'
        ? 'Student Management System | College PBL Micro Project'
        : `${title} | Student Management System`;
}

/* ---------- Mobile navigation (hamburger) ---------- */
function openNav() {
    lastFocusedElement = document.activeElement;
    dom.sidebar.classList.add('open');
    dom.sidebarOverlay.classList.add('show');
    dom.menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
    // Focus the first link once the drawer becomes visible
    setTimeout(() => {
        const current = dom.sidebar.querySelector('.nav-link[aria-current="page"]') || dom.navLinks[0];
        if (current) current.focus();
    }, 50);
}

function closeNav(restoreFocus = true) {
    if (!dom.sidebar.classList.contains('open')) return;
    dom.sidebar.classList.remove('open');
    dom.sidebarOverlay.classList.remove('show');
    dom.menuToggle.setAttribute('aria-expanded', 'false');
    if (!activeModal) document.body.classList.remove('no-scroll');
    if (restoreFocus && lastFocusedElement) lastFocusedElement.focus();
}

function toggleNav() {
    if (dom.sidebar.classList.contains('open')) closeNav();
    else openNav();
}

/* =========================================================
   9. DASHBOARD
   ========================================================= */

/** Calculates all dashboard statistics from the student data. */
function getStatistics() {
    const currentSemester = getCurrentSemester();
    const now = Date.now();
    return {
        total: students.length,
        currentSemester,
        currentSemesterCount: students.filter((s) => s.semester === currentSemester).length,
        itCount: students.filter((s) => s.course === IT_COURSE).length,
        recentCount: students.filter((s) => s.createdAt && now - s.createdAt <= RECENT_DAYS * DAY_MS).length
    };
}

function renderDashboard() {
    const stats = getStatistics();

    animateCount(dom.statTotal, stats.total);
    animateCount(dom.statCurrentSem, stats.currentSemesterCount);
    animateCount(dom.statIT, stats.itCount);
    animateCount(dom.statRecent, stats.recentCount);

    dom.currentSemSelect.value = stats.currentSemester;
    dom.statCurrentSemMeta.textContent = `Students in Semester ${stats.currentSemester}`;
    const itPercent = stats.total ? Math.round((stats.itCount / stats.total) * 100) : 0;
    dom.statITMeta.textContent = `${itPercent}% of all students`;
    dom.navStudentCount.textContent = stats.total;

    renderRecentStudents();
}

/** Shows the latest 5 added students. */
function renderRecentStudents() {
    const recent = [...students]
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, RECENT_LIST_LIMIT);

    if (recent.length === 0) {
        dom.recentList.innerHTML = `<li>${emptyStateHTML({
            title: 'No students available',
            text: 'Add your first student to get started.',
            withButton: true,
            extraClass: 'recent-empty'
        })}</li>`;
        hydrateIcons(dom.recentList);
        return;
    }

    dom.recentList.innerHTML = recent.map((student) => `
        <li class="recent-item">
            <span class="avatar ${avatarClass(student.id)}" aria-hidden="true">${escapeHTML(getInitials(student.name))}</span>
            <div class="recent-info">
                <button type="button" class="recent-name" data-action="view" data-id="${escapeHTML(student.id)}" aria-label="View details of ${escapeHTML(student.name)}">${escapeHTML(student.name)}</button>
                <p class="recent-meta">${escapeHTML(student.id)} · ${escapeHTML(student.course)}</p>
            </div>
            <div class="recent-side">
                <span class="sem-badge">Sem ${escapeHTML(student.semester)}</span>
                <span class="recent-time">${escapeHTML(timeAgo(student.createdAt))}</span>
            </div>
        </li>`).join('');
}

/* =========================================================
   10. STUDENT LIST — search, filter, sort, render
   ========================================================= */

/** Search by Student ID, name, email or course (case-insensitive). */
function searchStudents(list, query) {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((s) =>
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q)
    );
}

/** Filter by course and/or semester ('' = all). */
function filterStudents(list, course, semester) {
    return list.filter((s) =>
        (!course || s.course === course) &&
        (!semester || s.semester === semester)
    );
}

function sortStudents(list, sortBy) {
    const sorted = [...list];
    const byName = (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
    switch (sortBy) {
        case 'oldest': return sorted.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        case 'name-asc': return sorted.sort(byName);
        case 'name-desc': return sorted.sort((a, b) => byName(b, a));
        case 'id-asc': return sorted.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
        case 'semester-asc': return sorted.sort((a, b) => Number(a.semester) - Number(b.semester) || byName(a, b));
        case 'recent':
        default: return sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
}

/** Applies the current search, filters and sort. */
function getVisibleStudents() {
    let list = searchStudents(students, dom.searchInput.value);
    list = filterStudents(list, dom.filterCourse.value, dom.filterSemester.value);
    return sortStudents(list, dom.sortSelect.value);
}

function hasActiveFilters() {
    return Boolean(dom.searchInput.value.trim() || dom.filterCourse.value || dom.filterSemester.value);
}

/** Reusable empty-state markup. */
function emptyStateHTML({ title, text, withButton = false, withClear = false, iconName = 'users', extraClass = '' }) {
    return `
        <div class="empty-state ${extraClass}">
            <span class="empty-icon" data-icon="${iconName}" aria-hidden="true"></span>
            <p class="empty-title">${escapeHTML(title)}</p>
            <p class="empty-text">${escapeHTML(text)}</p>
            ${withButton ? `<a href="#add" class="btn btn-primary">${icon('plus')}<span>Add Student</span></a>` : ''}
            ${withClear ? `<button type="button" class="btn btn-ghost" data-action="clear-filters">${icon('refresh')}<span>Clear filters</span></button>` : ''}
        </div>`;
}

function actionButtonsHTML(student, variant) {
    const id = escapeHTML(student.id);
    const name = escapeHTML(student.name);
    if (variant === 'table') {
        return `
            <div class="row-actions">
                <button type="button" class="action-btn view" data-action="view" data-id="${id}" aria-label="View ${name}" title="View">${icon('eye')}</button>
                <button type="button" class="action-btn edit" data-action="edit" data-id="${id}" aria-label="Edit ${name}" title="Edit">${icon('edit')}</button>
                <button type="button" class="action-btn delete" data-action="delete" data-id="${id}" aria-label="Delete ${name}" title="Delete">${icon('trash')}</button>
            </div>`;
    }
    return `
        <div class="sc-actions">
            <button type="button" class="sc-btn view" data-action="view" data-id="${id}" aria-label="View ${name}"><span data-icon="eye" aria-hidden="true">${icon('eye')}</span>View</button>
            <button type="button" class="sc-btn edit" data-action="edit" data-id="${id}" aria-label="Edit ${name}"><span data-icon="edit" aria-hidden="true">${icon('edit')}</span>Edit</button>
            <button type="button" class="sc-btn delete" data-action="delete" data-id="${id}" aria-label="Delete ${name}"><span data-icon="trash" aria-hidden="true">${icon('trash')}</span>Delete</button>
        </div>`;
}

function tableRowHTML(student, query) {
    return `
        <tr>
            <td><span class="id-badge">${highlight(student.id, query)}</span></td>
            <td>
                <div class="cell-student">
                    <span class="avatar ${avatarClass(student.id)}" aria-hidden="true">${escapeHTML(getInitials(student.name))}</span>
                    <span class="cell-name">${highlight(student.name, query)}</span>
                </div>
            </td>
            <td class="cell-email">${highlight(student.email, query)}</td>
            <td class="cell-nowrap">${escapeHTML(formatPhone(student.phone))}</td>
            <td><span class="course-pill">${highlight(student.course, query)}</span></td>
            <td><span class="sem-badge">Sem ${escapeHTML(student.semester)}</span></td>
            <td>${actionButtonsHTML(student, 'table')}</td>
        </tr>`;
}

function studentCardHTML(student, query, index) {
    const row = (iconName, label, value) => `
        <div class="sc-row">
            <span data-icon="${iconName}" aria-hidden="true">${icon(iconName)}</span>
            <div class="sc-row-text"><dt>${label}</dt><dd>${value}</dd></div>
        </div>`;
    return `
        <article class="student-card" style="animation-delay:${Math.min(index, 8) * 30}ms">
            <header class="sc-head">
                <span class="avatar ${avatarClass(student.id)}" aria-hidden="true">${escapeHTML(getInitials(student.name))}</span>
                <div class="sc-title">
                    <h3>${highlight(student.name, query)}</h3>
                    <span class="id-badge">${highlight(student.id, query)}</span>
                </div>
            </header>
            <dl class="sc-details">
                ${row('book', 'Course', highlight(student.course, query))}
                ${row('layers', 'Semester', `Semester ${escapeHTML(student.semester)}`)}
                ${row('mail', 'Email', highlight(student.email, query))}
                ${row('phone', 'Phone', escapeHTML(formatPhone(student.phone)))}
            </dl>
            ${actionButtonsHTML(student, 'card')}
        </article>`;
}

/** Renders the students table (desktop) and cards (mobile). */
function renderStudents() {
    const list = getVisibleStudents();
    const query = dom.searchInput.value;

    dom.searchClear.hidden = !query;

    // Case 1: no students at all
    if (students.length === 0) {
        dom.tableCard.hidden = true;
        dom.cardsContainer.hidden = true;
        dom.resultsCount.textContent = '';
        dom.studentsEmpty.innerHTML = emptyStateHTML({
            title: 'No students available',
            text: 'Add your first student to get started.',
            withButton: true
        });
        dom.studentsEmpty.hidden = false;
        hydrateIcons(dom.studentsEmpty);
        return;
    }

    // Case 2: search / filters returned nothing
    if (list.length === 0) {
        dom.tableCard.hidden = true;
        dom.cardsContainer.hidden = true;
        dom.resultsCount.innerHTML = `Showing <strong>0</strong> of ${students.length} students`;
        dom.studentsEmpty.innerHTML = emptyStateHTML({
            title: 'No students found.',
            text: 'Try a different search term or clear the filters.',
            withClear: true,
            iconName: 'search'
        });
        dom.studentsEmpty.hidden = false;
        hydrateIcons(dom.studentsEmpty);
        return;
    }

    // Case 3: show results
    dom.studentsEmpty.hidden = true;
    dom.studentsEmpty.innerHTML = '';
    dom.tableCard.hidden = false;
    dom.cardsContainer.hidden = false;

    dom.resultsCount.innerHTML = hasActiveFilters()
        ? `Showing <strong>${list.length}</strong> of ${students.length} students`
        : `<strong>${students.length}</strong> student${students.length === 1 ? '' : 's'} in total`;

    dom.tableBody.innerHTML = list.map((s) => tableRowHTML(s, query)).join('');
    dom.cardsContainer.innerHTML = list.map((s, i) => studentCardHTML(s, query, i)).join('');
}

/** Fills the course dropdowns (form + filter) from COURSES and existing data. */
function populateCourseOptions() {
    const formValue = dom.fields.course.value;
    const filterValue = dom.filterCourse.value;
    const extraCourses = students.map((s) => s.course).filter((c) => c && !COURSES.includes(c));
    const allCourses = [...COURSES, ...new Set(extraCourses)];

    const options = allCourses.map((c) => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join('');
    dom.fields.course.innerHTML = `<option value="">Select course / branch</option>${options}`;
    dom.filterCourse.innerHTML = `<option value="">All courses</option>${options}`;

    dom.fields.course.value = formValue;
    dom.filterCourse.value = allCourses.includes(filterValue) ? filterValue : '';
}

function resetFilters() {
    dom.searchInput.value = '';
    dom.filterCourse.value = '';
    dom.filterSemester.value = '';
    dom.sortSelect.value = 'recent';
    renderStudents();
}

/** Re-renders everything that depends on student data. */
function refreshUI() {
    populateCourseOptions();
    renderDashboard();
    renderStudents();
}

/* =========================================================
   11. FORM — validation
   ========================================================= */
const VALIDATION_PATTERNS = {
    id: /^[A-Z0-9-]{3,15}$/,
    name: /^[A-Za-z][A-Za-z .'-]*$/,
    email: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
    phone: /^[6-9]\d{9}$/            // Indian mobile: 10 digits starting with 6–9
};

/** Reads and cleans form values. */
function getFormData() {
    return {
        id: dom.fields.id.value.trim().toUpperCase(),
        name: dom.fields.name.value.trim().replace(/\s+/g, ' '),
        email: dom.fields.email.value.trim().toLowerCase(),
        phone: dom.fields.phone.value.replace(/\D/g, ''),
        course: dom.fields.course.value,
        semester: dom.fields.semester.value
    };
}

/** Returns an error message for one field, or '' when valid. */
function validateField(field, data) {
    const value = data[field];
    switch (field) {
        case 'id':
            if (!value) return 'Student ID is required.';
            if (!VALIDATION_PATTERNS.id.test(value)) return 'Use 3–15 letters, numbers or hyphens (e.g. STU006).';
            if (!editingId && findStudent(value)) return `Student ID "${value}" already exists. Please use a unique ID.`;
            return '';
        case 'name':
            if (!value) return 'Student name is required.';
            if (value.length < 2) return 'Name must be at least 2 characters.';
            if (!VALIDATION_PATTERNS.name.test(value)) return 'Name can contain only letters, spaces, dots, hyphens and apostrophes.';
            return '';
        case 'email':
            if (!value) return 'Email is required.';
            if (!VALIDATION_PATTERNS.email.test(value)) return 'Enter a valid email address (e.g. name@example.com).';
            return '';
        case 'phone':
            if (!value) return 'Phone number is required.';
            if (value.length !== 10) return 'Phone number must be exactly 10 digits.';
            if (!VALIDATION_PATTERNS.phone.test(value)) return 'Enter a valid Indian mobile number starting with 6, 7, 8 or 9.';
            return '';
        case 'course':
            return value ? '' : 'Please select a course / branch.';
        case 'semester':
            return value ? '' : 'Please select a semester.';
        default:
            return '';
    }
}

/** Shows or clears the inline error for a field. */
function setFieldError(field, message) {
    const input = dom.fields[field];
    const wrapper = input.closest('.field');
    const errorEl = document.getElementById(`${input.id}-error`);

    if (message) {
        input.setAttribute('aria-invalid', 'true');
        wrapper.classList.add('has-error');
        errorEl.innerHTML = `<span data-icon="alert" aria-hidden="true">${icon('alert')}</span><span>${escapeHTML(message)}</span>`;
    } else {
        input.removeAttribute('aria-invalid');
        wrapper.classList.remove('has-error');
        errorEl.textContent = '';
    }
}

function clearFormErrors() {
    Object.keys(dom.fields).forEach((field) => setFieldError(field, ''));
}

/** Validates the entire form. */
function validateForm() {
    const data = getFormData();
    let firstInvalid = null;
    let hasEmptyField = false;

    Object.keys(dom.fields).forEach((field) => {
        const message = validateField(field, data);
        setFieldError(field, message);
        if (message && !firstInvalid) firstInvalid = field;
        if (!data[field]) hasEmptyField = true;
    });

    return { isValid: !firstInvalid, data, firstInvalid, hasEmptyField };
}

/* =========================================================
   12. CRUD OPERATIONS
   ========================================================= */

/** Adds a new student and saves to LocalStorage. */
function addStudent(data) {
    const student = { ...data, createdAt: Date.now() };
    students.push(student);

    if (!saveStudents()) {
        students.pop(); // roll back if saving failed
        return false;
    }
    refreshUI();
    showToast('Student added successfully.', 'success');
    resetForm();
    return true;
}

/** Updates an existing student and saves to LocalStorage. */
function updateStudent(id, data) {
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) {
        showToast('This student no longer exists.', 'error');
        resetForm();
        return false;
    }

    const previous = students[index];
    students[index] = { ...previous, ...data, id: previous.id, createdAt: previous.createdAt, updatedAt: Date.now() };

    if (!saveStudents()) {
        students[index] = previous; // roll back
        return false;
    }
    refreshUI();
    showToast('Student updated successfully.', 'success');
    resetForm();
    navigateTo('students');
    return true;
}

/** Asks for confirmation before deleting a student. */
function deleteStudent(id) {
    const student = findStudent(id);
    if (!student) return;
    pendingDeleteId = id;
    dom.deleteStudentName.textContent = `${student.name} (${student.id})`;
    openModal(dom.deleteModal);
}

/** Deletes the student after the user confirms. */
function confirmDelete() {
    if (!pendingDeleteId) return;
    const previous = students;
    const removedId = pendingDeleteId;
    students = students.filter((s) => s.id !== removedId);
    pendingDeleteId = null;

    if (!saveStudents()) {
        students = previous;
        closeModal(dom.deleteModal);
        return;
    }
    if (editingId === removedId) resetForm();

    closeModal(dom.deleteModal, false);
    refreshUI();
    showToast('Student deleted successfully.', 'success');
}

/** Opens the details modal for a student. */
function viewStudent(id) {
    const student = findStudent(id);
    if (!student) return;

    dom.viewModal.dataset.id = student.id;
    dom.viewAvatar.className = `avatar avatar-lg ${avatarClass(student.id)}`;
    dom.viewAvatar.textContent = getInitials(student.name);
    dom.viewModalTitle.textContent = student.name;
    dom.viewSub.textContent = student.createdAt ? `Added ${timeAgo(student.createdAt)}` : 'Student Details';

    dom.viewId.textContent = student.id;
    dom.viewName.textContent = student.name;
    dom.viewEmail.innerHTML = `<a href="mailto:${escapeHTML(student.email)}">${escapeHTML(student.email)}</a>`;
    dom.viewPhone.innerHTML = `<a href="tel:+91${escapeHTML(student.phone)}">+91 ${escapeHTML(formatPhone(student.phone))}</a>`;
    dom.viewCourse.textContent = student.course;
    dom.viewSemester.textContent = `Semester ${student.semester}`;

    openModal(dom.viewModal);
}

/** Opens the form pre-filled with a student's data. */
function startEdit(id) {
    const student = findStudent(id);
    if (!student) return;

    editingId = student.id;
    clearFormErrors();

    dom.fields.id.value = student.id;
    dom.fields.name.value = student.name;
    dom.fields.email.value = student.email;
    dom.fields.phone.value = student.phone;
    dom.fields.course.value = student.course;
    dom.fields.semester.value = student.semester;

    dom.fields.id.readOnly = true;
    dom.form.classList.add('editing');
    dom.formTitle.textContent = 'Edit Student';
    dom.formSubtitle.textContent = `Update the details of ${student.name}. Student ID cannot be changed.`;
    dom.saveBtnText.textContent = 'Update Student';
    dom.resetBtnText.textContent = 'Cancel';

    navigateTo('add');
    updateTopbarTitle('add');
    setTimeout(() => dom.fields.name.focus(), 60);
}

/** Clears the form and returns it to "Add Student" mode. */
function resetForm() {
    dom.form.reset();
    clearFormErrors();
    editingId = null;

    dom.fields.id.readOnly = false;
    dom.fields.id.placeholder = `e.g. ${getNextStudentId()}`;
    dom.form.classList.remove('editing');
    dom.formTitle.textContent = 'Add Student';
    dom.formSubtitle.textContent = 'Fill in the details below to register a new student.';
    dom.saveBtnText.textContent = 'Save Student';
    dom.resetBtnText.textContent = 'Reset';

    if (getSectionFromHash() === 'add') updateTopbarTitle('add');
}

/* =========================================================
   13. FORM EVENT HANDLERS
   ========================================================= */
function handleFormSubmit(event) {
    event.preventDefault();
    const { isValid, data, firstInvalid, hasEmptyField } = validateForm();

    if (!isValid) {
        showToast(hasEmptyField ? 'Please fill all required fields.' : 'Please correct the highlighted fields.', 'error');
        dom.fields[firstInvalid].focus();
        return;
    }

    if (editingId) updateStudent(editingId, data);
    else addStudent(data);
}

function handleResetClick() {
    if (editingId) {
        resetForm();
        showToast('Edit cancelled.', 'info');
        navigateTo('students');
    } else {
        resetForm();
        dom.fields.id.focus();
    }
}

/** Live validation: re-check a field once it has an error, and on blur. */
function attachLiveValidation() {
    Object.entries(dom.fields).forEach(([field, input]) => {
        const eventName = input.tagName === 'SELECT' ? 'change' : 'input';

        input.addEventListener(eventName, () => {
            if (field === 'phone') {
                // Allow digits only
                const digits = input.value.replace(/\D/g, '').slice(0, 10);
                if (digits !== input.value) input.value = digits;
            }
            if (field === 'id' && !input.readOnly) {
                const pos = input.selectionStart;
                input.value = input.value.toUpperCase();
                input.setSelectionRange(pos, pos);
            }
            if (input.getAttribute('aria-invalid') === 'true' || input.tagName === 'SELECT') {
                setFieldError(field, validateField(field, getFormData()));
            }
        });

        input.addEventListener('blur', () => {
            if (input.value.trim() !== '') setFieldError(field, validateField(field, getFormData()));
        });
    });
}

/* =========================================================
   14. MODALS
   ========================================================= */
function getFocusableElements(container) {
    return Array.from(container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((el) => el.offsetParent !== null);
}

function openModal(modal) {
    if (activeModal && activeModal !== modal) closeModal(activeModal, false);
    if (!activeModal) lastFocusedElement = document.activeElement;

    modal.hidden = false;
    void modal.offsetWidth; // force reflow so the CSS transition runs
    modal.classList.add('open');
    activeModal = modal;
    document.body.classList.add('no-scroll');

    const target = modal.querySelector('[data-autofocus]') || getFocusableElements(modal)[0];
    if (target) target.focus();
}

function closeModal(modal = activeModal, restoreFocus = true) {
    if (!modal) return;
    modal.classList.remove('open');
    if (activeModal === modal) activeModal = null;

    setTimeout(() => {
        if (!modal.classList.contains('open')) modal.hidden = true;
    }, 250);

    if (!activeModal && !dom.sidebar.classList.contains('open')) {
        document.body.classList.remove('no-scroll');
    }
    if (modal === dom.deleteModal) pendingDeleteId = null;

    if (restoreFocus && lastFocusedElement && document.body.contains(lastFocusedElement)) {
        lastFocusedElement.focus();
    }
}

/** Keeps keyboard focus inside the open modal. */
function trapFocus(event) {
    if (!activeModal || event.key !== 'Tab') return;
    const focusable = getFocusableElements(activeModal);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

/* =========================================================
   15. TOAST NOTIFICATIONS
   ========================================================= */
const TOAST_ICONS = { success: 'check', error: 'alert', info: 'info', warning: 'warning' };
const MAX_TOASTS = 4;

/**
 * Shows a toast that disappears automatically.
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {number} duration in ms
 */
function showToast(message, type = 'success', duration = 3200) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icon(TOAST_ICONS[type] || 'info')}</span>
        <p class="toast-msg"></p>
        <button type="button" class="toast-close" aria-label="Dismiss notification">${icon('x')}</button>
        <span class="toast-progress" style="animation-duration:${duration}ms"></span>`;
    toast.querySelector('.toast-msg').textContent = message;

    dom.toastContainer.appendChild(toast);

    // Keep the stack short
    const toasts = dom.toastContainer.querySelectorAll('.toast:not(.leaving)');
    if (toasts.length > MAX_TOASTS) dismissToast(toasts[0]);

    const timer = setTimeout(() => dismissToast(toast), duration);
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timer);
        dismissToast(toast);
    });
}

function dismissToast(toast) {
    if (!toast || toast.classList.contains('leaving')) return;
    toast.classList.add('leaving');
    const remove = () => toast.remove();
    toast.addEventListener('animationend', remove, { once: true });
    setTimeout(remove, 400); // fallback
}

/* =========================================================
   16. EVENT LISTENERS
   ========================================================= */
function bindEvents() {
    // Navigation
    window.addEventListener('hashchange', () => handleRoute(false));
    dom.menuToggle.addEventListener('click', toggleNav);
    dom.sidebarClose.addEventListener('click', () => closeNav());
    dom.sidebarOverlay.addEventListener('click', () => closeNav());
    dom.navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            // Clicking the current section's link should still close the mobile menu
            if (link.getAttribute('href') === window.location.hash) closeNav(false);
        });
    });

    // Close the mobile drawer automatically when resizing to desktop
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
        if (e.matches) closeNav(false);
    });

    // Delegated clicks for dynamically rendered buttons
    document.addEventListener('click', (event) => {
        // "Add Student" links always open a blank form (exit edit mode)
        if (event.target.closest('a[href="#add"]') && editingId) resetForm();

        const actionEl = event.target.closest('[data-action]');
        if (!actionEl) return;
        const { action, id } = actionEl.dataset;

        if (action === 'view') viewStudent(id);
        else if (action === 'edit') startEdit(id);
        else if (action === 'delete') deleteStudent(id);
        else if (action === 'clear-filters') resetFilters();
    });

    // Search & filters (instant)
    dom.searchInput.addEventListener('input', renderStudents);
    dom.searchClear.addEventListener('click', () => {
        dom.searchInput.value = '';
        renderStudents();
        dom.searchInput.focus();
    });
    dom.filterCourse.addEventListener('change', renderStudents);
    dom.filterSemester.addEventListener('change', renderStudents);
    dom.sortSelect.addEventListener('change', renderStudents);
    dom.resetFiltersBtn.addEventListener('click', resetFilters);

    // Dashboard: current semester selector
    dom.currentSemSelect.addEventListener('change', () => {
        setCurrentSemester(dom.currentSemSelect.value);
        renderDashboard();
    });

    // Form
    dom.form.addEventListener('submit', handleFormSubmit);
    dom.resetBtn.addEventListener('click', handleResetClick);
    attachLiveValidation();

    // Modals
    [dom.viewModal, dom.deleteModal].forEach((modal) => {
        modal.addEventListener('click', (event) => {
            // Click on backdrop or any [data-close-modal] button closes it
            if (event.target === modal || event.target.closest('[data-close-modal]')) closeModal(modal);
        });
    });
    dom.viewEditBtn.addEventListener('click', () => {
        const id = dom.viewModal.dataset.id;
        closeModal(dom.viewModal, false);
        startEdit(id);
    });
    dom.deleteConfirmBtn.addEventListener('click', confirmDelete);

    // Keyboard: Escape closes modal/menu, Tab is trapped in modals
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (activeModal) closeModal(activeModal);
            else if (dom.sidebar.classList.contains('open')) closeNav();
        }
        trapFocus(event);
    });

    // Keep multiple open tabs in sync
    window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY) {
            loadStudents();
            refreshUI();
        }
    });
}

/* =========================================================
   17. INITIALISATION
   ========================================================= */
function init() {
    hydrateIcons();

    const today = new Date();
    dom.todayDate.textContent = today.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    dom.footerYear.textContent = today.getFullYear();

    loadStudents();
    populateCourseOptions();
    bindEvents();
    resetForm();
    renderDashboard();
    renderStudents();
    handleRoute(true);
}

document.addEventListener('DOMContentLoaded', init);
