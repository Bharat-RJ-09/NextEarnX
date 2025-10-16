// panel/js/make_lifafa.js - Dedicated Lifafa Creation Logic (UPDATED FOR GLOBAL TELEGRAM)

document.addEventListener('DOMContentLoaded', () => {
    
    const SETTINGS_KEY = 'nextEarnXGlobalSettings'; // Define settings key

    // NEW YOUTUBE ELEMENTS
    const checkYoutubeVideoBtn = document.getElementById('checkYoutubeVideoBtn');
    const youtubeLinkInput = document.getElementById('lifafaYoutubeLink_Normal');
    const youtubeDurationControl = document.getElementById('youtubeDurationControl');
    const watchDurationSlider = document.getElementById('watchDurationSlider');
    const watchDurationDisplay = document.getElementById('watchDurationDisplay');
    const videoTotalDurationDisplay = document.getElementById('videoTotalDuration');
    
    let videoDurationSeconds = 0; // Stores the mock duration in seconds of the YouTube video

    // --- ELEMENTS ---

    
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

    // panel/js/make_lifafa.js: REPLACEMENT BLOCK (Add this after the secondary tab switching logic, around line 200)

    // --- YOUTUBE DURATION LOGIC ---

    // 1. Check Video Button Handler (Mock Duration Fetch)
    if (checkYoutubeVideoBtn) {
        checkYoutubeVideoBtn.addEventListener('click', () => {
            const link = youtubeLinkInput.value.trim();
            youtubeDurationControl.style.display = 'none';

            if (!link || !link.startsWith('http')) {
                alert("❌ Please enter a valid YouTube link.");
                return;
            }

            // MOCK LOGIC: Simulate fetching video duration (3 to 10 minutes)
            const minTime = 180; // 3 minutes
            const maxTime = 600; // 10 minutes
            videoDurationSeconds = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
            const totalMinutes = Math.ceil(videoDurationSeconds / 60);

            // Update UI with max duration
            watchDurationSlider.max = totalMinutes;
            watchDurationSlider.value = totalMinutes; // Default to max
            videoTotalDurationDisplay.textContent = `${totalMinutes} min`;

            // Display control and update initial watch time display
            youtubeDurationControl.style.display = 'block';
            watchDurationDisplay.textContent = `${totalMinutes} min`;

            appendLog(`Video link verified (MOCK). Max duration: ${totalMinutes} minutes.`, 'info');
        });
    }

    // 2. Slider Input Handler
    if (watchDurationSlider) {
        watchDurationSlider.addEventListener('input', (e) => {
            const minutes = e.target.value;
            watchDurationDisplay.textContent = `${minutes} min`;
        });
    } 


    // --- INITIALIZE & TAB SWITCHING LOGIC ---
    getCurrentUserSession(); 
    loadGlobalSettings(); // CALL HERE
    refreshBalanceUI();
    renderLifafas();
    updateTelegramStatusUI(); // CALL HERE
 
   // --- ACCORDION TOGGLE LOGIC (FIXED FOR RELIABLE EXCLUSIVE ANIMATION) ---
    const allHeaders = document.querySelectorAll('.accordion-header');
    
    allHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.dataset.target;
            const content = document.getElementById(targetId);
            
            if (content) {
                // Check if the clicked accordion is currently active
                const wasActive = header.classList.contains('active');

                // 1. Close all open accordions first (Header and Content)
                allHeaders.forEach(otherHeader => {
                    const otherContent = document.getElementById(otherHeader.dataset.target);
                    if (otherHeader.classList.contains('active')) {
                        otherHeader.classList.remove('active');
                        if (otherContent) otherContent.classList.remove('active');
                    }
                });
                
                // 2. If the clicked accordion was NOT active (i.e., we want to open it now)
                if (!wasActive) {
                    header.classList.add('active');
                    content.classList.add('active');
                }
                // Agar wasActive true tha, toh step 1 mein woh band ho gaya, aur step 2 mein woh band hi rahega (jo ki expected hai).
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
        
        // 1. Calculate total original entries
        const totalOriginalEntries = rawUsers.split(/[,*.\s\n]+/).filter(Boolean).length;
        
        // 2. Get the final cleaned list (unique and 10-digit only)
        const validNumbers = parseAndFilterNumbers(rawUsers);
        
        const finalCount = validNumbers.length;
        const removedCount = totalOriginalEntries - finalCount;
        
        // 3. Update textarea with valid, unique numbers, separated by a comma and a newline
        // CRITICAL FIX: Join with ', \n' for visual comma and correct splitting later
        textarea.value = validNumbers.join(',\n'); 
        
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
     
 // panel/js/make_lifafa.js: REPLACEMENT BLOCK for the LIFAFA CREATION LOGIC section

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
        
        const specialUsers = parseAndFilterNumbers(rawSpecialUsers); 
        
        const youtubeLink = youtubeLinkInput.value.trim();
        
        // NEW: Get required watch duration in seconds
        let watchDurationSeconds = 0;
        if (youtubeLink && youtubeDurationControl.style.display !== 'none') {
             const requiredMinutes = parseInt(watchDurationSlider.value) || 0;
             watchDurationSeconds = requiredMinutes * 60;
        } else if (youtubeLink) {
             // If link is provided but check wasn't run, alert the user or default to a small value (let's enforce check)
             alert("⚠️ Please click 'Check Video' and set the watch duration before creating Lifafa with a YouTube link.");
             return;
        }
        
        const referCount = parseInt(document.getElementById('lifafaReferCount_Normal')?.value) || 0;
        const requiredChannels = globalSettings.telegramChannels || [];

        // TYPE-SPECIFIC FIELDS
        let typeSpecificData = {};
// ... (rest of the logic remains the same)
        
        // 1. Validation (Same as before)
// ... (Validation code) ...

        // 2. Confirmation (Same as before)
// ... (Confirmation code) ...

        // 3. Execution: Deduct and Create Lifafa Object
        const newBalance = currentBalance - totalAmount;
        setBalance(senderUsername, newBalance);

        const uniqueId = senderUsername.slice(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 9).toUpperCase() + Date.now().toString().slice(-4);
        
        const newLifafa = {
            id: uniqueId,
            creator: senderUsername,
            date: Date.now(),
            type: lifafaType, 
            title: title,
            comment: comment,
            redirectLink: redirectLink,
            accessCode: accessCode || null,
            specialUsers: specialUsers,
            requirements: {
                channels: requiredChannels,
                youtube: youtubeLink || null,
                watchDuration: watchDurationSeconds > 0 ? watchDurationSeconds : null, // NEW: Save duration
                referrals: referCount > 0 ? referCount : null,
            },
            ...typeSpecificData,
            totalAmount: totalAmount, 
            count: count,
            perClaim: perUserAmount, 
            claims: [] 
        };

        // 4. Save Lifafa & Log Transaction (Same as before)
// ... (Save and Log code) ...

        // 5. Final UI Update (Same as before)
// ... (Final UI Update code) ...
    });
});

// ... (rest of the file follows, including the fixed accordion logic)

// Logout Button (For consistency) - moved outside submit handler so it attaches once on load
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('session');
        localStorage.removeItem('nextEarnXCurrentUser');
        alert("Logged out from NextEarnX!");
        window.location.href = 'login.html';
    });
}

}); // end DOMContentLoaded