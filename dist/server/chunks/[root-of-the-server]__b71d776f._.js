module.exports = [
"[project]/.next-internal/server/app/api/permissions/digital-assets/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/lib/middleware.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateToken",
    ()=>generateToken,
    "verifyToken",
    ()=>verifyToken,
    "withAuth",
    ()=>withAuth,
    "withRole",
    ()=>withRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
;
;
function verifyToken(token) {
    try {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}
function generateToken(payload) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
}
function withAuth(handler) {
    return async (req, context)=>{
        const authHeader = req.headers.get('authorization');
        console.log('Middleware: Authorization header:', authHeader);
        const token = authHeader?.replace('Bearer ', '');
        console.log('Middleware: Extracted token:', token ? 'Token exists' : 'No token');
        if (!token) {
            console.log('Middleware: No token provided');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const decoded = verifyToken(token);
        console.log('Middleware: Token verification result:', decoded ? 'Valid' : 'Invalid');
        if (!decoded) {
            console.log('Middleware: Invalid token');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid token'
            }, {
                status: 401
            });
        }
        req.user = decoded;
        return handler(req, context);
    };
}
function withRole(roles) {
    return function(handler) {
        return withAuth(async (req, context)=>{
            if (!req.user || !roles.includes(req.user.role)) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Forbidden'
                }, {
                    status: 403
                });
            }
            return handler(req, context);
        });
    };
}
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/src/lib/permissions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SYSTEM_MODULES",
    ()=>SYSTEM_MODULES,
    "canUserDelete",
    ()=>canUserDelete,
    "canUserRead",
    ()=>canUserRead,
    "canUserWrite",
    ()=>canUserWrite,
    "checkUserPermissions",
    ()=>checkUserPermissions,
    "getDepartmentPermissions",
    ()=>getDepartmentPermissions,
    "withPermissionCheck",
    ()=>withPermissionCheck
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const prisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]();
async function checkUserPermissions(userDepartment, userRole, module) {
    try {
        // Admin has full access to everything
        if (userRole === 'ADMIN') {
            return {
                canRead: true,
                canWrite: true,
                canDelete: true
            };
        }
        // Users without department have limited access
        if (!userDepartment) {
            return {
                canRead: true,
                canWrite: false,
                canDelete: false
            };
        }
        // Temporarily disable cache to fix hang issue
        // const cacheKey = CacheManager.generatePermissionKey(userDepartment, userRole, module)
        // const cachedPermission = CacheManager.getPermissions(cacheKey)
        // if (cachedPermission) {
        //   return cachedPermission
        // }
        // Get department permissions from database with timeout
        const permissionPromise = prisma.departmentPermission.findFirst({
            where: {
                department: userDepartment,
                module: module,
                isActive: true
            }
        });
        const timeoutPromise = new Promise((_, reject)=>setTimeout(()=>reject(new Error('Database query timeout')), 3000));
        const permission = await Promise.race([
            permissionPromise,
            timeoutPromise
        ]);
        let result;
        if (!permission) {
            // Default permissions if no specific permission is set
            result = {
                canRead: true,
                canWrite: false,
                canDelete: false
            };
        } else {
            result = {
                canRead: permission.canRead,
                canWrite: permission.canWrite,
                canDelete: permission.canDelete
            };
        }
        // Cache the result (temporarily disabled)
        // CacheManager.setPermissions(cacheKey, result)
        return result;
    } catch (error) {
        console.error('Error checking user permissions:', error);
        // Default to safe permissions on error
        return {
            canRead: true,
            canWrite: false,
            canDelete: false
        };
    }
}
async function canUserRead(userDepartment, userRole, module) {
    const permissions = await checkUserPermissions(userDepartment, userRole, module);
    return permissions.canRead;
}
async function canUserWrite(userDepartment, userRole, module) {
    const permissions = await checkUserPermissions(userDepartment, userRole, module);
    return permissions.canWrite;
}
async function canUserDelete(userDepartment, userRole, module) {
    const permissions = await checkUserPermissions(userDepartment, userRole, module);
    return permissions.canDelete;
}
async function getDepartmentPermissions(department) {
    try {
        const permissions = await prisma.departmentPermission.findMany({
            where: {
                department,
                isActive: true
            },
            orderBy: {
                module: 'asc'
            }
        });
        // Convert to a map for easy lookup
        const permissionMap = {};
        permissions.forEach((perm)=>{
            permissionMap[perm.module] = {
                canRead: perm.canRead,
                canWrite: perm.canWrite,
                canDelete: perm.canDelete
            };
        });
        return permissionMap;
    } catch (error) {
        console.error('Error getting department permissions:', error);
        return {};
    }
}
function withPermissionCheck(requiredModule, requiredAction) {
    return function(handler) {
        return async function(request, context) {
            try {
                // Extract user from request (assuming JWT verification is done)
                const user = request.user;
                if (!user) {
                    return new Response(JSON.stringify({
                        error: 'Unauthorized'
                    }), {
                        status: 401,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }
                // Check permissions
                const permissions = await checkUserPermissions(user.department, user.role, requiredModule);
                let hasPermission = false;
                switch(requiredAction){
                    case 'read':
                        hasPermission = permissions.canRead;
                        break;
                    case 'write':
                        hasPermission = permissions.canWrite;
                        break;
                    case 'delete':
                        hasPermission = permissions.canDelete;
                        break;
                }
                if (!hasPermission) {
                    return new Response(JSON.stringify({
                        error: 'Insufficient permissions'
                    }), {
                        status: 403,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }
                // Call the original handler
                return await handler(request, context);
            } catch (error) {
                console.error('Permission check error:', error);
                return new Response(JSON.stringify({
                    error: 'Internal server error'
                }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        };
    };
}
const SYSTEM_MODULES = {
    ASSETS: 'ASSETS',
    DOCUMENTS: 'DOCUMENTS',
    DIGITAL_ASSETS: 'DIGITAL_ASSETS',
    USERS: 'USERS',
    AUDIT_LOGS: 'AUDIT_LOGS',
    REPORTS: 'REPORTS',
    SETTINGS: 'SETTINGS'
};
}),
"[project]/src/lib/cache.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CacheManager",
    ()=>CacheManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lru$2d$cache$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lru-cache/dist/esm/index.js [app-route] (ecmascript)");
;
// Cache for permissions - expires after 5 minutes
const permissionsCache = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lru$2d$cache$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LRUCache"]({
    max: 1000,
    ttl: 5 * 60 * 1000
});
// Cache for user data - expires after 10 minutes
const userCache = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lru$2d$cache$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LRUCache"]({
    max: 500,
    ttl: 10 * 60 * 1000
});
// Cache for digital assets - expires after 2 minutes
const digitalAssetsCache = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lru$2d$cache$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LRUCache"]({
    max: 100,
    ttl: 2 * 60 * 1000
});
class CacheManager {
    // Permission caching
    static getPermissions(key) {
        return permissionsCache.get(key);
    }
    static setPermissions(key, value) {
        permissionsCache.set(key, value);
    }
    static clearPermissions(key) {
        if (key) {
            permissionsCache.delete(key);
        } else {
            permissionsCache.clear();
        }
    }
    // User caching
    static getUser(key) {
        return userCache.get(key);
    }
    static setUser(key, value) {
        userCache.set(key, value);
    }
    static clearUser(key) {
        if (key) {
            userCache.delete(key);
        } else {
            userCache.clear();
        }
    }
    // Digital assets caching
    static getDigitalAssets(key) {
        return digitalAssetsCache.get(key);
    }
    static setDigitalAssets(key, value) {
        digitalAssetsCache.set(key, value);
    }
    static clearDigitalAssets(key) {
        if (key) {
            digitalAssetsCache.delete(key);
        } else {
            digitalAssetsCache.clear();
        }
    }
    // Clear all caches
    static clearAll() {
        permissionsCache.clear();
        userCache.clear();
        digitalAssetsCache.clear();
    }
    // Generate cache keys
    static generatePermissionKey(department, role, module) {
        return `perm:${department || 'null'}:${role}:${module}`;
    }
    static generateUserKey(userId) {
        return `user:${userId}`;
    }
    static generateDigitalAssetsKey(params) {
        const { page, limit, search = '', aspectRatio = '', department = '' } = params;
        return `digital-assets:${page}:${limit}:${search}:${aspectRatio}:${department}`;
    }
}
}),
"[project]/src/app/api/permissions/digital-assets/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/permissions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cache.ts [app-route] (ecmascript)");
;
;
;
;
const GET = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withAuth"])(async (request)=>{
    try {
        const user = request.user;
        // Check cache first
        const cacheKey = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CacheManager"].generatePermissionKey(user.department, user.role, 'DIGITAL_ASSETS');
        const cachedPermissions = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CacheManager"].getPermissions(cacheKey);
        if (cachedPermissions) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(cachedPermissions);
        }
        const permissions = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkUserPermissions"])(user.department, user.role, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SYSTEM_MODULES"].DIGITAL_ASSETS);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(permissions);
    } catch (error) {
        console.error('Error checking permissions:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
});
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b71d776f._.js.map