// Types for course catalog data

export type Course = {
    code: string;
    title: string;
    credits: number;
    prerequisites: string[];
    topics?: string[];
};

export type CatalogData = {
    course_catalog: Course[];
    electives: {
        group_A_without_lab: Course[];
        group_B_with_lab: Course[];
    };
};
