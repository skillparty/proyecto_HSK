// Debug script to test authentication flow
console.log('🔍 Debugging Authentication Issue');

// Test 1: Check if BackendAuth is loaded
if (window.BackendAuth) {
    console.log('✅ BackendAuth class is available');
} else {
    console.log('❌ BackendAuth class not found');
}

// Test 2: Check current URL parameters
const urlParams = new URLSearchParams(window.location.search);
console.log('🔍 URL Parameters:', {
    auth: urlParams.get('auth'),
    error: urlParams.get('error'),
    token: urlParams.get('token'),
    message: urlParams.get('message')
});

// Test 3: Check localStorage
console.log('🔍 LocalStorage:', {
    authToken: localStorage.getItem('auth-token'),
    hasToken: !!localStorage.getItem('auth-token')
});

// Test 4: Test auth endpoints
async function testAuthEndpoints() {
    console.log('🔍 Testing Auth Endpoints...');
    
    try {
        // Test user endpoint
        const userResponse = await fetch('/auth/user', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('🔍 /auth/user response:', {
            status: userResponse.status,
            ok: userResponse.ok,
            headers: Object.fromEntries(userResponse.headers.entries())
        });
        
        if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('✅ User data received:', userData);
        } else {
            const errorData = await userResponse.text();
            console.log('❌ User endpoint error:', errorData);
        }
        
    } catch (error) {
        console.error('❌ Auth endpoint test failed:', error);
    }
}

// Test 5: Check if auth container exists
const authContainer = document.getElementById('auth-container');
if (authContainer) {
    console.log('✅ Auth container found:', authContainer.innerHTML);
} else {
    console.log('❌ Auth container not found');
}

// Run tests
testAuthEndpoints();

// Test 6: Manual auth check
setTimeout(() => {
    if (window.backendAuth) {
        console.log('🔍 BackendAuth instance:', {
            isAuthenticated: window.backendAuth.isAuthenticated(),
            currentUser: window.backendAuth.getUser(),
            token: window.backendAuth.getToken()
        });
    } else {
        console.log('❌ BackendAuth instance not found');
    }
}, 2000);
