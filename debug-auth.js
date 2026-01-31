// Debug script to test GitHub OAuth credentials
const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

console.log('🔍 Testing GitHub OAuth Configuration...');
console.log('Client ID:', GITHUB_CLIENT_ID ? `${GITHUB_CLIENT_ID.substring(0, 10)}...` : 'NOT SET');
console.log('Client Secret:', GITHUB_CLIENT_SECRET ? `${GITHUB_CLIENT_SECRET.substring(0, 10)}...` : 'NOT SET');

async function testGitHubAPI() {
  try {
    // Test 1: Check if we can reach GitHub API
    console.log('\n📡 Test 1: Testing GitHub API connectivity...');
    const response = await axios.get('https://api.github.com/rate_limit');
    console.log('✅ GitHub API is reachable');
    console.log('Rate limit:', response.data.rate);

    // Test 2: Test OAuth app configuration
    console.log('\n🔑 Test 2: Testing OAuth app configuration...');
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      console.error('❌ GitHub OAuth credentials not configured');
      return;
    }

    // Test with a dummy code (will fail but shows if credentials are valid format)
    try {
      await axios.post('https://github.com/login/oauth/access_token', {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: 'dummy_code_for_testing'
      }, {
        headers: { Accept: 'application/json' }
      });
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error === 'bad_verification_code') {
        console.log('✅ OAuth credentials format is valid (bad_verification_code expected)');
      } else {
        console.error('❌ OAuth credentials issue:', error.response?.data || error.message);
      }
    }

    console.log('\n🎯 Next steps:');
    console.log('1. Make sure your GitHub OAuth app is configured correctly');
    console.log('2. Authorization callback URL should be: http://localhost:3000/auth/callback');
    console.log('3. Homepage URL should be: http://localhost:3000');
    console.log('4. Try the authentication flow again');

  } catch (error) {
    console.error('❌ Error testing GitHub API:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('❌ Network error: Cannot reach GitHub API');
      console.error('   Check your internet connection');
    }
  }
}

testGitHubAPI();