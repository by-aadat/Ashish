/**
 * SHARED AUTH / SESSION HELPER
 * Include with <script src="auth.js"></script> BEFORE your page's own script.
 * Session is stored in sessionStorage (clears when the browser tab closes).
 */

const HRMS_SESSION_KEY = "hrms_session";

function hrmsGetSession() {
    try {
        const raw = sessionStorage.getItem(HRMS_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function hrmsSetSession(profile) {
    sessionStorage.setItem(HRMS_SESSION_KEY, JSON.stringify(profile));
}

function hrmsLogout() {
    sessionStorage.removeItem(HRMS_SESSION_KEY);
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
