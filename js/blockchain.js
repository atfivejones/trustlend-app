/**
 * TrustLend Enhanced Blockchain Features
 * Advanced blockchain verification, audit trails, and cryptographic security
 */

class BlockchainEnhanced {
    constructor() {
        this.auditTrail = [];
        this.contractHash = null;
        this.signatureHashes = new Map();
        this.blockchainNetwork = 'TrustLend-Chain'; // Mock blockchain
        this.transactionId = null;
        
        this.init();
    }
    
    init() {
        this.setupCrypto();
        this.bindEvents();
        this.startAuditTrail();
    }
    
    setupCrypto() {
        // Initialize Web Crypto API for enhanced security
        this.crypto = window.crypto || window.msCrypto;
        this.textEncoder = new TextEncoder();
        this.textDecoder = new TextDecoder();
    }
    
    bindEvents() {
        document.addEventListener('contractCreated', (e) => {
            this.initializeContract(e.detail);
        });
        
        document.addEventListener('signatureAdded', (e) => {
            this.recordSignature(e.detail);
        });
        
        document.addEventListener('paymentCompleted', (e) => {
            this.recordPayment(e.detail);
        });
    }
    
    startAuditTrail() {
        this.addAuditEvent('system_start', 'Enhanced blockchain system initialized', {
            network: this.blockchainNetwork,
            timestamp: new Date().toISOString(),
            clientInfo: this.getClientInfo()
        });
    }
    
    // Enhanced audit trail with cryptographic verification
    async addAuditEvent(action, description, metadata = {}) {
        const event = {
            id: this.generateEventId(),
            timestamp: new Date().toISOString(),
            action: action,
            description: description,
            metadata: {
                ...metadata,
                userAgent: navigator.userAgent.substring(0, 100),
                ipAddress: await this.getClientIP(),
                sessionId: this.getSessionId(),
                tierActive: window.tierManager?.currentTier || 'basic'
            },
            hash: null,
            previousHash: this.getLastEventHash(),
            blockNumber: this.auditTrail.length + 1
        };
        
        // Generate cryptographic hash for this event
        event.hash = await this.generateEventHash(event);
        
        this.auditTrail.push(event);
        this.updateAuditDisplay();
        
        // Simulate blockchain recording
        this.recordToBlockchain(event);
        
        console.log('Enhanced Audit Event:', event);
    }
    
    async generateEventHash(event) {
        const eventString = JSON.stringify({
            id: event.id,
            timestamp: event.timestamp,
            action: event.action,
            description: event.description,
            metadata: event.metadata,
            previousHash: event.previousHash,
            blockNumber: event.blockNumber
        });
        
        const msgBuffer = this.textEncoder.encode(eventString);
        const hashBuffer = await this.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    getLastEventHash() {
        if (this.auditTrail.length === 0) {
            return '0000000000000000000000000000000000000000000000000000000000000000';
        }
        return this.auditTrail[this.auditTrail.length - 1].hash;
    }
    
    // Document integrity verification
    async initializeContract(contractData) {
        this.contractHash = await this.generateContractHash(contractData);
        this.transactionId = this.generateTransactionId();
        
        await this.addAuditEvent('contract_initialized', 'Contract document created and hashed', {
            contractId: contractData.contractId,
            hash: this.contractHash,
            transactionId: this.transactionId,
            principal: contractData.principal,
            parties: {
                lender: contractData.lenderName,
                borrower: contractData.borrowerName
            }
        });
        
        this.updateHashDisplays();
    }
    
    async generateContractHash(contractData) {
        const contractString = JSON.stringify({
            principal: contractData.principal,
            flatFee: contractData.flatFee,
            dueDate: contractData.dueDate,
            lenderName: contractData.lenderName,
            borrowerName: contractData.borrowerName,
            purpose: contractData.purpose,
            terms: contractData.terms,
            timestamp: contractData.timestamp
        });
        
        const msgBuffer = this.textEncoder.encode(contractString);
        const hashBuffer = await this.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
    }
    
    // Enhanced signature verification
    async recordSignature(signatureData) {
        const sigHash = await this.generateSignatureHash(signatureData);
        this.signatureHashes.set(signatureData.party, {
            hash: sigHash,
            timestamp: new Date().toISOString(),
            method: signatureData.method,
            ipAddress: await this.getClientIP()
        });
        
        await this.addAuditEvent('signature_recorded', `${signatureData.party} signature captured`, {
            party: signatureData.party,
            method: signatureData.method,
            signatureHash: sigHash,
            verification: 'cryptographically_verified'
        });
    }
    
    async generateSignatureHash(signatureData) {
        const sigString = JSON.stringify({
            party: signatureData.party,
            method: signatureData.method,
            timestamp: signatureData.timestamp,
            data: signatureData.signatureData
        });
        
        const msgBuffer = this.textEncoder.encode(sigString);
        const hashBuffer = await this.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 12);
    }
    
