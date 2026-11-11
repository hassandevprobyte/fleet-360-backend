const Vehicle = require("./vehicle.model");

const POPULATION_PIPELINE = [{ path: "make" }, { path: "model" }, { path: "type" }, { path: "fuelType" }, { path: "transmission" }, { path: "status" }, { path: "condition" }];

exports.getAllVehicles = async (filters) => {
  return Vehicle.find(filters).sort({ createdAt: -1 }).populate(POPULATION_PIPELINE).lean();
};

exports.getVehiclesWithPagination = async (filters, offset, pageSize, sort) => {
  return Vehicle.find(filters).skip(offset).limit(pageSize).sort(sort).populate(POPULATION_PIPELINE).lean();
};

exports.getVehiclesCount = async (filters) => {
  return Vehicle.countDocuments(filters);
};

exports.getVehiclesSummaryByGroup = async (filters, primaryGroup, secondaryGroup) => {
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

  const [result = { primaryGroupWise: [], secondaryGroupWise: [], totalCount: 0, totalPurchaseAmount: 0 }] = await Vehicle.aggregate(aggregationPipeline);

  return result;
};

exports.getVehicleById = async (vehicleId) => {
  return Vehicle.findById(vehicleId).populate(POPULATION_PIPELINE).lean();
};

exports.getVehicleByIdAndWorkspaceId = async (vehicleId, workspaceId) => {
  return Vehicle.findOne({ _id: vehicleId, workspace: workspaceId }).populate(POPULATION_PIPELINE).lean();
};

exports.getVehicleByLicensePlate = async (licensePlate) => {
  return Vehicle.findOne({ licensePlate });
};

exports.createVehicle = async (payload) => {
  return Vehicle.create(payload);
};

exports.updateVehicleById = async (vehicleId, payload) => {
  return Vehicle.findByIdAndUpdate(vehicleId, payload, { returnDocument: "after" });
};

exports.deleteVehicleById = async (vehicleId) => {
  return Vehicle.findByIdAndDelete(vehicleId);
};
