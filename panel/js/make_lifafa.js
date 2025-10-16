// panel/js/make_lifafa.js - Dedicated Lifafa Creation Logic (REFINED AND FRESH)

document.addEventListener('DOMContentLoaded', () => {
    
    const SETTINGS_KEY = 'nextEarnXGlobalSettings';
    
    // UI Elements
    const currentBalanceDisplay = document.getElementById('currentBalanceDisplay'); 
    const logArea = document.getElementById('logArea');
    const logoutBtn = document.getElementById('logoutBtn');
    const currentChannelCountDisplay = document.getElementById('currentChannelCount'); 
    
    // Lifafa Form Elements (Normal Lifafa is the default for submission)
    const activeLifafasList = document.getElementById('activeLifafasList');

    // ACCORDION ELEMENTS
    const allAccordionHeaders = document.querySelectorAll('.accordion-header');
    
    // NEW YOUTUBE ELEMENTS
    const checkYoutubeVideoBtn = document.getElementById('checkYoutubeVideoBtn');
    const youtubeLinkInput = document.getElementById('lifafaYoutubeLink_Normal');
    const youtubeVideoInfoContainer = document.getElementById('youtubeVideoInfoContainer');
    const videoThumbnail = document.getElementById('videoThumbnail');
    const videoTitleDisplay = document.getElementById('videoTitle');
    const videoTotalDurationDisplay = document.getElementById('videoTotalDurationDisplay');
    const watchDurationSlider = document.getElementById('watchDurationSlider');
    const watchDurationDisplay = document.getElementById('watchDurationDisplay');

    // SCRATCH SLIDER ELEMENT
    const scratchSlider = document.getElementById('percentageSlider_Scratch');
    const sliderValueDisplay = document.getElementById('sliderValue_Scratch');


    // LIFAFA LIMITS
    const MIN_LIFAFA_AMOUNT = 10;
    const LIFAFA_STORAGE_KEY = 'nextEarnXLifafas'; 
    
    // CRITICAL: Global Balance and History Keys
    const GLOBAL_BALANCE_KEY = 'nextEarnXBalance'; 
    const GLOBAL_HISTORY_KEY = 'nextEarnXHistory'; 

    let senderUsername = '';
    let globalSettings = {}; 
    let videoDurationSeconds = 0; // Stores the mock duration in seconds

    // --- UTILITIES ---
    
    function getCurrentUserSession() {
        try {
            const user = JSON.parse(localStorage.getItem('nextEarnXCurrentUser'));
            senderUsername = user ? user.username : ''; 
        } catch { return null; }
    }
    
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

    // UTILITY: Parse and Filter Numbers (For Special Users)
    function parseAndFilterNumbers(rawText) {
        if (!rawText) return [];
        
        // Split by all recognized separators (comma, asterisk, period, space, or newline)
        const potentialNumbers = rawText.split(/[,*.\s\n]+/).filter(Boolean);
        
        // Filter for valid 10-digit numeric strings
        const validNumbers = potentialNumbers.filter(n => 
            /^\d{10}$/.test(n.trim())
        );
        
        // Return only unique numbers using a Set, and convert back to an Array.
        return Array.from(new Set(validNumbers));
    }

    // UTILITY: YouTube ID Extractor (Mock helper)
    function getYoutubeId(url) {
        const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
    
    // UTILITY: Time Formatter
    function formatTime(totalSeconds) {
        if (isNaN(totalSeconds) || totalSeconds < 0) return "0:00";
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        
        let result = "";
        if (hours > 0) result += `${hours}:`;
        result += `${minutes.toString().padStart(hours > 0 ? 2 : 1, '0')}:${seconds.toString().padStart(2, '0')}`;
        return result;
    }

    // MOCK: Fetch Video Info
    function fetchYoutubeInfo(videoId) {
        if (!videoId) return null;

        // Mock duration in seconds (4 minutes (240s) to 15 minutes (900s))
        const mockDuration = Math.floor(Math.random() * (900 - 240 + 1)) + 240; 
        
        return {
            title: `NextEarnX Promotion - New Lifafa Feature! (Video: ${videoId.slice(0, 4)})`, 
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            durationSeconds: mockDuration
        };
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
                    <br>Link: <span class="link" data-link="${window.location.origin}/panel/claim.html?id=${l.id}" title="Click to copy">${window.location.origin}/panel/claim.html?id=${l.id.slice(0, 8)}...</span>
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
    loadGlobalSettings();
    refreshBalanceUI();
    renderLifafas();
    updateTelegramStatusUI();


    // --- ACCORDION TOGGLE LOGIC (FIXED) ---
    allAccordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.dataset.target;
            const content = document.getElementById(targetId);
            
            if (content) {
                const wasActive = header.classList.contains('active');

                // 1. Close all open accordions first 
                allAccordionHeaders.forEach(otherHeader => {
                    const otherContent = document.getElementById(otherHeader.dataset.target);
                    if (otherHeader.classList.contains('active')) {
                        otherHeader.classList.remove('active');
                        if (otherContent) otherContent.classList.remove('active');
                    }
                });
                
                // 2. If the clicked accordion was NOT active, open it
                if (!wasActive) {
                    header.classList.add('active');
                    content.classList.add('active');
                }
            }
        });
    });

    // --- SECONDARY TAB SWITCHING LOGIC (Lifafa Types) ---
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

    // --- SPECIAL USERS CHECK LOGIC (FIXED) ---
    document.querySelector('#specialUsersContent .check-btn')?.addEventListener('click', () => {
        const rawUsers = document.getElementById('lifafaSpecialUsers_Normal').value.trim();
        const textarea = document.getElementById('lifafaSpecialUsers_Normal');

        if (!rawUsers) {
             alert('Enter mobile numbers first!');
             return;
        }
        
        const totalOriginalEntries = rawUsers.split(/[,*.\s\n]+/).filter(Boolean).length;
        const validNumbers = parseAndFilterNumbers(rawUsers);
        
        const finalCount = validNumbers.length;
        const removedCount = totalOriginalEntries - finalCount;
        
        // Update textarea with valid, unique numbers, separated by a comma and a newline
        textarea.value = validNumbers.join(',\n'); 
        
        if (finalCount === 0) {
            alert("❌ No valid 10-digit unique numbers found after filtering.");
            appendLog('Error: No valid 10-digit numbers found.', 'error');
        } else {
             alert(`✅ Filtered and kept ${finalCount} valid 10-digit numbers. Removed ${removedCount} invalid entries/duplicates.`);
             appendLog(`Filtered: ${finalCount} valid numbers found for Special Users. Removed: ${removedCount}.`, 'success');
        }
    });

    // --- SCRATCH LIFAFA SLIDER LISTENER ---
    if (scratchSlider && sliderValueDisplay) {
        scratchSlider.addEventListener('input', (e) => {
            sliderValueDisplay.textContent = `${e.target.value}% Luck`;
        });
    }

    // --- YOUTUBE CHECK AND SLIDER LOGIC (FINAL) ---
    
    // 1. Check Video Button Handler
    if (checkYoutubeVideoBtn) {
        checkYoutubeVideoBtn.addEventListener('click', () => {
            const link = youtubeLinkInput.value.trim();
            youtubeVideoInfoContainer.style.display = 'none';
            
            const videoId = getYoutubeId(link);

            if (!link || !videoId) {
                alert("❌ Please enter a valid YouTube video URL.");
                return;
            }

            const videoInfo = fetchYoutubeInfo(videoId);
            if (!videoInfo) return; 

            videoDurationSeconds = videoInfo.durationSeconds;
            // Get total minutes, rounded down for max slider value (e.g., 5 min 59 sec = 5 min max)
            const totalMinutes = Math.floor(videoDurationSeconds / 60);
            
            if (totalMinutes < 1) {
                alert("❌ Video length is too short (less than 1 minute).");
                return;
            }

            // Update UI with video details
            videoThumbnail.src = videoInfo.thumbnailUrl;
            videoThumbnail.style.display = 'block';
            videoTitleDisplay.textContent = videoInfo.title;
            videoTotalDurationDisplay.textContent = formatTime(videoDurationSeconds);

            // Update Slider: Max value is total minutes (Min is always 1)
            watchDurationSlider.max = totalMinutes;
            watchDurationSlider.value = totalMinutes; // Default to max
            
            // Update Duration Displays
            watchDurationDisplay.textContent = `${totalMinutes} min`;
            
            // Show Container
            youtubeVideoInfoContainer.style.display = 'block';

            appendLog(`Video data retrieved. Total length: ${formatTime(videoDurationSeconds)}.`, 'success');
        });
    }

    // 2. Slider Input Handler
    if (watchDurationSlider) {
        watchDurationSlider.addEventListener('input', (e) => {
            const minutes = e.target.value;
            watchDurationDisplay.textContent = `${minutes} min`;
        });
    }


   // panel/js/make_lifafa.js: REPLACEMENT BLOCK for the LIFAFA CREATION LOGIC section (Final version with Optional Refer Reward)

