let database = [];

// ✅ Service Worker Registration with Smart Version Checking
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log('Service Worker registered successfully.');
                
                // ✅ Check for updates by comparing server version with localStorage
                checkForUpdatesFromServer();
            })
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}

// ✅ Function to check version from server sw.js file
function checkForUpdatesFromServer() {
    fetch('./sw.js?t=' + Date.now(), { cache: 'no-store' })
        .then(response => response.text())
        .then(swContent => {
            // Extract CACHE_NAME from sw.js
            const cacheNameMatch = swContent.match(/const\s+CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
            
            if (cacheNameMatch && cacheNameMatch[1]) {
                const serverVersion = cacheNameMatch[1]; // e.g., 'prashna-chakra-v10.1.1'
                const localStorageVersion = localStorage.getItem('appCacheVersion');
                
                console.log('Server Version:', serverVersion);
                console.log('Stored Version:', localStorageVersion);
                
                // If no stored version, save it
                if (!localStorageVersion) {
                    localStorage.setItem('appCacheVersion', serverVersion);
                    return;
                }
                
                // If versions are different, update is available
                if (serverVersion !== localStorageVersion) {
                    console.log('New version detected! Old:', localStorageVersion, 'New:', serverVersion);
                    showUpdateNotification(serverVersion, localStorageVersion);
                } else {
                    console.log('App is up to date.');
                }
            }
        })
        .catch(err => console.error('Failed to check server version:', err));
}

// ✅ Function to show update notification
function showUpdateNotification(newVersion, oldVersion) {
    const notification = document.createElement('div');
    notification.id = 'updateNotification';
    notification.innerHTML = `
        <style>
            #updateNotification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #b33939 0%, #7a1a1a 100%);
                color: #fdf6e8;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(74, 20, 0, 0.3);
                z-index: 10000;
                font-family: 'Noto Serif Kannada', Georgia, serif;
                max-width: 350px;
                animation: slideInRight 0.5s ease-out;
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(400px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            #updateNotification h4 {
                margin: 0 0 10px 0;
                font-size: 16px;
            }
            
            #updateNotification p {
                margin: 0 0 15px 0;
                font-size: 14px;
                opacity: 0.95;
            }
            
            #updateNotification .button-group {
                display: flex;
                gap: 10px;
            }
            
            #updateNotification button {
                flex: 1;
                padding: 10px 15px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            #updateNotification .update-btn {
                background: #f0c060;
                color: #2d1200;
            }
            
            #updateNotification .update-btn:hover {
                background: #ffd700;
                transform: scale(1.02);
            }
            
            #updateNotification .dismiss-btn {
                background: transparent;
                color: #fdf6e8;
                border: 1px solid #fdf6e8;
            }
            
            #updateNotification .dismiss-btn:hover {
                background: rgba(255,255,255,0.1);
            }
        </style>
        <h4>📱 नया संस्करण उपलब्ध है</h4>
        <p>नई अपडेट उपलब्ध है। अभी अपडेट करने के लिए बटन दबाएं।</p>
        <div class="button-group">
            <button class="update-btn" onclick="reloadApp()">अभी अपडेट करें</button>
            <button class="dismiss-btn" onclick="dismissUpdateNotification()">बाद में</button>
        </div>
    `;
    
    document.body.appendChild(notification);
}

// ✅ Function to reload and update the app
function reloadApp() {
    // Update localStorage with new version
    fetch('./sw.js?t=' + Date.now(), { cache: 'no-store' })
        .then(response => response.text())
        .then(swContent => {
            const cacheNameMatch = swContent.match(/const\s+CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
            if (cacheNameMatch) {
                localStorage.setItem('appCacheVersion', cacheNameMatch[1]);
            }
        });
    
    // Unregister old service workers
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
            registration.unregister();
        }
    });
    
    // Clear all caches
    caches.keys().then(cacheNames => {
        return Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
    }).then(() => {
        // Force reload from server
        window.location.href = window.location.href.split('#')[0] + '?nocache=' + Date.now();
    });
}

