/**
 * SHARED AUTH / SESSION HELPER
 */

const HRMS_SESSION_KEY = "hrms_session";
const HRMS_REMEMBER_KEY = "hrms_remember";
const HRMS_LAST_ACTIVITY_KEY = "hrms_last_activity";
const HRMS_SESSION_TIMEOUT_MINUTES = 30;

function hrmsGetStorage() {
    if (localStorage.getItem(HRMS_SESSION_KEY)) return localStorage;
    return sessionStorage;
}

function hrmsGetSession() {
    try {
        const store = hrmsGetStorage();
        const raw = store.getItem(HRMS_SESSION_KEY);
        if (!raw) return null;

        const lastActivity = Number(store.getItem(HRMS_LAST_ACTIVITY_KEY) || 0);
        const minutesIdle = (Date.now() - lastActivity) / 60000;
        if (lastActivity && minutesIdle > HRMS_SESSION_TIMEOUT_MINUTES) {
            hrmsClearSession();
            return null;
        }

        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function hrmsSetSession(profile, rememberMe) {
    hrmsClearSession();
    const store = rememberMe ? localStorage : sessionStorage;
    store.setItem(HRMS_SESSION_KEY, JSON.stringify(profile));
    store.setItem(HRMS_LAST_ACTIVITY_KEY, String(Date.now()));
}

function hrmsClearSession() {
    [localStorage, sessionStorage].forEach(function (store) {
        store.removeItem(HRMS_SESSION_KEY);
        store.removeItem(HRMS_LAST_ACTIVITY_KEY);
    });
}

function hrmsTouchActivity() {
    const store = hrmsGetStorage();
    if (store.getItem(HRMS_SESSION_KEY)) {
        store.setItem(HRMS_LAST_ACTIVITY_KEY, String(Date.now()));
    }
}

function hrmsLogout() {
    hrmsClearSession();
    window.location.href = "login.html";
}

function hrmsRequireAuth(requireAdmin) {
    // Hide body immediately to avoid visual flash
    const style = document.createElement('style');
    style.id = "auth-hide-style";
    style.innerHTML = 'body { display: none !important; }';
    document.head.appendChild(style);

    const session = hrmsGetSession();

    if (!session || !session.employeeId) {
        window.location.href = "login.html";
        return null;
    }

    if (requireAdmin && (session.role || "").toLowerCase() !== "admin") {
        alert("Sirf Admin is page ko access kar sakta hai.");
        window.location.href = "dashboard.html";
        return null;
    }

    // Unhide once verified
    document.addEventListener("DOMContentLoaded", function () {
        const hideStyle = document.getElementById("auth-hide-style");
        if (hideStyle) hideStyle.remove();

        const badge = document.getElementById("userBadge");
        if (badge) {
            badge.innerHTML =
                `👤 ${session.name} (${session.role}) ` +
                `<button onclick="hrmsLogout()" class="logout-btn">Logout</button>`;
        }

        if ((session.role || "").toLowerCase() !== "admin") {
            document.querySelectorAll(".admin-only").forEach(function (el) {
                el.style.display = "none";
            });
        }
    });

    ["click", "keydown", "scroll", "mousemove", "touchstart"].forEach(function (evt) {
        document.addEventListener(evt, hrmsTouchActivity, { passive: true });
    });

    return session;
}
