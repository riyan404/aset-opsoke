module.exports = [
"[project]/.next-internal/server/app/api/digital-assets/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    // Memory optimization: Configure connection pooling
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    },
    // Reduce memory usage with optimized logging
    log: ("TURBOPACK compile-time truthy", 1) ? [
        'query',
        'error',
        'warn'
    ] : "TURBOPACK unreachable",
    // Connection pool optimization for memory efficiency
    __internal: {
        engine: {
            // Limit connection pool size to reduce memory usage
            connectionLimit: 5
        }
    }
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
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
"[project]/src/lib/audit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "logActivity",
    ()=>logActivity
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
async function logActivity(userId, action, resource, resourceId, oldValues, newValues, ipAddress, userAgent) {
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].auditLog.create({
            data: {
                userId,
                action,
                resource,
                resourceId,
                oldValues: oldValues ? JSON.stringify(oldValues) : null,
                newValues: newValues ? JSON.stringify(newValues) : null,
                ipAddress,
                userAgent
            }
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}
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
"[project]/src/app/api/digital-assets/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/audit.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/permissions.ts [app-route] (ecmascript)");
;
;
;
;
;
const GET = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withAuth"])(async (request)=>{
    try {
        const user = request.user;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const search = searchParams.get('search') || '';
        const aspectRatio = searchParams.get('aspectRatio') || '';
        const department = searchParams.get('department') || '';
        // Temporarily disable cache to fix loading issue
        // const cacheKey = `digital-assets:${user.id}:${page}:${limit}:${search}:${aspectRatio}:${department}`
        // const cachedResult = CacheManager.getDigitalAssets(cacheKey)
        // if (cachedResult) {
        //   const response = NextResponse.json(cachedResult)
        //   response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400')
        //   response.headers.set('ETag', `"${Buffer.from(cacheKey).toString('base64')}"`)
        //   response.headers.set('Vary', 'Accept-Encoding')
        //   response.headers.set('X-Cache-Status', 'HIT')
        //   return response
        // }
        // Check permissions with timeout
        const permissionPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkUserPermissions"])(user.department, user.role, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SYSTEM_MODULES"].DIGITAL_ASSETS);
        const timeoutPromise = new Promise((_, reject)=>setTimeout(()=>reject(new Error('Permission check timeout')), 5000));
        const permissions = await Promise.race([
            permissionPromise,
            timeoutPromise
        ]);
        if (!permissions.canRead) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Forbidden'
            }, {
                status: 403
            });
        }
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {
            isActive: true
        };
        // Add search filter
        if (search) {
            where.OR = [
                {
                    contentName: {
                        contains: search
                    }
                },
                {
                    description: {
                        contains: search
                    }
                },
                {
                    tags: {
                        contains: search
                    }
                }
            ];
        }
        // Add aspect ratio filter
        if (aspectRatio) {
            where.aspectRatio = aspectRatio;
        }
        // Optional department filter (available for all users)
        if (department && department !== 'all') {
            where.department = department;
        }
        // Optimize query by selecting only necessary fields and get total count
        const [digitalAssets, total] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].digitalAsset.findMany({
                where,
                select: {
                    id: true,
                    contentName: true,
                    description: true,
                    // Always load preview files for all pages
                    previewFile: true,
                    previewFileName: true,
                    previewFileSize: true,
                    aspectRatio: true,
                    googleDriveLink: true,
                    tags: true,
                    department: true,
                    createdAt: true,
                    updatedAt: true,
                    createdBy: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].digitalAsset.count({
                where
            })
        ]);
        const result = {
            digitalAssets,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        };
        // Cache the result with enhanced caching (temporarily disabled)
        // CacheManager.setDigitalAssets(cacheKey, result)
        // Return with optimized cache headers
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result);
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    } catch (error) {
        console.error('Failed to fetch digital assets:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch digital assets'
        }, {
            status: 500
        });
    }
});
const POST = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withAuth"])(async (request)=>{
    try {
        const user = request.user;
        // Check if user can create digital assets
        const permissions = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkUserPermissions"])(user.department, user.role, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SYSTEM_MODULES"].DIGITAL_ASSETS);
        if (!permissions.canWrite) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'You do not have permission to create digital assets'
            }, {
                status: 403
            });
        }
        const contentType = request.headers.get('content-type');
        let data;
        let previewFileBuffer = null;
        let previewFileName = null;
        let previewFileSize = null;
        if (contentType?.includes('multipart/form-data')) {
            // Handle FormData (with file upload)
            const formData = await request.formData();
            const previewFile = formData.get('previewFile');
            data = {
                contentName: formData.get('contentName'),
                description: formData.get('description'),
                aspectRatio: formData.get('aspectRatio'),
                googleDriveLink: formData.get('googleDriveLink'),
                tags: formData.get('tags'),
                department: formData.get('department')
            };
            // Process uploaded file if present
            if (previewFile && previewFile.size > 0) {
                // Convert file to base64 for storage
                const bytes = await previewFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                previewFileBuffer = buffer.toString('base64');
                previewFileName = previewFile.name;
                previewFileSize = previewFile.size;
            }
        } else {
            // Handle JSON data (legacy support)
            data = await request.json();
            previewFileBuffer = data.previewFile;
            previewFileName = data.previewFileName;
            previewFileSize = data.previewFileSize;
        }
        const { contentName, description, aspectRatio, googleDriveLink, tags, department } = data;
        // Validate required fields
        if (!contentName || !aspectRatio) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Content name and aspect ratio are required'
            }, {
                status: 400
            });
        }
        // Validate aspect ratio
        if (![
            'RATIO_4_3',
            'RATIO_9_16'
        ].includes(aspectRatio)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid aspect ratio. Must be RATIO_4_3 or RATIO_9_16'
            }, {
                status: 400
            });
        }
        // Create digital asset
        const digitalAsset = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].digitalAsset.create({
            data: {
                contentName,
                description,
                aspectRatio,
                googleDriveLink,
                previewFile: previewFileBuffer,
                previewFileName,
                previewFileSize,
                tags,
                department: department || user.department || 'Digital',
                createdById: user.id,
                updatedById: user.id
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                updatedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        // Log activity
        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logActivity"])(user.id, 'CREATE_DIGITAL_ASSET', 'DigitalAsset', digitalAsset.id, null, digitalAsset, ipAddress, request.headers.get('user-agent') || 'unknown');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            digitalAsset
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Failed to create digital asset:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create digital asset'
        }, {
            status: 500
        });
    }
});
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c115665c._.js.map