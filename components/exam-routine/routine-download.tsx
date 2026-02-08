'use client';

import { useState } from 'react';
import { DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ExamData {
    courseCode: string;
    courseTitle: string;
    date: string;
    startTime: string;
    endTime: string;
    faculty: string;
}

interface ExamRoutineDownloadProps {
    getTotalResults: () => number;
    getAllExams: () => ExamData[];
    courseCodes: string[];
    formatDate: (date: string) => string;
    formatTime: (startTime: string, endTime: string) => string;
}

export default function ExamRoutineDownload({ 
    getTotalResults, 
    getAllExams, 
    courseCodes, 
    formatDate, 
    formatTime 
}: ExamRoutineDownloadProps) {
    const [downloading, setDownloading] = useState(false);

    const downloadAsPDF = async () => {
        if (getTotalResults() === 0) return;
        
        setDownloading(true);
        try {
            // Dynamically import jsPDF
            const jsPDFModule = await import('jspdf');
            const jsPDF = jsPDFModule.default;
            const doc = new jsPDF();
            
            // Title
            doc.setFontSize(20);
            doc.setTextColor(59, 130, 246); // Blue color
            doc.text('Exam Schedule', 20, 30);
            
            // Subtitle
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 40);
            doc.text(`Course codes: ${courseCodes.join(', ')}`, 20, 50);
            
            let yPosition = 70;
            const allExams = getAllExams();
            
            allExams.forEach((exam) => {
                // Check if we need a new page
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 30;
                }
                
                // Course title
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                doc.text(exam.courseTitle, 20, yPosition);
                yPosition += 10;
                
                // Course code
                doc.setFontSize(10);
                doc.setTextColor(59, 130, 246);
                doc.text(`Course: ${exam.courseCode}`, 20, yPosition);
                yPosition += 8;
                
                // Exam details
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.text(`Date: ${formatDate(exam.date)}`, 20, yPosition);
                yPosition += 6;
                doc.text(`Time: ${formatTime(exam.startTime, exam.endTime)}`, 20, yPosition);
                yPosition += 6;
                doc.text(`Faculty: ${exam.faculty}`, 20, yPosition);
                yPosition += 15; // Extra space between exams
            });
            
            // Save the PDF
            doc.save(`exam-schedule-${new Date().toISOString().split('T')[0]}.pdf`);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const downloadAsPNG = async () => {
        if (getTotalResults() === 0) return;
        
        setDownloading(true);
        try {
            // Dynamically import html2canvas
            const html2canvas = (await import('html2canvas')).default;
            
            // Create a wrapper div for the content
            const wrapper = document.createElement('div');
            wrapper.style.width = '800px';
            wrapper.style.padding = '40px';
            wrapper.style.backgroundColor = 'white';
            wrapper.style.fontFamily = 'Arial, sans-serif';
            wrapper.style.position = 'absolute';
            wrapper.style.left = '-9999px';
            
            // Create header
            const header = document.createElement('div');
            header.style.marginBottom = '30px';
            
            const title = document.createElement('h1');
            title.textContent = 'Exam Schedule';
            title.style.fontSize = '24px';
            title.style.margin = '0 0 10px 0';
            title.style.color = '#3b82f6';
            
            const subtitle = document.createElement('p');
            subtitle.textContent = `Generated on ${new Date().toLocaleDateString()} | Courses: ${courseCodes.join(', ')}`;
            subtitle.style.fontSize = '12px';
            subtitle.style.margin = '0';
            subtitle.style.color = '#666666';
            
            header.appendChild(title);
            header.appendChild(subtitle);
            
            // Create content section with exam data
            const content = document.createElement('div');
            const allExams = getAllExams();
            
            allExams.forEach((exam) => {
                const examDiv = document.createElement('div');
                examDiv.style.marginBottom = '20px';
                examDiv.style.padding = '15px';
                examDiv.style.border = '1px solid #e5e7eb';
                examDiv.style.borderRadius = '8px';
                examDiv.style.backgroundColor = '#f9fafb';
                
                const courseTitle = document.createElement('h3');
                courseTitle.textContent = exam.courseTitle;
                courseTitle.style.margin = '0 0 8px 0';
                courseTitle.style.fontSize = '16px';
                courseTitle.style.color = '#111827';
                courseTitle.style.fontWeight = 'bold';
                
                const courseCode = document.createElement('div');
                courseCode.textContent = `Course: ${exam.courseCode}`;
                courseCode.style.fontSize = '12px';
                courseCode.style.color = '#3b82f6';
                courseCode.style.marginBottom = '8px';
                courseCode.style.fontWeight = '600';
                
                const examDate = document.createElement('div');
                examDate.textContent = `Date: ${formatDate(exam.date)}`;
                examDate.style.fontSize = '14px';
                examDate.style.color = '#374151';
                examDate.style.marginBottom = '4px';
                
                const examTime = document.createElement('div');
                examTime.textContent = `Time: ${formatTime(exam.startTime, exam.endTime)}`;
                examTime.style.fontSize = '14px';
                examTime.style.color = '#374151';
                examTime.style.marginBottom = '4px';
                
                const faculty = document.createElement('div');
                faculty.textContent = `Faculty: ${exam.faculty}`;
                faculty.style.fontSize = '14px';
                faculty.style.color = '#374151';
                
                examDiv.appendChild(courseTitle);
                examDiv.appendChild(courseCode);
                examDiv.appendChild(examDate);
                examDiv.appendChild(examTime);
                examDiv.appendChild(faculty);
                
                content.appendChild(examDiv);
            });
            
            wrapper.appendChild(header);
            wrapper.appendChild(content);
            document.body.appendChild(wrapper);
            
            // Generate canvas with safe options
            const canvas = await html2canvas(wrapper, {
                width: 860,
                height: wrapper.scrollHeight,
                useCORS: false,
                allowTaint: false,
                logging: false
            });
            
            // Cleanup
            document.body.removeChild(wrapper);
            
            // Create download link
            const link = document.createElement('a');
            link.download = `exam-schedule-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png', 0.9);
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Error generating PNG:', error);
            alert('Error generating PNG. The PDF download option is recommended for better compatibility.');
        } finally {
            setDownloading(false);
        }
    };

    if (getTotalResults() === 0) {
        return null;
    }

    return (
        <div className="mt-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                {/* Header */}
                <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Export Your Schedule
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Download your exam schedule for offline access
                    </p>
                </div>
                
                {/* Download Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={downloadAsPDF}
                        disabled={downloading}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors w-full sm:w-auto"
                    >
                        {downloading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Generating PDF...</span>
                            </>
                        ) : (
                            <>
                                <DocumentIcon className="w-4 h-4" />
                                <span>Download PDF</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={downloadAsPNG}
                        disabled={downloading}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors w-full sm:w-auto"
                    >
                        {downloading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Generating PNG...</span>
                            </>
                        ) : (
                            <>
                                <PhotoIcon className="w-4 h-4" />
                                <span>Download PNG</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

