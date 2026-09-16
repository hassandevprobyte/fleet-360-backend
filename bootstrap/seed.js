const bcrypt = require("bcrypt");

const Role = require("../modules/role/role.model");
const User = require("../modules/user/user.model");

const roleService = require("../modules/role/role.service");

const SCOPE = require("../constants/SCOPE");

const SUPER_ADMIN = {
  title: "super admin",
  email: "superadmin@fleet360.com",
  defaultPassword: "Abcd1234",
  role: "super admin",
};

exports.seedSuperAdmin = async () => {
  try {
    const role = await Role.findOneAndUpdate(
      { title: SUPER_ADMIN.role },
      {
        $setOnInsert: {
          title: SUPER_ADMIN.role,
          scope: SCOPE.ALL,
          indexPath: "/",
          permissions: roleService.getAllResources(),
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    await User.findOneAndUpdate(
      { email: SUPER_ADMIN.email },
      {
        $set: {
          roles: [role._id],
        },
        $setOnInsert: {
          name: SUPER_ADMIN.title,
          email: SUPER_ADMIN.email,
          password: await bcrypt.hash(SUPER_ADMIN.defaultPassword, 10),
          isActive: true,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );
  } catch (error) {
    console.error("Error seeding super admin:", error);

    throw error;
  }
};
