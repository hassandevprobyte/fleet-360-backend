const bcrypt = require("bcrypt");

// Models
const Picklist = require("../modules/picklist/picklist.model");
const User = require("../modules/user/user.model");

// Constants
const { DEFAULTS, ROLES } = require("../common/constants");

const SUPER_ADMIN = {
  title: "super admin",
  email: "superadmin@fleet360.com",
  defaultPassword: "Abcd1234",
  platformRole: ROLES.PLATFORM_ROLES.SUPER_ADMIN,
};

exports.seedSuperAdmin = async () => {
  try {
    await User.findOneAndUpdate(
      { email: SUPER_ADMIN.email },
      {
        $set: {
          permissions: [],
        },
        $setOnInsert: {
          name: SUPER_ADMIN.title,
          email: SUPER_ADMIN.email,
          password: await bcrypt.hash(SUPER_ADMIN.defaultPassword, 10),
          platformRole: SUPER_ADMIN.platformRole,
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
