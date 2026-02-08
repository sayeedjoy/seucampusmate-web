import { CourseCatalogClient } from "./CourseCatalogClient";
import courseData from "./catalog.json";
import { type CatalogData } from "./types";
import { createPageMetadata } from "@/lib/metadata";

const data = courseData as CatalogData;

export const metadata = createPageMetadata("courseCatalog");

export default function CourseCatalogPage() {
    return <CourseCatalogClient data={data} />;
}
