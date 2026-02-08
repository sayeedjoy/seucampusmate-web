'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// InputField component defined outside to prevent re-renders
const InputField: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    required?: boolean;
    error?: string;
}> = React.memo(({ label, value, onChange, placeholder, required = false, error }) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        // Allow empty string
        if (newValue === '') {
            onChange(newValue);
            return;
        }

        // Allow valid decimal numbers: digits, optional decimal point, more digits
        // This regex matches: "123", "123.", "123.45", ".5", etc.
        if (/^\d*\.?\d*$/.test(newValue)) {
            onChange(newValue);
        }
        // If regex doesn't match, don't update the value (ignore the input)
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type="text" // Keep as text to allow decimal point typing
                inputMode="decimal" // Hint for mobile keyboards
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                autoComplete="off"
                spellCheck="false"
                className={cn(
                    "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors",
                    error ? "border-red-300 bg-red-50 dark:bg-red-950/30" : "border-input bg-background"
                )}
            />
            {error && (
                <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span>
                    {error}
                </p>
            )}
        </div>
    );
});

// Add display name for debugging
InputField.displayName = 'InputField';

interface CalculationResult {
    totalFee: number;
    firstInstallment: number;
    secondInstallment: number;
    thirdInstallment: number;
}

interface ValidationErrors {
    perCreditFee?: string;
    totalCredits?: string;
    laboratoryFee?: string;
    waiverPercentage?: string;
}

