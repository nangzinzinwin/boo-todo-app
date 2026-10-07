/* APP STATE & LOCAL STORAGE */
let tasks = [];
try { 
    tasks = JSON.parse(localStorage.getItem('boo_tasks')) || []; 
    tasks = tasks.map(t => ({
        ...t,
        reminderTimes: t.reminderTimes || [],
        dailyProgress: t.dailyProgress || {},
        emails: t.emails || []
    }));
} catch(e) {}

let categories = ['Personal', 'Work', 'Health', 'Errands'];
try { 
    categories = JSON.parse(localStorage.getItem('boo_categories')) || categories; 
} catch(e) {}

let currentTheme = localStorage.getItem('boo_theme') || 'default';
let previousTheme = localStorage.getItem('boo_prev_theme') || 'default'; // Theme Bug Fix အတွက် သိမ်းဆည်းရန်
let customUserBg = localStorage.getItem('boo_custom_bg') || '';
let userAvatar = localStorage.getItem('boo_user_avatar') || '';
let userName = localStorage.getItem('boo_username') || 'Boo User';
let currentLang = localStorage.getItem('boo_lang') || 'en';

let currentActiveTask = null;

/* AURA HISTORY & QUOTES */
let auraHistory = [];
try { 
    auraHistory = JSON.parse(localStorage.getItem('boo_aura_history')) || []; 
} catch(e) {}

let pendingAura = null;

const AURA_COLORS = { 
    'gold': '#FFD700', 
    'peach': '#FFDAB9', 
    'lavender': '#E6E6FA', 
    'blue': '#ADD8E6', 
    'green': '#98FB98' 
};

const auraMeanings = {
    'gold': { title: "Radiant Gold", text: "You are filled with positive energy today." },
    'peach': { title: "Warm Peach", text: "You are carrying a gentle and loving energy." },
    'lavender': { title: "Soft Lavender", text: "You are embracing calm and self-care today." },
    'blue': { title: "Serene Blue", text: "You are flowing with peace and letting go." },
    'green': { title: "Mint Green", text: "You are welcoming growth and fresh starts." }
};

const auraQuotes = {
    'gold': ["You are capable of amazing things. Trust your journey.", "Make today so beautiful that your yesterday gets jealous.", "Your potential is endless. Go shine.", "Even the smallest step forward is progress. Keep going.", "You have the power to create a life you love.", "Believe in your magic. The world needs your unique light.", "Embrace the challenges; they are shaping your masterpiece."],
    'peach': ["Someone is smiling today because you exist.", "You carry so much love in your heart. Don't forget to give some to yourself.", "Sending you a warm hug through this little note.", "Your kindness makes the world a softer place.", "You are deeply loved, just for being exactly who you are.", "Never forget how much joy you bring to those around you.", "May your day be filled with the same sweetness you give to others."],
    'lavender': ["Be gentle with yourself. You are doing the best you can.", "It is okay to pause and just breathe for a moment.", "Your worth is not measured by your productivity today.", "Rest is not a reward, it is a necessity. Take care of you.", "You are allowed to take up space and take your time.", "Wrap yourself in grace today. You deserve it.", "Your feelings are valid, and your heart is safe here."],
    'blue': ["Let go of what you cannot control. Peace is yours to claim.", "May your mind be as calm as a quiet ocean today.", "Breathe in peace, exhale the worries.", "You don't have to figure everything out right now. Just be.", "Release the heaviness. You were meant to feel light.", "In the midst of the noise, find your quiet center.", "Let the gentle waves wash away your stress."],
    'green': ["Beautiful things take time to grow, just like you.", "Every day is a fresh start. Take a deep breath and begin again.", "I hope today brings you a tiny moment of pure joy.", "You are constantly blooming, even when you cannot see it.", "Trust the timing of your life. Every season has its purpose.", "May your path be lined with serendipity and sunlight.", "Celebrate how far you have come. You are doing wonderfully."]
};

let gapiInited = false;
let gisInited = false;
let tokenClient;
let isAuthorized = false;

