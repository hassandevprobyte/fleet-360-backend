const Boom = require("@hapi/boom");

// Repositories
const picklistRepository = require("../picklist/picklist.repository");

// Utilities
const isValidObjectId = require("../../utils/isValidObjectId");

// Config
const ENUMS = require("../../constants/ENUMS");

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

exports.transformFleetsSummaryByGroup = async (fleetsSummary, primaryGroup, secondaryGroup) => {
  const primaryGroupIds = fleetsSummary.primaryGroupWise
    .map((group) => group?._id)
    .filter((id) => id && isValidObjectId(id))
    .map(String);
  const primaryFilters = { _id: { $in: primaryGroupIds } };

  const secondaryGroupIds = fleetsSummary.secondaryGroupWise
    .map((group) => group?._id)
    .filter((id) => id && isValidObjectId(id))
    .map(String);
  const secondaryFilters = { _id: { $in: secondaryGroupIds } };

  const [primaryGroupItemsMap, secondaryGroupItemsMap] = await Promise.all([
    exports.getGroupListItemsMap(primaryGroup, primaryFilters),
    exports.getGroupListItemsMap(secondaryGroup, secondaryFilters),
  ]);

  const transformSecondaryGroupWise = (secondaryGroupWise = []) => {
    const secondaryGroupWiseMap = new Map(secondaryGroupWise.map((s) => [String(s._id), s]));

    return Array.from(secondaryGroupItemsMap.values())
      .map((s) => {
        const secondaryGroupData = secondaryGroupWiseMap.get(String(s._id)) || {};

        const _id = s._id || null;
        const title = s.title || "-";
        const color = s.color || null;
        const count = secondaryGroupData.count || 0;
        const purchaseAmount = secondaryGroupData.purchaseAmount || 0;

        return { _id, title, color, count, purchaseAmount };
      })
      .sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
  };

  const transformPrimaryGroupWise = (primaryGroupWise = []) => {
    return primaryGroupWise
      .map((primaryGroup) => {
        const primaryGroupFound = primaryGroupItemsMap.get(String(primaryGroup._id));

        return {
          ...primaryGroup,
          title: primaryGroupFound?.title || "-",
          color: primaryGroupFound?.color || null,
          secondaryGroupWise: transformSecondaryGroupWise(primaryGroup?.secondaryGroupWise),
        };
      })
      .sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
  };

  const primaryGroupWise = transformPrimaryGroupWise(fleetsSummary.primaryGroupWise);
  const secondaryGroupWise = transformSecondaryGroupWise(fleetsSummary.secondaryGroupWise);

  return { ...fleetsSummary, primaryGroupWise, secondaryGroupWise };
};

exports.validateFleetStatus = (payload) => {
  const { status, driverDetails } = payload;

  switch (status) {
    case ENUMS.FLEET.STATUSES.IN_HOUSE:
      if (driverDetails) {
        throw Boom.badRequest("Driver details should not be provided when status is 'In House'");
      }
      break;

    case ENUMS.FLEET.STATUSES.ASSIGNED:
      if (!driverDetails) {
        throw Boom.badRequest("Driver details must be provided when status is 'Assigned'");
      }
      break;

    case ENUMS.FLEET.STATUSES.IN_MAINTENANCE:
      break;

    default:
      break;
  }
};
