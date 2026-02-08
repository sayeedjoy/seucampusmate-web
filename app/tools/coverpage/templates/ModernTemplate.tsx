import React from 'react';
import Image from 'next/image';
import { CoverPageData } from './types';

interface ModernTemplateProps {
  data: CoverPageData;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      {/* Header Section with Logo */}
      <div className="text-center border-b-2 border-gray-300 pb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 relative">
            <Image
              src="/coverlogo/logo.png"
              alt="University Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <h1 
          className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800" 
          style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: 'clamp(14pt, 4vw, 18pt)' }}
        >
          {data.taskTitle}
        </h1>
      </div>

      {/* Course Information Card */}
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
        <h2 
          className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 border-b pb-2" 
          style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: 'clamp(12pt, 3.5vw, 16pt)' }}
        >
          Course Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row">
              <span className="font-semibold text-gray-600 w-full sm:w-32 text-xs sm:text-sm">Faculty Initial:</span>
              <span className="text-gray-800 text-xs sm:text-sm">{data.facultyInitial}</span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <span className="font-semibold text-gray-600 w-full sm:w-32 text-xs sm:text-sm">Faculty Name:</span>
              <span className="text-gray-800 text-xs sm:text-sm">{data.facultyName}</span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <span className="font-semibold text-gray-600 w-full sm:w-32 text-xs sm:text-sm">Course Code:</span>
              <span className="text-gray-800 text-xs sm:text-sm">{data.courseCode}</span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <span className="font-semibold text-gray-600 w-full sm:w-32 text-xs sm:text-sm">Course Title:</span>
              <span className="text-gray-800 text-xs sm:text-sm">{data.courseTitle}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row">
              <span className="font-semibold text-gray-600 w-full sm:w-32 text-xs sm:text-sm">Program:</span>
              <span className="text-gray-800 text-xs sm:text-sm">{data.program}</span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <span className="font-semibold text-gray-600 w-full sm:w-32 text-xs sm:text-sm">Department:</span>
              <span className="text-gray-800 text-xs sm:text-sm">{data.department}</span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <span className="font-semibold text-gray-600 w-full sm:w-32 text-xs sm:text-sm">Semester:</span>
              <span className="text-gray-800 text-xs sm:text-sm">{data.semester}</span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <span className="font-semibold text-gray-600 w-full sm:w-32 text-xs sm:text-sm">Submission Date:</span>
              <span className="text-gray-800 text-xs sm:text-sm">{data.submissionDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Student Information Card */}
      <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200">
        <h2 
          className="text-lg sm:text-xl font-semibold mb-4 text-blue-700 border-b border-blue-300 pb-2" 
          style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: 'clamp(12pt, 3.5vw, 16pt)' }}
        >
          Submitted By
        </h2>
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row">
            <span className="font-semibold text-blue-600 w-full sm:w-32 text-xs sm:text-sm">Name:</span>
            <span className="text-blue-800 text-xs sm:text-sm">{data.studentName}</span>
          </div>
          <div className="flex flex-col sm:flex-row">
            <span className="font-semibold text-blue-600 w-full sm:w-32 text-xs sm:text-sm">Student Code:</span>
            <span className="text-blue-800 text-xs sm:text-sm" style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: 'clamp(9pt, 2.5vw, 11pt)' }}>
              {data.studentCode}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-gray-300">
        <p className="text-gray-500 text-xs" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
          Academic Assignment Cover Page
        </p>
      </div>
    </div>
  );
};