/* I18N TRANSLATIONS */
const translations = {
    en: {
        "menu-header": "Menu", "menu-all-tasks": "All Tasks", "menu-starred": "Starred", "menu-category": "Category",
        "menu-create-list": "Create New Category", "menu-theme": "Theme", "menu-settings": "Settings", "support-title": "Support", 
        "menu-signout": "Sign Out", "aura-ask": "What is your aura today?", "aura-desc": "Pick the color that matches your energy.",
        "booboo-says": "Boo says:", "cancel-btn": "Cancel", "habit-title": "Good Habits", "habit-desc": "Start building a better you today!",
        "hab-water": "Drink water", "hab-meds": "Medication reminder", "hab-pray": "Pray", "hab-yoga": "Meditation / Yoga",
        "hab-music": "Learn an instrument", "hab-gym": "Go exercising", "hab-sleep": "Go to bed early", "hab-phone": "Less time on phone",
        "lang-select-title": "Select Language", "mark-status": "Update Progress",
        "save-progress": "SAVE PROGRESS", "set-time": "Set Time", "create-task-title": "Create New Task", "task-input-ph": "What needs to be done?",
        "save-to-cat": "Save to Category:", "save-to-date": "Due Date:", "add-task-btn": "Add Task", "habit-btn": "Let us start with some good habits?",
        "tasks-for": "Tasks for ", "cal-sync-soon": "Tap the + button to add an event to this date!", "click-login": "Tap avatar to customize",
        "connect-cal": "Connect Google Calendar", "tasks-overview": "Tasks Overview", "completed-tasks": "Completed Tasks",
        "pending-tasks": "Pending Tasks", "next-7-days": "Tasks in Next 7 Days", "settings-title": "Settings", "set-sync": "Account Sync",
        "set-notif": "Notifications", "set-cal": "Sync Calendar", "set-manage": "Manage", "set-lang": "Language",
        "set-support": "Support & About", "set-feedback": "Feedback", "set-share": "Share App", "set-follow": "Follow us",
        "set-privacy": "Privacy Policy", "set-version": "Version", "theme-texture": "Texture", "theme-gallery": "Your Gallery",
        "upload-btn": "Upload Image", "no-stars": "There are no starred tasks.", "star-hint": "Tap the star icon on a task to save it here!",
        "detail-edit": "Edit Settings", "detail-delete": "Delete Task", "detail-done": "Mark as Done", "detail-hint": "Tap the elements below to edit.",
        "nav-tasks": "Tasks", "nav-calendar": "Calendar", "nav-boo": "Boo",
        "support-popup": "I will add a buy me a coffee feature later! ☕",
        "normal-task-done": "Complete Task",
        "next-7-empty": "No tasks in the next 7 days.",
        "tag-friends": "Tag Friends (Emails)"
    },
    my: {
        "menu-header": "မီနူး", "menu-all-tasks": "လုပ်စရာအားလုံး", "menu-starred": "ကြယ်ပြထားသော", "menu-category": "အမျိုးအစားခွဲခြားမှု",
        "menu-create-list": "အမျိုးအစားအသစ်ဖန်တီးရန်", "menu-theme": "အပြင်အဆင်", "menu-settings": "ဆက်တင်များ", "support-title": "အကူအညီ", 
        "menu-signout": "အကောင့်ထွက်ရန်", "aura-ask": "ဒီနေ့ သင့်ရဲ့ Aura အရောင်က ဘာလဲ?", "aura-desc": "သင့်ခံစားချက်နဲ့ ကိုက်ညီတဲ့ အရောင်ကို ရွေးပါ။", 
        "booboo-says": "Boo ပြောသည်:", "cancel-btn": "ပယ်ဖျက်ရန်", "habit-title": "အလေ့အကျင့်ကောင်းများ", "habit-desc": "ပိုကောင်းတဲ့ သင့်ကို တည်ဆောက်လိုက်ပါ!",
        "hab-water": "ရေသောက်ပါ", "hab-meds": "ဆေးသောက်ရန် သတိပေးချက်", "hab-pray": "ဘုရားရှိခိုးရန်", "hab-yoga": "တရားထိုင် / ယောဂ",
        "hab-music": "တူရိယာလေ့လာရန်", "hab-gym": "လေ့ကျင့်ခန်းလုပ်ရန်", "hab-sleep": "စောစောအိပ်ရန်", "hab-phone": "ဖုန်းသုံးချိန်လျှော့ရန်",
        "lang-select-title": "ဘာသာစကားရွေးချယ်ရန်", "mark-status": "တိုးတက်မှုကို အပ်ဒိတ်လုပ်ပါ",
        "save-progress": "တိုးတက်မှုကို သိမ်းဆည်းရန်", "set-time": "အချိန်သတ်မှတ်ရန်", "create-task-title": "လုပ်စရာအသစ်ဖန်တီးရန်",
        "task-input-ph": "ဘာလုပ်ဖို့လိုလဲ?", "save-to-cat": "အမျိုးအစားထဲ သိမ်းရန်:", "save-to-date": "နောက်ဆုံးရက်:", "add-task-btn": "လုပ်စရာထည့်ရန်",
        "habit-btn": "အလေ့အကျင့်ကောင်းတွေ စတင်လိုက်ရအောင်?", "tasks-for": "လုပ်စရာများ - ", "cal-sync-soon": "ဒီနေ့အတွက် အစီအစဉ်ထည့်ရန် + ကို နှိပ်ပါ!",
        "click-login": "ပရိုဖိုင်ပြင်ရန် နှိပ်ပါ", "connect-cal": "Google Calendar ချိတ်ဆက်ရန်", "tasks-overview": "လုပ်စရာ အကျဉ်းချုပ်",
        "completed-tasks": "ပြီးစီးသော လုပ်စရာများ", "pending-tasks": "ကျန်ရှိသော လုပ်စရာများ", "next-7-days": "နောက် ၇ ရက်အတွင်း လုပ်စရာများ",
        "settings-title": "ဆက်တင်များ", "set-sync": "အကောင့်ထပ်တူပြုခြင်း", "set-notif": "သတိပေးချက်များ", "set-cal": "ပြက္ခဒိန်ချိတ်ဆက်ရန်", 
        "set-manage": "စီမံရန်", "set-lang": "ဘာသာစကား", "set-support": "အကူအညီ & အကြောင်း", "set-feedback": "အကြံပြုရန်", 
        "set-share": "အက်ပ်ကိုမျှဝေရန်", "set-follow": "ကျွန်ုပ်တို့ကို ဖော်လိုလုပ်ပါ", "set-privacy": "ကိုယ်ရေးကိုယ်တာမူဝါဒ", "set-version": "ဗားရှင်း",
        "theme-texture": "မျက်နှာပြင်ဒီဇိုင်း", "theme-gallery": "သင့်ပြခန်း", "upload-btn": "ပုံတင်ရန်", "no-stars": "ကြယ်ပြထားသော လုပ်စရာမရှိပါ။",
        "star-hint": "လုပ်စရာကို ကြယ်နှိပ်ပြီး ဤနေရာတွင် သိမ်းပါ!", "detail-edit": "ဆက်တင်များကို ပြင်ရန်", "detail-delete": "လုပ်စရာဖျက်ရန်",
        "detail-done": "ပြီးစီးကြောင်း အမှတ်အသားလုပ်ရန်", "detail-hint": "ပြင်ဆင်ရန် အောက်ပါအချက်များကို နှိပ်ပါ။",
        "nav-tasks": "လုပ်စရာများ", "nav-calendar": "ပြက္ခဒိန်", "nav-boo": "Boo",
        "support-popup": "Coffee တိုက်ချင်ရင် နောက်မှ ထပ်ထည့်ပေးပါမယ်!☕ ",
        "normal-task-done": "လုပ်စရာ ပြီးစီးပါပြီ",
        "next-7-empty": "နောက် ၇ ရက်အတွင်း လုပ်စရာမရှိပါ။",
        "tag-friends": "Tag Friends (Emails)"
    }
};

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('boo_lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            if (el.tagName === 'INPUT' && el.type === 'text') el.placeholder = translations[lang][key];
            else el.textContent = translations[lang][key];
        }
    });
    const langDisplay = document.getElementById('current-lang-display');
    if (langDisplay) langDisplay.textContent = lang === 'en' ? 'English >' : 'မြန်မာ >';
}

/* INITIALIZATION ON LOAD */
document.addEventListener('DOMContentLoaded', () => {
    loadTheme(currentTheme);
    applyLanguage(currentLang);
    
    document.getElementById('profile-username-display').textContent = userName;
    if (userAvatar) {
        document.getElementById('profile-avatar-display').style.backgroundImage = `url(${userAvatar})`;
        document.getElementById('profile-avatar-emoji').style.display = 'none';
    }

    renderTasks();
    renderCategories();
    renderAuraBottle();
    updateWeeklyAura();
    updateStats();

    const todayStr = new Date().toDateString();
    if (!auraHistory.find(a => a.date === todayStr)) {
        setTimeout(() => {
            document.getElementById('aura-modal').classList.add('show');
            document.getElementById('overlay').classList.add('show');
        }, 1200);
    }
    
    try { history.replaceState({ id: 'tasks-screen' }, '', '#tasks'); } catch(e){}
    initSidebarSwipe();
});

