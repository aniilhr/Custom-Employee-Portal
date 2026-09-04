const zohoApps = require('../config/zohoApps');
const { callZohoApi } = require('../services/zohoService');
const auditService = require('../services/auditService');

// GET /api/zoho/apps
// Returns only the Zoho apps this user's roles are authorized to see, for dashboard rendering.
async function getAuthorizedApps(req, res) {
  const userRoles = req.user.roles || [];

  let apps;
  if (userRoles.includes('Admin')) {
    apps = Object.values(zohoApps); // Admin sees everything
  } else {
    apps = userRoles
      .map((role) => zohoApps[role])
      .filter(Boolean);
  }

  res.json({ apps });
}

// POST /api/zoho/launch/:appKey
// Validates the user is authorized for the requested app, then proxies/returns a launch URL.
// The employee never sees or handles the underlying Zoho service-account token.
async function launchApp(req, res) {
  const { appKey } = req.params;
  const userRoles = req.user.roles || [];

  const matchedEntry = Object.entries(zohoApps).find(([, app]) => app.key === appKey);
  if (!matchedEntry) {
    return res.status(404).json({ message: 'Unknown Zoho application' });
  }

  const [role, app] = matchedEntry;
  const authorized = userRoles.includes('Admin') || userRoles.includes(role);

  if (!authorized) {
    await auditService.logEvent({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ZOHO_ACCESS_DENIED',
      details: { appKey },
    });
    return res.status(403).json({ message: 'Access Denied: You are not authorized for this Zoho application' });
  }

  await auditService.logEvent({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'ZOHO_ACCESS',
    details: { appKey, app: app.name },
  });

  // In a full integration this might call callZohoApi(...) to fetch a deep-link
  // or embed data. For the portal's redirect flow we simply return the app URL.
  res.json({ url: app.url, name: app.name });
}

// Example authenticated proxy call, e.g. fetching data from Zoho Books for a Finance user.
// GET /api/zoho/proxy/books/invoices
async function proxyBooksInvoices(req, res, next) {
  try {
    const data = await callZohoApi({ method: 'GET', path: '/books/v3/invoices', params: { organization_id: req.query.organization_id } });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAuthorizedApps, launchApp, proxyBooksInvoices };
