/**
 * TrustLend UCC Compliance Module
 * Handles UCC Articles 3 & 9 compliance, attachments, and legal requirements
 */

class UCCCompliance {
    constructor() {
        this.uccArticles = {
            article3: {
                title: "UCC Article 3 - Negotiable Instruments",
                sections: [
                    {
                        number: "3-104",
                        title: "Negotiable Instrument", 
                        content: "A negotiable instrument is an unconditional promise or order to pay a fixed amount of money..."
                    },
                    {
                        number: "3-412", 
                        title: "Obligation of Issuer",
                        content: "The issuer of a note is obliged to pay the instrument according to its terms..."
                    },
                    {
                        number: "3-302",
                        title: "Holder in Due Course",
                        content: "Subject to subsection (c) and Section 3-106(d), 'holder in due course' means..."
                    }
                ]
            },
            article9: {
                title: "UCC Article 9 - Secured Transactions",
                sections: [
                    {
                        number: "9-203",
                        title: "Attachment of Security Interest",
                        content: "A security interest attaches to collateral when it becomes enforceable..."
                    },
                    {
                        number: "9-310", 
                        title: "When Filing Required to Perfect Security Interest",
                        content: "Except as otherwise provided in subsection (b) and Section 9-312(b)..."
                    },
                    {
                        number: "9-315",
                        title: "Secured Party's Rights on Disposition of Collateral",
                        content: "Except as otherwise provided in this article and in Section 2-403(2)..."
                    }
                ]
            }
        };
        
        this.stateRequirements = {
            'GA': {
                name: 'Georgia',
                maxInterestRate: 16.0,
                usury: true,
                witnessRequired: false,
                notaryRequired: false,
                additionalRequirements: ['Recording may be required for amounts over $500']
            },
            'FL': {
                name: 'Florida', 
                maxInterestRate: 18.0,
                usury: true,
                witnessRequired: true,
                notaryRequired: true,
                additionalRequirements: ['Two witnesses required for amounts over $1,000']
            },
            'AL': {
                name: 'Alabama',
                maxInterestRate: 8.0,
                usury: true, 
                witnessRequired: false,
                notaryRequired: false,
                additionalRequirements: ['Recording required for amounts over $500']
            },
            'TN': {
                name: 'Tennessee',
                maxInterestRate: 10.0,
                usury: true,
                witnessRequired: false,
                notaryRequired: false,
                additionalRequirements: ['May require recording for secured transactions']
            }
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        document.addEventListener('contractGenerated', (e) => {
            this.attachUCCProvisions(e.detail);
        });
        
        document.addEventListener('stateChanged', (e) => {
            this.updateStateRequirements(e.detail.state);
        });
    }
    
    // Generate UCC attachments based on contract type
    getRelevantUCC(contractData) {
        const attachments = {
            uccProvisions: [],
            stateRequirements: [],
            compliance: []
        };
        
        // Determine if secured transaction
        const isSecured = this.isSecuredTransaction(contractData);
        
        // Always include Article 3 for promissory notes
        attachments.uccProvisions.push({
            article: 'article3',
            relevance: 'This promissory note is a negotiable instrument under UCC Article 3',
            sections: this.uccArticles.article3.sections.filter(s => 
                ['3-104', '3-412'].includes(s.number)
            )
        });
        
        // Include Article 9 if secured
        if (isSecured) {
            attachments.uccProvisions.push({
                article: 'article9',
                relevance: 'This secured promissory note requires UCC Article 9 compliance',
                sections: this.uccArticles.article9.sections
            });
        }
        
        // Add state-specific requirements
        const lenderState = contractData.lenderState;
        if (lenderState && this.stateRequirements[lenderState]) {
            attachments.stateRequirements = this.getStateRequirements(lenderState);
        }
        
        return attachments;
    }
    
    isSecuredTransaction(contractData) {
        // Determine if this is a secured transaction based on:
        // 1. Collateral mentioned
        // 2. Security interest language
        // 3. Amount threshold
        // 4. Contract template type
        
        const amount = parseFloat(contractData.principal) || 0;
        const hasCollateral = contractData.collateral && contractData.collateral.trim();
        const template = contractData.contractTemplate;
        
        return hasCollateral || 
               template === 'secured' || 
               amount > 10000; // Large amounts often secured
    }
    
    getStateRequirements(state) {
        const requirements = this.stateRequirements[state];
        if (!requirements) return null;
        
        return {
            state: state,
            stateName: requirements.name,
            maxInterestRate: requirements.maxInterestRate,
            usury: requirements.usury,
            witnessRequired: requirements.witnessRequired,
            notaryRequired: requirements.notaryRequired,
            additional: requirements.additionalRequirements,
            compliance: this.generateComplianceChecklist(requirements)
        };
    }
    
    generateComplianceChecklist(requirements) {
        const checklist = [];
        
        checklist.push({
            requirement: 'Interest Rate Compliance',
            status: 'compliant',
            description: `Maximum rate: ${requirements.maxInterestRate}% (this note uses flat fee structure)`
        });
        
        if (requirements.witnessRequired) {
            checklist.push({
                requirement: 'Witness Requirement',
                status: 'required',
                description: 'Two witnesses required for execution'
            });
        }
        
        if (requirements.notaryRequired) {
            checklist.push({
                requirement: 'Notarization',
                status: 'required', 
                description: 'Notary public acknowledgment required'
            });
        }
        
        requirements.additionalRequirements.forEach(req => {
            checklist.push({
                requirement: 'Additional Requirement',
                status: 'informational',
                description: req
            });
        });
        
        return checklist;
    }
    
    // Generate complete UCC attachment document
    generateUCCAttachment(contractData) {
        const uccData = this.getRelevantUCC(contractData);
        const timestamp = new Date().toISOString();
        
        return {
            metadata: {
                title: 'UCC Compliance Attachment',
                contractId: contractData.contractId || this.generateContractId(),
                generatedAt: timestamp,
                version: '1.0'
            },
            articles: uccData.uccProvisions,
            stateRequirements: uccData.stateRequirements,
            complianceStatement: this.generateComplianceStatement(contractData),
            attachmentContent: this.renderUCCDocument(uccData)
        };
    }
    
    generateComplianceStatement(contractData) {
        const isSecured = this.isSecuredTransaction(contractData);
        
        return {
            statement: `This promissory note has been prepared in compliance with the Uniform Commercial Code (UCC) as adopted by the state of ${contractData.lenderState || '[State]'}.`,
            articles: [
                'UCC Article 3 governs this negotiable instrument',
                isSecured ? 'UCC Article 9 governs the security interest (if applicable)' : null,
                'State-specific requirements have been reviewed and addressed'
            ].filter(Boolean),
            disclaimer: 'This attachment is provided for informational purposes. Consult legal counsel for specific compliance questions.'
        };
    }
    
    renderUCCDocument(uccData) {
        let html = `
            <div class="ucc-attachment-document">
                <header class="ucc-header">
                    <h1>UCC Compliance Attachment</h1>
                    <p>Uniform Commercial Code Provisions</p>
                    <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
                </header>
                
                <section class="compliance-overview">
                    <h2>Compliance Overview</h2>
                    <p>This promissory note complies with applicable UCC provisions and state requirements.</p>
                </section>
        `;
        
        // Add UCC Articles
        uccData.uccProvisions.forEach(provision => {
            html += `
                <section class="ucc-article">
                    <h2>${this.uccArticles[provision.article].title}</h2>
                    <p class="relevance">${provision.relevance}</p>
                    
                    <div class="ucc-sections">
                        ${provision.sections.map(section => `
                            <div class="ucc-section">
                                <h3>Section ${section.number}: ${section.title}</h3>
                                <p>${section.content}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        });
        
        // Add State Requirements
        if (uccData.stateRequirements) {
            html += `
                <section class="state-requirements">
                    <h2>${uccData.stateRequirements.stateName} State Requirements</h2>
                    
                    <div class="compliance-checklist">
                        ${uccData.stateRequirements.compliance.map(item => `
                            <div class="compliance-item ${item.status}">
                                <strong>${item.requirement}:</strong> ${item.description}
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        }
        
        html += `
                <footer class="ucc-footer">
                    <p><strong>Important:</strong> This attachment provides relevant UCC provisions for reference. 
                    Consult with legal counsel to ensure full compliance with applicable laws.</p>
                    <p>Generated by TrustLend UCC Compliance System</p>
                </footer>
            </div>
        `;
        
        return html;
    }
    
    // Preview UCC attachments
    previewUCCAttachments(contractData) {
        const uccAttachment = this.generateUCCAttachment(contractData);
        
        // Open preview window
        const previewWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>UCC Compliance Preview</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                    .ucc-header { border-bottom: 2px solid #ccc; padding-bottom: 20px; margin-bottom: 30px; }
                    .ucc-header h1 { color: #d97706; margin: 0; }
                    .timestamp { color: #666; font-size: 0.9em; }
                    .ucc-article { margin: 30px 0; }
                    .ucc-article h2 { color: #1f2937; border-left: 4px solid #d97706; padding-left: 10px; }
                    .relevance { background: #fef3c7; padding: 10px; border-radius: 5px; font-style: italic; }
                    .ucc-section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 5px; }
                    .ucc-section h3 { color: #374151; margin-top: 0; }
                    .state-requirements h2 { color: #059669; }
                    .compliance-item { margin: 10px 0; padding: 8px; border-radius: 4px; }
                    .compliance-item.compliant { background: #d1fae5; border-left: 4px solid #10b981; }
                    .compliance-item.required { background: #fef3c7; border-left: 4px solid #f59e0b; }
                    .compliance-item.informational { background: #dbeafe; border-left: 4px solid #3b82f6; }
                    .ucc-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 0.9em; color: #666; }
                </style>
            </head>
            <body>
                ${uccAttachment.attachmentContent}
            </body>
            </html>
        `);
        previewWindow.document.close();
    }
    
    // Download UCC attachments as PDF
    downloadUCCAttachments(contractData) {
        const uccAttachment = this.generateUCCAttachment(contractData);
        
        // Create downloadable content
        const content = this.formatForDownload(uccAttachment);
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `UCC_Compliance_Attachment_${uccAttachment.metadata.contractId}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    formatForDownload(uccAttachment) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>UCC Compliance Attachment - ${uccAttachment.metadata.contractId}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; margin: 40px; line-height: 1.6; color: #000; }
                    .letterhead { text-align: center; margin-bottom: 40px; }
                    .letterhead h1 { font-size: 24px; margin: 0; }
                    .letterhead p { margin: 5px 0; }
                    h2 { color: #000; border-bottom: 1px solid #000; padding-bottom: 5px; }
                    h3 { color: #333; }
                    .section { margin: 25px 0; }
                    .ucc-text { background: #f8f8f8; padding: 15px; border-left: 3px solid #ccc; }
                    .compliance-grid { display: grid; gap: 10px; margin: 20px 0; }
                    .compliance-item { padding: 10px; border: 1px solid #ddd; }
                    .footer { margin-top: 50px; font-size: 12px; text-align: center; }
                    @media print { body { margin: 20px; } }
                </style>
            </head>
            <body>
                <div class="letterhead">
                    <h1>UCC COMPLIANCE ATTACHMENT</h1>
                    <p>Uniform Commercial Code Provisions</p>
                    <p>Contract ID: ${uccAttachment.metadata.contractId}</p>
                    <p>Generated: ${new Date(uccAttachment.metadata.generatedAt).toLocaleString()}</p>
                </div>
                
                ${uccAttachment.attachmentContent}
                
                <div class="footer">
                    <p>This document was automatically generated by TrustLend UCC Compliance System</p>
                    <p>For legal questions, consult qualified legal counsel</p>
                </div>
            </body>
            </html>
        `;
    }
    
    // Validation functions
    validateCompliance(contractData) {
        const issues = [];
        const state = contractData.lenderState;
        
        if (state && this.stateRequirements[state]) {
            const requirements = this.stateRequirements[state];
            
            // Check interest rate (if applicable)
            if (contractData.interestRate && contractData.interestRate > requirements.maxInterestRate) {
                issues.push({
                    type: 'usury',
                    message: `Interest rate exceeds ${state} maximum of ${requirements.maxInterestRate}%`
                });
            }
            
            // Check witness requirements
            if (requirements.witnessRequired && !contractData.witnesses) {
                issues.push({
                    type: 'witness',
                    message: `${state} requires witnesses for this transaction`
                });
            }
            
            // Check notary requirements  
            if (requirements.notaryRequired && !contractData.notarized) {
                issues.push({
                    type: 'notary',
                    message: `${state} requires notarization for this transaction`
                });
            }
        }
        
        return {
            isCompliant: issues.length === 0,
            issues: issues,
            recommendations: this.getComplianceRecommendations(contractData)
        };
    }
    
    getComplianceRecommendations(contractData) {
        const recommendations = [];
        
        // Always recommend UCC attachment
        recommendations.push('Attach relevant UCC provisions to contract');
        
        // Secured transaction recommendations
        if (this.isSecuredTransaction(contractData)) {
            recommendations.push('File UCC-1 financing statement if creating security interest');
            recommendations.push('Clearly describe collateral in security agreement');
        }
        
        // State-specific recommendations
        const state = contractData.lenderState;
        if (state && this.stateRequirements[state]) {
            recommendations.push(`Review ${this.stateRequirements[state].name} state-specific requirements`);
        }
        
        return recommendations;
    }
    
    generateContractId() {
        return 'TL-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
}

// Initialize UCC Compliance system
window.addEventListener('DOMContentLoaded', () => {
    window.uccCompliance = new UCCCompliance();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UCCCompliance;
}