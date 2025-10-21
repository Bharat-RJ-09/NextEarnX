// panel/js/create_camp.js - Campaign Maker Logic

document.addEventListener('DOMContentLoaded', () => {
    
    const createCampForm = document.getElementById('createCampForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // --- UTILITIES ---
    function getCurrentUser() {
        try {
            const user = JSON.parse(localStorage.getItem('nextEarnXCurrentUser'));
            return user ? user.username : null; 
        } catch { return null; }
    }
    
    function handleLogout() {
        localStorage.removeItem('session');
        localStorage.removeItem('nextEarnXCurrentUser');
        alert("Logged out from NextEarnX!");
        window.location.href = 'login.html';
    }

    // --- LOGOUT HANDLER ---
    if(logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // --- FORM SUBMISSION ---
    createCampForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const senderUsername = getCurrentUser();
        if (!senderUsername) {
            alert("Error: User not logged in. Please log in again.");
            window.location.href = 'login.html';
            return;
        }
        else {
            console.log("Campaign created by user:", senderUsername);
        }

        // Gather all form data
        const formData = {
            trackingLink: document.getElementById('trackingLink').value.trim(),
            campaignName: document.getElementById('campaignName').value.trim(),
            campaignShortName: document.getElementById('campaignShortName').value.trim(),
            amountPerUser: parseFloat(document.getElementById('amountPerUser').value) || 0,
            amountPerRefer: parseFloat(document.getElementById('amountPerRefer').value) || 0,
            steps: [
                "Step 1: Enter Your Number (Fixed)",
                document.getElementById('step2').value.trim(),
                document.getElementById('step3').value.trim(),
                document.getElementById('step4').value.trim(),
                document.getElementById('step5').value.trim()
            ].filter(step => step && step !== 'Step 1: Enter Your Number (Fixed)'), // Filter out empty steps

            creator: senderUsername,
            createdAt: Date.now()
        };
        
        // Basic Validation
        if (!formData.campaignName || !formData.campaignShortName || formData.amountPerUser <= 0) {
            alert("Please fill in Campaign Name, Short Name, and valid Amount per user.");
            return;
        }
        
        if (formData.campaignShortName.includes(' ') || formData.campaignShortName.includes('/')) {
             alert("Campaign Short Name cannot contain spaces or slashes.");
             return;
        }
        
        // Mock Campaign Link Generation
        const mockLink = `${window.location.origin}/camp/${formData.campaignShortName}?ref={refer_id}`;

        if (confirm(`Confirm Creation of Campaign: ${formData.campaignName} (Cost: ₹${formData.amountPerUser.toFixed(2)} per user)?`)) {
            
            // --- MOCK SAVING LOGIC ---
            // In a real app, this would deduct wallet balance and save to server/localStorage.
            
            alert(`✅ Campaign created successfully!\nLink: ${mockLink}\nTotal Steps: ${formData.steps.length}`);
            
            console.log("New Campaign Data:", formData);

            // Optional: Redirect to a Camp List page or clear form
            createCampForm.reset();
        }
    });
});