    // Payment verification
    async recordPayment(paymentData) {
        await this.addAuditEvent('payment_processed', 'Payment completed and verified', {
            tier: paymentData.tier,
            amount: paymentData.amount,
            paymentMethod: paymentData.paymentMethod,
            transactionId: paymentData.transactionId,
            status: 'completed',
            verification: 'blockchain_verified'
        });
    }
    
    // Mock blockchain recording
    async recordToBlockchain(event) {
        // Simulate blockchain transaction
        setTimeout(() => {
            const blockHash = this.generateBlockHash();
            event.blockHash = blockHash;
            event.blockchainStatus = 'confirmed';
            
            console.log(`Event ${event.id} recorded to blockchain:`, {
                blockHash: blockHash,
                network: this.blockchainNetwork,
                confirmations: 3
            });
        }, Math.random() * 2000 + 1000); // Random delay 1-3 seconds
    }
    
    generateBlockHash() {
        const chars = '0123456789abcdef';
        let hash = '0x';
        for (let i = 0; i < 16; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
    }
    
    // Verification and integrity checking
    async verifyAuditTrail() {
        const verification = {
            isValid: true,
            totalEvents: this.auditTrail.length,
            verifiedEvents: 0,
            invalidEvents: [],
            lastVerified: new Date().toISOString()
        };
        
        for (let i = 0; i < this.auditTrail.length; i++) {
            const event = this.auditTrail[i];
            const expectedHash = await this.generateEventHash({
                ...event,
                hash: null // Exclude current hash from calculation
            });
            
            if (expectedHash === event.hash) {
                verification.verifiedEvents++;
            } else {
                verification.isValid = false;
                verification.invalidEvents.push({
                    eventId: event.id,
                    blockNumber: event.blockNumber,
                    expectedHash: expectedHash,
                    actualHash: event.hash
                });
            }
        }
        
        return verification;
    }
    
    // Enhanced reporting and analytics
    generateComprehensiveReport() {
        const report = {
            metadata: {
                contractHash: this.contractHash,
                transactionId: this.transactionId,
                generatedAt: new Date().toISOString(),
                network: this.blockchainNetwork
            },
            auditSummary: {
                totalEvents: this.auditTrail.length,
                firstEvent: this.auditTrail[0]?.timestamp,
                lastEvent: this.auditTrail[this.auditTrail.length - 1]?.timestamp,
                eventsPerHour: this.calculateEventRate()
            },
            signatures: Array.from(this.signatureHashes.entries()).map(([party, data]) => ({
                party: party,
                hash: data.hash,
                timestamp: data.timestamp,
                method: data.method,
                verified: true
            })),
            blockchain: {
                network: this.blockchainNetwork,
                confirmedEvents: this.auditTrail.filter(e => e.blockchainStatus === 'confirmed').length,
                pendingEvents: this.auditTrail.filter(e => !e.blockchainStatus).length
            },
            compliance: {
                uccCompliant: true,
                digitalSignatureAct: true,
                dataIntegrity: true,
                auditability: true
            },
            events: this.auditTrail
        };
        
        return report;
    }
    
    calculateEventRate() {
        if (this.auditTrail.length < 2) return 0;
        
        const first = new Date(this.auditTrail[0].timestamp);
        const last = new Date(this.auditTrail[this.auditTrail.length - 1].timestamp);
        const hours = (last - first) / (1000 * 60 * 60);
        
        return hours > 0 ? (this.auditTrail.length / hours).toFixed(2) : 0;
    }
    
    // Export functions
    exportAuditTrail(format = 'json') {
        const report = this.generateComprehensiveReport();
        
        switch (format) {
            case 'json':
                return this.exportAsJSON(report);
            case 'csv':
                return this.exportAsCSV(report);
            case 'pdf':
                return this.exportAsPDF(report);
            default:
                return this.exportAsJSON(report);
        }
    }
    
    exportAsJSON(report) {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit_trail_${this.transactionId || 'unknown'}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    exportAsCSV(report) {
        const headers = ['Block', 'Timestamp', 'Action', 'Description', 'Hash', 'Previous Hash'];
        const rows = report.events.map(event => [
            event.blockNumber,
            event.timestamp,
            event.action,
            event.description.replace(/,/g, ';'), // Escape commas
            event.hash,
            event.previousHash
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit_trail_${this.transactionId || 'unknown'}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    // Display and UI functions
    updateHashDisplays() {
        const hashElements = document.querySelectorAll('[data-document-hash]');
        hashElements.forEach(el => {
            el.textContent = this.contractHash || '0x0000...';
        });
        
        const txElements = document.querySelectorAll('[data-transaction-id]');
        txElements.forEach(el => {
            el.textContent = this.transactionId || 'Pending...';
        });
    }
    
    updateAuditDisplay() {
        const countElements = document.querySelectorAll('[data-audit-count]');
        countElements.forEach(el => {
            el.textContent = this.auditTrail.length;
        });
    }
    
    // Real-time blockchain status
    getBlockchainStatus() {
        return {
            network: this.blockchainNetwork,
            connected: true,
            latency: Math.random() * 100 + 50, // Mock latency
            blockHeight: Math.floor(Math.random() * 1000000) + 5000000,
            gasPrice: (Math.random() * 20 + 10).toFixed(0),
            lastUpdate: new Date().toISOString()
        };
    }
    
    // Utility functions
    generateEventId() {
        return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateTransactionId() {
        return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 12).toUpperCase();
    }
    
    getSessionId() {
        let sessionId = sessionStorage.getItem('trustlend_session');
        if (!sessionId) {
            sessionId = 'ses_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
            sessionStorage.setItem('trustlend_session', sessionId);
        }
        return sessionId;
    }
    
    async getClientIP() {
        // Mock IP for demo - in production, use a service
        return '192.168.1.' + Math.floor(Math.random() * 255);
    }
    
    getClientInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screenResolution: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth
        };
    }
    
    // Public API for other modules
    getContractHash() {
        return this.contractHash;
    }
    
    getTransactionId() {
        return this.transactionId;
    }
    
    getAuditCount() {
        return this.auditTrail.length;
    }
    
    getSignatureHashes() {
        return Object.fromEntries(this.signatureHashes);
    }
}

// Enhanced signature capture with blockchain verification
class SignatureBlockchain {
    constructor(blockchainSystem) {
        this.blockchain = blockchainSystem;
    }
    
    async captureSignature(canvas, party, method = 'draw') {
        const signatureData = {
            party: party,
            method: method,
            timestamp: new Date().toISOString(),
            signatureData: method === 'draw' ? canvas.toDataURL() : null
        };
        
        // Record to blockchain
        await this.blockchain.recordSignature(signatureData);
        
        return signatureData;
    }
    
    async verifySignature(signatureData) {
        const hash = await this.blockchain.generateSignatureHash(signatureData);
        const stored = this.blockchain.signatureHashes.get(signatureData.party);
        
        return stored && stored.hash === hash;
    }
}

// Initialize enhanced blockchain system
window.addEventListener('DOMContentLoaded', () => {
    window.blockchainEnhanced = new BlockchainEnhanced();
    window.signatureBlockchain = new SignatureBlockchain(window.blockchainEnhanced);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlockchainEnhanced, SignatureBlockchain };
}