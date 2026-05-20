import fs from "fs";
import path from "path";

const moduleName = process.argv[2];

if (!moduleName) {
  console.error("Please provide a module name. E.g., npm run generate student");
  process.exit(1);
}

// Convert to camelCase, PascalCase
const lowercaseName = moduleName.toLowerCase();
const capitalizedName = lowercaseName.charAt(0).toUpperCase() + lowercaseName.slice(1);

const targetDir = path.join(__dirname, "app", "modules", lowercaseName);

if (fs.existsSync(targetDir)) {
  console.error(`Module "${lowercaseName}" already exists at ${targetDir}`);
  process.exit(1);
}

// Create Directory
fs.mkdirSync(targetDir, { recursive: true });

// 1. Controller Template
const controllerTemplate = `import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ${capitalizedName}Service } from "./${lowercaseName}.service";

const create${capitalizedName} = catchAsync(async (req: Request, res: Response) => {
  const result = await ${capitalizedName}Service.create${capitalizedName}(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "${capitalizedName} created successfully!",
    data: result,
  });
});

const getAll${capitalizedName}s = catchAsync(async (req: Request, res: Response) => {
  const result = await ${capitalizedName}Service.getAll${capitalizedName}s();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "${capitalizedName}s retrieved successfully!",
    data: result,
  });
});

export const ${capitalizedName}Controller = {
  create${capitalizedName},
  getAll${capitalizedName}s,
};
`;

// 2. Service Template
const serviceTemplate = `import prisma from "../../helpers/prisma";

const create${capitalizedName} = async (payload: any) => {
  // Implement database operation
  return payload;
};

const getAll${capitalizedName}s = async () => {
  // Implement database operation
  return [];
};

export const ${capitalizedName}Service = {
  create${capitalizedName},
  getAll${capitalizedName}s,
};
`;

// 3. Route Template
const routeTemplate = `import express from "express";
import { ${capitalizedName}Controller } from "./${lowercaseName}.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/", auth("SUPER_ADMIN"), ${capitalizedName}Controller.create${capitalizedName});
router.get("/", ${capitalizedName}Controller.getAll${capitalizedName}s);

export const ${capitalizedName}Routes = router;
`;

fs.writeFileSync(path.join(targetDir, `${lowercaseName}.controller.ts`), controllerTemplate);
fs.writeFileSync(path.join(targetDir, `${lowercaseName}.service.ts`), serviceTemplate);
fs.writeFileSync(path.join(targetDir, `${lowercaseName}.route.ts`), routeTemplate);

console.log(`Successfully generated module "${lowercaseName}" at ${targetDir}`);
