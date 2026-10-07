exports.error = {
  access: {
    notFound: "Access not found",
    userAccessNotFound: "User access not found",
    userExists: "Access user already exists",
  },
  asset: {
    notFound: "Asset not found",
  },
  attachment: {
    notFound: "Attachment not found",
    resourceNotFound: (resource) => `${resource} not found`,
  },
  auth: {
    unauthorized: "Not authorized",
    forbidden: "Forbidden",
    accessDenied: "Access denied",
    emailNotExists: "Email does not exist",
    invalidCredentials: "Invalid credentials",
    incorrectPassword: "Incorrect password",
    incorrectOldPassword: "Incorrect old password",
  },
  brand: {
    notFound: "Brand not found",
    notFoundInCompany: "Brand not found in company",
    titleExists: "Brand title already exists",
    acronymExists: "Brand acronym already exists",
    assignedOnUser: "Brand is assigned on user",
  },
  company: {
    notFound: "Company not found",
    titleExists: "Company title already exists",
    acronymExists: "Company acronym already exists",
    assignedOnUser: "Company is assigned on user",
  },
  depreciation: {
    notFound: "Depreciation not found",
    titleExists: "Depreciation already exists",
  },
  fleet: {
    notFound: "Fleet not found",
    licensePlateExists: "License plate already exists",
  },
  insurance: {
    notFound: "Insurance not found",
  },
  maintenance: {
    notFound: "Maintenance not found",
  },
  picklist: {
    notFound: "Picklist not found",
    titleExists: "Picklist title already exists",
    acronymExists: "Picklist acronym already exists",
    defaultNotExists: "Default picklist does not exist",
    defaultCannotBeDeleted: "Default picklist cannot be deleted",
    invalidContext: "Picklist context is invalid",
    invalidResource: (resource) => `Invalid resource: ${resource}`,
    invalidField: (field) => `Invalid field: ${field}`,
    assignedOnResource: (resource) => `Picklist is assigned on ${resource}`,
  },
  role: {
    notFound: "Role not found",
    titleExists: "Role title already exists",
    assignedOnUser: "Role is assigned on user",
  },
  taxation: {
    notFound: "Taxation not found",
  },
  user: {
    notFound: "User not found",
    notFoundInBrand: "User not found in brand",
    notFoundInCompany: "User not found in company",
    emailExists: "User email already exists",
  },
};
