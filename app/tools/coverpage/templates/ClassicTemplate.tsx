import React from 'react';
import Image from 'next/image';
import { CoverPageData } from './types';

interface ClassicTemplateProps {
  data: CoverPageData;
}

export const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ data }) => {
  return (
    <div className="text-center space-y-6">
      {/* Title */}
      <div className="mb-6 sm:mb-8">
        <h1 
          className="text-xl sm:text-2xl lg:text-3xl font-bold underline mb-6 sm:mb-8" 
          style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: 'clamp(14pt, 4vw, 18pt)' }}
        >
          {data.taskTitle}
        </h1>
      </div>

      {/* Task Details Table */}
      <div className="max-w-full sm:max-w-xl mx-auto mb-6 sm:mb-8 overflow-x-auto">
        <table 
          className="w-full border-collapse text-xs sm:text-sm" 
          style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: 'clamp(9pt, 2.5vw, 11pt)' }}
        >
          <tbody>
            <tr>
              <td className="font-bold text-left py-1 sm:py-2 w-32 sm:w-48 text-xs sm:text-sm">Faculty Initial</td>
              <td className="text-center py-1 sm:py-2 w-4 sm:w-8 text-xs sm:text-sm">:</td>
              <td className="text-left py-1 sm:py-2 text-xs sm:text-sm">{data.facultyInitial}</td>
            </tr>
            <tr>
              <td className="font-bold text-left py-1 sm:py-2 w-32 sm:w-48 text-xs sm:text-sm">Faculty Name</td>
              <td className="text-center py-1 sm:py-2 w-4 sm:w-8 text-xs sm:text-sm">:</td>
              <td className="text-left py-1 sm:py-2 text-xs sm:text-sm">{data.facultyName}</td>
            </tr>
            <tr>
              <td className="font-bold text-left py-1 sm:py-2 w-32 sm:w-48 text-xs sm:text-sm">Course Code and Section</td>
              <td className="text-center py-1 sm:py-2 w-4 sm:w-8 text-xs sm:text-sm">:</td>
              <td className="text-left py-1 sm:py-2 text-xs sm:text-sm">{data.courseCode}</td>
            </tr>
            <tr>
              <td className="font-bold text-left py-1 sm:py-2 w-32 sm:w-48 text-xs sm:text-sm">Course Title</td>
              <td className="text-center py-1 sm:py-2 w-4 sm:w-8 text-xs sm:text-sm">:</td>
              <td className="text-left py-1 sm:py-2 text-xs sm:text-sm">{data.courseTitle}</td>
            </tr>
            <tr>
              <td className="font-bold text-left py-1 sm:py-2 w-32 sm:w-48 text-xs sm:text-sm">Program</td>
              <td className="text-center py-1 sm:py-2 w-4 sm:w-8 text-xs sm:text-sm">:</td>
              <td className="text-left py-1 sm:py-2 text-xs sm:text-sm">{data.program}</td>
            </tr>
            <tr>
              <td className="font-bold text-left py-1 sm:py-2 w-32 sm:w-48 text-xs sm:text-sm">Department</td>
              <td className="text-center py-1 sm:py-2 w-4 sm:w-8 text-xs sm:text-sm">:</td>
              <td className="text-left py-1 sm:py-2 text-xs sm:text-sm">{data.department}</td>
            </tr>
            <tr>
              <td className="font-bold text-left py-1 sm:py-2 w-32 sm:w-48 text-xs sm:text-sm">Semester</td>
              <td className="text-center py-1 sm:py-2 w-4 sm:w-8 text-xs sm:text-sm">:</td>
              <td className="text-left py-1 sm:py-2 text-xs sm:text-sm">{data.semester}</td>
            </tr>
            <tr>
              <td className="font-bold text-left py-1 sm:py-2 w-32 sm:w-48 text-xs sm:text-sm">Assignment Submission Date</td>
              <td className="text-center py-1 sm:py-2 w-4 sm:w-8 text-xs sm:text-sm">:</td>
              <td className="text-left py-1 sm:py-2 text-xs sm:text-sm">{data.submissionDate}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* University Logo */}
      <div className="flex justify-center py-4 sm:py-6 lg:py-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 relative">
          <Image
            src="/coverlogo/logo.png"
            alt="University Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Submitted By Section */}
      <div className="mt-6 sm:mt-8">
        <h2 
          className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6" 
          style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: 'clamp(12pt, 3.5vw, 16pt)' }}
        >
          Submitted By
        </h2>
        
        <div className="max-w-full sm:max-w-xl mx-auto overflow-x-auto">
          <table 
            className="w-full border-collapse text-xs sm:text-sm" 
            style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: 'clamp(9pt, 2.5vw, 11pt)' }}
          >
            <tbody>
              <tr>
                <td className="font-bold text-left py-1 sm:py-2 w-32 sm:w-48 text-xs sm:text-sm">Name</td>
                <td className="text-center py-1 sm:py-2 w-4 sm:w-8 text-xs sm:text-sm">:</td>
                <td className="text-left py-1 sm:py-2 text-xs sm:text-sm">{data.studentName}</td>
              </tr>
              <tr>
                <td className="font-bold text-left py-1 sm:py-2 w-32 sm:w-48 text-xs sm:text-sm">Student Code</td>
                <td className="text-center py-1 sm:py-2 w-4 sm:w-8 text-xs sm:text-sm">:</td>
                <td className="text-left py-1 sm:py-2 text-xs sm:text-sm" style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: 'clamp(9pt, 2.5vw, 11pt)' }}>
                  {data.studentCode}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
