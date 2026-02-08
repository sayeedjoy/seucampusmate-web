'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

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

    const calculateCgpa = useCallback(() => {
        const newErrors: Record<number, string> = {};

        courses.forEach(course => {
            const missingFields = [];
            if (!course.credit) missingFields.push('credit hours');
            if (!course.grade) missingFields.push('grade point');

            if (missingFields.length > 0) {
                newErrors[course.id] = `Please select ${missingFields.join(' and ')}`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
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
        setErrors({});
    }, [courses]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-foreground mb-4">CGPA Calculator</h1>
                <p className="text-muted-foreground">Calculate your Cumulative Grade Point Average</p>
            </div>

            {/* Course Input Section */}
            <div className="space-y-4">
                {courses.map((course, index) => (
                    <div
                        key={course.id}
                        className={`
                            bg-card border rounded-lg p-6 transition-all duration-200 
                            ${errors[course.id]
                                ? 'border-red-300 bg-red-50/50 shadow-sm'
                                : 'border-border hover:border-border hover:shadow-sm'
                            }
                        `}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center text-sm font-semibold">
                                    {index + 1}
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">Course {index + 1}</h3>
                            </div>
                            {courses.length > 1 && (
                                <Button
                                    onClick={() => removeCourse(course.id)}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                                >
                                    Remove
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-muted-foreground">
                                    Course Name <span className="text-muted-foreground font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={course.courseName}
                                    onChange={(e) => updateCourse(course.id, 'courseName', e.target.value)}
                                    placeholder="e.g., Mathematics 101"
                                    className="w-full px-3 py-2.5 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-muted-foreground">
                                    Credit Hours <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={course.credit}
                                    onChange={(e) => updateCourse(course.id, 'credit', e.target.value)}
                                    className={`w-full px-3 py-2.5 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 transition-colors ${errors[course.id] && !course.credit
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-input focus:ring-ring focus:border-ring'
                                        }`}
                                >
                                    <option value="">Select credits</option>
                                    {CREDIT_OPTIONS.map(credit => (
                                        <option key={credit} value={credit}>{credit}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                <label className="block text-sm font-medium text-muted-foreground">
                                    Grade Point <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={course.grade}
                                    onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                                    className={`w-full px-3 py-2.5 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 transition-colors ${errors[course.id] && !course.grade
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-input focus:ring-ring focus:border-ring'
                                        }`}
                                >
                                    <option value="">Select grade</option>
                                    {GRADE_OPTIONS.map(grade => (
                                        <option key={grade} value={grade.split(' ')[0]}>{grade}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {errors[course.id] && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-red-800">{errors[course.id]}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {courses.length < 10 && (
                    <div className="text-center py-4">
                        <Button
                            onClick={addCourse}
                            variant="outline"
                            className="border-dashed border-2 border-border text-muted-foreground hover:bg-muted px-6 py-3"
                        >
                            + Add Another Course
                        </Button>
                        <p className="text-sm text-muted-foreground mt-2">
                            You can add up to {10 - courses.length} more course{10 - courses.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                    onClick={calculateCgpa}
                    disabled={courses.length === 0}
                    className="px-8 py-3 text-base font-medium min-w-[160px] bg-blue-600 hover:bg-blue-700 disabled:bg-muted disabled:cursor-not-allowed"
                >
                    Calculate CGPA
                </Button>
                <Button
                    onClick={clearAll}
                    variant="outline"
                    className="px-8 py-3 text-base font-medium min-w-[160px] border-border text-muted-foreground hover:bg-muted"
                >
                    Clear All
                </Button>
            </div>

            {/* Results Section */}
            {result && (
                <div className="space-y-6 pt-6 border-t border-border">
                    {/* Main CGPA Result */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-foreground mb-6">Your CGPA Results</h2>
                        <div className="text-6xl font-bold text-blue-600 mb-4">
                            {result.cgpa.toFixed(2)}
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                                Grade: {result.gradeLetter}
                            </span>
                            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                                {result.remarks}
                            </span>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-sm transition-shadow">
                            <h4 className="font-medium text-gray-700 mb-2">Total Credits</h4>
                            <p className="text-3xl font-bold text-blue-600">{result.totalCredits}</p>
                            <p className="text-sm text-gray-500 mt-1">Credit Hours</p>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-sm transition-shadow">
                            <h4 className="font-medium text-gray-700 mb-2">Performance</h4>
                            <p className="text-xl font-bold text-green-600">{result.remarks}</p>
                            <p className="text-sm text-gray-500 mt-1">Overall Rating</p>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-sm transition-shadow sm:col-span-3 sm:col-start-2 sm:max-w-xs sm:mx-auto lg:col-span-1 lg:max-w-none lg:mx-0">
                            <h4 className="font-medium text-gray-700 mb-2">Total Courses</h4>
                            <p className="text-3xl font-bold text-blue-600">{courses.length}</p>
                            <p className="text-sm text-gray-500 mt-1">Courses Added</p>
                        </div>
                    </div>

                    {/* Course Breakdown */}
                    <div className="bg-card border border-border rounded-lg">
                        <div className="px-6 py-4 border-b border-border">
                            <h3 className="text-lg font-semibold text-foreground">Course Breakdown</h3>
                            <p className="text-sm text-gray-500 mt-1">Detailed breakdown of your courses and their contribution</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {courses.map((course, index) => {
                                    const gradeOption = GRADE_OPTIONS.find(option => option.startsWith(course.grade));
                                    const gradeLetter = gradeOption ? gradeOption.split('(')[1]?.replace(')', '') : course.grade;
                                    return (
                                        <div key={course.id} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-semibold">
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
                                            <div className="text-right">
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
                </div>
            )}
        </div>
    );
};

export default CgpaCalculator;