/* CUSTOM ALERTS & PROMPTS */
function booAlert(msg) {
    document.getElementById('booboo-alert-msg').textContent = msg;
    document.getElementById('booboo-alert').classList.add('show');
    document.getElementById('overlay').classList.add('show');
}
document.getElementById('booboo-alert-ok')?.addEventListener('click', () => {
    document.getElementById('booboo-alert').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
});

function booPrompt(msg, callback) {
    const promptModal = document.getElementById('booboo-prompt');
    const input = document.getElementById('booboo-prompt-input');
    document.getElementById('booboo-prompt-msg').textContent = msg;
    input.value = '';
    
    document.getElementById('overlay').classList.add('show');
    promptModal.classList.add('show');
    input.focus();

    document.getElementById('booboo-prompt-ok').onclick = () => {
        promptModal.classList.remove('show');
        document.getElementById('overlay').classList.remove('show');
        if (input.value.trim() !== '') callback(input.value.trim());
    };
    document.getElementById('booboo-prompt-cancel').onclick = () => {
        promptModal.classList.remove('show');
        document.getElementById('overlay').classList.remove('show');
    };
}

function showLogoutConfirm(callback) {
    document.getElementById('booboo-confirm-msg').textContent = "Are you sure you want to sign out? Your local data will remain, but syncing will stop.";
    document.getElementById('booboo-confirm').classList.add('show');
    document.getElementById('overlay').classList.add('show');
    
    document.getElementById('booboo-confirm-yes').onclick = () => {
        document.getElementById('booboo-confirm').classList.remove('show');
        document.getElementById('overlay').classList.remove('show');
        callback();
    };
    
    document.getElementById('booboo-confirm-cancel').onclick = () => {
        document.getElementById('booboo-confirm').classList.remove('show');
        document.getElementById('overlay').classList.remove('show');
    };
}

/* UX NAVIGATION & BACK BUTTON FIX */
const screens = ['tasks-screen', 'calendar-screen', 'profile-screen', 'settings-screen', 'theme-screen', 'starred-screen', 'habit-detail-screen'];

function showScreenElement(screenId) {
    screens.forEach(s => {
        const el = document.getElementById(s);
        if(el) el.style.display = 'none';
    });
    const target = document.getElementById(screenId);
    if(target) target.style.display = 'block';
    
    const fabTasks = document.getElementById('fab-add-task');
    const fabCal = document.getElementById('calendar-fab');
    if (fabTasks) fabTasks.style.display = (screenId === 'tasks-screen') ? 'flex' : 'none';
    if (fabCal) fabCal.style.display = (screenId === 'calendar-screen') ? 'flex' : 'none';

    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if (screenId === 'tasks-screen') document.getElementById('nav-tasks')?.classList.add('active');
    if (screenId === 'calendar-screen') document.getElementById('nav-calendar')?.classList.add('active');
    if (screenId === 'profile-screen') document.getElementById('nav-profile')?.classList.add('active');
    
    if (screenId === 'calendar-screen') renderCalendar();
}

function switchScreen(screenId) {
    try {
        if (screenId !== 'tasks-screen') history.pushState({ id: screenId }, '', `#${screenId}`);
        else history.pushState({ id: 'tasks-screen' }, '', '#tasks');
    } catch(e){}
    showScreenElement(screenId);
}

window.addEventListener('popstate', (e) => {
    const openModals = document.querySelectorAll('.custom-modal.show');
    if (openModals.length > 0) {
        openModals.forEach(m => m.classList.remove('show'));
        document.getElementById('overlay').classList.remove('show');
        return; 
    }
    if (e.state && e.state.id) showScreenElement(e.state.id);
    else showScreenElement('tasks-screen');
});

document.getElementById('nav-tasks')?.addEventListener('click', () => switchScreen('tasks-screen'));
document.getElementById('nav-calendar')?.addEventListener('click', () => switchScreen('calendar-screen'));
document.getElementById('nav-profile')?.addEventListener('click', () => switchScreen('profile-screen'));
document.getElementById('menu-all-tasks')?.addEventListener('click', () => { selectedCategory = 'All'; renderTasks(); switchScreen('tasks-screen'); closeSidebar(); });
document.getElementById('open-settings-btn')?.addEventListener('click', () => { switchScreen('settings-screen'); closeSidebar(); });
document.getElementById('open-theme-btn')?.addEventListener('click', () => { switchScreen('theme-screen'); closeSidebar(); });
document.getElementById('open-starred-btn')?.addEventListener('click', () => { renderStarredTasks(); switchScreen('starred-screen'); closeSidebar(); });

document.querySelectorAll('.back-to-tasks-btn').forEach(btn => {
    btn.addEventListener('click', () => switchScreen('tasks-screen'));
});

document.getElementById('menu-btn')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').classList.add('show');
});
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
}
document.getElementById('overlay')?.addEventListener('click', () => {
    closeSidebar();
    document.querySelectorAll('.custom-modal').forEach(m => m.classList.remove('show'));
    document.getElementById('overlay').classList.remove('show');
});
document.getElementById('toggle-category-btn')?.addEventListener('click', () => {
    const folder = document.getElementById('category-folder');
    const arrow = document.getElementById('category-arrow');
    folder.classList.toggle('open');
    arrow.style.transform = folder.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
});

// Dynamic Support Translation Trigger
document.getElementById('sidebar-support-btn')?.addEventListener('click', () => {
    booAlert(translations[currentLang]["support-popup"] || "Coffee တိုက်ချင်ရင် နောက်မှ ထပ်ထည့်ပေးပါမယ်! ☕");
});

document.getElementById('sidebar-signout-btn')?.addEventListener('click', () => {
    showLogoutConfirm(() => {
        if (isAuthorized && tokenClient) {
            const token = gapi.client.getToken();
            if (token !== null) {
                google.accounts.oauth2.revoke(token.access_token); 
                gapi.client.setToken(''); 
                isAuthorized = false;
            }
        }
        booAlert("Signed out completely! 👋");
    });
});

/* SIDEBAR SWIPE GESTURES */
function initSidebarSwipe() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    function handleSwipe() {
        const diffX = touchEndX - touchStartX;
        if (touchStartX < 50 && diffX > 80) {
            document.getElementById('sidebar').classList.add('open');
            document.getElementById('overlay').classList.add('show');
        }
        if (diffX < -80 && document.getElementById('sidebar').classList.contains('open')) {
            closeSidebar();
        }
    }
}