// ------------------------------------------
// --- LIFAFA CREATION LOGIC (ALL TYPES) ---
// ------------------------------------------

document.querySelectorAll('.lifafa-form-new').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const lifafaType = form.dataset.type; 
        
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
        
        // WATCH DURATION (from YouTube Check)
        let requiredWatchDuration = null;
        if (youtubeLink) {
             if (youtubeVideoInfoContainer.style.display === 'none' || !watchDurationSlider.value) {
                 alert("⚠️ Please click 'Check Video', verify the video, and set the watch duration.");
                 return;
             }
             const requiredMinutes = parseInt(watchDurationSlider.value) || 0;
             requiredWatchDuration = requiredMinutes * 60;
             if (requiredWatchDuration === 0) {
                 alert("⚠️ Required watch time cannot be 0 minutes. Please adjust the slider.");
                 return;
             }
        }
        
        // NEW: REFERRAL REWARD FIELDS
        const referAmountInput = document.getElementById('lifafaReferAmount_Normal');
        const referCommentInput = document.getElementById('lifafaReferComment_Normal');
        
        const referAmount = parseFloat(referAmountInput.value) || 0;
        const referComment = referCommentInput.value.trim();

        if (referAmount > 0 && referAmount < 0.01) {
            alert("⚠️ Refer Amount must be at least ₹0.01 if set.");
            return;
        }

        const requiredChannels = globalSettings.telegramChannels || [];

        // TYPE-SPECIFIC FIELDS
        let typeSpecificData = {};
        if (lifafaType === 'Scratch') {
            const luckPercentage = parseInt(document.getElementById('percentageSlider_Scratch').value) || 100;
            typeSpecificData.luckPercentage = luckPercentage;
        }

        const totalAmount = perUserAmount * count; 
        const currentBalance = getBalance(senderUsername);

        // 1. Validation
        if (!title) { appendLog('Error: Lifafa Title is required.', 'error'); return; }
        if (isNaN(perUserAmount) || perUserAmount < 0.01) {
            appendLog(`Error: Per user amount must be at least ₹0.01.`, 'error');
            return;
        }
        if (isNaN(count) || count < 2) {
            appendLog('Error: Minimum claims/users is 2.', 'error');
            return;
        }
        if (totalAmount < MIN_LIFAFA_AMOUNT) {
             appendLog(`Error: Minimum Lifafa total amount is ₹${MIN_LIFAFA_AMOUNT}.`, 'error');
             return;
        }
        if (currentBalance < totalAmount) {
            appendLog(`Error: Insufficient balance. Available: ₹${currentBalance.toFixed(2)}. Total Cost: ₹${totalAmount.toFixed(2)}`, 'error');
            return;
        }

        // 2. Confirmation
        if (!confirm(`Confirm creation of ${lifafaType} Lifafa worth ₹${totalAmount.toFixed(2)} for ${count} users?`)) {
            return;
        }

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
                watchDuration: requiredWatchDuration,
            },
            // NEW: REFERRAL REWARD OBJECT
            referralReward: referAmount > 0 ? {
                amount: referAmount,
                comment: referComment
            } : null,
            ...typeSpecificData,
            totalAmount: totalAmount, 
            count: count,
            perClaim: perUserAmount, 
            claims: [] 
        };

        // 4. Save Lifafa & Log Transaction
        let lifafas = loadLifafas();
        lifafas.push(newLifafa);
        saveLifafas(lifafas);
        
        let senderHistory = getHistory(senderUsername);
        senderHistory.push({ date: Date.now(), type: 'debit', amount: totalAmount, txnId: `LIFAFA_CREATED_${lifafaType}_` + uniqueId, note: `Created ${lifafaType} Lifafa: ${title}` });
        saveHistory(senderUsername, senderHistory);


        // 5. Final UI Update
        refreshBalanceUI();
        renderLifafas();
        appendLog(`SUCCESS: ${lifafaType} Lifafa created! Share link with ID: ${uniqueId}`, 'success');
        
        const linkMsg = document.createElement('p');
        linkMsg.innerHTML = `<span style="color: #00e0ff; font-weight:bold;">Link:</span> ${window.location.origin}/panel/claim.html?id=${uniqueId}`;
        logArea.prepend(linkMsg);
        
        form.reset(); 
        youtubeLinkInput.value = ''; // Reset YouTube link
        youtubeVideoInfoContainer.style.display = 'none';
        referAmountInput.value = ''; // Reset new fields
        referCommentInput.value = ''; // Reset new fields
    });
});
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