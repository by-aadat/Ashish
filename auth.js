/**
 * SHARED AUTH / SESSION HELPER
 * Include with <script src="auth.js"></script> BEFORE your page's own script.
 *
 * Session storage strategy:
 * - "Remember Me" checked at login  -> localStorage (survives closing the browser)
 * - "Remember Me" unchecked         -> sessionStorage (clears when the tab closes)
 * Either way the same HRMS_SESSION_KEY is used, and hrmsGetSession() checks
 * both locations so the rest of the app doesn't need to know which one is active.
 *
 * Session Timeout: session auto-expires after HRMS_SESSION_TIMEOUT_MINUTES of
 * inactivity (any click/keypress/scroll resets the timer). This applies to
 * both storage modes.
 */

const HRMS_SESSION_KEY = "hrms_session";
const HRMS_REMEMBER_KEY = "hrms_remember";
const HRMS_LAST_ACTIVITY_KEY = "hrms_last_activity";
const HRMS_SESSION_TIMEOUT_MINUTES = 30;

function hrmsGetStorage() {
    // Whichever storage actually has the session wins; default to sessionStorage.
    if (localStorage.getItem(HRMS_SESSION_KEY)) return localStorage;
    return sessionStorage;
}

function hrmsGetSession() {
    try {
        const store = hrmsGetStorage();
        const raw = store.getItem(HRMS_SESSION_KEY);
        if (!raw) return null;

        // Enforce inactivity timeout.
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
    hrmsClearSession(); // avoid stale copies sitting in the other storage
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

/**
 * Call at the top of every protected page.
 * requireAdmin = true -> only Admin role allowed, else redirected to dashboard.
 * Returns the session object if allowed (also injects the user badge + logout
 * button into any element with id="userBadge", and hides elements with
 * class="admin-only" for non-admins).
 */
function hrmsRequireAuth(requireAdmin) {
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

    // Reset the inactivity timer on any user interaction.
    ["click", "keydown", "scroll", "mousemove", "touchstart"].forEach(function (evt) {
        document.addEventListener(evt, hrmsTouchActivity, { passive: true });
    });

    document.addEventListener("DOMContentLoaded", function () {
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

    return session;
}
