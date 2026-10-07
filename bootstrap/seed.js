const Role = require("../modules/role/role.model");
const Access = require("../modules/access/access.model");

const roleService = require("../modules/role/role.service");

const SCOPE = require("../constants/SCOPE");

const SUPER_ADMIN = {
  role: "super admin",
  userId: "6aa026cba7a08805dfef012b",
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

    await Access.findOneAndUpdate(
      { user: SUPER_ADMIN.userId },
      {
        $set: {
          roles: [role._id],
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
