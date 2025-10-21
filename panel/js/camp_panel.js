// panel/js/camp_panel.js - Camp Panel Logic

document.addEventListener('DOMContentLoaded', () => {
    
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutLink = document.getElementById('logoutLink');
    
    // --- UTILITIES ---
    function handleLogout() {
        localStorage.removeItem('session');
        localStorage.removeItem('nextEarnXCurrentUser');
        alert("Logged out from NextEarnX!");
        window.location.href = 'login.html';
    }

    // --- LOGOUT HANDLERS ---
    if(logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if(logoutLink) {
        logoutLink.addEventListener('click', (e) => {
             e.preventDefault();
             handleLogout();
        });
    }

    // --- CAMP BUTTON HANDLERS (Mock) ---
    document.querySelectorAll('.camp-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const action = e.currentTarget.id.replace('Btn', '');
            if(action === 'createCamp') {
                window.location.href = 'create_camp.html';
            }
            else if(action === 'viewStats') {
                alert("View Stats feature coming soon!");
            }
            // Yahan aap further logic ya naye pages par redirect kar sakte hain
        });
    });
});