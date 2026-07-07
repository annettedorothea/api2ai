export function checkToolAccessForTestGetAdminSecrets(credential) {
    const expected = process.env.TEST_API_KEY?.trim() || 'demo-test-api-key';
    if (credential.trim() !== expected) {
        throw new Error('Admin role required; invalid test harness API key.');
    }
}