/* THEMES, AVATAR & USER NAME EDIT (BUG FIXED HERE) */
function loadTheme(theme) {
    if (theme !== 'dark') {
        previousTheme = theme;
        localStorage.setItem('boo_prev_theme', previousTheme);
    }
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem('boo_theme', theme);
    if (theme === 'custom-user-bg' && customUserBg) {
        document.documentElement.style.setProperty('--custom-user-image', `url(${customUserBg})`);
        const preview = document.getElementById('custom-bg-preview');
        if (preview) { preview.style.display = 'block'; preview.style.backgroundImage = `url(${customUserBg})`; }
    }
}

// Night mode toggle fix with previousTheme memory
document.getElementById('theme-toggle')?.addEventListener('click', () => {
    if (currentTheme === 'dark') {
        loadTheme(previousTheme || 'default');
    } else {
        previousTheme = currentTheme;
        localStorage.setItem('boo_prev_theme', previousTheme);
        loadTheme('dark');
    }
});

document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
        loadTheme(e.target.getAttribute('data-theme-choice'));
        booAlert("Theme updated successfully!");
    });
});

document.getElementById('trigger-upload-btn')?.addEventListener('click', () => document.getElementById('custom-bg-upload').click());
document.getElementById('custom-bg-upload')?.addEventListener('change', function(event) {
    if (event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            customUserBg = e.target.result;
            localStorage.setItem('boo_custom_bg', customUserBg);
            loadTheme('custom-user-bg');
            booAlert("Custom background applied!");
        };
        reader.readAsDataURL(event.target.files[0]);
    }
});

document.getElementById('edit-avatar-btn')?.addEventListener('click', (e) => {
    e.stopPropagation(); 
    document.getElementById('profile-avatar-upload').click();
});
document.getElementById('profile-avatar-upload')?.addEventListener('change', function(event) {
    if (event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            userAvatar = e.target.result;
            localStorage.setItem('boo_user_avatar', userAvatar);
            document.getElementById('profile-avatar-display').style.backgroundImage = `url(${userAvatar})`;
            document.getElementById('profile-avatar-emoji').style.display = 'none';
        };
        reader.readAsDataURL(event.target.files[0]);
    }
});

document.getElementById('edit-name-icon')?.addEventListener('click', (e) => {
    e.stopPropagation(); 
    booPrompt("What should Boo call you?", (newName) => {
        userName = newName;
        localStorage.setItem('boo_username', userName);
        document.getElementById('profile-username-display').textContent = userName;
        booAlert("Nice to meet you, " + userName + "!");
    });
});

/* AURA JAR & "SAVE YOUR AURA" MODAL */
function getStarSVG(color) {
    return `
    <svg class="aura-star" viewBox="0 0 512 512" style="filter: drop-shadow(0 0 8px ${color});">
        <path fill="${color}" d="M256 14L328 178L506 195L371 314L410 488L256 397L102 488L141 314L6 195L184 178L256 14Z" opacity="0.9"/>
        <path fill="#ffffff" d="M256 14L328 178L256 256L184 178L256 14Z" opacity="0.4"/>
        <path fill="#ffffff" d="M256 256L328 178L506 195L371 314L256 256Z" opacity="0.2"/>
        <path fill="#000000" d="M256 256L371 314L410 488L256 397L256 256Z" opacity="0.1"/>
        <path fill="#000000" d="M256 256L256 397L102 488L141 314L256 256Z" opacity="0.2"/>
        <path fill="#ffffff" d="M256 256L141 314L6 195L184 178L256 256Z" opacity="0.1"/>
    </svg>`;
}

document.querySelectorAll('.aura-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const colorName = e.target.getAttribute('data-aura');
        const todayStr = new Date().toDateString();
        
        if (!auraHistory.find(a => a.date === todayStr)) {
            pendingAura = { date: todayStr, color: colorName };
            document.getElementById('aura-modal').classList.remove('show');
            
            document.getElementById('save-aura-glow').style.color = AURA_COLORS[colorName];
            document.getElementById('save-aura-title').textContent = auraMeanings[colorName].title;
            document.getElementById('save-aura-desc').textContent = auraMeanings[colorName].text;
            document.getElementById('save-aura-modal').classList.add('show');
        } else {
            document.getElementById('aura-modal').classList.remove('show');
            document.getElementById('overlay').classList.remove('show');
        }
    });
});

document.getElementById('confirm-aura-btn')?.addEventListener('click', () => {
    if (pendingAura) {
        auraHistory.push(pendingAura);
        if (auraHistory.length > 200) auraHistory.shift(); 
        localStorage.setItem('boo_aura_history', JSON.stringify(auraHistory));
        pendingAura = null;
        
        document.getElementById('save-aura-modal').classList.remove('show');
        document.getElementById('overlay').classList.remove('show');
        renderAuraBottle();
        updateWeeklyAura();
    }
});

document.getElementById('clear-bottle-btn')?.addEventListener('click', () => {
    if (confirm("Are you sure you want to empty your Aura Jar? This cannot be undone!")) {
        auraHistory = [];
        localStorage.removeItem('boo_aura_history');
        renderAuraBottle();
        updateWeeklyAura();
    }
});

function renderAuraBottle() {
    const bottleBody = document.getElementById('bottle-body');
    const countDisplay = document.getElementById('bottle-count');
    if (!bottleBody) return;

    bottleBody.innerHTML = '';
    countDisplay.textContent = auraHistory.length;

    auraHistory.forEach(aura => {
        const span = document.createElement('div');
        span.style.display = 'inline-block';
        span.innerHTML = getStarSVG(AURA_COLORS[aura.color] || '#FFD700');
        
        const randomRotation = Math.floor(Math.random() * 360);
        const starEl = span.querySelector('.aura-star');
        starEl.setAttribute('data-rot', randomRotation);
        starEl.style.transform = `rotate(${randomRotation}deg)`;
        
        bottleBody.appendChild(span);
    });
}

function updateWeeklyAura() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const dayEl = document.getElementById(`aura-day-${days[checkDate.getDay()]}`);
        
        if (dayEl) {
            const entry = auraHistory.find(a => a.date === checkDate.toDateString());
            const circle = dayEl.querySelector('span');
            if (entry) {
                dayEl.classList.add('active');
                circle.style.backgroundColor = AURA_COLORS[entry.color];
                circle.innerHTML = `<svg style="width:14px; height:14px; stroke:white; stroke-width:3; fill:none;" viewBox="0 0 24 24"><path d="M12 2l2.4 7.6 7.6 2.4-7.6 2.4L12 22l-2.4-7.6-7.6-2.4 7.6-2.4L12 2z"/></svg>`;
            } else {
                dayEl.classList.remove('active');
                circle.style.backgroundColor = 'var(--input-bg)';
                circle.innerHTML = '-';
            }
        }
    }
}

