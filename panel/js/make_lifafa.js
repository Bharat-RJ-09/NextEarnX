// panel/js/make_lifafa.js - Dedicated Lifafa Creation Logic (UPDATED FOR GLOBAL TELEGRAM)

document.addEventListener('DOMContentLoaded', () => {
    
    const SETTINGS_KEY = 'nextEarnXGlobalSettings'; // Define settings key
    
    // UI Elements
    const currentBalanceDisplay = document.getElementById('currentBalanceDisplay'); 
    const logArea = document.getElementById('logArea');
    const logoutBtn = document.getElementById('logoutBtn');
    const currentChannelCountDisplay = document.getElementById('currentChannelCount'); // ADDED
    
    // Lifafa Form Elements (Normal Lifafa is the default for submission)
    const normalLifafaForm = document.getElementById('normalLifafaForm');
    const lifafaCountInput = document.getElementById('lifafaCount_Normal'); 
    const lifafaPerUserAmountInput = document.getElementById('lifafaPerUserAmount_Normal');
    const activeLifafasList = document.getElementById('activeLifafasList');

    // LIFAFA LIMITS
    const MIN_LIFAFA_AMOUNT = 10;
    const LIFAFA_STORAGE_KEY = 'nextEarnXLifafas'; 
    
    // CRITICAL: Global Balance and History Keys
    const GLOBAL_BALANCE_KEY = 'nextEarnXBalance'; 
    const GLOBAL_HISTORY_KEY = 'nextEarnXHistory'; 
    const USER_STORAGE_KEY = 'nextEarnXUsers';

    let senderUsername = '';
    let globalSettings = {}; // ADDED Global Settings container

    // --- UTILITIES ---
    
    function getCurrentUserSession() {
        try {
            const user = JSON.parse(localStorage.getItem('nextEarnXCurrentUser'));
            senderUsername = user ? user.username : ''; 
        } catch { return null; }
    }

    function appendLog(message, type = 'info') {
        const p = document.createElement('p');
        p.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
        p.style.color = type === 'success' ? '#aaffaa' : type === 'error' ? '#ffaaaa' : '#e0e0e0';
        logArea.prepend(p);
    }
    
    // NEW UTILITY: Parse and Filter Numbers (FIXED)
    function parseAndFilterNumbers(rawText) {
        if (!rawText) return [];
        
        // 1. Split by all recognized separators (comma, asterisk, period, space, or newline)
        const potentialNumbers = rawText.split(/[,*.\s\n]+/).filter(Boolean);
        
        // 2. Filter for valid 10-digit numeric strings (CRITICAL: /^\d{10}$/ regex ensures 10 digits only)
        const validNumbers = potentialNumbers.filter(n => 
            /^\d{10}$/.test(n.trim())
        );
        
        // 3. Return only unique numbers using a Set, and convert back to an Array.
        return Array.from(new Set(validNumbers));
    }
    
    // ADDED: Load Global Settings
    function loadGlobalSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
            globalSettings = settings || {};
        } catch {
            globalSettings = {};
        }
    }

    function getBalance(username) {
        if (username === senderUsername) {
            return parseFloat(localStorage.getItem(GLOBAL_BALANCE_KEY) || '0.00');
        }
        return parseFloat(localStorage.getItem(`nextEarnXBalance_${username}`) || '0.00'); 
    }
    
    function setBalance(username, balance) {
        if (username === senderUsername) {
            localStorage.setItem(GLOBAL_BALANCE_KEY, balance.toFixed(2));
            return;
        }
        localStorage.setItem(`nextEarnXBalance_${username}`, balance.toFixed(2));
    }
    
    function getHistory(username) {
        const key = (username === senderUsername) ? GLOBAL_HISTORY_KEY : `nextEarnXHistory_${username}`;
        try { return JSON.parse(localStorage.getItem(key) || '[]'); }
        catch { return []; }
    }

    function saveHistory(username, history) {
        const key = (username === senderUsername) ? GLOBAL_HISTORY_KEY : `nextEarnXHistory_${username}`;
        localStorage.setItem(key, JSON.stringify(history));
    }
    
    function loadLifafas() {
        try { return JSON.parse(localStorage.getItem(LIFAFA_STORAGE_KEY) || "[]"); }
        catch { return []; }
    }
    
    function saveLifafas(lifafas) {
        localStorage.setItem(LIFAFA_STORAGE_KEY, JSON.stringify(lifafas));
    }
    
    function refreshBalanceUI() {
        const currentBalance = getBalance(senderUsername); 
        currentBalanceDisplay.textContent = `₹${currentBalance.toFixed(2)}`;
    }

    function appendLog(message, type = 'info') {
        const p = document.createElement('p');
        p.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
        p.style.color = type === 'success' ? '#aaffaa' : type === 'error' ? '#ffaaaa' : '#e0e0e0';
        logArea.prepend(p);
    }
    
    // ADDED: Update Telegram Channel Status on UI
    function updateTelegramStatusUI() {
        const channels = globalSettings.telegramChannels || [];
        const count = channels.length;
        
        if (currentChannelCountDisplay) {
            if (count > 0) {
                 currentChannelCountDisplay.textContent = `(Currently ${count} channel(s) are required globally)`;
                 currentChannelCountDisplay.style.color = '#aaffaa';
            } else {
                 currentChannelCountDisplay.textContent = `(No channels required yet. Click 'Manage Channels' to add.)`;
                 currentChannelCountDisplay.style.color = '#ffcc00';
            }
        }
    }
    
    // --- LIFAFA LIST RENDERING ---
    function renderLifafas() {
        const lifafas = loadLifafas().filter(l => l.creator === senderUsername);
        activeLifafasList.innerHTML = '';
        
        if (lifafas.length === 0) {
            activeLifafasList.innerHTML = '<p>No active giveaways.</p>';
            return;
        }

        lifafas.forEach(l => {
            const item = document.createElement('div');
            item.classList.add('lifafa-item');
            
            const claimedCount = l.claims.length;
            const statusText = (claimedCount === l.count) ? 'CLOSED' : `${claimedCount}/${l.count} Claimed`;
            
            const totalAmount = l.perClaim * l.count;

            item.innerHTML = `
                <p>
                    <strong>₹${totalAmount.toFixed(2)}</strong> | ${statusText}
                    <br>Link: <span class="link" data-link="${window.location.origin}/claim.html?id=${l.id}" title="Click to copy">${window.location.origin}/claim.html?id=${l.id}</span>
                </p>
                <p style="color:#777; font-size:11px;">Created: ${new Date(l.date).toLocaleString()}</p>
            `;
            activeLifafasList.appendChild(item);
            
            // Attach copy listener
            item.querySelector('.link').addEventListener('click', (e) => {
                const linkToCopy = e.target.dataset.link;
                navigator.clipboard.writeText(linkToCopy);
                alert('Lifafa Link copied to clipboard!');
            });
        });
    }

    // --- INITIALIZE & TAB SWITCHING LOGIC ---
    getCurrentUserSession(); 
    loadGlobalSettings(); // CALL HERE
    refreshBalanceUI();
    renderLifafas();
    updateTelegramStatusUI(); // CALL HERE
 
   // --- ACCORDION TOGGLE LOGIC (UPDATED FOR SMOOTH ANIMATION) ---
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.dataset.target;
            const content = document.getElementById(targetId);
            
            if (content) {
                // Toggle 'active' class on both header and content
                header.classList.toggle('active');
                content.classList.toggle('active');
                
                // Since the content contained an old display logic, this simple toggle 
                // ensures CSS's max-height transition takes over smoothly.
                
                // Close other open accordions (optional, but good UX for features)
                document.querySelectorAll('.accordion-header').forEach(otherHeader => {
                    if (otherHeader !== header && otherHeader.classList.contains('active')) {
                        otherHeader.classList.remove('active');
                        document.getElementById(otherHeader.dataset.target).classList.remove('active');
                    }
                });
            }
        });
    });

    // Mock Check Button Listener (Special Users) - FIXED
    document.querySelector('#specialUsersContent .check-btn')?.addEventListener('click', () => {
        const rawUsers = document.getElementById('lifafaSpecialUsers_Normal').value.trim();
        const textarea = document.getElementById('lifafaSpecialUsers_Normal');

        if (!rawUsers) {
             alert('Enter mobile numbers first!');
             return;
        }
        
        // 1. Calculate total original entries (including duplicates and invalid)
        const totalOriginalEntries = rawUsers.split(/[,*.\s\n]+/).filter(Boolean).length;
        
        // 2. Get the final cleaned list (unique and 10-digit only)
        const validNumbers = parseAndFilterNumbers(rawUsers);
        
        const finalCount = validNumbers.length;
        const removedCount = totalOriginalEntries - finalCount;
        
        // 3. Update textarea with only valid, unique numbers (separated by newline for readability)
        textarea.value = validNumbers.join('\n');
        
        if (finalCount === 0) {
            alert("❌ No valid 10-digit unique numbers found after filtering.");
            appendLog('Error: No valid 10-digit numbers found.', 'error');
        } else {
             alert(`✅ Filtered and kept ${finalCount} valid 10-digit numbers. Removed ${removedCount} invalid entries/duplicates.`);
             appendLog(`Filtered: ${finalCount} valid numbers found for Special Users. Removed: ${removedCount}.`, 'success');
        }
    });

    // Secondary Tab Switching Logic (Lifafa Types)
    document.querySelectorAll('.lifafa-tab-secondary').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.dataset.lifafaType;
            document.querySelectorAll('.lifafa-tab-secondary').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.lifafa-form-new').forEach(f => f.style.display = 'none');
            
            btn.classList.add('active');
            document.getElementById(`${type.toLowerCase()}LifafaForm`).style.display = 'block';
            logArea.innerHTML = `<p>Ready to create ${type} Lifafa...</p>`;
            
            e.stopPropagation(); 
        });
    });

    // ------------------------------------------
     
 // --- LIFAFA CREATION LOGIC (ALL TYPES) ---
