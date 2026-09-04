require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Role, Permission } = require('../models');

async function seed() {
  await sequelize.sync({ force: true });

  // --- Permissions ---
  const permissionDefs = [
    { name: 'access:zoho_people', description: 'Access Zoho People' },
    { name: 'access:zoho_crm', description: 'Access Zoho CRM' },
    { name: 'access:zoho_desk', description: 'Access Zoho Desk' },
    { name: 'access:zoho_books', description: 'Access Zoho Books' },
    { name: 'manage:users', description: 'Create, edit, delete users' },
    { name: 'manage:roles', description: 'Create and manage roles/permissions' },
    { name: 'view:audit_logs', description: 'View system audit logs' },
  ];
  const permissions = {};
  for (const def of permissionDefs) {
    permissions[def.name] = await Permission.create(def);
  }

  // --- Roles ---
  const admin = await Role.create({ name: 'Admin', description: 'Full portal and Zoho access' });
  const manager = await Role.create({ name: 'Manager', description: 'Access to assigned department reports' });
  const hr = await Role.create({ name: 'HR', description: 'HR management via Zoho People' });
  const sales = await Role.create({ name: 'Sales', description: 'Sales via Zoho CRM' });
  const support = await Role.create({ name: 'Support', description: 'Support via Zoho Desk' });
  const finance = await Role.create({ name: 'Finance', description: 'Finance via Zoho Books' });

  await admin.setPermissions(Object.values(permissions));
  await hr.setPermissions([permissions['access:zoho_people']]);
  await sales.setPermissions([permissions['access:zoho_crm']]);
  await support.setPermissions([permissions['access:zoho_desk']]);
  await finance.setPermissions([permissions['access:zoho_books']]);

  // --- Seed users (demo credentials — change immediately outside of local dev) ---
  const demoPassword = 'Password@123';
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  const adminUser = await User.create({
    name: 'Portal Admin',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@company.com',
    passwordHash: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin@12345', 10),
  });
  await adminUser.setRoles([admin]);

  const hrUser = await User.create({ name: 'Hana Ray (HR)', email: 'hr@company.com', passwordHash });
  await hrUser.setRoles([hr]);

  const salesUser = await User.create({ name: 'Sam Lee (Sales)', email: 'sales@company.com', passwordHash });
  await salesUser.setRoles([sales]);

  const supportUser = await User.create({ name: 'Sunny Park (Support)', email: 'support@company.com', passwordHash });
  await supportUser.setRoles([support]);

  const financeUser = await User.create({ name: 'Finn Ance (Finance)', email: 'finance@company.com', passwordHash });
  await financeUser.setRoles([finance]);

  console.log('\nSeed complete. Demo accounts:');
  console.log(`  Admin:   ${adminUser.email} / ${process.env.SEED_ADMIN_PASSWORD || 'Admin@12345'}`);
  console.log(`  HR:      hr@company.com / ${demoPassword}`);
  console.log(`  Sales:   sales@company.com / ${demoPassword}`);
  console.log(`  Support: support@company.com / ${demoPassword}`);
  console.log(`  Finance: finance@company.com / ${demoPassword}`);

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