window.addEventListener('deviceorientation', (e) => {
    let yTilt = e.beta || 0; 
    let xTilt = e.gamma || 0;
    xTilt = Math.max(-45, Math.min(45, xTilt));
    yTilt = Math.max(-45, Math.min(45, yTilt));

    const stars = document.querySelectorAll('.aura-star');
    stars.forEach((star) => {
        const rot = star.getAttribute('data-rot') || 0;
        const moveX = (xTilt / 45) * 35; 
        const moveY = (yTilt / 45) * 35; 
        star.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rot}deg)`;
    });
});

let lastShakeTime = 0;
let lastX = null, lastY = null, lastZ = null;
window.addEventListener('devicemotion', (e) => {
    let acc = e.accelerationIncludingGravity;
    if (!acc) return;
    if (lastX !== null) {
        if (Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ) > 25) {
            const now = Date.now();
            if (now - lastShakeTime > 1000) { 
                lastShakeTime = now;
                const profileScreen = document.getElementById('profile-screen');
                if (profileScreen && profileScreen.style.display !== 'none') {
                    document.querySelectorAll('.aura-star').forEach(star => {
                        const rot = star.getAttribute('data-rot');
                        const randX = (Math.random() - 0.5) * 80;
                        const randY = (Math.random() - 0.5) * 80;
                        star.style.transform = `translate(${randX}px, ${randY}px) rotate(${Math.random() * 360}deg)`;
                        setTimeout(() => { star.style.transform = `translate(0px, 0px) rotate(${rot}deg)`; }, 600);
                    });
                    if (navigator.vibrate) navigator.vibrate([40, 50, 40]); 
                }
            }
        }
    }
    lastX = acc.x; lastY = acc.y; lastZ = acc.z;
});

/* "READ AURA" LOGIC */
document.getElementById('open-read-aura-btn')?.addEventListener('click', () => {
    document.getElementById('read-aura-color-modal').classList.add('show');
    document.getElementById('overlay').classList.add('show');
});

document.getElementById('close-read-color-btn')?.addEventListener('click', () => {
    document.getElementById('read-aura-color-modal').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
});

document.querySelectorAll('.read-aura-star-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        let color = e.target.getAttribute('data-color');
        if (!color) color = e.target.closest('.read-aura-star-btn').getAttribute('data-color'); 
        
        document.getElementById('read-aura-color-modal').classList.remove('show');
        const envelopeModal = document.getElementById('read-aura-envelope-modal');
        envelopeModal.classList.add('show');
        
        const envContainer = document.getElementById('envelope-container');
        envContainer.classList.remove('envelope-open'); 
        
        const envColors = {
            'gold': { body: '#fceda8', flap: '#f7df74' },
            'peach': { body: '#fcd5c5', flap: '#f2bbaf' },
            'lavender': { body: '#e3dcf5', flap: '#d1c7eb' },
            'blue': { body: '#cce6f0', flap: '#add0df' },
            'green': { body: '#cbf2cb', flap: '#ade6ad' }
        };
        document.getElementById('envelope-body').style.backgroundColor = envColors[color].body;
        document.getElementById('envelope-flap').style.borderTopColor = envColors[color].flap;
        
        envContainer.onclick = () => {
            envContainer.classList.add('envelope-open'); 
            setTimeout(() => {
                envelopeModal.classList.remove('show');
                const quotesList = auraQuotes[color];
                const finalQuote = quotesList[Math.floor(Math.random() * quotesList.length)];
                document.getElementById('aura-letter-content').textContent = finalQuote;
                document.getElementById('read-aura-letter-modal').classList.add('show');
            }, 1200); 
        };
    });
});

document.getElementById('close-letter-btn')?.addEventListener('click', () => {
    document.getElementById('read-aura-letter-modal').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
});

/* TASKS, CATEGORY & QUICK HABITS LOGIC */
let selectedCategory = 'All';

document.getElementById('add-new-category-btn')?.addEventListener('click', () => {
    booPrompt("Enter new category name:", (newCat) => {
        if (!categories.includes(newCat)) {
            categories.push(newCat);
            localStorage.setItem('boo_categories', JSON.stringify(categories));
            renderCategories();
            booAlert(`Category "${newCat}" created!`);
        }
    });
});

function renderCategories() {
    const filterContainer = document.getElementById('category-filters');
    const sidebarList = document.getElementById('sidebar-categories-list');
    const dropdown = document.getElementById('new-task-category');
    if(!filterContainer) return;
    
    filterContainer.innerHTML = ''; sidebarList.innerHTML = ''; dropdown.innerHTML = '';

    const allCat = document.createElement('button');
    allCat.className = `cat-pill ${selectedCategory === 'All' ? 'active' : ''}`;
    allCat.textContent = currentLang === 'en' ? 'All Tasks' : 'လုပ်စရာအားလုံး';
    allCat.onclick = () => { selectedCategory = 'All'; renderTasks(); };
    filterContainer.appendChild(allCat);

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `cat-pill ${selectedCategory === cat ? 'active' : ''}`;
        btn.textContent = cat;
        btn.onclick = () => { selectedCategory = cat; renderTasks(); };
        filterContainer.appendChild(btn);

        const li = document.createElement('li');
        li.className = 'sidebar-item'; 
        li.innerHTML = `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg> <span style="margin-left: 5px;">${cat}</span>`;
        li.onclick = () => { selectedCategory = cat; renderTasks(); closeSidebar(); };
        sidebarList.appendChild(li);

        const opt = document.createElement('option');
        opt.value = cat; opt.textContent = cat; dropdown.appendChild(opt);
    });
}

function renderTasks() {
    const list = document.getElementById('task-list');
    if(!list) return;
    list.innerHTML = '';

    let filteredTasks = selectedCategory !== 'All' ? tasks.filter(t => t.category === selectedCategory) : tasks;

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = "task-item-container";
        
        li.innerHTML = `
            <div class="swipe-actions">
                <div class="swipe-edit">Edit</div>
                <div class="swipe-delete">Delete</div>
            </div>
            <div class="task-content">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                        <input type="checkbox" style="width: 20px; height: 20px; accent-color: var(--primary-btn);" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id}, event)">
                        <div style="flex: 1;">
                            <span class="${task.completed ? 'completed' : ''}" style="font-weight: 500; font-size: 16px;">${task.text}</span>
                            ${task.date ? `<div style="font-size: 12px; color: var(--completed-text); margin-top: 4px; display: flex; align-items: center;"><svg class="svg-icon" style="width:12px; height:12px; margin:0 4px 0 0;" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${task.date}</div>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <span style="cursor: pointer;" onclick="toggleStar(${task.id}, event)">
                            ${task.starred 
                                ? `<svg class="svg-icon" style="width:20px; height:20px; color:var(--primary-btn); fill:currentColor; margin:0;" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>` 
                                : `<svg class="svg-icon" style="width:20px; height:20px; margin:0; color:var(--completed-text);" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`}
                        </span>
                        <span class="task-category-tag">${task.category}</span>
                        <button onclick="deleteTask(${task.id}, this, event)" style="background: none; border: none; color: #e53935; cursor: pointer; display: flex; align-items: center;">
                            <svg class="svg-icon" style="width:18px; height:18px; margin:0;" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        list.appendChild(li);

        const taskContent = li.querySelector('.task-content');
        taskContent.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && !e.target.closest('button') && !e.target.closest('span[onclick]')) {
                openTaskDetail(task);
            }
        });

        let startX = 0, currentX = 0;
        taskContent.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, {passive: true});
        taskContent.addEventListener('touchmove', e => {
            currentX = e.touches[0].clientX - startX;
            if (Math.abs(currentX) > 20) { 
                taskContent.style.transform = `translateX(${currentX}px)`;
            }
        }, {passive: true});
        taskContent.addEventListener('touchend', e => {
            if (currentX > 80) {
                taskContent.style.transform = `translateX(0px)`;
                openTaskDetail(task);
            } else if (currentX < -80) {
                taskContent.style.transform = `translateX(-100%)`;
                setTimeout(() => deleteTask(task.id, taskContent, e), 300);
            } else {
                taskContent.style.transform = `translateX(0px)`;
            }
            currentX = 0;
        });
    });
    updateStats();
}

function openTaskDetail(task) {
    currentActiveTask = task;
    
    document.getElementById('habit-detail-title').textContent = task.text;
    document.getElementById('habit-detail-icon').innerHTML = `<svg class="svg-icon" style="width:50px;height:50px;color:var(--primary-btn);" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`;
    document.getElementById('edit-phrase-input').value = task.text;
    document.getElementById('edit-date-input').value = task.date || '';
    
    document.getElementById('edit-emails-input').value = task.emails && task.emails.length > 0 ? task.emails.join(', ') : '';
    
    const timeInput = document.getElementById('add-time-input');
    if (timeInput) timeInput.value = '';

    renderReminderTimes(task);
    
    const saveBtn = document.getElementById('save-task-settings-btn');
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    
    newSaveBtn.addEventListener('click', async () => {
        task.text = document.getElementById('edit-phrase-input').value;
        task.date = document.getElementById('edit-date-input').value;
        
        const emailsRaw = document.getElementById('edit-emails-input').value;
        task.emails = emailsRaw.split(',').map(e => e.trim()).filter(e => e !== '');
        
        if (timeInput && timeInput.value) {
            let [hours, minutes] = timeInput.value.split(':');
            let ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const timeStr = `${hours}:${minutes} ${ampm}`;
            
            if (!task.reminderTimes) task.reminderTimes = [];
            if (!task.reminderTimes.includes(timeStr)) {
                task.reminderTimes.push(timeStr);
            }
        }
        
        saveTasks();
        renderTasks();
        
        if (isAuthorized) await addEventToCalendar(task);

        booAlert("Task updated successfully!");
        switchScreen('tasks-screen');
    });

    switchScreen('habit-detail-screen');
}

function renderReminderTimes(task) {
    const container = document.getElementById('reminder-time-container');
    if(!container) return;
    
    const timeInput = document.getElementById('add-time-input');
    container.innerHTML = ''; 
    if(timeInput) container.appendChild(timeInput);
    
    task.reminderTimes.forEach((timeStr, index) => {
        const btn = document.createElement('button');
        btn.className = 'time-pill';
        btn.textContent = timeStr;
        btn.onclick = () => {
            task.reminderTimes.splice(index, 1);
            saveTasks();
            renderReminderTimes(task);
        };
        container.insertBefore(btn, timeInput); 
    });
}

function renderStarredTasks() {
    const list = document.getElementById('starred-task-list');
    const emptyState = document.getElementById('empty-starred-state');
    if(!list) return;
    list.innerHTML = '';
    
    const starredTasks = tasks.filter(t => t.starred);
    if (starredTasks.length === 0) emptyState.style.display = 'block';
    else {
        emptyState.style.display = 'none';
        starredTasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <svg class="svg-icon" style="width:20px; height:20px; color:var(--primary-btn); fill:currentColor; margin:0;" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        <div>
                            <span class="${task.completed ? 'completed' : ''}" style="font-weight: 500; font-size: 16px;">${task.text}</span>
                            ${task.date ? `<div style="font-size: 12px; color: var(--completed-text); margin-top: 4px; display:flex; align-items:center;"><svg class="svg-icon" style="width:12px; height:12px; margin:0 4px 0 0;" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${task.date}</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
            list.appendChild(li);
        });
    }
}

