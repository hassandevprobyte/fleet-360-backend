const Fleet = require("./fleet.model");

const POPULATION_PIPELINE = [{ path: "make" }, { path: "model" }, { path: "type" }, { path: "fuelType" }, { path: "transmission" }, { path: "status" }, { path: "condition" }];

exports.getAllFleets = async (filters) => {
  return Fleet.find(filters).sort({ createdAt: -1 }).populate(POPULATION_PIPELINE).lean();
};

exports.getFleetsWithPagination = async (filters, offset, pageSize, sort) => {
  return Fleet.find(filters).skip(offset).limit(pageSize).sort(sort).populate(POPULATION_PIPELINE).lean();
};

exports.getFleetsCount = async (filters) => {
  return Fleet.countDocuments(filters);
};

exports.getFleetsSummaryByGroup = async (filters, primaryGroup, secondaryGroup) => {
  const matchPipeline = [{ $match: filters }];

  const facetPipelines = {
    totals: [{ $group: { _id: null, totalCount: { $sum: 1 }, totalPurchaseAmount: { $sum: "$purchaseAmount" } } }],
    primaryGroupWise: [
      {
        $group: {
          _id: { primaryGroup: `$${primaryGroup}`, secondaryGroup: `$${secondaryGroup}` },
          count: { $sum: 1 },
          purchaseAmount: { $sum: "$purchaseAmount" },
        },
      },
      {
        $group: {
          _id: "$_id.primaryGroup",
          groupType: { $first: primaryGroup },
          secondaryGroupWise: { $push: { _id: "$_id.secondaryGroup", groupType: secondaryGroup, count: "$count", purchaseAmount: "$purchaseAmount" } },
          count: { $sum: "$count" },
          purchaseAmount: { $sum: "$purchaseAmount" },
        },
      },
    ],
    secondaryGroupWise: [{ $group: { _id: `$${secondaryGroup}`, count: { $sum: 1 }, purchaseAmount: { $sum: "$purchaseAmount" } } }],
  };

  const projectionPipeline = [
    {
      $project: {
        primaryGroupWise: 1,
        secondaryGroupWise: 1,
        totalCount: { $arrayElemAt: ["$totals.totalCount", 0] },
        totalPurchaseAmount: { $arrayElemAt: ["$totals.totalPurchaseAmount", 0] },
      },
    },
  ];

  const aggregationPipeline = [...matchPipeline, { $facet: facetPipelines }, ...projectionPipeline];

  const [result = { primaryGroupWise: [], secondaryGroupWise: [], totalCount: 0, totalPurchaseAmount: 0 }] = await Fleet.aggregate(aggregationPipeline);

  return result;
};

exports.getFleetById = async (fleetId) => {
  return Fleet.findById(fleetId).populate(POPULATION_PIPELINE).lean();
};

exports.getFleetByLicensePlate = async (licensePlate) => {
  return Fleet.findOne({ licensePlate });
};

exports.createFleet = async (payload) => {
  return Fleet.create(payload);
};

exports.updateFleetById = async (fleetId, payload) => {
  return Fleet.findByIdAndUpdate(fleetId, payload, { returnDocument: "after" });
};

exports.deleteFleetById = async (fleetId) => {
  return Fleet.findByIdAndDelete(fleetId);
};
