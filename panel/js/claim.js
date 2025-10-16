// panel/js/claim.js - Lifafa Claim Logic with FULL Validation and Types (VIDEO MATCH LOGIC)

document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const accountRequiredState = document.getElementById('accountRequiredState');
    const requiredMobileDisplay = document.getElementById('requiredMobileDisplay');

    const claimSection = document.getElementById('claimSection');
    const lifafaTitleDisplay = document.getElementById('lifafaTitle');
    const claimAmountDisplay = document.getElementById('claimAmountDisplay');
    const initialClaimAmount = document.getElementById('initialClaimAmount');
    const claimCountDisplay = document.getElementById('claimCountDisplay');
    const mobileForm = document.getElementById('mobileForm');
    const claimMobileInput = document.getElementById('claimMobileInput');
    const claimDetailsContainer = document.getElementById('claimDetailsContainer');
    const specialLifafaInterface = document.getElementById('specialLifafaInterface');

    const reqStatusBan = document.getElementById('reqStatusBan');
    const reqStatusSpecialUser = document.getElementById('reqStatusSpecialUser');
    const reqStatusCode = document.getElementById('reqStatusCode');
    const reqStatusTelegram = document.getElementById('reqStatusTelegram');
    const reqStatusYoutube = document.getElementById('reqStatusYoutube');
    
    // YOUTUBE ELEMENTS
    const youtubeControlSection = document.getElementById('youtubeControlSection');
    const youtubeVerifyBtn = document.getElementById('youtubeVerifyBtn');
    const videoLinkDisplay = document.getElementById('videoLinkDisplay');
    
    const accessCodeForm = document.getElementById('accessCodeForm');
    const accessCodeInput = document.getElementById('accessCodeInput');
    const finalClaimBtn = document.getElementById('finalClaimBtn');
    const claimLog = document.getElementById('claimLog');

    // Keys and Storage
    const LIFAFA_STORAGE_KEY = 'nextEarnXLifafas'; 
    const BAN_NUMBERS_KEY = 'nextEarnXBanNumbers';
    const USER_KEY = 'nextEarnXCurrentUser';
    const USERS_LIST_KEY = 'nextEarnXUsers';
    const GLOBAL_BALANCE_KEY = 'nextEarnXBalance';
    const GLOBAL_HISTORY_KEY = 'nextEarnXHistory';
    
    let lifafaId = new URLSearchParams(location.search).get('id');
    let currentUser = null; // User currently trying to claim
    let lifafaData = null;
    let claimChecksPassed = {
        ban: false, specialUser: false, code: false, telegram: false, youtube: false
    };

    // --- UTILITIES ---
    
    function appendLog(message, type = 'info') {
        const p = document.createElement('p');
        p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        p.style.color = type === 'error' ? '#ff0077' : type === 'success' ? '#aaffaa' : '#e0e0e0';
        claimLog.prepend(p);
    }
    
    function getBalance() {
        try { return parseFloat(localStorage.getItem(GLOBAL_BALANCE_KEY) || '0.00'); }
        catch { return 0.00; }
    }
    
    function setBalance(balance) {
        localStorage.setItem(GLOBAL_BALANCE_KEY, balance.toFixed(2));
    }
    
    function getHistory() {
        try { return JSON.parse(localStorage.getItem(GLOBAL_HISTORY_KEY) || '[]'); }
        catch { return []; }
    }
    
    function loadUsers() {
        try { return JSON.parse(localStorage.getItem(USERS_LIST_KEY) || "[]"); }
        catch { return []; }
    }

    function updateReqStatus(element, success, message) {
        if (!element) return;
        element.textContent = message;
        element.classList.remove('status-pending', 'status-success', 'status-failed');
        if (success === true) {
            element.classList.add('status-success');
            element.querySelector('i').className = 'ri-checkbox-circle-fill';
        } else if (success === false) {
            element.classList.add('status-failed');
            element.querySelector('i').className = 'ri-close-circle-fill';
        } else {
            element.classList.add('status-pending');
            element.querySelector('i').className = 'ri-lock-line';
        }
    }

    function showError(title, message) {
        loadingState.style.display = 'none';
        claimSection.style.display = 'none';
        accountRequiredState.style.display = 'none';
        errorState.style.display = 'block';
        errorTitle.textContent = title;
        errorMessage.textContent = message;
    }
    
    // --- AUTH AND INITIAL DATA LOAD ---

    function loadInitialData() {
        if (!lifafaId) {
            showError("Invalid Link", "Lifafa ID is missing from the URL.");
            return false;
        }

        const allLifafas = JSON.parse(localStorage.getItem(LIFAFA_STORAGE_KEY) || '[]');
        lifafaData = allLifafas.find(l => l.id === lifafaId);

        if (!lifafaData) {
            showError("Lifafa Not Found", "The link is invalid or the Lifafa has expired/closed.");
            return false;
        }
        
        if (lifafaData.claims.length >= lifafaData.count) {
             showError("Lifafa Closed", "All slots for this Lifafa have been claimed.");
             return false;
        }
        
        // Update basic UI details
        lifafaTitleDisplay.textContent = lifafaData.title;
        claimAmountDisplay.textContent = `₹${lifafaData.perClaim.toFixed(2)}`;
        initialClaimAmount.textContent = `₹${lifafaData.perClaim.toFixed(2)}`;

        // Proceed to show the mobile input form
        loadingState.style.display = 'none';
        claimSection.style.display = 'block';
        return true;
    }
    
    // --- USER VERIFICATION HANDLER (Triggered by mobileForm submit) ---

    mobileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const mobile = claimMobileInput.value.trim();
        const users = loadUsers();
        
        const userFound = users.find(user => user.mobile === mobile);

        if (!userFound) {
            // User not found: Show "Account Required" screen
            claimSection.style.display = 'none';
            accountRequiredState.style.display = 'flex';
            requiredMobileDisplay.textContent = mobile;
            appendLog(`❌ User account not found for ${mobile}.`, 'error');
            return;
        }

        // User found: Set current user and proceed to requirements check
        currentUser = userFound;
        
        // Check if already claimed
        const alreadyClaimed = lifafaData.claims.some(c => c.username === currentUser.username);
        if (alreadyClaimed) {
             showError("Already Claimed", `You have already claimed this Lifafa.`);
             return;
        }

        // Hide mobile form and show details
        mobileForm.style.display = 'none';
        claimDetailsContainer.style.display = 'block';
        
        // Start detailed requirements check
        checkAllRequirements();
        appendLog(`✅ User ${currentUser.username} verified. Checking Lifafa requirements...`, 'success');
    });

    // --- CORE REQUIREMENTS CHECKER FUNCTIONS ---

    function checkAllRequirements() {
        // Run all checks
        checkBanStatus();
        checkSpecialUserStatus();
        checkAccessCode();
        checkTelegram();
        checkYoutube();

        // Initialize Special Lifafa Interface (Dice/Toss/Scratch)
        initializeSpecialLifafaInterface();

        // Check if button should be enabled initially
        updateClaimButtonStatus();
    }
    
    function updateClaimButtonStatus() {
        // Check all simple requirements
        const allMandatoryChecksPass = claimChecksPassed.ban
            && claimChecksPassed.specialUser
            && claimChecksPassed.code
            && claimChecksPassed.telegram
            && claimChecksPassed.youtube;
            
        // Check if Special Lifafa Interface needs manual interaction
        const specialInterfaceNeedsInteraction = document.querySelector('#specialLifafaInterface button:not([disabled])');
        
        if (allMandatoryChecksPass && !specialInterfaceNeedsInteraction) {
            finalClaimBtn.disabled = false;
        } else {
            finalClaimBtn.disabled = true;
        }
    }
    
    function checkBanStatus() {
        if (!currentUser) return;
        const bannedNumbers = JSON.parse(localStorage.getItem(BAN_NUMBERS_KEY) || '[]');
        const isBanned = bannedNumbers.includes(currentUser.mobile);
        
        if (isBanned) {
            updateReqStatus(reqStatusBan, false, "Banned: Cannot claim Lifafa.");
            claimChecksPassed.ban = false;
        } else {
            updateReqStatus(reqStatusBan, true, "Banned Status: Passed.");
            claimChecksPassed.ban = true;
        }
    }
    
    function checkSpecialUserStatus() {
        if (!currentUser) return;
        const hasSpecialUsers = lifafaData.specialUsers && lifafaData.specialUsers.length > 0;
        if (hasSpecialUsers) {
            const isSpecialUser = lifafaData.specialUsers.includes(currentUser.mobile);
            
            if (isSpecialUser) {
                updateReqStatus(reqStatusSpecialUser, true, "Special User: Passed! You are on the list.");
                claimChecksPassed.specialUser = true;
            } else {
                updateReqStatus(reqStatusSpecialUser, false, "Special User: Restricted. You are not on the permitted list.");
                claimChecksPassed.specialUser = false;
            }
        } else {
            updateReqStatus(reqStatusSpecialUser, true, "Special User: Not Restricted.");
            claimChecksPassed.specialUser = true;
        }
    }

    function checkAccessCode() {
        if (lifafaData.accessCode) {
            if (claimChecksPassed.code) {
                updateReqStatus(reqStatusCode, true, "Access Code: Verified.");
                accessCodeForm.style.display = 'none';
            } else {
                updateReqStatus(reqStatusCode, false, "Access Code: Required (Enter below)");
                accessCodeForm.style.display = 'block';
                claimChecksPassed.code = false;
            }
        } else {
            updateReqStatus(reqStatusCode, true, "Access Code: Not Required.");
            accessCodeForm.style.display = 'none';
            claimChecksPassed.code = true;
        }
    }
    
    function checkTelegram() {
        const requiredChannels = lifafaData.requirements?.channels || [];
        
        if (requiredChannels.length > 0) {
            updateReqStatus(reqStatusTelegram, true, `Telegram Join: ${requiredChannels.length} channels required (MOCK: Passed)`);
            claimChecksPassed.telegram = true;
        } else {
            updateReqStatus(reqStatusTelegram, true, "Telegram Join: Not Required.");
            claimChecksPassed.telegram = true;
        }
    }
    
    function checkYoutube() {
        const youtubeLink = lifafaData.requirements?.youtube;
        const requiredDuration = lifafaData.requirements?.watchDuration;
        
        if (youtubeLink && requiredDuration) {
            if (claimChecksPassed.youtube) {
                updateReqStatus(reqStatusYoutube, true, "YouTube: Video Watched & Verified.");
                youtubeControlSection.style.display = 'none';
            } else {
                const requiredMinutes = Math.ceil(requiredDuration / 60);
                updateReqStatus(reqStatusYoutube, false, `YouTube: Watch ${requiredMinutes} min Required.`);
                youtubeControlSection.style.display = 'block';
                videoLinkDisplay.href = youtubeLink;
                youtubeVerifyBtn.disabled = false;
                claimChecksPassed.youtube = false;
            }
        } else {
            updateReqStatus(reqStatusYoutube, true, "YouTube Watch: Not Required.");
            youtubeControlSection.style.display = 'none';
            claimChecksPassed.youtube = true;
        }
    }

    // --- SPECIAL LIFAFA TYPE INTERFACE HANDLERS ---

    function initializeSpecialLifafaInterface() {
        specialLifafaInterface.innerHTML = ''; // Clear previous interface
        const type = lifafaData.type;
        
        if (type === 'Normal') return;

        let content = '';
        let buttonText = '';
        let buttonId = `specialClaimBtn_${type}`;
        
        // Check if the user has lost/won the special game in this session (mock)
        const gameStatus = sessionStorage.getItem(`gameStatus_${lifafaId}`);

        if (gameStatus === 'won') {
             specialLifafaInterface.innerHTML = `<p style="color:#aaffaa; font-weight:bold;">✅ ${type} Game Won! Proceed to Claim.</p>`;
             finalClaimBtn.disabled = false;
             return;
        } else if (gameStatus === 'lost') {
             specialLifafaInterface.innerHTML = `<p style="color:#ff0077; font-weight:bold;">❌ ${type} Game Lost. You cannot claim this Lifafa now.</p>`;
             finalClaimBtn.disabled = true;
             return;
        }


        if (type === 'Dice') {
            content = `<p class="note-msg" style="color:#00e0ff; font-weight:bold;">🎲 Guess the roll! Winning number: ${lifafaData.winningDice}.</p>`;
            buttonText = 'Roll Dice to Claim';
        } else if (type === 'Toss') {
            content = `<p class="note-msg" style="color:#00e0ff; font-weight:bold;">🪙 Toss a coin! Winning side: ${lifafaData.winningSide}.</p>`;
            buttonText = 'Toss Coin to Claim';
        } else if (type === 'Scratch') {
            content = `<p class="note-msg" style="color:#00e0ff; font-weight:bold;">✨ Scratch to win! Luck: ${lifafaData.luckPercentage}%. (One try only)</p>`;
            buttonText = 'Scratch Card to Claim';
        }
        
        if (content) {
            specialLifafaInterface.innerHTML = `
                ${content}
                <button id="${buttonId}" class="submit-btn claim-btn" style="background:#ffcc00; color:#1a1a2a; margin-bottom: 15px;">
                    <i class="ri-play-line"></i> ${buttonText}
                </button>
            `;
            // Attach special claim handler
            document.getElementById(buttonId).addEventListener('click', () => handleSpecialLifafaClaim(type, buttonId));
            finalClaimBtn.disabled = true; // Keep main button disabled until game won
        }
    }

    function handleSpecialLifafaClaim(type, buttonId) {
        const specialBtn = document.getElementById(buttonId);
        specialBtn.disabled = true;
        
        let resultMessage = '';
        let isSuccess = false;

        if (type === 'Dice') {
            const roll = Math.floor(Math.random() * 6) + 1;
            isSuccess = (roll === lifafaData.winningDice);
            resultMessage = isSuccess 
                ? `🎉 SUCCESS! You rolled a ${roll} and won!` 
                : `❌ FAIL. You rolled a ${roll}. The winning number was ${lifafaData.winningDice}.`;
        } else if (type === 'Toss') {
            const tossResult = Math.random() < 0.5 ? 'Heads' : 'Tails';
            isSuccess = (tossResult === lifafaData.winningSide);
            resultMessage = isSuccess 
                ? `🎉 SUCCESS! It landed on ${tossResult} and you won!`
                : `❌ FAIL. It landed on ${tossResult}. The winning side was ${lifafaData.winningSide}.`;
        } else if (type === 'Scratch') {
            const luck = lifafaData.luckPercentage;
            isSuccess = (Math.random() * 100) < luck;
            resultMessage = isSuccess
                ? `🎉 SUCCESS! Scratch revealed a prize!`
                : `❌ FAIL. Scratch revealed no prize. Your luck was ${luck}%.`;
        }
        
        // Show result and update session/UI
        sessionStorage.setItem(`gameStatus_${lifafaId}`, isSuccess ? 'won' : 'lost');
        appendLog(`${type} Game Result: ${resultMessage}`, isSuccess ? 'success' : 'error');
        
        if (isSuccess) {
            specialLifafaInterface.innerHTML = `<p style="color:#aaffaa; font-weight:bold;">✅ ${type} Game Won! Proceed to Claim.</p>`;
            finalClaimBtn.disabled = false; // Enable main button
        } else {
            specialLifafaInterface.innerHTML = `<p style="color:#ff0077; font-weight:bold;">❌ ${type} Game Lost. Try again next time.</p>`;
            finalClaimBtn.disabled = true;
        }
    }

    // --- EVENT HANDLERS ---
    
    // 1. Access Code Verification
    accessCodeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) return;
        const enteredCode = accessCodeInput.value.trim();
        
        if (enteredCode === lifafaData.accessCode) {
            updateReqStatus(reqStatusCode, true, "Access Code: Verified.");
            accessCodeForm.style.display = 'none';
            claimChecksPassed.code = true;
            appendLog("Access code correct. Re-checking requirements.", 'success');
            updateClaimButtonStatus(); 
        } else {
            alert("❌ Incorrect Access Code. Try again.");
            updateReqStatus(reqStatusCode, false, "Access Code: Failed.");
            claimChecksPassed.code = false;
            updateClaimButtonStatus();
        }
    });

    // 2. YouTube Verification (Mock)
    if (youtubeVerifyBtn) {
        youtubeVerifyBtn.addEventListener('click', () => {
             updateReqStatus(reqStatusYoutube, true, "YouTube: Video Watched & Verified (MOCK)");
             claimChecksPassed.youtube = true;
             youtubeControlSection.style.display = 'none';
             appendLog("YouTube watch requirement passed.", 'success');
             updateClaimButtonStatus(); 
        });
    }

    // 3. Main Claim Action
    finalClaimBtn.addEventListener('click', () => {
        if (finalClaimBtn.disabled || !currentUser) return;
        
        if (!confirm(`Confirm final claim of ₹${lifafaData.perClaim.toFixed(2)}?`)) return;
        
        finalClaimBtn.disabled = true;

        // Perform final credit
        const claimAmount = lifafaData.perClaim;
        const currentBalance = getBalance();
        const newBalance = currentBalance + claimAmount;
        
        setBalance(newBalance);
        
        // Update Lifafa history
        lifafaData.claims.push({
            username: currentUser.username,
            date: Date.now(),
            amount: claimAmount
        });
        
        // Save updated Lifafa data
        const allLifafas = JSON.parse(localStorage.getItem(LIFAFA_STORAGE_KEY));
        const index = allLifafas.findIndex(l => l.id === lifafaId);
        if (index !== -1) {
            allLifafas[index] = lifafaData;
            localStorage.setItem(LIFAFA_STORAGE_KEY, JSON.stringify(allLifafas));
        }
        
        // Record transaction
        let userHistory = getHistory(currentUser.username); 
        userHistory.push({
            date: Date.now(),
            type: 'credit',
            amount: claimAmount,
            txnId: 'LIFAFA_CLAIM_' + lifafaId,
            note: `Claimed Lifafa: ${lifafaData.title}`
        });
        localStorage.setItem(`nextEarnXHistory_${currentUser.username}`, JSON.stringify(userHistory));
        
        // Final Success Message
        appendLog(`🎉 SUCCESS: ₹${claimAmount.toFixed(2)} credited! New Balance: ₹${newBalance.toFixed(2)}`, 'success');
        alert(`🎉 Successfully claimed ₹${claimAmount.toFixed(2)}!`);
        
        finalClaimBtn.textContent = "Claimed!";
        
        // Clear session storage game status
        sessionStorage.removeItem(`gameStatus_${lifafaId}`);
        
        if(lifafaData.redirectLink) {
            document.getElementById('finalStatusMessage').innerHTML = `<p>Redirecting to <a href="${lifafaData.redirectLink}" target="_blank">Creator's Link</a>...</p>`;
            setTimeout(() => {
                window.location.href = lifafaData.redirectLink;
            }, 3000);
        }
    });
    
    // --- INITIALIZE ---
    if (loadInitialData()) {
        // Only run checkAllRequirements after mobile verification is complete
        // The check is now triggered by the mobileForm submit event
    }
});