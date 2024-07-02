// seedSuperAdmin.js
const User = require('./models/User.js');
const bcrypt = require ("bcrypt")

function seedSuperAdmin() {
  User.findOne({ email: process.env.SUPER_ADMIN_EMAIL, mobileNo: process.env.SUPER_ADMIN_MOBILE })
    .then(existingSuperAdmin => {
      if (existingSuperAdmin) {
        console.log('SuperAdmin already exists, no action taken');
        return null; // Return null to indicate no action was taken
      }

      const superAdmin = new User({
        firstName: process.env.SUPER_ADMIN_FIRSTNAME,
        lastName: process.env.SUPER_ADMIN_LASTNAME,
        email: process.env.SUPER_ADMIN_EMAIL,
        password: bcrypt.hashSync(process.env.SUPER_ADMIN_SECRET, 10),
        mobileNo: process.env.SUPER_ADMIN_MOBILE,
        isAdmin: true,
        isVerified: true,
      });

      return superAdmin.save(); // Save the new super admin
    })
    .then((superAdmin) => {
      if (superAdmin) {
        console.log('SuperAdmin seeded successfully');
      }
    })
    .catch(error => {
      console.error('Error seeding SuperAdmin:', error);
    });
}

module.exports = seedSuperAdmin;
