// ==================== GLOBAL VARIABLES ====================
let geminiKey = localStorage.getItem('geminiKey') || '';

// DOM Elements
const elements = {
    // API Key
    geminiKeyInput: document.getElementById('geminiKey'),
    saveKeyBtn: document.getElementById('saveKeyBtn'),
    
    // Tabs
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Chat
    chatPrompt: document.getElementById('chatPrompt'),
    chatBtn: document.getElementById('chatBtn'),
    chatResult: document.getElementById('chatResult'),
    chatModel: document.getElementById('chatModel'),
    
    // Search
    searchQuery: document.getElementById('searchQuery'),
    searchBtn: document.getElementById('searchBtn'),
    searchResult: document.getElementById('searchResult'),
    
    // Weather
    cityInput: document.getElementById('cityInput'),
    weatherBtn: document.getElementById('weatherBtn'),
    weatherResult: document.getElementById('weatherResult'),
    
    // Floating Chat
    floatingBtn: document.getElementById('floatingBtn'),
    floatingChat: document.getElementById('floatingChat'),
    closeChat: document.getElementById('closeChat'),
    chatInput: document.getElementById('chatInput'),
    sendChat: document.getElementById('sendChat'),
    chatMessages: document.getElementById('chatMessages')
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Load saved API key
    if (geminiKey && elements.geminiKeyInput) {
        elements.geminiKeyInput.value = geminiKey;
    }
    
    // Setup event listeners
    setupEventListeners();
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Save API Key
    if (elements.saveKeyBtn) {
        elements.saveKeyBtn.addEventListener('click', saveApiKey);
    }
    
    // Tab navigation
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab));
    });
    
    // Chat
    if (elements.chatBtn) {
        elements.chatBtn.addEventListener('click', handleChat);
    }
    
    // Search
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', handleSearch);
    }
    
    // Weather
    if (elements.weatherBtn) {
        elements.weatherBtn.addEventListener('click', handleWeather);
    }
    
    // Floating chat
    if (elements.floatingBtn) {
        elements.floatingBtn.addEventListener('click', toggleFloatingChat);
    }
    
    if (elements.closeChat) {
        elements.closeChat.addEventListener('click', toggleFloatingChat);
    }
    
    if (elements.sendChat) {
        elements.sendChat.addEventListener('click', sendChatMessage);
    }
    
    if (elements.chatInput) {
        elements.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }
}

// ==================== API KEY FUNCTIONS ====================
function saveApiKey() {
    const key = elements.geminiKeyInput.value.trim();
    if (key) {
        geminiKey = key;
        localStorage.setItem('geminiKey', key);
        showNotification('API Key berhasil disimpan!', 'success');
    } else {
        showNotification('Masukkan API Key terlebih dahulu', 'error');
    }
}

function getApiKey() {
    if (!geminiKey) {
        geminiKey = localStorage.getItem('geminiKey') || '';
    }
    return geminiKey;
}

// ==================== TAB FUNCTIONS ====================
function switchTab(selectedTab) {
    const tabId = selectedTab.getAttribute('data-tab');
    
    elements.tabs.forEach(t => t.classList.remove('active'));
    elements.tabContents.forEach(c => c.classList.remove('active'));
    
    selectedTab.classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');
}

// ==================== AI FUNCTIONS ====================
async function callGemini(prompt) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('API Key belum diisi! Klik tab API Key untuk mengisi.');
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// ==================== CHAT HANDLER ====================
async function handleChat() {
    const prompt = elements.chatPrompt.value.trim();
    if (!prompt) {
        elements.chatResult.innerHTML = '⚠️ Masukkan pertanyaan terlebih dahulu';
        return;
    }
    
    elements.chatResult.innerHTML = '<div class="loading">AI sedang berpikir</div>';
    
    try {
        const response = await callGemini(prompt);
        elements.chatResult.innerHTML = response.replace(/\n/g, '<br>');
    } catch (error) {
        elements.chatResult.innerHTML = `❌ ${error.message}`;
    }
}

// ==================== SEARCH HANDLER ====================
async function handleSearch() {
    const query = elements.searchQuery.value.trim();
    if (!query) {
        elements.searchResult.innerHTML = '⚠️ Masukkan kata kunci pencarian';
        return;
    }
    
    elements.searchResult.innerHTML = '<div class="loading">Mencari informasi...</div>';
    
    try {
        const prompt = `Cari informasi terbaru tentang "${query}". Berikan hasil pencarian yang akurat, ringkas, dan sertakan sumber terpercaya. Format dengan bullet points.`;
        const response = await callGemini(prompt);
        elements.searchResult.innerHTML = response.replace(/\n/g, '<br>');
    } catch (error) {
        elements.searchResult.innerHTML = `❌ ${error.message}`;
    }
}

// ==================== WEATHER HANDLER ====================
async function handleWeather() {
    const city = elements.cityInput.value.trim();
    if (!city) {
        elements.weatherResult.innerHTML = '⚠️ Masukkan nama kota';
        return;
    }
    
    elements.weatherResult.innerHTML = '<div class="loading">Mengecek cuaca...</div>';
    
    try {
        const prompt = `Berikan informasi cuaca terkini untuk kota ${city}, Indonesia. Format respons:
        
🌤️ **Cuaca di ${city}**

• **Suhu:** [suhu dalam °C]
• **Kondisi:** [cerah/berawan/hujan dll]
• **Kelembaban:** [persen]
• **Angin:** [kecepatan]

**Rekomendasi:** [saran aktivitas berdasarkan cuaca]

Sertakan juga perkiraan cuaca untuk 3 jam ke depan secara singkat.`;
        
        const response = await callGemini(prompt);
        elements.weatherResult.innerHTML = response.replace(/\n/g, '<br>');
    } catch (error) {
        elements.weatherResult.innerHTML = `❌ ${error.message}`;
    }
}

// ==================== FLOATING CHAT ====================
function toggleFloatingChat() {
    elements.floatingChat.classList.toggle('active');
    if (elements.floatingChat.classList.contains('active')) {
        elements.chatInput.focus();
    }
}

async function sendChatMessage() {
    const text = elements.chatInput.value.trim();
    if (!text) return;
    
    // Add user message
    addChatMessage(text, 'user');
    elements.chatInput.value = '';
    
    // Add loading message
    const loadingId = 'loading-' + Date.now();
    addChatMessage('AI sedang mengetik...', 'bot', loadingId);
    
    try {
        const response = await callGemini(text);
        
        // Remove loading message
        const loadingMsg = document.getElementById(loadingId);
        if (loadingMsg) loadingMsg.remove();
        
        // Add bot response
        addChatMessage(response, 'bot');
    } catch (error) {
        // Remove loading message
        const loadingMsg = document.getElementById(loadingId);
        if (loadingMsg) loadingMsg.remove();
        
        addChatMessage(`❌ ${error.message}`, 'bot');
    }
}

function addChatMessage(text, sender, id = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    if (id) messageDiv.id = id;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    elements.chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// ==================== NOTIFICATION ====================
function showNotification(message, type = 'info') {
    // Simple alert for now - bisa dikembangin jadi toast nanti
    alert(message);
}

// ==================== EXPORT FOR DEBUGGING ====================
window.debug = {
    getApiKey,
    callGemini
};