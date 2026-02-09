const API_URL = 'http://localhost:5000/api';

const runVerification = async () => {
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'antigravity_test@test.com',
                password: 'test1234'
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText} ${await loginRes.text()}`);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✅ Login successful');

        const headers = { Authorization: `Bearer ${token}` };

        console.log('\n2. Testing Ticket Sources...');
        const sourcesRes = await fetch(`${API_URL}/ticket-sources`, { headers });
        const sourcesData = await sourcesRes.json();
        console.log(`✅ Ticket Sources: ${sourcesData.length} found`);

        console.log('\n3. Testing Service Types...');
        const servicesRes = await fetch(`${API_URL}/service-types`, { headers });
        const servicesData = await servicesRes.json();
        console.log(`✅ Service Types: ${servicesData.length} found`);

        console.log('\n4. Testing User Search...');
        const searchRes = await fetch(`${API_URL}/admin/users/search?query=Antigravity`, { headers });
        const searchData = await searchRes.json();
        console.log(`✅ User Search result: ${searchData.length} found`);
        console.log(searchData);

        if (searchData.length > 0 && searchData[0].email === 'antigravity_test@test.com') {
            console.log('✅ Search logic verified.');
        } else {
            console.log('⚠️ Search logic might be incorrect.');
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error.message);
    }
};

runVerification();
