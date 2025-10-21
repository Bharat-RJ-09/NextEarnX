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
            alert(`Feature under construction: You clicked '${action}'.\n(Next Step: Implement actual functionality for ${action} page/modal)`);
            // Yahan aap further logic ya naye pages par redirect kar sakte hain
        });
    });
});