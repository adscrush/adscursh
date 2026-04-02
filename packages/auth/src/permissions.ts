export const PERMISSIONS = {
    // Offers
    "offers:view": "View offers",
    "offers:create": "Create offers",
    "offers:edit": "Edit offers",
    "offers:delete": "Delete offers",
    "offers:manage_affiliates": "Assign/reject affiliates on offer",

    // Affiliates
    "affiliates:view": "View affiliates",
    "affiliates:create": "Create affiliates",
    "affiliates:edit": "Edit affiliates",

    // Advertisers
    "advertisers:view": "View advertisers",
    "advertisers:create": "Create advertisers",
    "advertisers:edit": "Edit advertisers",

    // Reports
    "reports:view": "View reports",
    "reports:export": "Export reports",

    // Postbacks
    "postbacks:view": "View postbacks",
    "postbacks:manage": "Manage postback URLs",

    // Employees (admin only typically)
    "employees:view": "View employees",
    "employees:manage": "Manage employees",

    // Settings
    "settings:view": "View settings",
    "settings:edit": "Edit settings",
} as const

export type Permission = keyof typeof PERMISSIONS

// Presets for quick assignment
export const PERMISSION_PRESETS = {
    full: Object.keys(PERMISSIONS) as Permission[],

    readonly: [
        "offers:view",
        "affiliates:view",
        "advertisers:view",
        "reports:view",
        "postbacks:view",
    ] as Permission[],

    manager: [
        "offers:view",
        "offers:create",
        "offers:edit",
        "offers:manage_affiliates",
        "affiliates:view",
        "affiliates:create",
        "affiliates:edit",
        "advertisers:view",
        "reports:view",
        "reports:export",
        "postbacks:view",
        "postbacks:manage",
    ] as Permission[],
} as const

export type PermissionPreset = keyof typeof PERMISSION_PRESETS