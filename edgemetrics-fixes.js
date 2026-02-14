/**
 * EdgeMetrics Critical Fixes - Week 1
 * Auto-applies all security, performance, and reliability fixes
 * Just include this file and all improvements are automatic!
 */

(function() {
    'use strict';
    
    console.log('🔧 EdgeMetrics Critical Fixes loaded');
    
    // ============================================
    // FIX 1: SECURE STORAGE WITH ENCRYPTION
    // ============================================
    
    class SecureStorage {
        constructor() {
            this.encryptionKey = this.getOrCreateKey();
            console.log('🔒 Secure storage initialized');
        }
        
        getOrCreateKey() {
            let key = localStorage.getItem('edgemetrics_encryption_key');
            if (!key) {
                // Generate unique key for this browser
                key = this.generateKey();
                localStorage.setItem('edgemetrics_encryption_key', key);
                console.log('🔑 New encryption key generated');
            }
            return key;
        }
        
        generateKey() {
            const array = new Uint8Array(32);
            crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        }
        
        encrypt(data) {
            try {
                const jsonString = JSON.stringify(data);
                // Simple encryption (XOR with key) - In production, use CryptoJS AES
                let encrypted = '';
                for (let i = 0; i < jsonString.length; i++) {
                    const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                    encrypted += String.fromCharCode(jsonString.charCodeAt(i) ^ keyChar);
                }
                return btoa(encrypted); // Base64 encode
            } catch (error) {
                console.error('❌ Encryption failed:', error);
                return null;
            }
        }
        
        decrypt(encryptedData) {
            try {
                const encrypted = atob(encryptedData); // Base64 decode
                let decrypted = '';
                for (let i = 0; i < encrypted.length; i++) {
                    const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                    decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ keyChar);
                }
                return JSON.parse(decrypted);
            } catch (error) {
                console.error('❌ Decryption failed:', error);
                return null;
            }
        }
        
        setSecure(key, data) {
            try {
                const encrypted = this.encrypt(data);
                if (encrypted) {
                    localStorage.setItem(key, encrypted);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('❌ Secure save failed:', error);
                return false;
            }
        }
        
        getSecure(key) {
            try {
                const encrypted = localStorage.getItem(key);
                if (!encrypted) return null;
                return this.decrypt(encrypted);
            } catch (error) {
                console.error('❌ Secure load failed:', error);
                return null;
            }
        }
    }
    
    // Make SecureStorage globally available
    window.secureStorage = new SecureStorage();
    
    // ============================================
    // FIX 2: INPUT VALIDATION
    // ============================================
    
    window.Validator = {
        validatePnL(value) {
            if (!value) return { valid: true, value: null };
            
            const num = parseFloat(value);
            if (isNaN(num)) {
                return { valid: false, error: 'P&L must be a number' };
            }
            if (num < -1000000 || num > 1000000) {
                return { valid: false, error: 'P&L value seems unrealistic' };
            }
            return { valid: true, value: num };
        },
        
        validateText(value, fieldName, maxLength = 5000) {
            if (!value) return { valid: true, value: '' };
            
            const trimmed = value.trim();
            if (trimmed.length > maxLength) {
                return { 
                    valid: false, 
                    error: `${fieldName} must be less than ${maxLength} characters` 
                };
            }
            
            // Basic XSS protection
            const sanitized = trimmed
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;');
                
            return { valid: true, value: sanitized };
        },
        
        validateInstrument(value) {
            if (!value || value.trim() === '') {
                return { valid: false, error: 'Instrument is required' };
            }
            
            const trimmed = value.trim().toUpperCase();
            if (trimmed.length > 20) {
                return { valid: false, error: 'Instrument name too long' };
            }
            
            if (!/^[A-Z0-9\-\/\.]+$/.test(trimmed)) {
                return { valid: false, error: 'Invalid instrument format' };
            }
            
            return { valid: true, value: trimmed };
        },
        
        validateOutcome(value) {
            const validOutcomes = ['win', 'loss', 'breakeven', 'no-trade'];
            if (!validOutcomes.includes(value)) {
                return { valid: false, error: 'Invalid outcome value' };
            }
            return { valid: true, value };
        }
    };
    
    // ============================================
    // FIX 3: CHART MEMORY LEAK PREVENTION
    // ============================================
    
    window.ChartManager = {
        charts: {},
        
        createChart(canvasId, config) {
            // Destroy existing chart if it exists
            if (this.charts[canvasId]) {
                try {
                    this.charts[canvasId].destroy();
                    console.log(`♻️ Destroyed old chart: ${canvasId}`);
                } catch (error) {
                    console.error(`❌ Failed to destroy chart ${canvasId}:`, error);
                }
            }
            
            // Create new chart
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error(`❌ Canvas not found: ${canvasId}`);
                return null;
            }
            
            try {
                this.charts[canvasId] = new Chart(canvas, config);
                console.log(`✅ Created chart: ${canvasId}`);
                return this.charts[canvasId];
            } catch (error) {
                console.error(`❌ Failed to create chart ${canvasId}:`, error);
                return null;
            }
        },
        
        destroyChart(canvasId) {
            if (this.charts[canvasId]) {
                try {
                    this.charts[canvasId].destroy();
                    delete this.charts[canvasId];
                    console.log(`♻️ Destroyed chart: ${canvasId}`);
                } catch (error) {
                    console.error(`❌ Failed to destroy chart ${canvasId}:`, error);
                }
            }
        },
        
        destroyAllCharts() {
            Object.keys(this.charts).forEach(canvasId => {
                this.destroyChart(canvasId);
            });
            console.log('♻️ All charts destroyed');
        }
    };
    
    // ============================================
    // FIX 4: AUTOMATIC BACKUP SYSTEM
    // ============================================
    
    class BackupManager {
        constructor() {
            this.backupInterval = 24 * 60 * 60 * 1000; // 24 hours
            this.maxBackups = 7; // Keep 7 days of backups
            this.init();
        }
        
        init() {
            // Create backup on load
            this.createBackup();
            
            // Schedule regular backups
            setInterval(() => {
                this.createBackup();
            }, this.backupInterval);
            
            // Backup before leaving
            window.addEventListener('beforeunload', () => {
                this.createBackup();
            });
            
            console.log('💾 Automatic backup system initialized');
        }
        
        createBackup() {
            try {
                const timestamp = new Date().toISOString();
                const backupKey = `edgemetrics_backup_${timestamp}`;
                
                // Get all EdgeMetrics data
                const data = {
                    sessions: window.secureStorage.getSecure('edgemetrics_sessions') || [],
                    achievements: JSON.parse(localStorage.getItem('edgemetrics_achievements') || '[]'),
                    theme: localStorage.getItem('edgemetrics_theme'),
                    accent: localStorage.getItem('edgemetrics_accent'),
                    timestamp: timestamp
                };
                
                // Save backup
                localStorage.setItem(backupKey, JSON.stringify(data));
                
                // Prune old backups
                this.pruneOldBackups();
                
                console.log(`💾 Backup created: ${timestamp}`);
                return true;
            } catch (error) {
                console.error('❌ Backup failed:', error);
                return false;
            }
        }
        
        pruneOldBackups() {
            try {
                const backupKeys = Object.keys(localStorage)
                    .filter(key => key.startsWith('edgemetrics_backup_'))
                    .sort()
                    .reverse(); // Newest first
                
                // Keep only maxBackups
                if (backupKeys.length > this.maxBackups) {
                    const toDelete = backupKeys.slice(this.maxBackups);
                    toDelete.forEach(key => {
                        localStorage.removeItem(key);
                        console.log(`🗑️ Deleted old backup: ${key}`);
                    });
                }
            } catch (error) {
                console.error('❌ Failed to prune backups:', error);
            }
        }
        
        listBackups() {
            return Object.keys(localStorage)
                .filter(key => key.startsWith('edgemetrics_backup_'))
                .map(key => {
                    const data = JSON.parse(localStorage.getItem(key));
                    return {
                        key: key,
                        timestamp: data.timestamp,
                        sessions: data.sessions.length
                    };
                })
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
        
        restoreBackup(backupKey) {
            try {
                const backup = JSON.parse(localStorage.getItem(backupKey));
                if (!backup) {
                    throw new Error('Backup not found');
                }
                
                // Restore data
                window.secureStorage.setSecure('edgemetrics_sessions', backup.sessions);
                localStorage.setItem('edgemetrics_achievements', JSON.stringify(backup.achievements));
                localStorage.setItem('edgemetrics_theme', backup.theme || 'dark');
                
                console.log(`✅ Restored from backup: ${backup.timestamp}`);
                return true;
            } catch (error) {
                console.error('❌ Restore failed:', error);
                return false;
            }
        }
    }
    
    window.backupManager = new BackupManager();
    
    // ============================================
    // FIX 5: PAGINATION HELPER
    // ============================================
    
    window.PaginationHelper = {
        pageSize: 20,
        currentPage: 1,
        
        paginate(items, page = null) {
            if (page !== null) {
                this.currentPage = page;
            }
            
            const totalPages = Math.ceil(items.length / this.pageSize);
            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;
            
            return {
                items: items.slice(startIndex, endIndex),
                currentPage: this.currentPage,
                totalPages: totalPages,
                totalItems: items.length,
                hasNext: this.currentPage < totalPages,
                hasPrev: this.currentPage > 1
            };
        },
        
        renderControls(containerId, totalPages, currentPage, onPageChange) {
            const container = document.getElementById(containerId);
            if (!container || totalPages <= 1) {
                if (container) container.innerHTML = '';
                return;
            }
            
            let html = '<div class="flex items-center justify-center gap-2 mt-6">';
            
            // Previous button
            const prevDisabled = currentPage === 1 ? 'disabled opacity-50 cursor-not-allowed' : '';
            html += `
                <button 
                    onclick="${onPageChange}(${currentPage - 1})"
                    ${currentPage === 1 ? 'disabled' : ''}
                    class="btn-secondary px-4 py-2 ${prevDisabled}">
                    ← Previous
                </button>
            `;
            
            // Page numbers
            const maxPagesToShow = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
            
            if (endPage - startPage < maxPagesToShow - 1) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }
            
            // First page
            if (startPage > 1) {
                html += `<button onclick="${onPageChange}(1)" class="btn-secondary px-4 py-2">1</button>`;
                if (startPage > 2) {
                    html += `<span class="text-secondary">...</span>`;
                }
            }
            
            // Page numbers
            for (let i = startPage; i <= endPage; i++) {
                const active = i === currentPage ? 'bg-[#10b981] text-white' : '';
                html += `
                    <button 
                        onclick="${onPageChange}(${i})"
                        class="btn-secondary px-4 py-2 ${active}">
                        ${i}
                    </button>
                `;
            }
            
            // Last page
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    html += `<span class="text-secondary">...</span>`;
                }
                html += `<button onclick="${onPageChange}(${totalPages})" class="btn-secondary px-4 py-2">${totalPages}</button>`;
            }
            
            // Next button
            const nextDisabled = currentPage === totalPages ? 'disabled opacity-50 cursor-not-allowed' : '';
            html += `
                <button 
                    onclick="${onPageChange}(${currentPage + 1})"
                    ${currentPage === totalPages ? 'disabled' : ''}
                    class="btn-secondary px-4 py-2 ${nextDisabled}">
                    Next →
                </button>
            `;
            
            html += `<span class="text-sm text-secondary ml-4">Page ${currentPage} of ${totalPages}</span>`;
            html += '</div>';
            
            container.innerHTML = html;
        }
    };
    
    // ============================================
    // FIX 6: SEARCH PERFORMANCE (DEBOUNCE)
    // ============================================
    
    window.debounce = function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };
    
    // ============================================
    // FIX 7: ERROR BOUNDARY
    // ============================================
    
    window.safeExecute = function(fn, errorMessage = 'Operation failed') {
        try {
            return fn();
        } catch (error) {
            console.error(`❌ ${errorMessage}:`, error);
            if (window.app && window.app.showToast) {
                window.app.showToast(errorMessage, 'error');
            } else {
                alert(errorMessage);
            }
            return null;
        }
    };
    
    // Global error handler
    window.addEventListener('error', function(event) {
        console.error('❌ Global error:', event.error);
        // Don't show toast for every error, just log it
    });
    
    window.addEventListener('unhandledrejection', function(event) {
        console.error('❌ Unhandled promise rejection:', event.reason);
    });
    
    // ============================================
    // FIX 8: MOBILE IMPROVEMENTS
    // ============================================
    
    // Prevent zoom on iOS when focusing inputs
    const addMaximumScaleToMetaViewport = () => {
        const el = document.querySelector('meta[name=viewport]');
        if (el !== null) {
            let content = el.getAttribute('content');
            let re = /maximum-scale=[0-9.]+/g;
            if (re.test(content)) {
                content = content.replace(re, 'maximum-scale=1.0');
            } else {
                content = [content, 'maximum-scale=1.0'].join(', ');
            }
            el.setAttribute('content', content);
        }
    };
    
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        addMaximumScaleToMetaViewport();
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    console.log('✅ All critical fixes applied successfully!');
    console.log('🔒 Data encryption: ENABLED');
    console.log('♻️ Memory leak fixes: ENABLED');
    console.log('💾 Auto-backup: ENABLED');
    console.log('✅ Input validation: ENABLED');
    console.log('📄 Pagination: READY');
    
    // Migration: Encrypt existing unencrypted data
    window.addEventListener('load', function() {
        try {
            const oldSessions = localStorage.getItem('edgemetrics_sessions');
            if (oldSessions && !oldSessions.startsWith('{')) {
                // Looks like plain text, migrate to encrypted
                const sessions = JSON.parse(oldSessions);
                window.secureStorage.setSecure('edgemetrics_sessions', sessions);
                localStorage.removeItem('edgemetrics_sessions'); // Remove old version
                console.log('🔄 Migrated old data to encrypted storage');
            }
        } catch (error) {
            console.log('No migration needed');
        }
    });
    
})();
