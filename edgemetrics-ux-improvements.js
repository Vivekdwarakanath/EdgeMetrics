/**
 * EdgeMetrics Week 2-4 UX Improvements
 * Onboarding, Advanced Search, Keyboard Shortcuts, Better Empty States
 */

(function() {
    'use strict';
    
    console.log('🎨 EdgeMetrics Week 2-4 UX Improvements loading...');
    
    // ============================================
    // FEATURE 1: INTERACTIVE ONBOARDING
    // ============================================
    
    class OnboardingTour {
        constructor() {
            this.steps = [
                {
                    target: '#start-session-btn',
                    title: '📝 Start Your First Session',
                    content: 'Click here to log a new trading session. Record your trades in real-time or after the fact.',
                    position: 'bottom'
                },
                {
                    target: '#analytics-btn',
                    title: '📊 View Analytics',
                    content: 'See your performance metrics, charts, and trends. Track your progress over time.',
                    position: 'bottom'
                },
                {
                    target: '#learning-btn',
                    title: '🎓 Learning Resources',
                    content: 'Access trading lessons and improve your skills with guided content.',
                    position: 'bottom'
                },
                {
                    target: '.quick-stat',
                    title: '⚡ Quick Stats',
                    content: 'Your key metrics are always visible here. Track sessions, streaks, and performance at a glance.',
                    position: 'bottom'
                },
                {
                    target: '#search-input',
                    title: '🔍 Search & Filter',
                    content: 'Find any session instantly. Search by instrument, notes, outcome, or use advanced filters.',
                    position: 'bottom'
                }
            ];
            this.currentStep = 0;
            this.overlay = null;
        }
        
        start() {
            if (localStorage.getItem('edgemetrics_onboarding_completed')) {
                return; // Already completed
            }
            
            this.createOverlay();
            this.showStep(0);
        }
        
        createOverlay() {
            this.overlay = document.createElement('div');
            this.overlay.id = 'onboarding-overlay';
            this.overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                z-index: 10000;
                display: none;
            `;
            document.body.appendChild(this.overlay);
        }
        
        showStep(stepIndex) {
            if (stepIndex >= this.steps.length) {
                this.complete();
                return;
            }
            
            const step = this.steps[stepIndex];
            const target = document.querySelector(step.target);
            
            if (!target) {
                // Skip if target doesn't exist
                this.showStep(stepIndex + 1);
                return;
            }
            
            // Show overlay
            this.overlay.style.display = 'block';
            
            // Highlight target
            const rect = target.getBoundingClientRect();
            this.overlay.innerHTML = `
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;" onclick="onboardingTour.next()"></div>
                <div style="
                    position: absolute;
                    top: ${rect.top - 8}px;
                    left: ${rect.left - 8}px;
                    width: ${rect.width + 16}px;
                    height: ${rect.height + 16}px;
                    border: 3px solid #10b981;
                    border-radius: 8px;
                    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.85);
                    pointer-events: none;
                    animation: pulse-border 2s ease-in-out infinite;
                "></div>
                <div style="
                    position: absolute;
                    top: ${rect.bottom + 20}px;
                    left: ${Math.max(20, rect.left)}px;
                    max-width: 400px;
                    background: #111111;
                    border: 1px solid #10b981;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
                ">
                    <div style="font-size: 20px; font-weight: 600; color: #10b981; margin-bottom: 12px;">
                        ${step.title}
                    </div>
                    <div style="color: #e5e5e5; line-height: 1.6; margin-bottom: 20px;">
                        ${step.content}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="color: #6b7280; font-size: 14px;">
                            Step ${stepIndex + 1} of ${this.steps.length}
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button onclick="onboardingTour.skip()" style="
                                background: transparent;
                                border: 1px solid #333;
                                color: #9ca3af;
                                padding: 8px 16px;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                            ">Skip</button>
                            <button onclick="onboardingTour.next()" style="
                                background: #10b981;
                                border: none;
                                color: white;
                                padding: 8px 24px;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: 600;
                            ">${stepIndex === this.steps.length - 1 ? 'Finish' : 'Next'}</button>
                        </div>
                    </div>
                </div>
            `;
            
            this.currentStep = stepIndex;
        }
        
        next() {
            this.showStep(this.currentStep + 1);
        }
        
        skip() {
            this.complete();
        }
        
        complete() {
            if (this.overlay) {
                this.overlay.remove();
            }
            localStorage.setItem('edgemetrics_onboarding_completed', 'true');
            
            if (window.app && window.app.showToast) {
                window.app.showToast('🎉 Welcome to EdgeMetrics! You\'re all set.', 'success');
            }
        }
    }
    
    window.onboardingTour = new OnboardingTour();
    
    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse-border {
            0%, 100% { border-color: #10b981; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.85), 0 0 20px rgba(16, 185, 129, 0.5); }
            50% { border-color: #059669; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.85), 0 0 30px rgba(16, 185, 129, 0.8); }
        }
    `;
    document.head.appendChild(style);
    
    // ============================================
    // FEATURE 2: KEYBOARD SHORTCUTS GUIDE
    // ============================================
    
    class KeyboardShortcutsGuide {
        constructor() {
            this.shortcuts = [
                { key: 'Ctrl/⌘ + N', description: 'Start new trading session', category: 'Sessions' },
                { key: 'Ctrl/⌘ + Q', description: 'Quick log trade', category: 'Sessions' },
                { key: 'Ctrl/⌘ + A', description: 'Open analytics dashboard', category: 'Navigation' },
                { key: 'Ctrl/⌘ + L', description: 'Open learning center', category: 'Navigation' },
                { key: 'Ctrl/⌘ + E', description: 'Export menu', category: 'Data' },
                { key: 'Ctrl/⌘ + F', description: 'Focus search bar', category: 'Navigation' },
                { key: 'Ctrl/⌘ + K', description: 'Show keyboard shortcuts', category: 'Help' },
                { key: 'Escape', description: 'Close overlays/modals', category: 'Navigation' },
                { key: '/', description: 'Focus search bar', category: 'Navigation' },
                { key: '?', description: 'Show help', category: 'Help' }
            ];
        }
        
        show() {
            const modal = document.createElement('div');
            modal.id = 'keyboard-shortcuts-modal';
            modal.className = 'modal-overlay active';
            
            const categories = {};
            this.shortcuts.forEach(shortcut => {
                if (!categories[shortcut.category]) {
                    categories[shortcut.category] = [];
                }
                categories[shortcut.category].push(shortcut);
            });
            
            let categoriesHTML = '';
            Object.entries(categories).forEach(([category, shortcuts]) => {
                categoriesHTML += `
                    <div style="margin-bottom: 24px;">
                        <h3 style="color: #10b981; font-size: 14px; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
                            ${category}
                        </h3>
                        ${shortcuts.map(s => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #222;">
                                <span style="color: #e5e5e5;">${s.description}</span>
                                <kbd style="
                                    background: #1a1a1a;
                                    border: 1px solid #333;
                                    border-radius: 4px;
                                    padding: 4px 12px;
                                    font-family: 'IBM Plex Mono', monospace;
                                    font-size: 12px;
                                    color: #10b981;
                                ">${s.key}</kbd>
                            </div>
                        `).join('')}
                    </div>
                `;
            });
            
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <div>
                            <h2 style="font-size: 24px; font-weight: 600; color: #e5e5e5;">⌨️ Keyboard Shortcuts</h2>
                            <p style="color: #9ca3af; font-size: 14px; margin-top: 4px;">Master EdgeMetrics like a pro</p>
                        </div>
                        <button onclick="this.closest('.modal-overlay').remove()" style="
                            background: transparent;
                            border: none;
                            color: #9ca3af;
                            cursor: pointer;
                            font-size: 24px;
                            padding: 4px;
                        ">×</button>
                    </div>
                    
                    ${categoriesHTML}
                    
                    <div style="margin-top: 24px; padding: 16px; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; border-radius: 4px;">
                        <div style="color: #10b981; font-weight: 600; margin-bottom: 4px;">💡 Pro Tip</div>
                        <div style="color: #e5e5e5; font-size: 14px;">
                            Press <kbd style="background: #1a1a1a; padding: 2px 8px; border-radius: 3px;">Ctrl/⌘ + K</kbd> anytime to see this guide!
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close on escape
            const closeOnEscape = (e) => {
                if (e.key === 'Escape') {
                    modal.remove();
                    document.removeEventListener('keydown', closeOnEscape);
                }
            };
            document.addEventListener('keydown', closeOnEscape);
        }
    }
    
    window.keyboardShortcutsGuide = new KeyboardShortcutsGuide();
    
    // Add Ctrl/Cmd + K to show shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            window.keyboardShortcutsGuide.show();
        }
        
        // ? to show help
        if (e.key === '?' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            window.keyboardShortcutsGuide.show();
        }
        
        // / to focus search
        if (e.key === '/' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.focus();
        }
    });
    
    // ============================================
    // FEATURE 3: ADVANCED SEARCH FILTERS
    // ============================================
    
    class AdvancedSearch {
        constructor() {
            this.filters = {
                outcome: 'all',
                instrument: 'all',
                dateFrom: null,
                dateTo: null,
                minPnL: null,
                maxPnL: null,
                mood: 'all',
                tags: []
            };
        }
        
        showAdvancedPanel() {
            let panel = document.getElementById('advanced-search-panel');
            
            if (!panel) {
                panel = document.createElement('div');
                panel.id = 'advanced-search-panel';
                panel.style.cssText = `
                    background: #111111;
                    border: 1px solid #222;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 16px 0;
                    display: none;
                `;
                
                const searchContainer = document.querySelector('.search-container') || document.querySelector('input[type="search"]')?.parentElement;
                if (searchContainer) {
                    searchContainer.after(panel);
                }
            }
            
            panel.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
                    <div>
                        <label style="display: block; color: #9ca3af; font-size: 12px; margin-bottom: 6px;">Outcome</label>
                        <select id="filter-outcome" class="input-field" onchange="advancedSearch.applyFilters()">
                            <option value="all">All Outcomes</option>
                            <option value="win">Wins Only</option>
                            <option value="loss">Losses Only</option>
                            <option value="breakeven">Break Even</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; color: #9ca3af; font-size: 12px; margin-bottom: 6px;">Date From</label>
                        <input type="date" id="filter-date-from" class="input-field" onchange="advancedSearch.applyFilters()">
                    </div>
                    
                    <div>
                        <label style="display: block; color: #9ca3af; font-size: 12px; margin-bottom: 6px;">Date To</label>
                        <input type="date" id="filter-date-to" class="input-field" onchange="advancedSearch.applyFilters()">
                    </div>
                    
                    <div>
                        <label style="display: block; color: #9ca3af; font-size: 12px; margin-bottom: 6px;">Min P&L</label>
                        <input type="number" id="filter-min-pnl" class="input-field" placeholder="e.g., -100" onchange="advancedSearch.applyFilters()">
                    </div>
                    
                    <div>
                        <label style="display: block; color: #9ca3af; font-size: 12px; margin-bottom: 6px;">Max P&L</label>
                        <input type="number" id="filter-max-pnl" class="input-field" placeholder="e.g., 500" onchange="advancedSearch.applyFilters()">
                    </div>
                    
                    <div>
                        <label style="display: block; color: #9ca3af; font-size: 12px; margin-bottom: 6px;">Mood</label>
                        <select id="filter-mood" class="input-field" onchange="advancedSearch.applyFilters()">
                            <option value="all">All Moods</option>
                            <option value="confident">Confident</option>
                            <option value="focused">Focused</option>
                            <option value="anxious">Anxious</option>
                            <option value="frustrated">Frustrated</option>
                        </select>
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button onclick="advancedSearch.clearFilters()" class="btn-secondary" style="padding: 8px 16px;">
                        Clear All
                    </button>
                    <button onclick="advancedSearch.togglePanel()" class="btn-primary" style="padding: 8px 16px;">
                        Close
                    </button>
                </div>
                
                <div id="filter-results" style="margin-top: 12px; color: #10b981; font-size: 14px;"></div>
            `;
            
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
        
        togglePanel() {
            const panel = document.getElementById('advanced-search-panel');
            if (panel) {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            } else {
                this.showAdvancedPanel();
            }
        }
        
        applyFilters() {
            if (!window.app || !window.app.state) return;
            
            this.filters.outcome = document.getElementById('filter-outcome')?.value || 'all';
            this.filters.dateFrom = document.getElementById('filter-date-from')?.value;
            this.filters.dateTo = document.getElementById('filter-date-to')?.value;
            this.filters.minPnL = document.getElementById('filter-min-pnl')?.value;
            this.filters.maxPnL = document.getElementById('filter-max-pnl')?.value;
            this.filters.mood = document.getElementById('filter-mood')?.value || 'all';
            
            let filtered = window.app.state.sessions;
            
            // Apply outcome filter
            if (this.filters.outcome !== 'all') {
                filtered = filtered.filter(s => s.outcome === this.filters.outcome);
            }
            
            // Apply date filters
            if (this.filters.dateFrom) {
                const fromDate = new Date(this.filters.dateFrom);
                filtered = filtered.filter(s => new Date(s.startTime) >= fromDate);
            }
            
            if (this.filters.dateTo) {
                const toDate = new Date(this.filters.dateTo);
                toDate.setHours(23, 59, 59);
                filtered = filtered.filter(s => new Date(s.startTime) <= toDate);
            }
            
            // Apply P&L filters
            if (this.filters.minPnL) {
                filtered = filtered.filter(s => s.pnl >= parseFloat(this.filters.minPnL));
            }
            
            if (this.filters.maxPnL) {
                filtered = filtered.filter(s => s.pnl <= parseFloat(this.filters.maxPnL));
            }
            
            // Apply mood filter
            if (this.filters.mood !== 'all') {
                filtered = filtered.filter(s => s.mood === this.filters.mood);
            }
            
            window.app.state.filteredSessions = filtered;
            window.app.renderDashboard();
            
            // Show results count
            const resultsDiv = document.getElementById('filter-results');
            if (resultsDiv) {
                resultsDiv.textContent = `✓ Found ${filtered.length} session${filtered.length !== 1 ? 's' : ''}`;
            }
        }
        
        clearFilters() {
            document.getElementById('filter-outcome').value = 'all';
            document.getElementById('filter-date-from').value = '';
            document.getElementById('filter-date-to').value = '';
            document.getElementById('filter-min-pnl').value = '';
            document.getElementById('filter-max-pnl').value = '';
            document.getElementById('filter-mood').value = 'all';
            
            if (window.app) {
                window.app.state.filteredSessions = null;
                window.app.renderDashboard();
            }
            
            const resultsDiv = document.getElementById('filter-results');
            if (resultsDiv) {
                resultsDiv.textContent = '';
            }
        }
    }
    
    window.advancedSearch = new AdvancedSearch();
    
    // ============================================
    // FEATURE 4: BETTER EMPTY STATES
    // ============================================
    
    window.getEmptyStateHTML = function(type) {
        const states = {
            'no-sessions': `
                <div style="text-align: center; padding: 80px 40px; background: #111; border: 2px dashed #333; border-radius: 12px; margin: 40px 0;">
                    <div style="font-size: 64px; margin-bottom: 20px;">📊</div>
                    <h3 style="font-size: 24px; font-weight: 600; color: #e5e5e5; margin-bottom: 12px;">
                        No Trading Sessions Yet
                    </h3>
                    <p style="color: #9ca3af; margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto;">
                        Start documenting your trades to track performance, identify patterns, and improve your edge.
                    </p>
                    <button onclick="app.startSession()" class="btn-primary" style="font-size: 16px; padding: 12px 24px;">
                        🚀 Log Your First Trade
                    </button>
                    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #222;">
                        <div style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">Quick tips:</div>
                        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                            <div style="color: #9ca3af; font-size: 13px;">
                                ⌨️ Press <kbd style="background: #1a1a1a; padding: 2px 6px; border-radius: 3px; color: #10b981;">Ctrl+N</kbd> for new session
                            </div>
                            <div style="color: #9ca3af; font-size: 13px;">
                                ⚡ Press <kbd style="background: #1a1a1a; padding: 2px 6px; border-radius: 3px; color: #10b981;">Ctrl+Q</kbd> for quick log
                            </div>
                        </div>
                    </div>
                </div>
            `,
            
            'no-results': `
                <div style="text-align: center; padding: 60px 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                    <h3 style="font-size: 20px; font-weight: 600; color: #e5e5e5; margin-bottom: 8px;">
                        No Sessions Found
                    </h3>
                    <p style="color: #9ca3af; margin-bottom: 20px;">
                        Try adjusting your search or filters
                    </p>
                    <button onclick="advancedSearch.clearFilters()" class="btn-secondary">
                        Clear All Filters
                    </button>
                </div>
            `,
            
            'loading': `
                <div style="text-align: center; padding: 60px 40px;">
                    <div class="spinner-large" style="margin: 0 auto 20px;"></div>
                    <p style="color: #9ca3af;">Loading sessions...</p>
                </div>
            `
        };
        
        return states[type] || '';
    };
    
    // ============================================
    // FEATURE 5: HELP BUTTON IN HEADER
    // ============================================
    
    function addHelpButton() {
        // Wait for header to load
        setTimeout(() => {
            const header = document.querySelector('header .flex.items-center.gap-4');
            if (!header || document.getElementById('help-button')) return;
            
            const helpButton = document.createElement('button');
            helpButton.id = 'help-button';
            helpButton.innerHTML = '❓';
            helpButton.title = 'Help & Shortcuts (Ctrl+K)';
            helpButton.style.cssText = `
                background: transparent;
                border: 1px solid #333;
                color: #9ca3af;
                width: 32px;
                height: 32px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            `;
            
            helpButton.onmouseover = () => {
                helpButton.style.borderColor = '#10b981';
                helpButton.style.color = '#10b981';
            };
            
            helpButton.onmouseout = () => {
                helpButton.style.borderColor = '#333';
                helpButton.style.color = '#9ca3af';
            };
            
            helpButton.onclick = () => {
                window.keyboardShortcutsGuide.show();
            };
            
            header.appendChild(helpButton);
        }, 1000);
    }
    
    // ============================================
    // FEATURE 6: SEARCH BUTTON FOR ADVANCED FILTERS
    // ============================================
    
    function addAdvancedSearchButton() {
        setTimeout(() => {
            const searchInput = document.getElementById('search-input');
            if (!searchInput || document.getElementById('advanced-search-btn')) return;
            
            const button = document.createElement('button');
            button.id = 'advanced-search-btn';
            button.innerHTML = '🎛️';
            button.title = 'Advanced Filters';
            button.style.cssText = `
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: transparent;
                border: 1px solid #333;
                color: #9ca3af;
                width: 32px;
                height: 32px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            `;
            
            button.onmouseover = () => {
                button.style.borderColor = '#10b981';
                button.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            };
            
            button.onmouseout = () => {
                button.style.borderColor = '#333';
                button.style.backgroundColor = 'transparent';
            };
            
            button.onclick = () => {
                window.advancedSearch.togglePanel();
            };
            
            searchInput.parentElement.style.position = 'relative';
            searchInput.style.paddingRight = '48px';
            searchInput.parentElement.appendChild(button);
        }, 1000);
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    window.addEventListener('load', () => {
        // Add help button to header
        addHelpButton();
        
        // Add advanced search button
        addAdvancedSearchButton();
        
        // Start onboarding for new users (after 2 seconds)
        setTimeout(() => {
            window.onboardingTour.start();
        }, 2000);
        
        console.log('✅ Week 2-4 UX Improvements loaded successfully!');
        console.log('📝 Features added:');
        console.log('  - Interactive onboarding tour');
        console.log('  - Keyboard shortcuts guide (Ctrl+K)');
        console.log('  - Advanced search filters');
        console.log('  - Better empty states');
        console.log('  - Help button in header');
    });
    
    // Add CSS for spinner
    const spinnerStyle = document.createElement('style');
    spinnerStyle.textContent = `
        .spinner-large {
            width: 40px;
            height: 40px;
            border: 4px solid #222;
            border-top-color: #10b981;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(spinnerStyle);
    
})();
