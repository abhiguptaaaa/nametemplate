const { getTemplates, saveTemplates, addTemplate } = require('./lib/storage');
const fs = require('fs/promises');
const path = require('path');

// Mock process.cwd() for the script if needed, but we'll run from project root
async function test() {
    console.log('Testing storage logic...');

    const initialTemplates = await getTemplates();
    console.log('Initial templates count:', initialTemplates.length);

    const testTemplate = {
        id: 'test-id',
        name: 'Test Template',
        imageUrl: '/test.png',
        fields: []
    };

    await addTemplate(testTemplate);
    const updatedTemplates = await getTemplates();
    console.log('Updated templates count:', updatedTemplates.length);

    const found = updatedTemplates.find(t => t.id === 'test-id');
    if (found) {
        console.log('SUCCESS: Template found in storage');
    } else {
        console.log('FAILURE: Template not found');
    }
}

test();
