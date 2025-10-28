// TrustLend Premium Contract Templates
// Add sophisticated contract types without backend complexity

const PremiumContractTemplates = {
    // Business loan template
    businessLoan: {
        name: "Business Loan Agreement",
        description: "Professional loan contract for business purposes",
        fields: {
            businessName: { required: true, label: "Business Name" },
            businessType: { required: true, label: "Business Type", options: ["LLC", "Corporation", "Partnership", "Sole Proprietorship"] },
            taxId: { required: true, label: "Tax ID/EIN" },
            businessAddress: { required: true, label: "Business Address" },
            loanPurpose: { required: true, label: "Business Use of Funds", 
                options: ["Equipment Purchase", "Inventory", "Working Capital", "Expansion", "Other"] },
            personalGuarantee: { type: "checkbox", label: "Personal Guarantee Required" },
            businessCollateral: { label: "Business Assets as Collateral" }
        },
        terms: {
            defaultInterest: 0,
            suggestedLateFee: 50,
            maxAmount: 100000,
            suggestedGraceDays: 10
        }
    },

    // Student loan template
    studentLoan: {
        name: "Educational Expense Loan",
        description: "Loan agreement for educational expenses",
        fields: {
            school: { required: true, label: "Educational Institution" },
            program: { required: true, label: "Program/Degree" },
            semester: { required: true, label: "Academic Period" },
            expectedGraduation: { type: "date", label: "Expected Graduation" },
            gradeRequirement: { label: "Minimum GPA Requirement" },
            defermentOption: { type: "checkbox", label: "Allow deferment during school" }
        },
        terms: {
            defaultInterest: 0,
            suggestedLateFee: 25,
            maxAmount: 50000,
            suggestedGraceDays: 30
        }
    },

    // Emergency loan template
    emergencyLoan: {
        name: "Emergency Financial Assistance",
        description: "Quick loan for unexpected expenses",
        fields: {
            emergencyType: { required: true, label: "Emergency Type",
                options: ["Medical", "Car Repair", "Home Repair", "Job Loss", "Other"] },
            urgencyLevel: { required: true, label: "Urgency",
                options: ["Immediate (24hrs)", "Urgent (1 week)", "Important (1 month)"] },
            repaymentPlan: { required: true, label: "Proposed Repayment",
                options: ["Next Paycheck", "Within 30 days", "Within 60 days", "Custom Schedule"] }
        },
        terms: {
            defaultInterest: 0,
            suggestedLateFee: 0, // Waive late fees for emergencies
            maxAmount: 10000,
            suggestedGraceDays: 14
        }
    },

    // Equipment purchase loan
    equipmentLoan: {
        name: "Equipment Purchase Loan",
        description: "Loan for specific equipment or tools",
        fields: {
            equipmentType: { required: true, label: "Equipment Type" },
            equipmentDescription: { required: true, label: "Equipment Description" },
            vendor: { required: true, label: "Equipment Vendor/Seller" },
            equipmentValue: { required: true, label: "Equipment Value", type: "currency" },
            warrantyInfo: { label: "Warranty Information" },
            useAsCollateral: { type: "checkbox", label: "Use equipment as loan collateral", checked: true }
        },
        terms: {
            defaultInterest: 0,
            suggestedLateFee: 75,
            maxAmount: 200000,
            suggestedGraceDays: 5
        }
    },

    // Vehicle loan template
    vehicleLoan: {
        name: "Vehicle Purchase Loan",
        description: "Loan agreement for vehicle purchase",
        fields: {
            vehicleYear: { required: true, label: "Vehicle Year" },
            vehicleMake: { required: true, label: "Vehicle Make" },
            vehicleModel: { required: true, label: "Vehicle Model" },
            vin: { required: true, label: "Vehicle VIN" },
            purchasePrice: { required: true, label: "Purchase Price", type: "currency" },
            dealer: { label: "Dealer/Seller" },
            useVehicleAsCollateral: { type: "checkbox", label: "Use vehicle as collateral", checked: true },
            insuranceRequired: { type: "checkbox", label: "Insurance required", checked: true }
        },
        terms: {
            defaultInterest: 0,
            suggestedLateFee: 100,
            maxAmount: 500000,
            suggestedGraceDays: 10
        }
    }
};

