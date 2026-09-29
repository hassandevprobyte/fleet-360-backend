// Repositories
const picklistRepository = require("../modules/picklist/picklist.repository");

const getGroupListItemsMap = async (group, filters = {}) => {
  let groupItems;

  switch (group) {
    case "location":
      groupItems = await picklistRepository.getAllPicklists(filters);
      break;

    case "category":
      groupItems = await picklistRepository.getAllPicklists(filters);
      break;

    case "subCategory":
      groupItems = await picklistRepository.getAllPicklists(filters);
      break;

    case "status":
      groupItems = await picklistRepository.getAllPicklists(filters);
      break;

    default:
      groupItems = await picklistRepository.getAllPicklists(filters);
      break;
  }

  return new Map(groupItems.map((group) => [group._id.toString(), group]));
};

module.exports = getGroupListItemsMap;