document.getElementById('open-habit-list-btn')?.addEventListener('click', () => {
    document.getElementById('habit-modal').classList.add('show');
    document.getElementById('overlay').classList.add('show');
});

document.getElementById('close-habit-btn')?.addEventListener('click', () => {
    document.getElementById('habit-modal').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
});

document.querySelectorAll('.habit-item').forEach(item => {
    item.addEventListener('click', async (e) => {
        const habitText = item.getAttribute('data-habit');
        if (habitText) {
            const newTask = { id: Date.now(), text: habitText, completed: false, category: 'Health', date: '', starred: false, reminderTimes: [], dailyProgress: {}, emails: [] };
            tasks.push(newTask);
            saveTasks();
            selectedCategory = 'All';
            renderCategories();
            renderTasks();
            document.getElementById('habit-modal').classList.remove('show');
            document.getElementById('overlay').classList.remove('show');
            booAlert(`"${habitText}" added!`);
            if (isAuthorized) await addEventToCalendar(newTask);
        }
    });
});

document.querySelectorAll('.habit-pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const taskText = btn.getAttribute('data-task');
        if (taskText) {
            document.getElementById('new-task-input').value = taskText;
        }
    });
});

document.getElementById('fab-add-task')?.addEventListener('click', () => {
    document.getElementById('new-task-date').value = ''; 
    document.getElementById('new-task-emails').value = ''; 
    document.getElementById('add-task-modal').classList.add('show');
    document.getElementById('overlay').classList.add('show');
    document.getElementById('new-task-input').focus();
});

document.getElementById('cancel-task-btn')?.addEventListener('click', () => {
    document.getElementById('add-task-modal').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
});

