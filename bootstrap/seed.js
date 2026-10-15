// Models
const Role = require("../modules/role/role.model");
const Access = require("../modules/access/access.model");
const Picklist = require("../modules/picklist/picklist.model");

// Services
const roleService = require("../modules/role/role.service");

// Constants
const DEFAULTS = require("../constants/DEFAULTS");
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

exports.seedDefaultPicklists = async () => {
  try {
    await Picklist.bulkWrite(
      DEFAULTS.PICKLIST.map((picklist) => ({
        updateOne: {
          filter: {
            value: picklist.value,
            scope: picklist.scope,
            field: picklist.field,
            acronym: picklist.acronym,
            parentPicklist: picklist.parentPicklist || null,
          },
          update: { $set: picklist },
          upsert: true,
        },
      })),
    );
  } catch (error) {
    console.error("Error seeding default picklists:", error);
    throw error;
  }
};
