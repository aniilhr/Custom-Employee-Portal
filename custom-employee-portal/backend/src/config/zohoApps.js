// Central mapping of role -> Zoho application metadata.
// Used to decide what appears on the employee dashboard and where "launch" redirects to.
require('dotenv').config();

module.exports = {
  HR: {
    key: 'zoho_people',
    name: 'Zoho People',
    purpose: 'HR management functions',
    url: process.env.ZOHO_PEOPLE_URL,
  },
  Sales: {
    key: 'zoho_crm',
    name: 'Zoho CRM',
    purpose: 'Sales and customer relationship management',
    url: process.env.ZOHO_CRM_URL,
  },
  Support: {
    key: 'zoho_desk',
    name: 'Zoho Desk',
    purpose: 'Support ticketing and case management',
    url: process.env.ZOHO_DESK_URL,
  },
  Finance: {
    key: 'zoho_books',
    name: 'Zoho Books',
    purpose: 'Financial and accounting operations',
    url: process.env.ZOHO_BOOKS_URL,
  },
};
