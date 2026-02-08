/**
 * SEO utilities - Unified module for metadata, structured data, and page registration
 * 
 * This module provides:
 * - Type-safe page configuration
 * - Consistent metadata generation
 * - Structured data helpers
 * - Page registry for adding new pages safely
 */

export {
    baseMetadata,
    pageMetadata,
    createPageMetadata,
    createDynamicMetadata,
    type PageMetadataKey
} from '../metadata';

export {
    getOrganizationStructuredData,
    getWebSiteStructuredData,
    getWebApplicationStructuredData,
    getBreadcrumbStructuredData,
    getSoftwareApplicationStructuredData,
    type OrganizationStructuredData,
    type WebSiteStructuredData,
    type WebApplicationStructuredData,
    type BreadcrumbStructuredData
} from '../structured-data';

export {
    registerPage,
    getPageConfig,
    getAllPages,
    generateMetadataFromConfig,
    type PageConfig
} from './page-registry';