// Advanced payment schedule options
const AdvancedPaymentSchedules = {
    seasonalBusiness: {
        name: "Seasonal Business Schedule",
        description: "Higher payments during peak seasons",
        calculator: (principal, serviceFee, months) => {
            const total = principal + serviceFee;
            const schedule = [];
            
            // Peak season (June-August, November-December): 150% of normal
            // Off season: 75% of normal
            const normalPayment = total / months;
            
            for (let i = 1; i <= months; i++) {
                const month = new Date();
                month.setMonth(month.getMonth() + i);
                const monthNum = month.getMonth() + 1;
                
                let multiplier = 1;
                if ([6, 7, 8, 11, 12].includes(monthNum)) {
                    multiplier = 1.5; // Peak season
                } else {
                    multiplier = 0.75; // Off season
                }
                
                schedule.push({
                    payment: i,
                    amount: normalPayment * multiplier,
                    dueDate: month.toISOString().split('T')[0]
                });
            }
            
            // Adjust final payment to ensure total equals loan amount
            const totalPaid = schedule.reduce((sum, p) => sum + p.amount, 0);
            const difference = total - totalPaid;
            schedule[schedule.length - 1].amount += difference;
            
            return schedule;
        }
    },

    graduatedPayments: {
        name: "Graduated Payments",
        description: "Start low, increase over time",
        calculator: (principal, serviceFee, months) => {
            const total = principal + serviceFee;
            const schedule = [];
            
            // Start at 60% of average, increase by 10% each payment
            const basePayment = total / months;
            
            for (let i = 1; i <= months; i++) {
                const month = new Date();
                month.setMonth(month.getMonth() + i);
                
                const multiplier = 0.6 + (0.1 * (i - 1));
                
                schedule.push({
                    payment: i,
                    amount: basePayment * multiplier,
                    dueDate: month.toISOString().split('T')[0]
                });
            }
            
            // Adjust for total
            const totalPaid = schedule.reduce((sum, p) => sum + p.amount, 0);
            const difference = total - totalPaid;
            schedule[schedule.length - 1].amount += difference;
            
            return schedule;
        }
    },

    balloonPayment: {
        name: "Balloon Payment",
        description: "Small payments with large final payment",
        calculator: (principal, serviceFee, months) => {
            const total = principal + serviceFee;
            const schedule = [];
            
            // 80% of total in final payment, rest spread over other payments
            const balloonAmount = total * 0.8;
            const regularTotal = total - balloonAmount;
            const regularPayment = regularTotal / (months - 1);
            
            for (let i = 1; i <= months; i++) {
                const month = new Date();
                month.setMonth(month.getMonth() + i);
                
                const amount = i === months ? balloonAmount : regularPayment;
                
                schedule.push({
                    payment: i,
                    amount: amount,
                    dueDate: month.toISOString().split('T')[0]
                });
            }
            
            return schedule;
        }
    }
};

// Smart contract suggestions based on amount and relationship
function getContractSuggestions(amount, relationship, purpose) {
    const suggestions = [];
    
    // Amount-based suggestions
    if (amount > 50000) {
        suggestions.push({
            type: "warning",
            message: "Large loan amount - consider requiring collateral",
            action: "Add collateral clause"
        });
    }
    
    if (amount > 10000) {
        suggestions.push({
            type: "info", 
            message: "Consider graduated payment schedule for large amounts",
            action: "Use graduated payments"
        });
    }
    
    // Relationship-based suggestions
    if (["friend", "colleague", "neighbor"].includes(relationship.toLowerCase())) {
        suggestions.push({
            type: "info",
            message: "Non-family loans benefit from formal documentation",
            action: "Add business loan template"
        });
    }
    
    if (["son", "daughter", "child"].includes(relationship.toLowerCase())) {
        suggestions.push({
            type: "info",
            message: "Consider student loan template for educational expenses",
            action: "Use student loan template"
        });
    }
    
    // Purpose-based suggestions
    if (purpose && purpose.toLowerCase().includes("business")) {
        suggestions.push({
            type: "recommendation",
            message: "Business loans should include tax ID and business details",
            action: "Use business loan template"
        });
    }
    
    if (purpose && purpose.toLowerCase().includes("car")) {
        suggestions.push({
            type: "recommendation",
            message: "Vehicle loans should include VIN and insurance requirements",
            action: "Use vehicle loan template"
        });
    }
    
    return suggestions;
}

// Contract risk assessment
function assessContractRisk(contractData) {
    let riskScore = 0;
    const risks = [];
    
    // Amount risk
    if (contractData.principal > 25000) {
        riskScore += 3;
        risks.push("High loan amount increases default risk");
    }
    
    // No collateral risk
    if (!contractData.collateral || !contractData.collateral.description) {
        riskScore += 2;
        risks.push("No collateral specified - consider adding security");
    }
    
    // Short repayment period risk
    const daysDiff = (new Date(contractData.dueDate) - new Date(contractData.loanDate)) / (1000 * 60 * 60 * 24);
    if (daysDiff < 30) {
        riskScore += 2;
        risks.push("Very short repayment period may cause payment difficulties");
    }
    
    // No late fees risk
    if (!contractData.lateFee || contractData.lateFee.type === 'none') {
        riskScore += 1;
        risks.push("No late fees may reduce payment motivation");
    }
    
    // Risk level
    let riskLevel = "Low";
    if (riskScore >= 6) riskLevel = "High";
    else if (riskScore >= 3) riskLevel = "Medium";
    
    return {
        score: riskScore,
        level: riskLevel,
        risks: risks,
        recommendations: getRiskRecommendations(riskScore, risks)
    };
}

function getRiskRecommendations(riskScore, risks) {
    const recommendations = [];
    
    if (riskScore >= 6) {
        recommendations.push("Consider requiring a co-signer or guarantor");
        recommendations.push("Add specific collateral to secure the loan");
        recommendations.push("Consider a payment schedule instead of lump sum");
    }
    
    if (riskScore >= 3) {
        recommendations.push("Add late fees to encourage timely payment");
        recommendations.push("Include acceleration clause for default protection");
        recommendations.push("Consider identity verification for added security");
    }
    
    if (risks.some(r => r.includes("short repayment"))) {
        recommendations.push("Extend repayment period or add payment schedule");
    }
    
    return recommendations;
}

// Export for use in contract creation
window.PremiumFeatures = {
    templates: PremiumContractTemplates,
    paymentSchedules: AdvancedPaymentSchedules,
    getContractSuggestions,
    assessContractRisk
};
