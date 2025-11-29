// Mock Database - Residents Information
const residents = {
    'R001': { 
        name: 'Amogh Ameye', 
        password: 'Amogh@7603', 
        room: '7-603', 
        contact: '9876543210', 
        status: 'out' 
    },
    'R002': { 
        name: 'Moulik Gupta', 
        password: 'Moulik@7602', 
        room: '7-602', 
        contact: '7987239390', 
        status: 'out' 
    },
    'R003': { 
        name: 'Divyansh Singh', 
        password: 'Divyansh@7602', 
        room: '7-602', 
        contact: '9876543212', 
        status: 'out' 
    },
    'R004': { 
        name: 'Harshul Adwani', 
        password: 'Harshul@7604', 
        room: '7-604', 
        contact: '9876543213', 
        status: 'out' 
    },
    'R005': { 
        name: 'Prithvi Raj Shinde', 
        password: 'Prithvi@7303', 
        room: '7-303', 
        contact: '9876543214', 
        status: 'out' 
    }
};

// Global Variables
let currentResident = null;
let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

function showWardenPanel() {
    document.getElementById('landingPage').classList.remove('active');
    document.getElementById('wardenPanel').classList.add('active');
    loadWardenDashboard();
}

function showResidentPanel() {
    document.getElementById('landingPage').classList.remove('active');
    document.getElementById('residentPanel').classList.add('active');
}

function goHome() {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('landingPage').classList.add('active');
}

// ============================================
// WARDEN PANEL FUNCTIONS
// ============================================

function loadWardenDashboard() {
    // Calculate statistics
    const totalResidents = Object.keys(residents).length;
    const todayRecords = attendanceRecords.filter(r => isToday(r.timestamp));
    
    // Count unique residents who checked in today
    const uniqueCheckIns = new Set(
        todayRecords
            .filter(r => r.status === 'in')
            .map(r => r.residentId)
    ).size;
    
    const presentToday = uniqueCheckIns;
    const absentToday = totalResidents - presentToday;
    const totalCheckIns = attendanceRecords.filter(r => r.status === 'in').length;

    // Update statistics display
    document.getElementById('totalResidents').textContent = totalResidents;
    document.getElementById('presentToday').textContent = presentToday;
    document.getElementById('absentToday').textContent = absentToday;
    document.getElementById('totalCheckIns').textContent = totalCheckIns;

    // Load attendance log for today
    loadAttendanceLog();

    // Load all residents list
    loadResidentsList();
}

