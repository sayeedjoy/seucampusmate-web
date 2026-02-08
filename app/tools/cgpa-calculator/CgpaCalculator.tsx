'use client';

import React, { useState, useCallback, useEffect, useId } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldContent, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Course {
    id: number;
    credit: string;
    grade: string;
    courseName: string;
}

interface CalculationResult {
    cgpa: number;
    totalCredits: number;
    totalPoints: number;
    gradeLetter: string;
    remarks: string;
}

const CREDIT_OPTIONS = ['1', '3'];
const GRADE_OPTIONS = [
    '4.0 (A+)', '3.75 (A)', '3.5 (A-)', '3.25 (B+)', '3.0 (B)', '2.75 (B-)',
    '2.5 (C+)', '2.25 (C)', '2.0 (D)', '0.0 (F)'
];

const determineGradeAndRemarks = (cgpa: number): { gradeLetter: string; remarks: string } => {
    if (cgpa === 4.00) return { gradeLetter: 'A+', remarks: 'Outstanding' };
    if (cgpa >= 3.75) return { gradeLetter: 'A', remarks: 'Excellent' };
    if (cgpa >= 3.50) return { gradeLetter: 'A-', remarks: 'Quite Excellent' };
    if (cgpa >= 3.25) return { gradeLetter: 'B+', remarks: 'Very Good' };
    if (cgpa >= 3.00) return { gradeLetter: 'B', remarks: 'Good' };
    if (cgpa >= 2.75) return { gradeLetter: 'B-', remarks: 'Quite Good' };
    if (cgpa >= 2.50) return { gradeLetter: 'C+', remarks: 'Above Average' };
    if (cgpa >= 2.25) return { gradeLetter: 'C', remarks: 'Average' };
    if (cgpa >= 2.00) return { gradeLetter: 'D', remarks: 'Poor' };
    return { gradeLetter: 'F', remarks: 'Fail' };
};