// ✅ Function to dismiss update notification
function dismissUpdateNotification() {
    const notification = document.getElementById('updateNotification');
    if (notification) {
        notification.style.animation = 'slideInRight 0.5s ease-out reverse';
        setTimeout(() => notification.remove(), 500);
    }
}

// CSV టెక్స్ట్‌ను సులభంగా ఆబ్జెక్ట్‌లుగా మార్చే ఫంక్షన్
function parseCSV(text) {
    const lines = text.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        let row = [];
        let inQuotes = false;
        let val = "";
        // కొటేషన్స్ (") మధ్యలో ఉన్న కమా (,) లను సపరేట్ కాకుండా కంట్రోల్ చేయడానికి
        for(let char of lines[i]) {
            if(char === '"') {
                inQuotes = !inQuotes;
            } else if(char === ',' && !inQuotes) {
                row.push(val);
                val = "";
            } else {
                val += char;
            }
        }
        row.push(val);

        let obj = {};
        headers.forEach((header, index) => {
            if (row[index]) {
                obj[header.trim()] = row[index].trim();
            }
        });
        result.push(obj);
    }
    return result;
}

// CSV ఫైల్ లోడ్ చేయడం
async function loadData() {
    try {
        const response = await fetch('QA_database.csv');
        const text = await response.text();
        database = parseCSV(text);
        populateChakras();
    } catch (error) {
        console.error("Error loading CSV:", error);
        alert("డేటాబేస్ ఫైల్ లోడ్ అవ్వలేదు. దయచేసి లోకల్ సర్వర్‌ ద్వారా రన్ చేయండి.");
    }
}

// మొదటి డ్రాప్‌డౌన్ (చక్రాలు) నింపడం
function populateChakras() {
    const chakraSelect = document.getElementById('chakraSelect');
    // డూప్లికేట్స్ లేకుండా కేవలం చక్రాల పేర్లు తీసుకోవడం
    const uniqueChakras = [...new Set(database.map(item => item.Chakra_Name))].filter(Boolean);
    
    uniqueChakras.forEach(chakra => {
        const option = document.createElement('option');
        option.value = chakra;
        option.textContent = chakra;
        chakraSelect.appendChild(option);
    });
}

// చక్రం మార్చినప్పుడు కారక పేర్లను సెట్ చేయడం
document.getElementById('chakraSelect').addEventListener('change', function() {
    const selectedChakra = this.value;
    const karakaContainer = document.getElementById('karakaContainer');
    const instructionText = document.getElementById('instructionText');
    
    karakaContainer.innerHTML = '';
    document.getElementById('resultBox').classList.add('hidden');
    
    if (selectedChakra) {
        const filteredData = database.filter(item => item.Chakra_Name === selectedChakra);
        const uniqueKarakas = [...new Set(filteredData.map(item => item.karaka_name))].filter(Boolean);
        
        uniqueKarakas.forEach(karaka => {
            const btn = document.createElement('button');
            btn.className = 'karaka-btn';
            btn.textContent = karaka;
            
            // పేరుపై క్లిక్ చేయగానే ఫలితాన్ని తీసుకురావడం
            btn.addEventListener('click', function() {
                // పాతగా సెలెక్ట్ చేసిన బటన్ కలర్ మార్చడం
                document.querySelectorAll('.karaka-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active'); // ఇప్పుడు క్లిక్ చేసిన దానికి యాక్టివ్ కలర్
                
                const resultRow = database.find(item => item.Chakra_Name === selectedChakra && item.karaka_name === karaka);
                if (resultRow) {
                    document.getElementById('resultText').textContent = resultRow.chakra_result;
                    document.getElementById('resultBox').classList.remove('hidden');
                }
            });
            
            karakaContainer.appendChild(btn);
        });
        karakaContainer.classList.remove('hidden');
        instructionText.classList.remove('hidden');
    } else {
        karakaContainer.classList.add('hidden');
        instructionText.classList.add('hidden');
    }
});

// డేటాని లోడ్ చేస్తూ అప్లికేషన్ స్టార్ట్ చేయడం
loadData();