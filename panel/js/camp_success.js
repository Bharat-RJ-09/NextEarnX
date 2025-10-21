// panel/js/camp_success.js - Campaign Creation Success Page Logic

document.addEventListener('DOMContentLoaded', () => {
    const linkResultsContainer = document.getElementById('linkResultsContainer');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // --- UTILITIES ---
    function handleLogout() {
        localStorage.removeItem('session');
        localStorage.removeItem('nextEarnXCurrentUser');
        alert("Logged out from NextEarnX!");
        window.location.href = 'login.html';
    }

    if(logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    function getUrlParams() {
        const params = {};
        location.search.slice(1).split('&').forEach(pair => {
            if (!pair) return;
            const [k, v] = pair.split('=');
            params[decodeURIComponent(k)] = decodeURIComponent(v || '');
        });
        return params;
    }

    function createLinkBlock(headerText, linkUrl) {
        const block = document.createElement('div');
        block.classList.add('link-block');
        block.innerHTML = `
            <h3 class="link-block-header">${headerText}</h3>
            <div class="link-input-display" id="linkDisplay_${headerText.replace(/\s+/g, '')}">${linkUrl}</div>
            <button class="copy-btn" data-link="${linkUrl}"><i class="ri-file-copy-line"></i> Copy</button>
        `;
        linkResultsContainer.appendChild(block);
        
        // Attach copy listener
        block.querySelector('.copy-btn').addEventListener('click', (e) => {
            const linkToCopy = e.currentTarget.dataset.link;
            navigator.clipboard.writeText(linkToCopy)
                .then(() => alert('✅ Link copied to clipboard!'))
                .catch(err => console.error('Copy failed:', err));
        });
    }

    // --- MAIN RENDER LOGIC ---
    const params = getUrlParams();
    const shortName = params.shortName;

    if (!shortName) {
        linkResultsContainer.innerHTML = '<p style="color:#ff0077;">❌ Error: Campaign details not found. Please try creating a campaign again.</p>';
        return;
    }
    
    // Mock Base URL - Note: {refer_id} is often used in Camp Links, and {campaign_id} for Self Refer
    const mockDomain = 'https://elfcampaign.rf.gd'; // Using the domain from the image for mock links
    const campLink = `${mockDomain}/camp?camp-${shortName}`; 
    const referEarnLink = `${mockDomain}/camp/refer.php?camp-${shortName}`; 
    const selfReferLink = `${mockDomain}/camp/create.php?camp-${shortName}`; 

    // Render the three blocks
    createLinkBlock("Camp Link", campLink);
    createLinkBlock("Refer & Earn", referEarnLink);
    createLinkBlock("Self Refer Link", selfReferLink);
});