document.getElementById('add-task-btn')?.addEventListener('click', async () => {
    const text = document.getElementById('new-task-input').value.trim();
    const cat = document.getElementById('new-task-category').value;
    const date = document.getElementById('new-task-date').value;
    const emailsRaw = document.getElementById('new-task-emails').value;
    const emails = emailsRaw.split(',').map(e => e.trim()).filter(e => e !== '');

    if (text !== '') {
        const newTask = { id: Date.now(), text: text, completed: false, category: cat, date: date, starred: false, reminderTimes: [], dailyProgress: {}, emails: emails };
        tasks.push(newTask);
        saveTasks();
        
        selectedCategory = 'All';
        renderCategories(); 
        renderTasks();
        
        if (isAuthorized) await addEventToCalendar(newTask);

        document.getElementById('new-task-input').value = '';
        document.getElementById('new-task-date').value = '';
        document.getElementById('new-task-emails').value = '';
        document.getElementById('add-task-modal').classList.remove('show');
        document.getElementById('overlay').classList.remove('show');
        switchScreen('tasks-screen'); 
    }
});

function toggleTask(id, event) {
    if(event) event.stopPropagation();
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks(); renderTasks();
        if (task.completed && "Notification" in window && Notification.permission === "granted") {
            new Notification("Great job!", { body: `Completed: ${task.text}`, icon: "Img/logo.png" });
        }
    }
}

function toggleStar(id, event) {
    if(event) event.stopPropagation();
    const task = tasks.find(t => t.id === id);
    if (task) { task.starred = !task.starred; saveTasks(); renderTasks(); }
}

function deleteTask(id, btnElement, event) {
    if(event) event.stopPropagation();
    const li = btnElement.closest('li');
    li.classList.add('fade-out');
    setTimeout(() => { tasks = tasks.filter(t => t.id !== id); saveTasks(); renderTasks(); switchScreen('tasks-screen'); }, 400); 
}

function saveTasks() {
    localStorage.setItem('boo_tasks', JSON.stringify(tasks));
    updateStats();
    renderNext7Days(); 
}

function updateStats() {
    const completed = tasks.filter(t => t.completed).length;
    const completedEl = document.getElementById('completed-count');
    const pendingEl = document.getElementById('pending-count');
    if(completedEl) completedEl.textContent = completed;
    if(pendingEl) pendingEl.textContent = tasks.length - completed;
    
    const sbAll = document.getElementById('sidebar-all-count');
    const sbStar = document.getElementById('sidebar-star-count');
    if(sbAll) sbAll.textContent = tasks.length;
    if(sbStar) sbStar.textContent = tasks.filter(t => t.starred).length;
    
    renderNext7Days();
}

function renderNext7Days() {
    const list = document.getElementById('next-7-days-list');
    if(!list) return;
    list.innerHTML = '';
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const next7DaysTasks = tasks.filter(t => {
        if(!t.date) return false;
        const taskDate = new Date(t.date);
        taskDate.setHours(0,0,0,0);
        const diffTime = taskDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7 && !t.completed;
    });

    next7DaysTasks.sort((a,b) => new Date(a.date) - new Date(b.date));

    if(next7DaysTasks.length === 0) {
        list.innerHTML = `<p style="color: var(--completed-text); font-size: 14px;">${translations[currentLang]['next-7-empty'] || 'No tasks in the next 7 days.'}</p>`;
        return;
    }

    next7DaysTasks.forEach(t => {
        const item = document.createElement('div');
        item.style = 'display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);';
        item.innerHTML = `
            <span style="font-weight: 500; color: var(--text-color); font-size: 14px;">${t.text}</span>
            <span style="font-size: 12px; color: var(--primary-btn); font-weight: bold; background: var(--container-bg); padding: 4px 8px; border-radius: 6px;">${t.date}</span>
        `;
        list.appendChild(item);
    });
}

/* CALENDAR SCREEN & AUTO-FILL */
let currentDate = new Date();
let globalSelectedDate = new Date().toISOString().split('T')[0];

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('month-year');
    if(!grid) return;
    grid.innerHTML = '';

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    monthYear.textContent = `${monthNames[month]} ${year}`;

    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        grid.appendChild(emptyDiv);
    }

    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = i;
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        if (tasks.some(t => t.date === dateStr)) dayDiv.classList.add('has-tasks');
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) dayDiv.classList.add('today');

        dayDiv.onclick = () => {
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            dayDiv.classList.add('selected');
            showTasksForDate(dateStr, i, monthNames[month], year);
        };
        grid.appendChild(dayDiv);
    }
}

