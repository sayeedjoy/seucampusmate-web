import { CourseCatalogClient } from "./CourseCatalogClient";
import courseData from "./catalog.json";
import { type CatalogData } from "./types";

const data = courseData as CatalogData;

export default function CourseCatalogPage() {
    return <CourseCatalogClient data={data} />;
}