function loadAttendanceLog() {
    const logBody = document.getElementById('attendanceLog');
    const todayRecords = attendanceRecords.filter(r => isToday(r.timestamp));
    
    if (todayRecords.length === 0) {
        logBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #95a5a6; padding: 30px;">
                    No attendance records yet for today
                </td>
            </tr>
        `;
    } else {
        // Sort by most recent first
        const sortedRecords = todayRecords.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        logBody.innerHTML = sortedRecords.map(record => `
            <tr>
                <td>${record.residentId}</td>
                <td>${record.name}</td>
                <td>${record.room}</td>
                <td>
                    <span class="badge badge-${record.status}">
                        ${record.status === 'in' ? 'Check In' : 'Check Out'}
                    </span>
                </td>
                <td>${new Date(record.timestamp).toLocaleTimeString()}</td>
            </tr>
        `).join('');
    }
}

function loadResidentsList() {
    const residentsList = document.getElementById('residentsList');
    
    residentsList.innerHTML = Object.entries(residents).map(([id, data]) => `
        <tr>
            <td>${id}</td>
            <td>${data.name}</td>
            <td>${data.room}</td>
            <td>${data.contact}</td>
            <td>
                <span class="badge badge-${data.status}">
                    ${data.status === 'in' ? 'Inside' : 'Outside'}
                </span>
            </td>
        </tr>
    `).join('');
}

// ============================================
// RESIDENT PANEL FUNCTIONS
// ============================================

function residentLogin() {
    const id = document.getElementById('residentId').value.trim();
    const password = document.getElementById('residentPassword').value;

    // Validate input
    if (!id || !password) {
        alert('Please enter both Resident ID and Password');
        return;
    }

    // Check if resident exists
    if (!residents[id]) {
        alert('Invalid Resident ID');
        return;
    }

    // Check password
    if (residents[id].password !== password) {
        alert('Invalid Password');
        return;
    }

    // Login successful
    currentResident = { id, ...residents[id] };
    
    // Hide login form and show dashboard
    document.getElementById('residentLogin').style.display = 'none';
    document.getElementById('residentDashboard').style.display = 'block';
    
    // Load resident dashboard
    loadResidentDashboard();
}

function loadResidentDashboard() {
    // Display resident information
    document.getElementById('residentName').textContent = currentResident.name;
    document.getElementById('displayResidentId').textContent = currentResident.id;
    document.getElementById('displayRoom').textContent = currentResident.room;
    document.getElementById('displayStatus').textContent = 
        currentResident.status === 'in' ? 'Inside Hostel' : 'Outside Hostel';

    // Update button visibility based on current status
    updateAttendanceButtons();

    // Start real-time clock
    updateTime();
    setInterval(updateTime, 1000);

    // Load personal attendance records
    loadMyRecords();
}

function updateAttendanceButtons() {
    const checkInBtn = document.getElementById('checkInBtn');
    const checkOutBtn = document.getElementById('checkOutBtn');

    if (currentResident.status === 'in') {
        checkInBtn.style.display = 'none';
        checkOutBtn.style.display = 'block';
    } else {
        checkInBtn.style.display = 'block';
        checkOutBtn.style.display = 'none';
    }
}

function updateTime() {
    const timeEl = document.getElementById('currentTime');
    if (timeEl) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        timeEl.textContent = now.toLocaleString('en-US', options);
    }
}

function markAttendance(status) {
    // Create attendance record
    const record = {
        residentId: currentResident.id,
        name: currentResident.name,
        room: currentResident.room,
        status: status,
        timestamp: new Date().toISOString()
    };

    // Add to attendance records
    attendanceRecords.push(record);
    
    // Save to localStorage
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));

    // Update resident status in memory
    residents[currentResident.id].status = status;
    currentResident.status = status;

    // Show success message
    showSuccessMessage(status);

    // Update dashboard
    updateAttendanceButtons();
    document.getElementById('displayStatus').textContent = 
        status === 'in' ? 'Inside Hostel' : 'Outside Hostel';
    
    // Reload records
    loadMyRecords();
}

function showSuccessMessage(status) {
    const msgContainer = document.getElementById('successMsg');
    const message = status === 'in' 
        ? '✓ Checked In Successfully!' 
        : '✗ Checked Out Successfully!';
    
    msgContainer.innerHTML = `<div class="success-message">${message}</div>`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        msgContainer.innerHTML = '';
    }, 3000);
}

function loadMyRecords() {
    const myRecords = attendanceRecords.filter(r => r.residentId === currentResident.id);
    const tbody = document.getElementById('myRecords');

    if (myRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; color: #95a5a6; padding: 30px;">
                    No attendance records yet
                </td>
            </tr>
        `;
    } else {
        // Sort by most recent first and show last 10 records
        const sortedRecords = myRecords.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        ).slice(0, 10);

        tbody.innerHTML = sortedRecords.map(record => `
            <tr>
                <td>${new Date(record.timestamp).toLocaleDateString()}</td>
                <td>
                    <span class="badge badge-${record.status}">
                        ${record.status === 'in' ? 'Check In' : 'Check Out'}
                    </span>
                </td>
                <td>${new Date(record.timestamp).toLocaleTimeString()}</td>
            </tr>
        `).join('');
    }
}

function residentLogout() {
    // Clear current resident
    currentResident = null;
    
    // Reset form
    document.getElementById('residentId').value = '';
    document.getElementById('residentPassword').value = '';
    
    // Show login form and hide dashboard
    document.getElementById('residentLogin').style.display = 'block';
    document.getElementById('residentDashboard').style.display = 'none';
    
    // Go back to home
    goHome();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function isToday(timestamp) {
    const today = new Date();
    const date = new Date(timestamp);
    return date.toDateString() === today.toDateString();
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Show landing page by default
    document.getElementById('landingPage').classList.add('active');
    
    // Add Enter key support for login forms
    document.getElementById('residentPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            residentLogin();
        }
    });
});

// Auto-refresh warden dashboard every 30 seconds if it's active
setInterval(function() {
    const wardenPanel = document.getElementById('wardenPanel');
    if (wardenPanel.classList.contains('active')) {
        loadWardenDashboard();
    }
}, 30000);