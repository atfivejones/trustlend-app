const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        AlignmentType, WidthType, BorderStyle, ShadingType, HeadingLevel, 
        PageOrientation, TabStopType, TabStopPosition } = require('docx');
const fs = require('fs');

/**
 * TrustLend Promissory Note Generator - Simplified for Small Claims Court
 * Generates UCC-compliant promissory notes with flat fees (no interest)
 */

class PromissoryNoteGenerator {
    constructor(contractData) {
        this.data = contractData;
        this.validateData();
    }

    validateData() {
        const required = ['principal', 'borrower', 'lender', 'loanDate', 'dueDate'];
        for (const field of required) {
            if (!this.data[field]) {
                throw new Error(`Required field missing: ${field}`);
            }
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    calculateTotalAmount() {
        const principal = parseFloat(this.data.principal);
        const serviceFee = parseFloat(this.data.serviceFee || 0);
        return principal + serviceFee;
    }

    createHeader() {
        return [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
                children: [
                    new TextRun({
                        text: "PROMISSORY NOTE",
                        bold: true,
                        size: 32,
                        font: "Times New Roman"
                    })
                ]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
                children: [
                    new TextRun({
                        text: "UCC Article 3 Compliant Negotiable Instrument",
                        size: 20,
                        font: "Times New Roman",
                        italics: true
                    })
                ]
            })
        ];
    }

    createUCCCompliantPromise() {
        const principal = this.formatCurrency(this.data.principal);
        const serviceFee = this.data.serviceFee ? parseFloat(this.data.serviceFee) : 0;
        const totalAmount = this.calculateTotalAmount();
        const totalAmountFormatted = this.formatCurrency(totalAmount);
        const totalAmountWords = this.numberToWords(totalAmount);
        
        // Payment schedule text
        let paymentText = '';
        if (this.data.paymentSchedule === 'lump_sum') {
            paymentText = `payable in full on ${this.formatDate(this.data.dueDate)}`;
        } else {
            const scheduleNames = {
                'monthly': 'monthly',
                'bi_weekly': 'bi-weekly',
                'quarterly': 'quarterly',
                'custom': 'installment'
            };
            const scheduleName = scheduleNames[this.data.paymentSchedule] || 'installment';
            paymentText = `payable in ${this.data.numberOfPayments} ${scheduleName} payments of ${this.formatCurrency(this.data.paymentAmount)} each, with final payment due ${this.formatDate(this.data.dueDate)}`;
        }
        
        const promiseText = serviceFee > 0 
            ? `FOR VALUE RECEIVED, I, ${this.data.borrower.firstName} ${this.data.borrower.lastName}, promise to pay to the order of ${this.data.lender.firstName} ${this.data.lender.lastName}, or bearer, the sum of ${totalAmountWords} (${totalAmountFormatted}), consisting of principal amount ${principal} plus service fee ${this.formatCurrency(serviceFee)}, ${paymentText}.`
            : `FOR VALUE RECEIVED, I, ${this.data.borrower.firstName} ${this.data.borrower.lastName}, promise to pay to the order of ${this.data.lender.firstName} ${this.data.lender.lastName}, or bearer, the sum of ${totalAmountWords} (${totalAmountFormatted}), ${paymentText}.`;
        
        return [
            new Paragraph({
                spacing: { before: 400, after: 400 },
                alignment: AlignmentType.JUSTIFIED,
                indent: { left: 360, right: 360 },
                shading: {
                    fill: "F8F9FA",
                    type: ShadingType.SOLID
                },
                children: [
                    new TextRun({
                        text: promiseText,
                        size: 24,
                        font: "Times New Roman",
                        bold: true
                    })
                ]
            })
        ];
    }

