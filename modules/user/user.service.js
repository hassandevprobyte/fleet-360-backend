const bcrypt = require("bcrypt");

// Repository
const userRepository = require("./user.repository");

// Validations
const joi = require("../../config");
const joiSchema = require("./user.schema");
const brandValidation = require("../brand/brand.validation");
const companyValidation = require("../company/company.validation");
const roleValidation = require("../role/role.validation");
const userValidation = require("./user.validation");

exports.getAllUsers = async (filters) => {
  return userRepository.getAllUsers(filters);
};

exports.getUsersWithPagination = async (payload) => {
  const { filters, page, pageSize, sort } = payload;
  const offset = (page - 1) * pageSize;

  const [users, totalCount] = await Promise.all([userRepository.getUsersWithPagination(filters, offset, pageSize, sort), userRepository.getUsersCount(filters)]);

  const meta = { totalCount, totalPages: Math.ceil(totalCount / pageSize), page, pageSize };

  return { data: users, meta };
};

exports.getUserById = async (userId) => {
  joi.validate(userId, joiSchema.getUserById);

  return userValidation.throwErrorIfUserDoesNotExist(userId);
};

exports.createUser = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.createUser);

  await userValidation.throwErrorIfUserEmailExists(validatedPayload.email);
  await companyValidation.throwErrorIfAnyCompanyDoesNotExist(validatedPayload.companies);
  await brandValidation.throwErrorIfAnyBrandDoesNotExistInAnyCompany(validatedPayload.brands, validatedPayload.companies);
  await roleValidation.throwErrorIfAnyRoleDoesNotExist(validatedPayload.roles);

  // todo: add smtp support here

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(validatedPayload.password, salt);

  const createPayload = { ...validatedPayload, password: hashedPassword };

  return userRepository.createUser(createPayload);
};

exports.updateUser = async (payload) => {
  const validatedPayload = joi.validate(payload, joiSchema.updateUser);

  const existingUser = await userValidation.throwErrorIfUserDoesNotExist(validatedPayload.id);

  const updatePayload = {};

  const updatedBrands = validatedPayload.brands || existingUser?.brands?.map((v) => String(v._id));
  const updatedCompanies = validatedPayload.companies || existingUser?.companies?.map((v) => String(v._id));

  if (validatedPayload.name && existingUser.name !== validatedPayload.name) {
    updatePayload.name = validatedPayload.name;
  }

  if (validatedPayload.email && existingUser.email !== validatedPayload.email) {
    await userValidation.throwErrorIfUserEmailExists(validatedPayload.email);

    updatePayload.email = validatedPayload.email;
  }

  if (validatedPayload.password) {
    const oldPassword = await userRepository.getUserPasswordById(existingUser._id);

    const compare = await bcrypt.compare(validatedPayload.password, oldPassword);

    if (!compare) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(validatedPayload.password, salt);

      updatePayload.password = hashedPassword;
    }
  }

  if (validatedPayload.companies) {
    const existingCompanyIds = existingUser?.companies?.map((v) => String(v._id));
    const incomingCompanyIds = validatedPayload.companies;

    const newCompanyIds = incomingCompanyIds.filter((companyId) => !existingCompanyIds.includes(companyId));

    if (newCompanyIds.length > 0) {
      await companyValidation.throwErrorIfAnyCompanyDoesNotExist(newCompanyIds);
    }

    const companiesAreDifferent = incomingCompanyIds.length !== existingCompanyIds.length || !incomingCompanyIds.every((companyId) => existingCompanyIds.includes(companyId));

    if (companiesAreDifferent) {
      await brandValidation.throwErrorIfAnyBrandDoesNotExistInAnyCompany(updatedBrands, incomingCompanyIds);

      updatePayload.companies = incomingCompanyIds;
    }
  }

  if (validatedPayload.brands) {
    const existingBrandIds = existingUser?.brands?.map((v) => String(v._id));
    const incomingBrandIds = validatedPayload.brands;

    const newBrandIds = incomingBrandIds.filter((brandId) => !existingBrandIds.includes(brandId));

    if (newBrandIds.length > 0) {
      await brandValidation.throwErrorIfAnyBrandDoesNotExistInAnyCompany(newBrandIds, updatedCompanies);
    }

    const brandsAreDifferent = incomingBrandIds.length !== existingBrandIds.length || !incomingBrandIds.every((brandId) => existingBrandIds.includes(brandId));

    if (brandsAreDifferent) {
      updatePayload.brands = incomingBrandIds;
    }
  }

  if (validatedPayload.roles) {
    const existingRoleIds = existingUser?.roles?.map((v) => String(v._id));
    const incomingRoleIds = validatedPayload.roles;

    const newRoleIds = incomingRoleIds.filter((roleId) => !existingRoleIds.includes(roleId));

    if (newRoleIds.length > 0) {
      await roleValidation.throwErrorIfAnyRoleDoesNotExist(newRoleIds);
    }

    const rolesAreDifferent = incomingRoleIds.length !== existingRoleIds.length || !incomingRoleIds.every((roleId) => existingRoleIds.includes(roleId));

    if (rolesAreDifferent) {
      updatePayload.roles = incomingRoleIds;
    }
  }

  if (validatedPayload.hasOwnProperty("isActive") && validatedPayload.isActive !== existingUser.isActive) {
    updatePayload.isActive = validatedPayload.isActive;
  }

  return userRepository.updateUserById(validatedPayload.id, updatePayload);
};

exports.deleteUser = async (userId) => {
  joi.validate(userId, joiSchema.getUserById);

  await userValidation.throwErrorIfUserDoesNotExist(userId);

  await userRepository.deleteUserById(userId);
  return { deletedId: userId };
};
