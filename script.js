let database = [];

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registered successfully.'))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
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