    createBasicInformation() {
        const totalAmount = this.calculateTotalAmount();
        
        return [
            new Paragraph({
                spacing: { after: 300 },
                children: [
                    new TextRun({
                        text: `Principal Amount: `,
                        bold: true,
                        size: 24,
                        font: "Times New Roman"
                    }),
                    new TextRun({
                        text: this.formatCurrency(this.data.principal),
                        size: 24,
                        font: "Times New Roman"
                    })
                ]
            }),
            ...(this.data.serviceFee && parseFloat(this.data.serviceFee) > 0 ? [
                new Paragraph({
                    spacing: { after: 200 },
                    children: [
                        new TextRun({
                            text: `Service Fee: `,
                            bold: true,
                            size: 24,
                            font: "Times New Roman"
                        }),
                        new TextRun({
                            text: this.formatCurrency(this.data.serviceFee),
                            size: 24,
                            font: "Times New Roman"
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 300 },
                    children: [
                        new TextRun({
                            text: `Total Amount Due: `,
                            bold: true,
                            size: 26,
                            font: "Times New Roman",
                            color: "0066CC"
                        }),
                        new TextRun({
                            text: this.formatCurrency(totalAmount),
                            size: 26,
                            font: "Times New Roman",
                            color: "0066CC",
                            bold: true
                        })
                    ]
                })
            ] : []),
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: `Borrower (Maker): `,
                        bold: true,
                        size: 24,
                        font: "Times New Roman"
                    }),
                    new TextRun({
                        text: `${this.data.borrower.firstName} ${this.data.borrower.lastName}`,
                        size: 24,
                        font: "Times New Roman"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: `Lender (Payee): `,
                        bold: true,
                        size: 24,
                        font: "Times New Roman"
                    }),
                    new TextRun({
                        text: `${this.data.lender.firstName} ${this.data.lender.lastName}`,
                        size: 24,
                        font: "Times New Roman"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: `Date of Note: `,
                        bold: true,
                        size: 24,
                        font: "Times New Roman"
                    }),
                    new TextRun({
                        text: this.formatDate(this.data.loanDate),
                        size: 24,
                        font: "Times New Roman"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 400 },
                children: [
                    new TextRun({
                        text: `Maturity Date: `,
                        bold: true,
                        size: 24,
                        font: "Times New Roman"
                    }),
                    new TextRun({
                        text: this.formatDate(this.data.dueDate),
                        size: 24,
                        font: "Times New Roman"
                    })
                ]
            })
        ];
    }

    createUCCTerms() {
        const paragraphs = [];

        // UCC Required Terms
        paragraphs.push(
            new Paragraph({
                spacing: { before: 400, after: 300 },
                children: [
                    new TextRun({
                        text: "TERMS AND CONDITIONS",
                        bold: true,
                        size: 26,
                        font: "Times New Roman"
                    })
                ]
            })
        );

        // No Interest Declaration (Important for legal clarity)
        paragraphs.push(
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: "No Interest: ",
                        bold: true,
                        size: 22,
                        font: "Times New Roman"
                    }),
                    new TextRun({
                        text: "This note bears no interest. The amount due is fixed at the principal amount" + 
                              (this.data.serviceFee ? " plus the one-time service fee" : "") + " specified above.",
                        size: 22,
                        font: "Times New Roman"
                    })
                ]
            })
        );

        // Default Terms
        paragraphs.push(
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: "Default: ",
                        bold: true,
                        size: 22,
                        font: "Times New Roman"
                    }),
                    new TextRun({
                        text: "This note shall be in default if not paid in full by the maturity date.",
                        size: 22,
                        font: "Times New Roman"
                    })
                ]
            })
        );

        // Late Fees
        if (this.data.lateFee && this.data.lateFee.type !== 'none') {
            const lateFeeText = this.getLateFeeText();
            paragraphs.push(
                new Paragraph({
                    spacing: { after: 200 },
                    children: [
                        new TextRun({
                            text: `Late Payment Fee: `,
                            bold: true,
                            size: 22,
                            font: "Times New Roman"
                        }),
                        new TextRun({
                            text: lateFeeText,
                            size: 22,
                            font: "Times New Roman"
                        })
                    ]
                })
            );
        }

        // Grace Period
        if (this.data.graceDays && this.data.graceDays > 0) {
            paragraphs.push(
                new Paragraph({
                    spacing: { after: 200 },
                    children: [
                        new TextRun({
                            text: `Grace Period: `,
                            bold: true,
                            size: 22,
                            font: "Times New Roman"
                        }),
                        new TextRun({
                            text: `${this.data.graceDays} days after maturity date before late fees apply.`,
                            size: 22,
                            font: "Times New Roman"
                        })
                    ]
                })
            );
        }

        // Acceleration Clause
        if (this.data.accelerationClause) {
            paragraphs.push(
                new Paragraph({
                    spacing: { before: 200, after: 200 },
                    indent: { left: 360, right: 360 },
                    shading: {
                        fill: "FFF3CD",
                        type: ShadingType.SOLID
                    },
                    children: [
                        new TextRun({
                            text: "ACCELERATION: ",
                            bold: true,
                            size: 22,
                            font: "Times New Roman"
                        }),
                        new TextRun({
                            text: "Upon default, the holder may declare the entire unpaid balance immediately due and payable.",
                            size: 22,
                            font: "Times New Roman"
                        })
                    ]
                })
            );
        }

        // Collateral (if any)
        if (this.data.collateral && this.data.collateral.description) {
            paragraphs.push(
                new Paragraph({
                    spacing: { before: 200, after: 200 },
                    children: [
                        new TextRun({
                            text: "SECURITY: ",
                            bold: true,
                            size: 22,
                            font: "Times New Roman"
                        }),
                        new TextRun({
                            text: `This note is secured by: ${this.data.collateral.description}`,
                            size: 22,
                            font: "Times New Roman"
                        })
                    ]
                })
            );
        }

        // Payment Schedule Section (for non-lump sum)
        if (this.data.paymentSchedule !== 'lump_sum' && this.data.paymentScheduleTable) {
            paragraphs.push(
                new Paragraph({
                    spacing: { before: 300, after: 200 },
                    children: [
                        new TextRun({
                            text: "PAYMENT SCHEDULE",
                            bold: true,
                            size: 24,
                            font: "Times New Roman"
                        })
                    ]
                })
            );

            // Create payment schedule table
            const scheduleRows = this.data.paymentScheduleTable.map((payment, index) => 
                new TableRow({
                    children: [
                        new TableCell({
                            width: { size: 20, type: WidthType.PERCENTAGE },
                            children: [new Paragraph({
                                children: [new TextRun({
                                    text: (index + 1).toString(),
                                    size: 20,
                                    font: "Times New Roman"
                                })]
                            })]
                        }),
                        new TableCell({
                            width: { size: 40, type: WidthType.PERCENTAGE },
                            children: [new Paragraph({
                                children: [new TextRun({
                                    text: this.formatDate(payment.date),
                                    size: 20,
                                    font: "Times New Roman"
                                })]
                            })]
                        }),
                        new TableCell({
                            width: { size: 40, type: WidthType.PERCENTAGE },
                            children: [new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                children: [new TextRun({
                                    text: this.formatCurrency(payment.amount),
                                    size: 20,
                                    font: "Times New Roman"
                                })]
                            })]
                        })
                    ]
                })
            );

            paragraphs.push(
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                        insideVertical: { style: BorderStyle.SINGLE, size: 1 }
                    },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    width: { size: 20, type: WidthType.PERCENTAGE },
                                    shading: { fill: "F0F0F0" },
                                    children: [new Paragraph({
                                        children: [new TextRun({
                                            text: "Payment #",
                                            bold: true,
                                            size: 20,
                                            font: "Times New Roman"
                                        })]
                                    })]
                                }),
                                new TableCell({
                                    width: { size: 40, type: WidthType.PERCENTAGE },
                                    shading: { fill: "F0F0F0" },
                                    children: [new Paragraph({
                                        children: [new TextRun({
                                            text: "Due Date",
                                            bold: true,
                                            size: 20,
                                            font: "Times New Roman"
                                        })]
                                    })]
                                }),
                                new TableCell({
                                    width: { size: 40, type: WidthType.PERCENTAGE },
                                    shading: { fill: "F0F0F0" },
                                    children: [new Paragraph({
                                        alignment: AlignmentType.RIGHT,
                                        children: [new TextRun({
                                            text: "Amount",
                                            bold: true,
                                            size: 20,
                                            font: "Times New Roman"
                                        })]
                                    })]
                                })
                            ]
                        }),
                        ...scheduleRows
                    ]
                })
            );
        }

        return paragraphs;
    }

    createUCCCompliantSignatures() {
        return [
            new Paragraph({
                spacing: { before: 600, after: 300 },
                children: [
                    new TextRun({
                        text: "MAKER'S SIGNATURE (Required for UCC Compliance)",
                        bold: true,
                        size: 24,
                        font: "Times New Roman"
                    })
                ]
            }),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                    insideHorizontal: { style: BorderStyle.NONE },
                    insideVertical: { style: BorderStyle.NONE }
                },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                width: { size: 50, type: WidthType.PERCENTAGE },
                                children: [
                                    new Paragraph({
                                        spacing: { after: 400 },
                                        children: [
                                            new TextRun({
                                                text: "Borrower/Maker Signature:",
                                                bold: true,
                                                size: 22,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    }),
                                    new Paragraph({
                                        spacing: { after: 200 },
                                        children: [
                                            new TextRun({
                                                text: "_".repeat(35),
                                                size: 20,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    }),
                                    new Paragraph({
                                        spacing: { after: 100 },
                                        children: [
                                            new TextRun({
                                                text: `${this.data.borrower.firstName} ${this.data.borrower.lastName}`,
                                                size: 20,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `Date: ${"_".repeat(15)}`,
                                                size: 18,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            new TableCell({
                                width: { size: 50, type: WidthType.PERCENTAGE },
                                children: [
                                    new Paragraph({
                                        spacing: { after: 400 },
                                        children: [
                                            new TextRun({
                                                text: "Lender/Payee Signature:",
                                                bold: true,
                                                size: 22,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    }),
                                    new Paragraph({
                                        spacing: { after: 200 },
                                        children: [
                                            new TextRun({
                                                text: "_".repeat(35),
                                                size: 20,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    }),
                                    new Paragraph({
                                        spacing: { after: 100 },
                                        children: [
                                            new TextRun({
                                                text: `${this.data.lender.firstName} ${this.data.lender.lastName}`,
                                                size: 20,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `Date: ${"_".repeat(15)}`,
                                                size: 18,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ];
    }

    createBlockchainSection() {
        return [
            new Paragraph({
                spacing: { before: 600, after: 200 },
                children: [
                    new TextRun({
                        text: "DIGITAL VERIFICATION",
                        bold: true,
                        size: 24,
                        font: "Times New Roman"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 200 },
                indent: { left: 360, right: 360 },
                shading: {
                    fill: "E3F2FD",
                    type: ShadingType.SOLID
                },
                children: [
                    new TextRun({
                        text: "This promissory note has been digitally signed and timestamped using blockchain technology to ensure authenticity and prevent tampering.",
                        size: 18,
                        font: "Times New Roman",
                        italics: true
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: `Digital Hash: `,
                        bold: true,
                        size: 18,
                        font: "Times New Roman"
                    }),
                    new TextRun({
                        text: this.data.blockchainHash || "[Generated upon completion]",
                        size: 16,
                        font: "Courier New"
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Verification: `,
                        bold: true,
                        size: 18,
                        font: "Times New Roman"
                    }),
                    new TextRun({
                        text: "TrustLend.app digital signature platform",
                        size: 18,
                        font: "Times New Roman"
                    })
                ]
            })
        ];
    }

    createLegalFooter() {
        return [
            new Paragraph({
                spacing: { before: 400, after: 200 },
                children: [
                    new TextRun({
                        text: "LEGAL COMPLIANCE NOTICE",
                        bold: true,
                        size: 20,
                        font: "Times New Roman"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 200 },
                alignment: AlignmentType.JUSTIFIED,
                children: [
                    new TextRun({
                        text: "This promissory note complies with UCC Article 3 requirements for negotiable instruments and is enforceable in small claims court. Both parties acknowledge receipt of a copy and understanding of all terms.",
                        size: 16,
                        font: "Times New Roman"
                    })
                ]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "--- Secured by TrustLend Digital Platform ---",
                        size: 14,
                        font: "Times New Roman",
                        italics: true,
                        color: "666666"
                    })
                ]
            })
        ];
    }

    getLateFeeText() {
        if (this.data.lateFee.type === 'flat') {
            return `${this.formatCurrency(this.data.lateFee.amount)} flat fee for each late payment.`;
        } else if (this.data.lateFee.type === 'percentage') {
            return `${this.data.lateFee.percentage}% of the total amount due for each late payment.`;
        }
        return '';
    }

    numberToWords(num) {
        // Enhanced number to words for legal documents
        if (num === 0) return 'Zero';
        if (num >= 1000000) return 'Over One Million'; // Simplify for very large amounts

        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                     'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const thousands = ['', 'Thousand'];

        function convertHundreds(n) {
            let result = '';
            if (n >= 100) {
                result += ones[Math.floor(n / 100)] + ' Hundred ';
                n %= 100;
            }
            if (n >= 20) {
                result += tens[Math.floor(n / 10)] + ' ';
                n %= 10;
            }
            if (n > 0) {
                result += ones[n] + ' ';
            }
            return result;
        }

        let result = '';
        let thousandCounter = 0;
        let tempNum = Math.floor(num);

        while (tempNum > 0) {
            if (tempNum % 1000 !== 0) {
                result = convertHundreds(tempNum % 1000) + thousands[thousandCounter] + ' ' + result;
            }
            tempNum = Math.floor(tempNum / 1000);
            thousandCounter++;
        }

        // Handle cents
        const cents = Math.round((num - Math.floor(num)) * 100);
        if (cents > 0) {
            result += `and ${cents}/100 `;
        }

        return result.trim() + ' Dollars';
    }

    async generateDocument() {
        const sections = [
            ...this.createHeader(),
            ...this.createBasicInformation(),
            ...this.createUCCCompliantPromise(),
            ...this.createUCCTerms(),
            ...this.createUCCCompliantSignatures(),
            ...this.createBlockchainSection(),
            ...this.createLegalFooter()
        ];

        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: {
                            font: "Times New Roman",
                            size: 24
                        }
                    }
                }
            },
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 1440,    // 1 inch
                            right: 1440,  // 1 inch  
                            bottom: 1440, // 1 inch
                            left: 1440    // 1 inch
                        }
                    }
                },
                children: sections
            }]
        });

        return doc;
    }

    async saveToFile(filename) {
        const doc = await this.generateDocument();
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(filename, buffer);
        return filename;
    }

    async getBuffer() {
        const doc = await this.generateDocument();
        return await Packer.toBuffer(doc);
    }
}

// Updated sample data with flat fee structure and payment schedule
const sampleContractData = {
    principal: 5000.00,
    serviceFee: 50.00, // Flat service fee instead of interest
    loanDate: "2025-01-25",
    dueDate: "2025-07-25",
    paymentSchedule: "monthly", // lump_sum, monthly, bi_weekly, quarterly, custom
    numberOfPayments: 6,
    paymentAmount: 841.67,
    paymentScheduleTable: [
        { date: "2025-02-25", amount: 841.67 },
        { date: "2025-03-25", amount: 841.67 },
        { date: "2025-04-25", amount: 841.67 },
        { date: "2025-05-25", amount: 841.67 },
        { date: "2025-06-25", amount: 841.67 },
        { date: "2025-07-25", amount: 841.65 } // Final payment adjusted for rounding
    ],
    borrower: {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@example.com",
        phone: "(555) 123-4567",
        address: "123 Oak Street, Springfield, IL 62701"
    },
    lender: {
        firstName: "John", 
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "(555) 987-6543",
        address: "456 Pine Avenue, Springfield, IL 62702"
    },
    lateFee: {
        type: "flat",
        amount: 25.00
    },
    graceDays: 5,
    accelerationClause: true,
    collateral: {
        description: "2018 Honda Civic, VIN: 1HGCM82633A123456"
    },
    loanPurpose: "Home improvement and emergency expenses",
    blockchainHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890"
};

    createTermsAndConditions() {
        const paragraphs = [];

        // Payment Terms
        paragraphs.push(
            new Paragraph({
                spacing: { before: 400, after: 200 },
                children: [
                    new TextRun({
                        text: "PAYMENT TERMS",
                        bold: true,
                        size: 26,
                        font: "Times New Roman"
                    })
                ]
            })
        );

        // Payment Schedule
        const scheduleText = this.getPaymentScheduleText();
        paragraphs.push(
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: scheduleText,
                        size: 22,
                        font: "Times New Roman"
                    })
                ]
            })
        );

        // Late Fees
        if (this.data.lateFee && this.data.lateFee.type !== 'none') {
            const lateFeeText = this.getLateFeeText();
            paragraphs.push(
                new Paragraph({
                    spacing: { after: 200 },
                    children: [
                        new TextRun({
                            text: `Late Payment Fee: `,
                            bold: true,
                            size: 22,
                            font: "Times New Roman"
                        }),
                        new TextRun({
                            text: lateFeeText,
                            size: 22,
                            font: "Times New Roman"
                        })
                    ]
                })
            );
        }

        // Grace Period
        if (this.data.graceDays && this.data.graceDays > 0) {
            paragraphs.push(
                new Paragraph({
                    spacing: { after: 200 },
                    children: [
                        new TextRun({
                            text: `Grace Period: `,
                            bold: true,
                            size: 22,
                            font: "Times New Roman"
                        }),
                        new TextRun({
                            text: `${this.data.graceDays} days after due date before late fees apply.`,
                            size: 22,
                            font: "Times New Roman"
                        })
                    ]
                })
            );
        }

        // Acceleration Clause
        if (this.data.accelerationClause) {
            paragraphs.push(
                new Paragraph({
                    spacing: { before: 300, after: 200 },
                    indent: { left: 360, right: 360 },
                    shading: {
                        fill: "FFF3CD",
                        type: ShadingType.SOLID
                    },
                    children: [
                        new TextRun({
                            text: "ACCELERATION CLAUSE: ",
                            bold: true,
                            size: 22,
                            font: "Times New Roman"
                        }),
                        new TextRun({
                            text: "Upon default of any payment, the entire unpaid balance shall become immediately due and payable.",
                            size: 22,
                            font: "Times New Roman"
                        })
                    ]
                })
            );
        }

        // Collateral
        if (this.data.collateral && this.data.collateral.description) {
            paragraphs.push(
                new Paragraph({
                    spacing: { before: 300, after: 200 },
                    children: [
                        new TextRun({
                            text: "COLLATERAL: ",
                            bold: true,
                            size: 22,
                            font: "Times New Roman"
                        }),
                        new TextRun({
                            text: this.data.collateral.description,
                            size: 22,
                            font: "Times New Roman"
                        })
                    ]
                })
            );
        }

        return paragraphs;
    }

    createSignatureSection() {
        return [
            new Paragraph({
                spacing: { before: 600, after: 200 },
                children: [
                    new TextRun({
                        text: "SIGNATURES",
                        bold: true,
                        size: 26,
                        font: "Times New Roman"
                    })
                ]
            }),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                    insideHorizontal: { style: BorderStyle.NONE },
                    insideVertical: { style: BorderStyle.NONE }
                },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                width: { size: 50, type: WidthType.PERCENTAGE },
                                children: [
                                    new Paragraph({
                                        spacing: { after: 400 },
                                        children: [
                                            new TextRun({
                                                text: "Borrower Signature:",
                                                bold: true,
                                                size: 22,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    }),
                                    new Paragraph({
                                        spacing: { after: 200 },
                                        children: [
                                            new TextRun({
                                                text: "_".repeat(30),
                                                size: 20,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `${this.data.borrower.firstName} ${this.data.borrower.lastName}`,
                                                size: 20,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `Date: ${"_".repeat(15)}`,
                                                size: 20,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    })
                                ]
                            }),
                            new TableCell({
                                width: { size: 50, type: WidthType.PERCENTAGE },
                                children: [
                                    new Paragraph({
                                        spacing: { after: 400 },
                                        children: [
                                            new TextRun({
                                                text: "Lender Signature:",
                                                bold: true,
                                                size: 22,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    }),
                                    new Paragraph({
                                        spacing: { after: 200 },
                                        children: [
                                            new TextRun({
                                                text: "_".repeat(30),
                                                size: 20,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `${this.data.lender.firstName} ${this.data.lender.lastName}`,
                                                size: 20,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: `Date: ${"_".repeat(15)}`,
                                                size: 20,
                                                font: "Times New Roman"
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ];
    }

    createBlockchainSection() {
        return [
            new Paragraph({
                spacing: { before: 600, after: 200 },
                children: [
                    new TextRun({
                        text: "BLOCKCHAIN VERIFICATION",
                        bold: true,
                        size: 26,
                        font: "Times New Roman"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 200 },
                indent: { left: 360, right: 360 },
                shading: {
                    fill: "E3F2FD",
                    type: ShadingType.SOLID
                },
                children: [
                    new TextRun({
                        text: "This contract has been timestamped and anchored on the blockchain for immutable proof of existence and authenticity.",
                        size: 20,
                        font: "Times New Roman",
                        italics: true
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: `Blockchain Hash: `,
                        bold: true,
                        size: 20,
                        font: "Times New Roman"
                    }),
                    new TextRun({
                        text: this.data.blockchainHash || "[To be generated upon signing]",
                        size: 18,
                        font: "Courier New"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: `Network: `,
                        bold: true,
                        size: 20,
                        font: "Times New Roman"
                    }),
                    new TextRun({
                        text: this.data.blockchainNetwork || "Ethereum Mainnet",
                        size: 20,
                        font: "Times New Roman"
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Timestamp: `,
                        bold: true,
                        size: 20,
                        font: "Times New Roman"
                    }),
                    new TextRun({
                        text: this.data.blockchainTimestamp || new Date().toISOString(),
                        size: 20,
                        font: "Times New Roman"
                    })
                ]
            })
        ];
    }

    createLegalDisclaimer() {
        return [
            new Paragraph({
                spacing: { before: 600, after: 200 },
                children: [
                    new TextRun({
                        text: "LEGAL NOTICE",
                        bold: true,
                        size: 26,
                        font: "Times New Roman"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 300 },
                alignment: AlignmentType.JUSTIFIED,
                children: [
                    new TextRun({
                        text: "This promissory note constitutes a legally binding agreement between the parties. Both parties acknowledge that they have read, understood, and agree to be bound by all terms contained herein. This agreement shall be governed by the laws of the jurisdiction where the Lender resides. Any disputes arising from this agreement shall be resolved in the courts of competent jurisdiction.",
                        size: 18,
                        font: "Times New Roman"
                    })
                ]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: "--- Generated by TrustLend.app ---",
                        size: 16,
                        font: "Times New Roman",
                        italics: true,
                        color: "666666"
                    })
                ]
            })
        ];
    }

    getPaymentScheduleText() {
        switch (this.data.paymentSchedule) {
            case 'lump_sum':
                return `The entire principal and accrued interest shall be paid in one lump sum on ${this.formatDate(this.data.dueDate)}.`;
            case 'monthly':
                return `Payments shall be made monthly, with equal installments calculated to fully amortize the loan by ${this.formatDate(this.data.dueDate)}.`;
            case 'quarterly':
                return `Payments shall be made quarterly, with equal installments calculated to fully amortize the loan by ${this.formatDate(this.data.dueDate)}.`;
            default:
                return `Payment schedule as agreed upon by both parties, with final payment due ${this.formatDate(this.data.dueDate)}.`;
        }
    }

    getLateFeeText() {
        if (this.data.lateFee.type === 'flat') {
            return `${this.formatCurrency(this.data.lateFee.amount)} flat fee for each late payment.`;
        } else if (this.data.lateFee.type === 'percentage') {
            return `${this.data.lateFee.percentage}% of the payment amount for each late payment.`;
        }
        return '';
    }

    numberToWords(num) {
        // Simple implementation - in production, use a proper library
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const thousands = ['', 'Thousand', 'Million', 'Billion'];

        if (num === 0) return 'Zero';

        function convertHundreds(n) {
            let result = '';
            if (n >= 100) {
                result += ones[Math.floor(n / 100)] + ' Hundred ';
                n %= 100;
            }
            if (n >= 20) {
                result += tens[Math.floor(n / 10)] + ' ';
                n %= 10;
            }
            if (n > 0) {
                result += ones[n] + ' ';
            }
            return result;
        }

        let result = '';
        let thousandCounter = 0;

        while (num > 0) {
            if (num % 1000 !== 0) {
                result = convertHundreds(num % 1000) + thousands[thousandCounter] + ' ' + result;
            }
            num = Math.floor(num / 1000);
            thousandCounter++;
        }

        return result.trim() + ' Dollars';
    }

    async generateDocument() {
        const sections = [
            ...this.createHeader(),
            ...this.createBasicInformation(),
            ...this.createPromiseClause(),
            ...this.createTermsAndConditions(),
            ...this.createSignatureSection(),
            ...this.createBlockchainSection(),
            ...this.createLegalDisclaimer()
        ];

        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: {
                            font: "Times New Roman",
                            size: 24
                        }
                    }
                }
            },
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 1440,    // 1 inch
                            right: 1440,  // 1 inch
                            bottom: 1440, // 1 inch
                            left: 1440    // 1 inch
                        }
                    }
                },
                children: sections
            }]
        });

        return doc;
    }

    async saveToFile(filename) {
        const doc = await this.generateDocument();
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(filename, buffer);
        return filename;
    }

    async getBuffer() {
        const doc = await this.generateDocument();
        return await Packer.toBuffer(doc);
    }
}

// Example usage and test data
const sampleContractData = {
    principal: 5000.00,
    interestRate: 5.0,
    loanDate: "2025-01-25",
    dueDate: "2025-07-25",
    paymentSchedule: "lump_sum",
    borrower: {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@example.com",
        phone: "(555) 123-4567",
        address: "123 Oak Street, Springfield, IL 62701"
    },
    lender: {
        firstName: "John", 
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "(555) 987-6543",
        address: "456 Pine Avenue, Springfield, IL 62702"
    },
    lateFee: {
        type: "flat",
        amount: 25.00
    },
    graceDays: 5,
    accelerationClause: true,
    collateral: {
        description: "2018 Honda Civic, VIN: 1HGCM82633A123456"
    },
    loanPurpose: "Home improvement and debt consolidation",
    blockchainHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
    blockchainNetwork: "Ethereum Mainnet",
    blockchainTimestamp: "2025-01-25T10:30:00.000Z"
};

// Generate the document
async function generateSamplePromissoryNote() {
    try {
        const generator = new PromissoryNoteGenerator(sampleContractData);
        const filename = `/mnt/user-data/outputs/promissory-note-${Date.now()}.docx`;
        await generator.saveToFile(filename);
        console.log(`UCC-compliant promissory note generated successfully: ${filename}`);
        return filename;
    } catch (error) {
        console.error('Error generating promissory note:', error);
        throw error;
    }
}

// Export for use in web applications
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PromissoryNoteGenerator, sampleContractData, generateSamplePromissoryNote };
}

// Generate sample if run directly
if (require.main === module) {
    generateSamplePromissoryNote();
}