// ------------------------------------------

document.querySelectorAll('.lifafa-form-new').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const lifafaType = form.dataset.type; // Get type from data-type attribute
        
        const perUserAmount = parseFloat(document.getElementById(`lifafaPerUserAmount_${lifafaType}`).value);
        const count = parseInt(document.getElementById(`lifafaCount_${lifafaType}`).value);
        const title = document.getElementById(`lifafaTitle_${lifafaType}`).value.trim();
        const comment = document.getElementById(`paymentComment_${lifafaType}`).value.trim();
        const redirectLink = document.getElementById(`redirectLink_${lifafaType}`).value.trim();
        
        // ADVANCED FIELDS 
        const accessCode = document.getElementById('lifafaAccessCode_Normal').value.trim();
        const rawSpecialUsers = document.getElementById('lifafaSpecialUsers_Normal').value.trim();
        
        // CRITICAL FIX: Filter and get only valid 10-digit unique mobile numbers
        const specialUsers = parseAndFilterNumbers(rawSpecialUsers); 
        
        const youtubeLink = document.getElementById('lifafaYoutubeLink_Normal')?.value.trim();
        const referCount = parseInt(document.getElementById('lifafaReferCount_Normal')?.value) || 0;
        const requiredChannels = globalSettings.telegramChannels || [];
    // Logout Button (For consistency)
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('session');
            localStorage.removeItem('nextEarnXCurrentUser');
            alert("Logged out from NextEarnX!");
            window.location.href = 'login.html';
        });
    }
});

// End of make_lifafa.js