const bcrypt = require('bcryptjs');

const password = 'password123'; // Change this to your desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error hashing password:', err);
    } else {
        console.log('Your hashed password:', hash);
        console.log('Copy this hash to your .env.local file as ADMIN_PASSWORD_HASH');
    }
});