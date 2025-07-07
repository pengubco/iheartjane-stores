// Welcome to your JavaScript project!
console.log('Hello from your new JavaScript project!');
console.log('Node.js version:', process.version);
console.log('Current working directory:', process.cwd());

// Example function
function greet(name = 'World') {
    return `Hello, ${name}!`;
}

// Export for potential use in other modules
module.exports = { greet };

// Run the greeting
console.log(greet('Developer'));
