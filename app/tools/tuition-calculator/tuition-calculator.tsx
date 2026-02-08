'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Field, FieldLabel, FieldContent, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Decimal-only input change handler
function handleDecimalChange(value: string, onChange: (v: string) => void) {
    if (value === '') {
        onChange(value);
        return;
    }
    if (/^\d*\.?\d*$/.test(value)) onChange(value);
}

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
    const idScope = useId();
    const [perCreditFee, setPerCreditFee] = useState<string>('');
    const [totalCredits, setTotalCredits] = useState<string>('');
    const [laboratoryFee, setLaboratoryFee] = useState<string>('0');
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

    // Validation and real-time calculation (single effect to avoid stale errors)
    useEffect(() => {
        const newErrors: ValidationErrors = {};
        newErrors.perCreditFee = validateField('perCreditFee', perCreditFee);
        newErrors.totalCredits = validateField('totalCredits', totalCredits);
        if (laboratoryFee !== '' && laboratoryFee !== '0') {
            newErrors.laboratoryFee = validateField('laboratoryFee', laboratoryFee);
        } else {
            newErrors.laboratoryFee = undefined;
        }
        newErrors.waiverPercentage = validateField('waiverPercentage', waiverPercentage);
        setErrors(newErrors);

        const hasRequired = perCreditFee.trim() && totalCredits.trim() && waiverPercentage.trim();
        const noErrors =
            !newErrors.perCreditFee &&
            !newErrors.totalCredits &&
            !newErrors.waiverPercentage &&
            (laboratoryFee === '' || laboratoryFee === '0' || !newErrors.laboratoryFee);

        if (!hasRequired || !noErrors) {
            setResult(null);
            return;
        }

        const perCreditNum = parseFloat(perCreditFee);
        const creditsNum = parseFloat(totalCredits);
        const labFeeNum = laboratoryFee.trim() === '' ? 0 : parseFloat(laboratoryFee) || 0;
        const waiverNum = parseFloat(waiverPercentage);

        if (
            !isNaN(perCreditNum) && perCreditNum >= 0 &&
            !isNaN(creditsNum) && creditsNum >= 0 &&
            !isNaN(labFeeNum) && labFeeNum >= 0 &&
            !isNaN(waiverNum) && waiverNum >= 0 && waiverNum <= 100
        ) {
            setResult(calculateFees(perCreditNum, creditsNum, labFeeNum, waiverNum));
        } else {
            setResult(null);
        }
    }, [perCreditFee, totalCredits, laboratoryFee, waiverPercentage, calculateFees]);



    return (
        <div className="space-y-8">
            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Fee Calculation Inputs</CardTitle>
                    <CardDescription>
                        Enter your per-credit fee, total credits, optional lab fee, and waiver to estimate semester tuition and installments.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field>
                            <FieldLabel htmlFor={`${idScope}-perCredit`}>
                                Per Credit Tuition Fee <span className="text-destructive">*</span>
                            </FieldLabel>
                            <FieldContent>
                                <Input
                                    id={`${idScope}-perCredit`}
                                    type="text"
                                    inputMode="decimal"
                                    value={perCreditFee}
                                    onChange={(e) => handleDecimalChange(e.target.value, setPerCreditFee)}
                                    placeholder="Enter fee per credit"
                                    autoComplete="off"
                                    aria-invalid={!!errors.perCreditFee}
                                    aria-describedby={errors.perCreditFee ? `${idScope}-perCredit-error` : undefined}
                                    className="h-9"
                                />
                            </FieldContent>
                            {errors.perCreditFee && (
                                <FieldError id={`${idScope}-perCredit-error`}>{errors.perCreditFee}</FieldError>
                            )}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={`${idScope}-credits`}>
                                Total Credits <span className="text-destructive">*</span>
                            </FieldLabel>
                            <FieldContent>
                                <Input
                                    id={`${idScope}-credits`}
                                    type="text"
                                    inputMode="decimal"
                                    value={totalCredits}
                                    onChange={(e) => handleDecimalChange(e.target.value, setTotalCredits)}
                                    placeholder="Enter total credits"
                                    autoComplete="off"
                                    aria-invalid={!!errors.totalCredits}
                                    aria-describedby={errors.totalCredits ? `${idScope}-credits-error` : undefined}
                                    className="h-9"
                                />
                            </FieldContent>
                            {errors.totalCredits && (
                                <FieldError id={`${idScope}-credits-error`}>{errors.totalCredits}</FieldError>
                            )}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={`${idScope}-lab`}>Laboratory Fee (optional)</FieldLabel>
                            <FieldContent>
                                <Input
                                    id={`${idScope}-lab`}
                                    type="text"
                                    inputMode="decimal"
                                    value={laboratoryFee}
                                    onChange={(e) => handleDecimalChange(e.target.value, setLaboratoryFee)}
                                    placeholder="Enter lab fee (optional)"
                                    autoComplete="off"
                                    aria-invalid={!!errors.laboratoryFee}
                                    aria-describedby={errors.laboratoryFee ? `${idScope}-lab-error` : undefined}
                                    className="h-9"
                                />
                            </FieldContent>
                            {errors.laboratoryFee && (
                                <FieldError id={`${idScope}-lab-error`}>{errors.laboratoryFee}</FieldError>
                            )}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={`${idScope}-waiver`}>
                                Waiver Percentage <span className="text-destructive">*</span>
                            </FieldLabel>
                            <FieldContent>
                                <Input
                                    id={`${idScope}-waiver`}
                                    type="text"
                                    inputMode="decimal"
                                    value={waiverPercentage}
                                    onChange={(e) => handleDecimalChange(e.target.value, setWaiverPercentage)}
                                    placeholder="Enter waiver % (0-100)"
                                    autoComplete="off"
                                    aria-invalid={!!errors.waiverPercentage}
                                    aria-describedby={errors.waiverPercentage ? `${idScope}-waiver-error` : undefined}
                                    className="h-9"
                                />
                            </FieldContent>
                            {errors.waiverPercentage && (
                                <FieldError id={`${idScope}-waiver-error`}>{errors.waiverPercentage}</FieldError>
                            )}
                        </Field>
                    </div>
                    <Alert className="mt-6">
                        <AlertTitle>Note</AlertTitle>
                        <AlertDescription>
                            12 credits required to keep waiver active. This calculation is an estimate.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Results */}
            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Calculation Results</CardTitle>
                        <CardDescription>Your estimated semester fee and installment breakdown.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="rounded-xl border border-border bg-muted/50 p-6">
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Semester Fee</h3>
                                <p className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                                    ৳ {formatCurrency(result.totalFee)}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-4">Installment Payment Plan</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="rounded-lg border border-border bg-card p-4">
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">1st Installment (40%)</h4>
                                        <p className="text-xl font-semibold text-foreground">
                                            ৳ {formatCurrency(result.firstInstallment)}
                                        </p>
                                    </div>
                                    {(result.secondInstallment > 0 || result.thirdInstallment > 0) && (
                                        <div className="rounded-lg border border-border bg-card p-4">
                                            <h4 className="text-sm font-medium text-muted-foreground mb-1">2nd Installment (30%)</h4>
                                            <p className="text-xl font-semibold text-foreground">
                                                ৳ {formatCurrency(result.secondInstallment)}
                                            </p>
                                        </div>
                                    )}
                                    {result.thirdInstallment > 0 && (
                                        <div className="rounded-lg border border-border bg-card p-4">
                                            <h4 className="text-sm font-medium text-muted-foreground mb-1">3rd Installment (Remaining)</h4>
                                            <p className="text-xl font-semibold text-foreground">
                                                ৳ {formatCurrency(result.thirdInstallment)}
                                            </p>
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