const TuitionCalculator: React.FC = () => {
    const [perCreditFee, setPerCreditFee] = useState<string>('');
    const [totalCredits, setTotalCredits] = useState<string>('');
    const [laboratoryFee, setLaboratoryFee] = useState<string>('0'); // Default to '0' string
    const [waiverPercentage, setWaiverPercentage] = useState<string>('');
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [errors, setErrors] = useState<ValidationErrors>({});

    // Format number with commas (international format)
    const formatCurrency = (amount: number): string => {
        // You can change 'en-US' to 'en-IN' or 'bn-BD' if needed for specific thousand separators
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
        // For Bengali numerals (like Android app), you might need:
        // return new Intl.NumberFormat('bn-BD', ...).format(amount);
        // Ensure 'bn-BD' locale is supported or polyfilled in your environment.
    };

    // Validate individual field
    const validateField = (name: string, value: string): string | undefined => {
        // Optional field check first
        if (name === 'laboratoryFee' && (!value.trim() || value.trim() === '0')) {
            // Allow empty or just '0' for optional field, treat as 0
            return undefined;
        }
        if (!value.trim()) {
            if (name === 'laboratoryFee') return undefined; // Redundant now, but safe
            return 'This field is required';
        }
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            return 'Please enter a valid number';
        }
        if (numValue < 0) {
            return 'Value cannot be negative';
        }
        if (name === 'waiverPercentage' && (numValue < 0 || numValue > 100)) {
            return 'Waiver percentage must be between 0 and 100';
        }
        return undefined;
    };

    // Calculate tuition fees
    const calculateFees = useCallback((
        perCredit: number,
        credits: number,
        labFee: number,
        waiver: number
    ): CalculationResult => {
        // Base calculation
        const baseTuition = perCredit * credits;
        const totalFee = ((100 - waiver) / 100) * baseTuition + labFee;

        // Installment calculation
        const fullAmount = baseTuition + labFee;
        const threshold40 = 0.4 * fullAmount;
        const threshold30 = 0.3 * fullAmount;

        // 1st Installment
        const firstInstallment = totalFee < threshold40 ? totalFee : threshold40;
        const remainingAfter1st = Math.max(0, totalFee - firstInstallment);

        // 2nd Installment
        let secondInstallment = 0;
        if (totalFee > threshold40) {
            secondInstallment = remainingAfter1st < threshold30 ? remainingAfter1st : threshold30;
        }
        const remainingAfter2nd = Math.max(0, totalFee - firstInstallment - secondInstallment);

        // 3rd Installment
        const thirdInstallment = (firstInstallment + secondInstallment) < totalFee ? remainingAfter2nd : 0;

        return {
            totalFee: Math.max(0, totalFee), // Ensure non-negative
            firstInstallment: Math.max(0, firstInstallment),
            secondInstallment: Math.max(0, secondInstallment),
            thirdInstallment: Math.max(0, thirdInstallment),
        };
    }, []);

    // Validation effect (runs on input change for immediate feedback)
    useEffect(() => {
        const newErrors: ValidationErrors = {};
        newErrors.perCreditFee = validateField('perCreditFee', perCreditFee);
        newErrors.totalCredits = validateField('totalCredits', totalCredits);
        // Validate lab fee if it has content or was changed from default '0'
        if (laboratoryFee !== '' && laboratoryFee !== '0') {
            newErrors.laboratoryFee = validateField('laboratoryFee', laboratoryFee);
        } else {
            // Clear error if it's effectively empty/default
            newErrors.laboratoryFee = undefined;
        }
        newErrors.waiverPercentage = validateField('waiverPercentage', waiverPercentage);
        setErrors(newErrors);
    }, [perCreditFee, totalCredits, laboratoryFee, waiverPercentage]); // Removed result from dependency array

    // Handle calculate button click (or could be triggered by useEffect if auto-calc desired)
    const handleCalculate = () => {
        const hasRequiredValues = perCreditFee.trim() && totalCredits.trim() && waiverPercentage.trim();
        if (hasRequiredValues) {
            const perCreditNum = parseFloat(perCreditFee);
            const creditsNum = parseFloat(totalCredits);
            // Parse lab fee, defaulting to 0 if empty or invalid after trimming
            const labFeeNum = laboratoryFee.trim() === '' ? 0 : parseFloat(laboratoryFee) || 0;
            const waiverNum = parseFloat(waiverPercentage);

            const isPerCreditValid = !isNaN(perCreditNum) && perCreditNum >= 0;
            const isCreditsValid = !isNaN(creditsNum) && creditsNum >= 0;
            const isLabFeeValid = !isNaN(labFeeNum) && labFeeNum >= 0; // Should always be true now due to defaulting
            const isWaiverValid = !isNaN(waiverNum) && waiverNum >= 0 && waiverNum <= 100;

            if (isPerCreditValid && isCreditsValid && isLabFeeValid && isWaiverValid) {
                const calculationResult = calculateFees(perCreditNum, creditsNum, labFeeNum, waiverNum);
                setResult(calculationResult);
            } else {
                // Should ideally not happen due to validation, but good fallback
                console.error("Calculation triggered with invalid numbers despite validation.");
            }
        } else {
            // Trigger validation errors if required fields are missing on button click
            const newErrors: ValidationErrors = {};
            if (!perCreditFee.trim()) newErrors.perCreditFee = 'This field is required';
            if (!totalCredits.trim()) newErrors.totalCredits = 'This field is required';
            if (!waiverPercentage.trim()) newErrors.waiverPercentage = 'This field is required';
            // Lab fee is optional, no need to error here if empty
            setErrors(prev => ({ ...prev, ...newErrors })); // Merge with existing potential errors
        }
    };

    // Check if calculate button should be enabled
    const canCalculate = () => {
        const hasRequiredValues = perCreditFee.trim() && totalCredits.trim() && waiverPercentage.trim();
        // Check for absence of errors on required fields (and lab fee if it has content)
        const noCriticalErrors =
            !errors.perCreditFee &&
            !errors.totalCredits &&
            !errors.waiverPercentage &&
            (laboratoryFee === '' || laboratoryFee === '0' || !errors.laboratoryFee); // Allow default/empty lab fee

        return hasRequiredValues && noCriticalErrors;
    };



    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Fee Calculation Inputs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Per Credit Tuition Fee"
                            value={perCreditFee}
                            onChange={setPerCreditFee}
                            placeholder="Enter fee per credit"
                            required
                            error={errors.perCreditFee}
                        />
                        <InputField
                            label="Total Credits"
                            value={totalCredits}
                            onChange={setTotalCredits}
                            placeholder="Enter total credits"
                            required
                            error={errors.totalCredits}
                        />
                        <InputField
                            label="Laboratory Fee"
                            value={laboratoryFee} // This will be '0' by default
                            onChange={setLaboratoryFee}
                            placeholder="Enter lab fee (optional)"
                            error={errors.laboratoryFee} // Show error only if user entered invalid data
                        />
                        <InputField
                            label="Waiver Percentage"
                            value={waiverPercentage}
                            onChange={setWaiverPercentage}
                            placeholder="Enter waiver % (0-100)"
                            required
                            error={errors.waiverPercentage}
                        />
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <span className="font-medium">Note:</span> 12 credits required to keep waiver active. This calculation is an estimate.
                        </p>
                    </div>
                    <div className="mt-8 flex justify-center">
                        <Button
                            onClick={handleCalculate}
                            disabled={!canCalculate()}
                            size="lg"
                            className="px-12 py-4 text-lg font-semibold"
                        >
                            Calculate Tuition Fees
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-700">Calculation Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Total Fee */}
                            <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-6 rounded-lg border border-violet-200">
                                <h3 className="text-lg font-semibold text-violet-900 mb-2">Total Semester Fee</h3>
                                <p className="text-3xl font-bold text-violet-700">
                                    ৳ {formatCurrency(result.totalFee)}
                                </p>
                            </div>
                            {/* Installment Plan */}
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-4">Installment Payment Plan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <h4 className="font-medium text-green-800 mb-1">1st Installment (40%)</h4>
                                        <p className="text-xl font-semibold text-green-700">
                                            ৳ {formatCurrency(result.firstInstallment)}
                                        </p>
                                    </div>
                                    {(result.secondInstallment > 0 || result.thirdInstallment > 0) && ( // Show 2nd if 3rd might exist or 2nd > 0
                                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                            <h4 className="font-medium text-yellow-800 mb-1">2nd Installment (30%)</h4>
                                            <p className="text-xl font-semibold text-yellow-700">
                                                ৳ {formatCurrency(result.secondInstallment)}
                                            </p>
                                        </div>
                                    )}
                                    {result.thirdInstallment > 0 && (
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                            <h4 className="font-medium text-blue-800 mb-1">3rd Installment (Remaining)</h4>
                                            <p className="text-xl font-semibold text-blue-700">
                                                ৳ {formatCurrency(result.thirdInstallment)}
                                            </p>
                                        </div>
                                    )}
                                    {/* If 2nd is 0 but 3rd exists (edge case, maybe not possible), ensure layout */}
                                    {result.secondInstallment === 0 && result.thirdInstallment > 0 && (
                                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 opacity-0">
                                            {/* Spacer/placeholder to maintain grid if needed */}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TuitionCalculator;