function showTasksForDate(dateStr, day, monthName, year) {
    globalSelectedDate = dateStr;
    document.getElementById('selected-date-text').textContent = `${monthName} ${day}, ${year}`;
    const list = document.getElementById('calendar-task-list');
    const emptyState = document.getElementById('empty-calendar-state');
    list.innerHTML = '';
    
    const dayTasks = tasks.filter(t => t.date === dateStr);
    
    if (dayTasks.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        dayTasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: ${task.completed ? 'var(--completed-text)' : 'var(--primary-btn)'}; font-weight:bold;">
                        ${task.completed ? '✓' : '○'}
                    </span>
                    <span class="${task.completed ? 'completed' : ''}" style="font-weight: 500;">${task.text}</span>
                </div>
            `;
            list.appendChild(li);
        });
    }
}

document.getElementById('prev-month')?.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
document.getElementById('next-month')?.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });

document.getElementById('calendar-fab')?.addEventListener('click', () => {
    document.getElementById('new-task-date').value = globalSelectedDate; 
    document.getElementById('add-task-modal').classList.add('show');
    document.getElementById('overlay').classList.add('show');
    document.getElementById('new-task-input').focus();
});

/* MARK AS DONE CHECKLIST LOGIC IN TASK DETAIL */
document.getElementById('detail-done-btn')?.addEventListener('click', () => {
    if (!currentActiveTask) return;
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (!currentActiveTask.dailyProgress) currentActiveTask.dailyProgress = {};
    if (!currentActiveTask.dailyProgress[todayStr]) currentActiveTask.dailyProgress[todayStr] = [];
    
    document.getElementById('mark-done-date').textContent = todayStr;
    document.getElementById('mark-done-subtitle').textContent = currentActiveTask.text;
    
    renderChecklist(currentActiveTask, todayStr);
    
    document.getElementById('mark-done-modal').classList.add('show');
    document.getElementById('overlay').classList.add('show');
});

function renderChecklist(task, dateStr) {
    const checklist = document.getElementById('mark-done-checklist');
    checklist.innerHTML = '';
    
    const times = task.reminderTimes && task.reminderTimes.length > 0 ? task.reminderTimes : ['Normal Task'];
    const completedTimes = task.dailyProgress[dateStr] || [];
    
    document.getElementById('mark-done-times-text').textContent = `${completedTimes.length} / ${times.length} times`;

    times.forEach(time => {
        const isDone = completedTimes.includes(time);
        const item = document.createElement('div');
        item.className = `checklist-item ${isDone ? 'done' : ''}`;
        
        const timeLabel = time === 'Normal Task' ? (translations[currentLang]["normal-task-done"] || 'Complete Task') : time;

        item.innerHTML = `
            <div class="checklist-box">
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span class="checklist-time" style="font-size: 15px; font-weight: 500; color: var(--text-color);">${timeLabel}</span>
        `;
        
        item.onclick = () => {
            if (isDone) {
                task.dailyProgress[dateStr] = task.dailyProgress[dateStr].filter(t => t !== time);
            } else {
                task.dailyProgress[dateStr].push(time);
            }
            saveTasks();
            renderChecklist(task, dateStr); 
        };
        checklist.appendChild(item);
    });
}

document.getElementById('cancel-complete-btn')?.addEventListener('click', () => {
    document.getElementById('mark-done-modal').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
});

document.getElementById('confirm-complete-btn')?.addEventListener('click', () => {
    document.getElementById('mark-done-modal').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
    
    if (currentActiveTask) {
        const todayStr = new Date().toISOString().split('T')[0];
        const requiredTimes = currentActiveTask.reminderTimes && currentActiveTask.reminderTimes.length > 0 ? currentActiveTask.reminderTimes.length : 1;
        const currentCompleted = (currentActiveTask.dailyProgress[todayStr] || []).length;

        if (currentCompleted >= requiredTimes) {
            currentActiveTask.completed = true;
            saveTasks();
            renderTasks();
            booAlert("Awesome! Task marked as fully complete for today! ");
        } else {
            booAlert("Progress saved! Keep going!");
        }
    }
});

/* SETTINGS & EXTERNAL LINKS */
document.getElementById('set-sync-btn')?.addEventListener('click', () => booAlert('Account Sync is active!'));
document.getElementById('sync-calendar-btn-settings')?.addEventListener('click', () => booAlert('Scroll to Profile page to connect Google Calendar!'));
document.getElementById('share-app-btn')?.addEventListener('click', () => {
    if (navigator.share) navigator.share({ title: 'Boo - To Do List', url: window.location.href });
    else booAlert('Share not supported on this browser.');
});

document.getElementById('follow-us-btn')?.addEventListener('click', () => window.open('https://youtube.com/@nangzzw', '_blank'));
document.getElementById('privacy-btn')?.addEventListener('click', () => booAlert('Privacy Policy: All data is saved safely on your device!'));

document.getElementById('language-btn')?.addEventListener('click', () => { document.getElementById('language-modal').classList.add('show'); document.getElementById('overlay').classList.add('show'); });
document.getElementById('close-lang-btn')?.addEventListener('click', () => { document.getElementById('language-modal').classList.remove('show'); document.getElementById('overlay').classList.remove('show'); });
document.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
        let lang = e.target.getAttribute('data-lang');
        if (!lang) lang = e.target.closest('.lang-option').getAttribute('data-lang');
        applyLanguage(lang);
        document.getElementById('language-modal').classList.remove('show');
        document.getElementById('overlay').classList.remove('show');
    });
});

const notifToggleBtns = document.querySelectorAll('.setting-item .toggle-btn');
if (notifToggleBtns.length > 1) {
    notifToggleBtns[1].addEventListener('click', (e) => {
        e.target.classList.toggle('active');
        if (e.target.classList.contains('active')) {
            e.target.textContent = 'On';
            if ("Notification" in window) Notification.requestPermission();
        } else e.target.textContent = 'Off';
    });
}

/* GOOGLE CALENDAR API LOGIC (WITH EMAIL INVITATIONS) */
const CLIENT_ID = '340484669276-2vmhnu567lnv2c20bunhj5oh28t00gp6.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

function gapiLoaded() { gapi.load('client', initializeGapiClient); }
async function initializeGapiClient() {
    try {
        await gapi.client.init({ discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'] });
        gapiInited = true; checkAuthStatus();
    } catch (e) {}
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID, scope: SCOPES,
        callback: (tokenResponse) => {
            if (tokenResponse.error !== undefined) throw (tokenResponse);
            isAuthorized = true;
            document.getElementById('authorize_button').style.display = 'none'; document.getElementById('signout_button').style.display = 'flex';
            booAlert("Successfully connected to Google Calendar!"); syncAllTasksToCalendar();
        },
    });
    gisInited = true;
}

function checkAuthStatus() {
    const token = gapi.client.getToken();
    if (token) {
        isAuthorized = true;
        document.getElementById('authorize_button').style.display = 'none'; document.getElementById('signout_button').style.display = 'flex';
    }
}

document.getElementById('authorize_button')?.addEventListener('click', () => { if (!isAuthorized && tokenClient) tokenClient.requestAccessToken({ prompt: 'consent' }); });

async function addEventToCalendar(task) {
    if (!isAuthorized) return;
    
    const event = {
        'summary': task.text, 
        'description': `Added via Boo\nCategory: ${task.category}`,
        'start': { 'date': task.date || new Date().toISOString().split('T')[0] },
        'end': { 'date': task.date || new Date().toISOString().split('T')[0] }
    };

    if (task.emails && task.emails.length > 0) {
        event.attendees = task.emails.map(email => ({ 'email': email.trim() }));
    }

    try { 
        await gapi.client.calendar.events.insert({ 
            'calendarId': 'primary', 
            'resource': event,
            'sendUpdates': 'all'
        }); 
        if(task.emails && task.emails.length > 0) {
            booAlert("Task saved and Invitations sent successfully! 💌");
        }
    } catch (err) {
        console.error("Calendar Sync Error", err);
    }
}

async function syncAllTasksToCalendar() {
    if (!isAuthorized) return;
    for (const task of tasks) { if (!task.completed) await addEventToCalendar(task); }
    booAlert("All pending tasks synced to Google Calendar!");
}

const gapiScript = document.createElement('script'); gapiScript.src = 'https://apis.google.com/js/api.js'; gapiScript.onload = gapiLoaded; document.head.appendChild(gapiScript);
const gisScript = document.createElement('script'); gisScript.src = 'https://accounts.google.com/gsi/client'; gisScript.onload = gisLoaded; document.head.appendChild(gisScript);
