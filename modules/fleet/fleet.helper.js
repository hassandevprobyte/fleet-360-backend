// Repositories
const picklistRepository = require("../picklist/picklist.repository");

exports.getGroupListItemsMap = async (group, filters = {}) => {
  let groupItems;

  switch (group) {
    case "company":
      break;

    case "brand":
      break;

    case "user":
    case "assignees":
      break;

    default:
      groupItems = await picklistRepository.getAllPicklists(filters);
      break;
  }

  return new Map(groupItems.map((group) => [group._id.toString(), group]));
};