const CgpaCalculator: React.FC = () => {
    const idScope = useId();
    const [courses, setCourses] = useState<Course[]>(() =>
        Array.from({ length: 2 }, (_, index) => ({
            id: index + 1,
            credit: '',
            grade: '',
            courseName: ''
        }))
    );

    const [result, setResult] = useState<CalculationResult | null>(null);
    const [errors, setErrors] = useState<Record<number, string>>({});
    const [nextId, setNextId] = useState(3);

    const addCourse = useCallback(() => {
        if (courses.length < 10) {
            setCourses(prev => [...prev, {
                id: nextId,
                credit: '',
                grade: '',
                courseName: ''
            }]);
            setNextId(prev => prev + 1);
        }
    }, [nextId, courses.length]);

    const removeCourse = useCallback((courseId: number) => {
        if (courses.length > 1) {
            setCourses(prev => prev.filter(course => course.id !== courseId));
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[courseId];
                return newErrors;
            });
        }
    }, [courses.length]);

    const updateCourse = useCallback((id: number, field: 'credit' | 'grade' | 'courseName', value: string) => {
        const processedValue = field === 'grade' ? value.split(' ')[0] : value;
        setCourses(prev => prev.map(course =>
            course.id === id ? { ...course, [field]: processedValue } : course
        ));

        if (errors[id]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }

        if (result) setResult(null);
    }, [errors, result]);

    const clearAll = useCallback(() => {
        setCourses(Array.from({ length: 2 }, (_, index) => ({
            id: index + 1,
            credit: '',
            grade: '',
            courseName: ''
        })));
        setResult(null);
        setErrors({});
        setNextId(3);
    }, []);

    // Real-time validation and calculation
    useEffect(() => {
        const newErrors: Record<number, string> = {};

        courses.forEach(course => {
            const missingFields = [];
            if (!course.credit) missingFields.push('credit hours');
            if (!course.grade) missingFields.push('grade point');

            if (missingFields.length > 0) {
                newErrors[course.id] = `Please select ${missingFields.join(' and ')}`;
            }
        });

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            setResult(null);
            return;
        }

        let totalCredits = 0;
        let totalPoints = 0;

        courses.forEach(course => {
            const credit = parseFloat(course.credit);
            const grade = parseFloat(course.grade);
            totalCredits += credit;
            totalPoints += credit * grade;
        });

        const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0.0;
        const { gradeLetter, remarks } = determineGradeAndRemarks(cgpa);

        setResult({
            cgpa: parseFloat(cgpa.toFixed(2)),
            totalCredits,
            totalPoints,
            gradeLetter,
            remarks
        });
    }, [courses]);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Courses</CardTitle>
                    <CardDescription>
                        Add your courses with credit hours and grade points. CGPA updates in real time when all required fields are filled.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {courses.map((course, index) => (
                        <Card key={course.id} className="overflow-hidden">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                                            {index + 1}
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground">Course {index + 1}</h3>
                                    </div>
                                    {courses.length > 1 && (
                                        <Button
                                            onClick={() => removeCourse(course.id)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <Field>
                                        <FieldLabel htmlFor={`${idScope}-course-${course.id}-name`}>
                                            Course Name <span className="font-normal text-muted-foreground">(Optional)</span>
                                        </FieldLabel>
                                        <FieldContent>
                                            <Input
                                                id={`${idScope}-course-${course.id}-name`}
                                                type="text"
                                                value={course.courseName}
                                                onChange={(e) => updateCourse(course.id, 'courseName', e.target.value)}
                                                placeholder="e.g., Mathematics 101"
                                                className="h-9"
                                            />
                                        </FieldContent>
                                    </Field>

                                    <Field>
                                        <FieldLabel>
                                            Credit Hours <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <FieldContent>
                                            <Select
                                                value={course.credit || undefined}
                                                onValueChange={(value) => updateCourse(course.id, 'credit', value)}
                                            >
                                                <SelectTrigger
                                                    className="w-full"
                                                    aria-invalid={!!errors[course.id] && !course.credit}
                                                    aria-describedby={errors[course.id] ? `${idScope}-course-${course.id}-error` : undefined}
                                                >
                                                    <SelectValue placeholder="Select credits" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CREDIT_OPTIONS.map(credit => (
                                                        <SelectItem key={credit} value={credit}>
                                                            {credit}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FieldContent>
                                    </Field>

                                    <Field className="sm:col-span-2 lg:col-span-1">
                                        <FieldLabel>
                                            Grade Point <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <FieldContent>
                                            <Select
                                                value={course.grade || undefined}
                                                onValueChange={(value) => updateCourse(course.id, 'grade', value)}
                                            >
                                                <SelectTrigger
                                                    className="w-full"
                                                    aria-invalid={!!errors[course.id] && !course.grade}
                                                    aria-describedby={errors[course.id] ? `${idScope}-course-${course.id}-error` : undefined}
                                                >
                                                    <SelectValue placeholder="Select grade" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {GRADE_OPTIONS.map(grade => (
                                                        <SelectItem key={grade} value={grade.split(' ')[0]}>
                                                            {grade}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FieldContent>
                                    </Field>
                                </div>

                                {errors[course.id] && (
                                    <FieldError id={`${idScope}-course-${course.id}-error`} className="mt-4">
                                        {errors[course.id]}
                                    </FieldError>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {courses.length < 10 && (
                        <div className="flex flex-col items-center gap-4 pt-2 sm:flex-row sm:justify-center">
                            <Button
                                onClick={addCourse}
                                variant="outline"
                                className="w-full border-dashed border-2 sm:w-auto"
                            >
                                + Add Another Course
                            </Button>
                            <Button onClick={clearAll} variant="outline" className="w-full sm:w-auto">
                                Clear All
                            </Button>
                        </div>
                    )}
                    {courses.length < 10 && (
                        <p className="text-center text-sm text-muted-foreground">
                            You can add up to {10 - courses.length} more course{10 - courses.length !== 1 ? 's' : ''}.
                        </p>
                    )}
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Calculation Results</CardTitle>
                        <CardDescription>Your CGPA and course breakdown.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-xl border border-border bg-muted/50 p-8 text-center">
                            <h2 className="text-sm font-medium text-muted-foreground mb-2">Your CGPA</h2>
                            <p className="text-4xl font-bold tracking-tight text-foreground md:text-6xl mb-4">
                                {result.cgpa.toFixed(2)}
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <Badge variant="secondary">Grade: {result.gradeLetter}</Badge>
                                <Badge variant="outline">{result.remarks}</Badge>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-lg border border-border bg-card p-6 text-center">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Total Credits</h4>
                                <p className="text-2xl font-bold text-foreground md:text-3xl">{result.totalCredits}</p>
                                <p className="text-sm text-muted-foreground mt-1">Credit Hours</p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-6 text-center">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Performance</h4>
                                <p className="text-xl font-bold text-foreground">{result.remarks}</p>
                                <p className="text-sm text-muted-foreground mt-1">Overall Rating</p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-6 text-center sm:col-span-3 sm:col-start-2 sm:max-w-xs sm:mx-auto lg:col-span-1 lg:max-w-none lg:mx-0">
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Total Courses</h4>
                                <p className="text-2xl font-bold text-foreground md:text-3xl">{courses.length}</p>
                                <p className="text-sm text-muted-foreground mt-1">Courses Added</p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-border bg-card">
                            <div className="border-b border-border px-6 py-4">
                                <h3 className="text-base font-semibold text-foreground">Course Breakdown</h3>
                                <p className="text-sm text-muted-foreground mt-1">Detailed breakdown of your courses and their contribution</p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {courses.map((course, index) => {
                                        const gradeOption = GRADE_OPTIONS.find(option => option.startsWith(course.grade));
                                        const gradeLetter = gradeOption ? gradeOption.split('(')[1]?.replace(')', '') : course.grade;
                                        return (
                                            <div
                                                key={course.id}
                                                className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-foreground">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-foreground">
                                                            {course.courseName || `Course ${index + 1}`}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {course.credit} credits • Grade: {gradeLetter}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-left sm:text-right">
                                                    <p className="font-semibold text-foreground">{course.grade} points</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {(parseFloat(course.credit) * parseFloat(course.grade)).toFixed(1)} total
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CgpaCalculator;
