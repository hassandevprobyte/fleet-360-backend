// Repositories
const brandRepository = require("../brand/brand.repository");
const companyRepository = require("../company/company.repository");
const picklistRepository = require("../picklist/picklist.repository");
const userRepository = require("../user/user.repository");

exports.getGroupListItemsMap = async (group, filters = {}) => {
  let groupItems;

  switch (group) {
    case "company":
      groupItems = await companyRepository.getAllCompanies(filters);
      break;

    case "brand":
      groupItems = await brandRepository.getAllBrands(filters);
      break;

    case "user":
    case "assignees":
      groupItems = await userRepository.getAllUsers(filters);
      break;

    default:
      groupItems = await picklistRepository.getAllPicklists(filters);
      break;
  }

  return new Map(groupItems.map((group) => [group._id.toString(), group]));
};
