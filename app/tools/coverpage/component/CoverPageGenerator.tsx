'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Edit3, Eye } from 'lucide-react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import {
  ClassicTemplate,
  ModernTemplate,
  templates,
  type TemplateType,
  type CoverPageData
} from '../templates'

const defaultData: CoverPageData = {
  taskTitle: '',
  facultyInitial: '',
  facultyName: '',
  courseCode: '',
  courseTitle: '',
  program: '',
  department: '',
  semester: '',
  submissionDate: '',
  studentName: '',
  studentCode: ''
}

export default function CoverPageGenerator() {
  const [data, setData] = useState<CoverPageData>(defaultData)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('classic')
  const [isGenerating, setIsGenerating] = useState(false)

  // Load cached user data on component mount
  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cachedUserData = localStorage.getItem('coverpage-user-data')
        if (cachedUserData) {
          const userData = JSON.parse(cachedUserData)
          setData(prev => ({
            ...prev,
            studentName: userData.studentName || '',
            studentCode: userData.studentCode || '',
            department: userData.department || '',
            program: userData.program || ''
          }))
        }
      } catch (error) {
        console.error('Error loading cached user data:', error)
      }
    }

    loadCachedData()
  }, [])

  // Save user data to localStorage when it changes
  useEffect(() => {
    const saveUserData = () => {
      try {
        const userData = {
          studentName: data.studentName,
          studentCode: data.studentCode,
          department: data.department,
          program: data.program
        }

        // Only save if at least one field has data
        if (userData.studentName || userData.studentCode || userData.department || userData.program) {
          localStorage.setItem('coverpage-user-data', JSON.stringify(userData))
        }
      } catch (error) {
        console.error('Error saving user data to cache:', error)
      }
    }

    saveUserData()
  }, [data.studentName, data.studentCode, data.department, data.program])

  const handleInputChange = (field: keyof CoverPageData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const clearCachedData = () => {
    try {
      localStorage.removeItem('coverpage-user-data')
      setData(prev => ({
        ...prev,
        studentName: '',
        studentCode: '',
        department: '',
        program: ''
      }))
    } catch (error) {
      console.error('Error clearing cached data:', error)
    }
  }

  const handleStudentCodeChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newCode = data.studentCode.split('')
      newCode[index] = value
      setData(prev => ({ ...prev, studentCode: newCode.join('') }))

      // Auto-focus next input when a digit is entered
      if (value && index < 12) {
        setTimeout(() => {
          const nextInput = document.getElementById(`student-code-${index + 1}`)
          if (nextInput) {
            nextInput.focus()
          }
        }, 10)
      }
    }
  }

  const handleStudentCodeKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move to previous input
    if (event.key === 'Backspace') {
      const currentValue = (event.target as HTMLInputElement).value
      if (!currentValue && index > 0) {
        event.preventDefault()
        const newCode = data.studentCode.split('')
        newCode[index - 1] = ''
        setData(prev => ({ ...prev, studentCode: newCode.join('') }))

        setTimeout(() => {
          const prevInput = document.getElementById(`student-code-${index - 1}`)
          if (prevInput) {
            prevInput.focus()
          }
        }, 10)
      }
    }

    // Handle arrow keys for navigation
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      const prevInput = document.getElementById(`student-code-${index - 1}`)
      if (prevInput) prevInput.focus()
    }

    if (event.key === 'ArrowRight' && index < 12) {
      event.preventDefault()
      const nextInput = document.getElementById(`student-code-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleStudentCodePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pastedData = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 13)
    if (pastedData) {
      setData(prev => ({ ...prev, studentCode: pastedData.padEnd(13, '') }))
      // Focus the last filled input
      const lastIndex = Math.min(pastedData.length - 1, 12)
      const lastInput = document.getElementById(`student-code-${lastIndex}`)
      if (lastInput) {
        setTimeout(() => lastInput.focus(), 10)
      }
    }
  }

  const generateClassicPDF = async () => {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()

    // Add a blank page (A4 size: 595.28 x 841.89 points = 210 x 297 mm)
    const page = pdfDoc.addPage([595.28, 841.89])

    // Get page dimensions
    const { width, height } = page.getSize()

    // Embed fonts
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

    // Define colors
    const blackColor = rgb(0, 0, 0)

    // Title
    const titleFontSize = 20
    const titleText = data.taskTitle
    const titleWidth = timesRomanBoldFont.widthOfTextAtSize(titleText, titleFontSize)
    page.drawText(titleText, {
      x: (width - titleWidth) / 2,
      y: height - 100,
      size: titleFontSize,
      font: timesRomanBoldFont,
      color: blackColor,
    })

    // Draw underline for title
    page.drawLine({
      start: { x: (width - titleWidth) / 2, y: height - 107 },
      end: { x: (width - titleWidth) / 2 + titleWidth, y: height - 107 },
      thickness: 1.5,
      color: blackColor,
    })

    // Course details section
    const detailsStartY = height - 150
    const labelX = 120
    const colonX = 280
    const valueX = 300
    const lineHeight = 30
    const labelFontSize = 12
    const valueFontSize = 12

    const details = [
      { label: 'Faculty Initial', value: data.facultyInitial },
      { label: 'Faculty Name', value: data.facultyName },
      { label: 'Course Code and Section', value: data.courseCode },
      { label: 'Course Title', value: data.courseTitle },
      { label: 'Program', value: data.program },
      { label: 'Department', value: data.department },
      { label: 'Semester', value: data.semester },
      { label: 'Assignment Submission Date', value: data.submissionDate },
    ]

    details.forEach((detail, index) => {
      const y = detailsStartY - (index * lineHeight)

      // Label (bold)
      page.drawText(detail.label, {
        x: labelX,
        y,
        size: labelFontSize,
        font: timesRomanBoldFont,
        color: blackColor,
      })

      // Colon
      page.drawText(':', {
        x: colonX,
        y,
        size: labelFontSize,
        font: timesRomanFont,
        color: blackColor,
      })

      // Value
      page.drawText(detail.value, {
        x: valueX,
        y,
        size: valueFontSize,
        font: timesRomanFont,
        color: blackColor,
      })
    })

    // Calculate proper logo positioning between course details and submitted by section
    const courseDetailsEndY = detailsStartY - (details.length * lineHeight) - 20 // Add 20px buffer
    const submittedBySectionStartY = height - 520 // Estimate for submitted by section
    const logoY = (courseDetailsEndY + submittedBySectionStartY) / 2 // Center between the two sections
    const logoSize = 100  // Increased logo size for better visibility

    try {
      // Fetch PNG logo directly - no conversion needed
      const logoResponse = await fetch('/coverlogo/logo.png')
      const logoArrayBuffer = await logoResponse.arrayBuffer()
      const logoImage = await pdfDoc.embedPng(logoArrayBuffer)

      // Get actual logo dimensions to maintain aspect ratio
      const logoDims = logoImage.scale(1)
      const aspectRatio = logoDims.width / logoDims.height

      let finalWidth = logoSize
      let finalHeight = logoSize

      // Maintain aspect ratio like object-contain in preview
      if (aspectRatio > 1) {
        // Logo is wider than tall
        finalHeight = logoSize / aspectRatio
      } else {
        // Logo is taller than wide
        finalWidth = logoSize * aspectRatio
      }

      page.drawImage(logoImage, {
        x: (width - finalWidth) / 2,  // Center horizontally
        y: logoY - (finalHeight / 2), // Center vertically at logoY
        width: finalWidth,
        height: finalHeight,
      })
    } catch {
      console.log('Could not embed logo, using stylized placeholder')
      // Create a stylized university placeholder with updated size
      const logoRect = {
        x: (width - logoSize) / 2,
        y: logoY - (logoSize / 2),
        width: logoSize,
        height: logoSize
      }

      // Draw main rectangle
      page.drawRectangle({
        ...logoRect,
        borderColor: rgb(0.2, 0.2, 0.2),
        borderWidth: 2,
      })

      // Draw inner elements to make it look more like a logo
      page.drawRectangle({
        x: logoRect.x + 25,
        y: logoRect.y + 25,
        width: logoSize - 50,
        height: logoSize - 50,
        borderColor: rgb(0.4, 0.4, 0.4),
        borderWidth: 1,
      })

      const logoText = 'SEU'
      const logoTextWidth = timesRomanBoldFont.widthOfTextAtSize(logoText, 16)
      page.drawText(logoText, {
        x: (width - logoTextWidth) / 2,
        y: logoY,
        size: 16,
        font: timesRomanBoldFont,
        color: rgb(0.3, 0.3, 0.3),
      })

      const logoSubText = 'LOGO'
      const logoSubTextWidth = timesRomanFont.widthOfTextAtSize(logoSubText, 10)
      page.drawText(logoSubText, {
        x: (width - logoSubTextWidth) / 2,
        y: logoY - 18,
        size: 10,
        font: timesRomanFont,
        color: rgb(0.5, 0.5, 0.5),
      })
    }

    // "Submitted By" section - positioned with proper spacing after logo
    const submittedByY = logoY - 100 // Consistent spacing after logo
    const submittedByText = 'Submitted By'
    const submittedByFontSize = 16
    const submittedByWidth = timesRomanBoldFont.widthOfTextAtSize(submittedByText, submittedByFontSize)
    page.drawText(submittedByText, {
      x: (width - submittedByWidth) / 2,
      y: submittedByY,
      size: submittedByFontSize,
      font: timesRomanBoldFont,
      color: blackColor,
    })

    // Student details
    const studentDetailsY = submittedByY - 50

    // Student name
    page.drawText('Name', {
      x: labelX,
      y: studentDetailsY,
      size: labelFontSize,
      font: timesRomanBoldFont,
      color: blackColor,
    })

    page.drawText(':', {
      x: colonX,
      y: studentDetailsY,
      size: labelFontSize,
      font: timesRomanFont,
      color: blackColor,
    })

    page.drawText(data.studentName, {
      x: valueX,
      y: studentDetailsY,
      size: valueFontSize,
      font: timesRomanFont,
      color: blackColor,
    })

    // Student code
    const studentCodeY = studentDetailsY - 32
    page.drawText('Student Code', {
      x: labelX,
      y: studentCodeY,
      size: labelFontSize,
      font: timesRomanBoldFont,
      color: blackColor,
    })

    page.drawText(':', {
      x: colonX,
      y: studentCodeY,
      size: labelFontSize,
      font: timesRomanFont,
      color: blackColor,
    })

    // Draw student code as plain text
    page.drawText(data.studentCode, {
      x: valueX,
      y: studentCodeY,
      size: valueFontSize,
      font: timesRomanFont,
      color: blackColor,
    })

    return pdfDoc
  }

  const generateModernPDF = async () => {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()

    // Add a blank page (A4 size: 595.28 x 841.89 points = 210 x 297 mm)
    const page = pdfDoc.addPage([595.28, 841.89])

    // Get page dimensions
    const { width, height } = page.getSize()

    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Define colors
    const primaryBlue = rgb(0.2, 0.4, 0.8)
    const lightBlue = rgb(0.9, 0.95, 1)
    const blackColor = rgb(0, 0, 0)

    // Title with blue accent
    const titleFontSize = 22
    const titleText = data.taskTitle
    const titleWidth = helveticaBoldFont.widthOfTextAtSize(titleText, titleFontSize)
    page.drawText(titleText, {
      x: (width - titleWidth) / 2,
      y: height - 80,
      size: titleFontSize,
      font: helveticaBoldFont,
      color: primaryBlue,
    })

    // Draw a blue underline
    page.drawLine({
      start: { x: (width - titleWidth) / 2, y: height - 87 },
      end: { x: (width - titleWidth) / 2 + titleWidth, y: height - 87 },
      thickness: 2,
      color: primaryBlue,
    })

    // Course details in a card-like layout
    const cardStartY = height - 140
    const cardPadding = 30
    const cardX = 80
    const cardWidth = width - 160
    const cardHeight = 280

    // Draw card background
    page.drawRectangle({
      x: cardX,
      y: cardStartY - cardHeight,
      width: cardWidth,
      height: cardHeight,
      color: lightBlue,
      borderColor: primaryBlue,
      borderWidth: 1,
    })

    // Card title
    const cardTitleText = 'Course Information'
    const cardTitleFontSize = 16
    const cardTitleWidth = helveticaBoldFont.widthOfTextAtSize(cardTitleText, cardTitleFontSize)
    page.drawText(cardTitleText, {
      x: cardX + (cardWidth - cardTitleWidth) / 2,
      y: cardStartY - 30,
      size: cardTitleFontSize,
      font: helveticaBoldFont,
      color: primaryBlue,
    })

    // Course details with modern layout
    const detailsStartY = cardStartY - 65
    const labelX = cardX + cardPadding
    const valueX = cardX + cardPadding + 180
    const lineHeight = 28
    const labelFontSize = 11
    const valueFontSize = 11

    const details = [
      { label: 'Faculty Initial', value: data.facultyInitial },
      { label: 'Faculty Name', value: data.facultyName },
      { label: 'Course Code & Section', value: data.courseCode },
      { label: 'Course Title', value: data.courseTitle },
      { label: 'Program', value: data.program },
      { label: 'Department', value: data.department },
      { label: 'Semester', value: data.semester },
      { label: 'Submission Date', value: data.submissionDate },
    ]

    details.forEach((detail, index) => {
      const y = detailsStartY - (index * lineHeight)

      // Label
      page.drawText(detail.label, {
        x: labelX,
        y,
        size: labelFontSize,
        font: helveticaBoldFont,
        color: blackColor,
      })

      // Value
      page.drawText(detail.value, {
        x: valueX,
        y,
        size: valueFontSize,
        font: helveticaFont,
        color: blackColor,
      })
    })

    // Logo section
    const logoY = height - 460
    const logoSize = 90

    try {
      const logoResponse = await fetch('/coverlogo/logo.png')
      const logoArrayBuffer = await logoResponse.arrayBuffer()
      const logoImage = await pdfDoc.embedPng(logoArrayBuffer)

      const logoDims = logoImage.scale(1)
      const aspectRatio = logoDims.width / logoDims.height

      let finalWidth = logoSize
      let finalHeight = logoSize

      if (aspectRatio > 1) {
        finalHeight = logoSize / aspectRatio
      } else {
        finalWidth = logoSize * aspectRatio
      }

      page.drawImage(logoImage, {
        x: (width - finalWidth) / 2,
        y: logoY - (finalHeight / 2),
        width: finalWidth,
        height: finalHeight,
      })
    } catch {
      // Modern placeholder
      const logoRect = {
        x: (width - logoSize) / 2,
        y: logoY - (logoSize / 2),
        width: logoSize,
        height: logoSize
      }

      page.drawRectangle({
        ...logoRect,
        color: lightBlue,
        borderColor: primaryBlue,
        borderWidth: 2,
      })

      const logoText = 'SEU'
      const logoTextWidth = helveticaBoldFont.widthOfTextAtSize(logoText, 18)
      page.drawText(logoText, {
        x: (width - logoTextWidth) / 2,
        y: logoY,
        size: 18,
        font: helveticaBoldFont,
        color: primaryBlue,
      })
    }

    // Student information card
    const studentCardY = height - 580
    const studentCardHeight = 120

    page.drawRectangle({
      x: cardX,
      y: studentCardY - studentCardHeight,
      width: cardWidth,
      height: studentCardHeight,
      color: lightBlue,
      borderColor: primaryBlue,
      borderWidth: 1,
    })

    const studentCardTitleText = 'Submitted By'
    const studentCardTitleWidth = helveticaBoldFont.widthOfTextAtSize(studentCardTitleText, cardTitleFontSize)
    page.drawText(studentCardTitleText, {
      x: cardX + (cardWidth - studentCardTitleWidth) / 2,
      y: studentCardY - 30,
      size: cardTitleFontSize,
      font: helveticaBoldFont,
      color: primaryBlue,
    })

    // Student details
    const studentDetailsY = studentCardY - 65

    page.drawText('Name', {
      x: labelX,
      y: studentDetailsY,
      size: labelFontSize,
      font: helveticaBoldFont,
      color: blackColor,
    })

    page.drawText(data.studentName, {
      x: valueX,
      y: studentDetailsY,
      size: valueFontSize,
      font: helveticaFont,
      color: blackColor,
    })

    page.drawText('Student Code', {
      x: labelX,
      y: studentDetailsY - lineHeight,
      size: labelFontSize,
      font: helveticaBoldFont,
      color: blackColor,
    })

    page.drawText(data.studentCode, {
      x: valueX,
      y: studentDetailsY - lineHeight,
      size: valueFontSize,
      font: helveticaFont,
      color: blackColor,
    })

    return pdfDoc
  }

  const generatePDF = async () => {
    setIsGenerating(true)

    try {
      let pdfDoc

      if (selectedTemplate === 'classic') {
        pdfDoc = await generateClassicPDF()
      } else {
        pdfDoc = await generateModernPDF()
      }

      // Serialize the PDF document to bytes
      const pdfBytes = await pdfDoc.save()

      // Download the PDF
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cover-page-${selectedTemplate}-${data.taskTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const studentCodeArray = data.studentCode.split('').concat(Array(13 - data.studentCode.length).fill(''))

  const renderPreview = () => {
    if (selectedTemplate === 'classic') {
      return <ClassicTemplate data={data} />
    } else if (selectedTemplate === 'modern') {
      return <ModernTemplate data={data} />
    }
    return <ClassicTemplate data={data} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Page Title */}
      <div className="pt-6 sm:pt-8 pb-4 sm:pb-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground text-center">
            Cover Page Generator
          </h1>
        </div>
      </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Editor Panel */}
            <div className="space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Edit Cover Page
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Template Selection */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Choose Template
                      </label>
                      <Button
                        onClick={clearCachedData}
                        size="sm"
                        className="text-xs h-7 px-3 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-900 active:bg-blue-300 border border-blue-200 shadow-sm transition-colors duration-150"
                        title="Clears your saved name, ID, department and program"
                      >
                        Clear saved data
                      </Button>
                    </div>
                    <div className="relative">
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value as TemplateType)}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 bg-background text-foreground appearance-none pr-10"
                      >
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Task Title
                      </label>
                      <input
                        type="text"
                        value={data.taskTitle}
                        onChange={(e) => handleInputChange('taskTitle', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        placeholder="Enter assignment title"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Faculty Initial
                        </label>
                        <input
                          type="text"
                          value={data.facultyInitial}
                          onChange={(e) => handleInputChange('facultyInitial', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                          placeholder="e.g. RIC"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Faculty Name
                        </label>
                        <input
                          type="text"
                          value={data.facultyName}
                          onChange={(e) => handleInputChange('facultyName', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                          placeholder="e.g. Rashik Iram Chowdhury"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Course Code
                        </label>
                        <input
                          type="text"
                          value={data.courseCode}
                          onChange={(e) => handleInputChange('courseCode', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                          placeholder="e.g. CSE384.2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Course Title
                        </label>
                        <input
                          type="text"
                          value={data.courseTitle}
                          onChange={(e) => handleInputChange('courseTitle', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                          placeholder="e.g. Database Design Lab"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Program
                      </label>
                      <input
                        type="text"
                        value={data.program}
                        onChange={(e) => handleInputChange('program', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        placeholder="e.g. B.Sc. in CSE"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={data.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        placeholder="e.g. Computer Science and Engineering"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Semester
                        </label>
                        <input
                          type="text"
                          value={data.semester}
                          onChange={(e) => handleInputChange('semester', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                          placeholder="e.g. Summer 2025"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Submission Date
                        </label>
                        <input
                          type="text"
                          value={data.submissionDate}
                          onChange={(e) => handleInputChange('submissionDate', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                          placeholder="e.g. 02 September 2025"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Student Name
                      </label>
                      <input
                        type="text"
                        value={data.studentName}
                        onChange={(e) => handleInputChange('studentName', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        placeholder="e.g. Abed Ali"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Student Code
                      </label>
                      <div className="flex gap-1 flex-wrap justify-start">
                        {studentCodeArray.map((digit, index) => (
                          <input
                            key={index}
                            id={`student-code-${index}`}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]"
                            value={digit}
                            onChange={(e) => handleStudentCodeChange(index, e.target.value)}
                            onKeyDown={(e) => handleStudentCodeKeyDown(index, e)}
                            onPaste={handleStudentCodePaste}
                            maxLength={1}
                            className="w-6 h-8 sm:w-7 sm:h-8 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm transition-all duration-200 hover:border-gray-400"
                            placeholder="0"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 sm:pt-6">
                    <Button
                      onClick={generatePDF}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-2 sm:py-3"
                      disabled={isGenerating}
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="text-sm sm:text-base">{isGenerating ? 'Generating PDF...' : 'Download PDF'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Preview Panel */}
            <div className="space-y-4 sm:space-y-6">
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-foreground text-lg sm:text-xl">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  {renderPreview()}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    </div>
  )
}