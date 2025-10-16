// panel/js/make_lifafa.js - Dedicated Lifafa Creation Logic (FINAL REFINED VERSION WITH DRAFTS)

document.addEventListener('DOMContentLoaded', () => {
    
    const SETTINGS_KEY = 'nextEarnXGlobalSettings';
    const DRAFT_KEY = 'nextEarnXLifafaDrafts';
    
    // UI Elements
    const currentBalanceDisplay = document.getElementById('currentBalanceDisplay'); 
    const logArea = document.getElementById('logArea');
    const logoutBtn = document.getElementById('logoutBtn');
    const currentChannelCountDisplay = document.getElementById('currentChannelCount'); 
    
    // Lifafa Form Elements (Normal Lifafa is the default for submission)
    const activeLifafasList = document.getElementById('activeLifafasList');

    // ACCORDION ELEMENTS
    const allAccordionHeaders = document.querySelectorAll('.accordion-header');
    
    // YOUTUBE ELEMENTS
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
    
    // DRAFT MODAL ELEMENTS
    const draftModal = document.getElementById('draftModal');
    const openDraftModalBtn = document.getElementById('openDraftModalBtn');
    const closeDraftModalBtn = document.getElementById('closeDraftModalBtn');
    const draftCountDisplay = document.getElementById('draftCount');
    const draftListContainer = document.getElementById('draftListContainer');
    const clearAllDraftsBtn = document.getElementById('clearAllDraftsBtn');


    // LIFAFA LIMITS
    const MIN_LIFAFA_AMOUNT = 10;
    const LIFAFA_STORAGE_KEY = 'nextEarnXLifafas'; 
    
    // CRITICAL: Global Balance and History Keys
    const GLOBAL_BALANCE_KEY = 'nextEarnXBalance'; 
    const GLOBAL_HISTORY_KEY = 'nextEarnXHistory'; 

    let senderUsername = '';
    let globalSettings = {}; 
    let videoDurationSeconds = 0; 
    let currentLifafaType = 'Normal';

    // --- UTILITIES (REFINED AND STABLE) ---
    
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
        
        const potentialNumbers = rawText.split(/[,*.\s\n]+/).filter(Boolean);
        
        const validNumbers = potentialNumbers.filter(n => 
            /^\d{10}$/.test(n.trim())
        );
        
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

        const mockDuration = Math.floor(Math.random() * (900 - 240 + 1)) + 240; 
        
        return {
            title: `NextEarnX Promotion - New Lifafa Feature! (Video: ${videoId.slice(0, 4)})`, 
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            durationSeconds: mockDuration
        };
    }
    
    // --- DRAFT UTILITIES (NEW) ---
    
    function loadDrafts() {
        try {
            const globalDrafts = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]");
            // Filter drafts that belong to the current user
            return globalDrafts.filter(d => d.creator === senderUsername);
        } catch {
            return [];
        }
    }
    
    function saveDrafts(drafts) {
        const otherUserDrafts = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]").filter(d => d.creator !== senderUsername);
        localStorage.setItem(DRAFT_KEY, JSON.stringify([...otherUserDrafts, ...drafts]));
        renderDraftList();
    }
    
    function autoSaveLifafa() {
        // Ensure senderUsername is set before saving
        if (!senderUsername) return; 

        const formId = `${currentLifafaType.toLowerCase()}LifafaForm`;
        const form = document.getElementById(formId);
        if (!form) return;
        
        const timestamp = Date.now();
        
        // Collect all form data
        const formData = {
            type: currentLifafaType,
            title: document.getElementById(`lifafaTitle_${currentLifafaType}`)?.value || 'Untitled',
            data: {}
        };
        
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
             // Handle select element value correctly
             formData.data[input.id] = input.value;
        });

        // Collect Advanced Settings (since they are common and share IDs)
        formData.data.lifafaAccessCode_Normal = document.getElementById('lifafaAccessCode_Normal')?.value || '';
        formData.data.lifafaSpecialUsers_Normal = document.getElementById('lifafaSpecialUsers_Normal')?.value || '';
        formData.data.lifafaYoutubeLink_Normal = document.getElementById('lifafaYoutubeLink_Normal')?.value || '';
        formData.data.lifafaReferAmount_Normal = document.getElementById('lifafaReferAmount_Normal')?.value || '';
        formData.data.lifafaReferComment_Normal = document.getElementById('lifafaReferComment_Normal')?.value || '';
        
        // --- Handle Scratch Slider Value Save (CRITICAL FIX) ---
        if (currentLifafaType === 'Scratch') {
            formData.data.percentageSlider_Scratch = document.getElementById('percentageSlider_Scratch')?.value || '100';
        }
        
        const draftKey = senderUsername + '-' + currentLifafaType;
        
        let allDrafts = loadDrafts();
        
        const existingIndex = allDrafts.findIndex(d => d.key === draftKey);
        
        const newDraft = {
            key: draftKey,
            creator: senderUsername,
            type: currentLifafaType,
            title: formData.title || `${currentLifafaType} Draft`,
            date: timestamp,
            data: formData.data
        };

        if (existingIndex !== -1) {
            allDrafts[existingIndex] = newDraft;
        } else {
            allDrafts.push(newDraft);
        }
        
        saveDrafts(allDrafts); // Uses helper function to merge and save
    }
    
    function loadDraftToForm(draftData) {
        // 1. Switch to correct form tab
        const formType = draftData.type;
        currentLifafaType = formType;
        document.querySelectorAll('.lifafa-tab-secondary').forEach(b => {
             b.classList.remove('active');
             if (b.dataset.lifafaType === formType) b.classList.add('active');
        });
        document.querySelectorAll('.lifafa-form-new').forEach(f => {
            f.style.display = (f.dataset.type === formType) ? 'block' : 'none';
        });
        
        // 2. Fill inputs
        for (const id in draftData.data) {
            const input = document.getElementById(id);
            if (input) {
                input.value = draftData.data[id];
            }
        }
        
        // 3. Special handling for YouTube related fields: Hide the info box
        if (youtubeVideoInfoContainer) youtubeVideoInfoContainer.style.display = 'none'; 

        // 4. Close Modal and Log
        draftModal.style.display = 'none';
        appendLog(`Draft for ${draftData.title} (${formType}) loaded.`, 'info');
    }

    function renderDraftList() {
        const drafts = loadDrafts();
        draftCountDisplay.textContent = drafts.length;
        draftListContainer.innerHTML = '';

        if (drafts.length === 0) {
            draftListContainer.innerHTML = '<p style="color:#aaa;">No saved drafts found.</p>';
            return;
        }

        drafts.forEach(draft => {
            const item = document.createElement('div');
            item.classList.add('draft-item');
            
            const timeAgo = Math.ceil((Date.now() - draft.date) / 60000); 
            
            item.innerHTML = `
                <div class="draft-item-info" data-key="${draft.key}" title="Click to load">
                    ${draft.title} (${draft.type}) <small style="color:#aaa; display:block;">Saved ${timeAgo} min ago</small>
                </div>
                <button class="draft-item-delete" data-key="${draft.key}"><i class="ri-delete-bin-line"></i></button>
            `;
            draftListContainer.appendChild(item);
        });

        // Attach listeners for loading and deleting single draft
        document.querySelectorAll('.draft-item-info').forEach(info => {
            info.addEventListener('click', (e) => {
                const key = e.target.dataset.key || e.target.closest('.draft-item-info').dataset.key;
                const draft = drafts.find(d => d.key === key);
                if (draft) loadDraftToForm(draft);
            });
        });
        
        document.querySelectorAll('.draft-item-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.target.dataset.key || e.target.closest('button').dataset.key;
                let allDrafts = loadDrafts(); // Reload current user drafts
                const updatedDrafts = allDrafts.filter(d => d.key !== key);
                saveDrafts(updatedDrafts); // Re-save and re-render
                appendLog(`Draft deleted.`, 'info');
            });
        });
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


    // --- INITIALIZE & EVENT LISTENERS ---
    getCurrentUserSession(); 
    loadGlobalSettings();
    refreshBalanceUI();
    renderLifafas();
    updateTelegramStatusUI();
    renderDraftList(); 
    
    // Auto-save interval (Every 2 seconds)
    if (senderUsername) {
        setInterval(autoSaveLifafa, 2000); 
    }


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
            currentLifafaType = type;

            document.querySelectorAll('.lifafa-tab-secondary').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.lifafa-form-new').forEach(f => f.style.display = 'none');
            
            btn.classList.add('active');
            document.getElementById(`${type.toLowerCase()}LifafaForm`).style.display = 'block';
            logArea.innerHTML = `<p>Ready to create ${type} Lifafa...</p>`;
            
            if (youtubeVideoInfoContainer) youtubeVideoInfoContainer.style.display = 'none'; 

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
            const totalMinutes = Math.floor(videoDurationSeconds / 60);
            
            if (totalMinutes < 1) {
                alert("❌ Video length is too short (less than 1 minute).");
                return;
            }

            videoThumbnail.src = videoInfo.thumbnailUrl;
            videoThumbnail.style.display = 'block';
            videoTitleDisplay.textContent = videoInfo.title;
            videoTotalDurationDisplay.textContent = formatTime(videoDurationSeconds);

            watchDurationSlider.max = totalMinutes;
            watchDurationSlider.value = totalMinutes; 
            
            watchDurationDisplay.textContent = `${totalMinutes} min`;
            
            youtubeVideoInfoContainer.style.display = 'block';

            appendLog(`Video data retrieved. Total length: ${formatTime(videoDurationSeconds)}.`, 'success');
        });
    }

    if (watchDurationSlider) {
        watchDurationSlider.addEventListener('input', (e) => {
            const minutes = e.target.value;
            watchDurationDisplay.textContent = `${minutes} min`;
        });
    }


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
            
            // REFERRAL REWARD FIELDS
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
            } else if (lifafaType === 'Dice') {
                const diceNumberInput = document.getElementById('lifafaDiceNumber_Dice');
                const diceNumber = parseInt(diceNumberInput ? diceNumberInput.value : null);
                
                if (isNaN(diceNumber) || diceNumber < 1 || diceNumber > 6) {
                    alert("⚠️ Dice Lifafa requires a valid Winning Dice Number between 1 and 6.");
                    appendLog('Error: Invalid Winning Dice Number.', 'error');
                    return;
                }
                typeSpecificData.winningDice = diceNumber;
            } else if (lifafaType === 'Toss') {
                const tossSideInput = document.getElementById('lifafaTossSide_Toss');
                const tossSide = tossSideInput ? tossSideInput.value : '';
                
                if (!tossSide || (tossSide !== 'Heads' && tossSide !== 'Tails')) {
                    alert("⚠️ Toss Lifafa requires a valid Winning Side (Heads or Tails).");
                    appendLog('Error: Invalid Winning Toss Side.', 'error');
                    return;
                }
                typeSpecificData.winningSide = tossSide;
            }

            const totalAmount = perUserAmount * count; 
            const currentBalance = getBalance(senderUsername);

            // 1. Validation (Common)
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
                alert(`Error: Insufficient balance. Available: ₹${currentBalance.toFixed(2)}. Total Cost: ₹${totalAmount.toFixed(2)}`);
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
            youtubeLinkInput.value = ''; 
            youtubeVideoInfoContainer.style.display = 'none';
            if (referAmountInput) referAmountInput.value = ''; 
            if (referCommentInput) referCommentInput.value = '';

            // Clean up current auto-save draft
            const draftKeyToDelete = senderUsername + '-' + lifafaType;
            let currentDrafts = loadDrafts();
            const updatedDrafts = currentDrafts.filter(d => d.key !== draftKeyToDelete);
            saveDrafts(updatedDrafts); 
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