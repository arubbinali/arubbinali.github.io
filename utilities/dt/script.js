document.addEventListener('DOMContentLoaded', function() {
    // Tab Functionality
    const tabs = document.querySelectorAll('.tab');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and panes
            tabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // Digital Clock Functionality
    function updateDigitalClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // AM/PM format
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
        
        // Add leading zeros
        const hoursDisplay = String(hours).padStart(2, '0');
        const minutesDisplay = String(minutes).padStart(2, '0');
        const secondsDisplay = String(seconds).padStart(2, '0');
        
        // Update the DOM elements
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        const ampmElement = document.getElementById('ampm');
        
        // Only update the DOM if the values have changed
        // This prevents unnecessary reflows and repaints
        if (hoursElement.textContent !== hoursDisplay) {
            hoursElement.textContent = hoursDisplay;
        }
        
        if (minutesElement.textContent !== minutesDisplay) {
            minutesElement.textContent = minutesDisplay;
        }
        
        if (secondsElement.textContent !== secondsDisplay) {
            secondsElement.textContent = secondsDisplay;
        }
        
        if (ampmElement.textContent !== ampm) {
            ampmElement.textContent = ampm;
        }
    }
    
    // Analog Clock Functionality
    function updateAnalogClock() {
        const now = new Date();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // Calculate rotation degrees
        const hourDegrees = (hours * 30) + (minutes * 0.5); // 30 degrees per hour + 0.5 degree per minute
        const minuteDegrees = (minutes * 6) + (seconds * 0.1); // 6 degrees per minute + 0.1 degree per second
        const secondDegrees = seconds * 6; // 6 degrees per second
        
        // Apply rotation to clock hands
        const hourHand = document.querySelector('.hour-hand');
        const minuteHand = document.querySelector('.minute-hand');
        const secondHand = document.querySelector('.second-hand');
        
        hourHand.style.transform = `rotate(${hourDegrees}deg)`;
        minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
        secondHand.style.transform = `rotate(${secondDegrees}deg)`;
    }
    
    // Create minute marks for analog clock
    function createMinuteMarks() {
        const minuteMarksContainer = document.querySelector('.minute-marks');
        for (let i = 0; i < 60; i++) {
            if (i % 5 !== 0) { // Skip positions where hour marks will be
                const minuteMark = document.createElement('div');
                minuteMark.className = 'minute-mark';
                minuteMark.style.transform = `rotate(${i * 6}deg)`;
                minuteMarksContainer.appendChild(minuteMark);
            }
        }
    }
    
    // Date Display Functionality
    function updateDateDisplay() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', options);
        
        // Update small date display in digital clock tab
        document.getElementById('date-small').textContent = dateString;
        
        // Update full date display in date tab
        document.getElementById('date-full').textContent = dateString;
        
        // Calculate day of year
        const startOfYear = new Date(now.getFullYear(), 0, 0);
        const diff = now - startOfYear;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        document.getElementById('day-of-year').textContent = dayOfYear;
        
        // Calculate week of year
        const weekOfYear = getWeekNumber(now);
        document.getElementById('week-of-year').textContent = weekOfYear;
        
        // Determine quarter
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        document.getElementById('quarter').textContent = `Q${quarter}`;
        
        // Update progress bars
        updateProgressBars(now);
    }
    
    // Calculate week number of the year
    function getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000; // 86400000 = 1000 * 60 * 60 * 24 (ms in a day)
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    
    // Update progress bars
    function updateProgressBars(date) {
        // Week progress
        const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
        const weekProgress = ((dayOfWeek + 1) / 7) * 100;
        document.getElementById('week-progress').style.width = `${weekProgress}%`;
        document.getElementById('week-percentage').textContent = `${Math.round(weekProgress)}%`;
        
        // Month progress
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const dayOfMonth = date.getDate();
        const monthProgress = (dayOfMonth / daysInMonth) * 100;
        document.getElementById('month-progress').style.width = `${monthProgress}%`;
        document.getElementById('month-percentage').textContent = `${Math.round(monthProgress)}%`;
        
        // Year progress
        const isLeapYear = ((date.getFullYear() % 4 === 0) && (date.getFullYear() % 100 !== 0)) || (date.getFullYear() % 400 === 0);
        const daysInYear = isLeapYear ? 366 : 365;
        const startOfYear = new Date(date.getFullYear(), 0, 0);
        const diff = date - startOfYear;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        const yearProgress = (dayOfYear / daysInYear) * 100;
        document.getElementById('year-progress').style.width = `${yearProgress}%`;
        document.getElementById('year-percentage').textContent = `${Math.round(yearProgress)}%`;
    }
    
    // Calendar Functionality
    let currentDate = new Date();
    let currentView = 'month';
    let isTransitioning = false;
    let viewBeforeTransition = '';
    
    // Month names array
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Year and Month dropdown elements
    const yearDropdown = document.getElementById('year-dropdown');
    const monthDropdown = document.getElementById('month-dropdown');
    const yearDropdownContainer = document.querySelector('.year-dropdown-container');
    const monthNameElement = document.getElementById('month-name');
    const yearValueElement = document.getElementById('year-value');
    
    // Create years for dropdown (current year ± 50 years)
    function populateYearDropdown() {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 50;
        const endYear = currentYear + 50;
        
        yearDropdown.innerHTML = '';
        
        for (let year = startYear; year <= endYear; year++) {
            const yearItem = document.createElement('div');
            yearItem.classList.add('year-item');
            if (year === currentDate.getFullYear()) {
                yearItem.classList.add('selected');
            }
            yearItem.textContent = year;
            yearItem.addEventListener('click', function() {
                // Only proceed if we're not already transitioning
                if (!isTransitioning) {
                    // Set transitioning flag
                    isTransitioning = true;
                    
                    // Update selected year in dropdown
                    document.querySelectorAll('.year-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    
                    // Fade out year value
                    yearValueElement.classList.add('fade-out');
                    
                    // Update calendar view
                    const selectedYear = parseInt(this.textContent);
                    
                    // Fade out content
                    const viewToUpdate = document.querySelector('.calendar-view.active');
                    if (viewToUpdate.id === 'month-view') {
                        const daysContainer = viewToUpdate.querySelector('.days');
                        daysContainer.classList.add('fade-out');
                    } else if (viewToUpdate.id === 'year-view') {
                        const monthsGrid = viewToUpdate.querySelector('.months-grid');
                        monthsGrid.classList.add('fade-out');
                    }
                    
                    // Set timeout for the fade effect to complete
                    setTimeout(() => {
                        // Update current date to selected year, keeping same month/day
                        currentDate = new Date(selectedYear, currentDate.getMonth(), 1);
                        
                        // Update header and generate view
                        updateCalendarHeader();
                        generateCalendarView();
                        
                        // Fade in year value with the new year
                        yearValueElement.classList.remove('fade-out');
                        yearValueElement.classList.add('fade-in');
                        
                        setTimeout(() => {
                            yearValueElement.classList.remove('fade-in');
                        }, 400);
                        
                        // Fade in the new content
                        if (viewToUpdate.id === 'month-view') {
                            const daysContainer = viewToUpdate.querySelector('.days');
                            daysContainer.classList.remove('fade-out');
                            daysContainer.classList.add('fade-in');
                            
                            // Remove fade-in class after animation completes
                            setTimeout(() => {
                                daysContainer.classList.remove('fade-in');
                                isTransitioning = false;
                            }, 400);
                        } else if (viewToUpdate.id === 'year-view') {
                            const monthsGrid = viewToUpdate.querySelector('.months-grid');
                            monthsGrid.classList.remove('fade-out');
                            monthsGrid.classList.add('fade-in');
                            
                            // Remove fade-in class after animation completes
                            setTimeout(() => {
                                monthsGrid.classList.remove('fade-in');
                                isTransitioning = false;
                            }, 400);
                        }
                        
                        // Close dropdown
                        yearDropdown.classList.remove('active');
                    }, 400);
                }
            });
            yearDropdown.appendChild(yearItem);
        }
    }
    
    // Create months for dropdown
    function populateMonthDropdown() {
        monthDropdown.innerHTML = '';
        
        for (let i = 0; i < 12; i++) {
            const monthItem = document.createElement('div');
            monthItem.classList.add('month-item');
            if (i === currentDate.getMonth()) {
                monthItem.classList.add('selected');
            }
            monthItem.textContent = monthNames[i];
            monthItem.addEventListener('click', function() {
                // Only proceed if we're not already transitioning
                if (!isTransitioning) {
                    // Set transitioning flag
                    isTransitioning = true;
                    
                    // Update selected month in dropdown
                    document.querySelectorAll('.month-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    
                    // Fade out month name
                    monthNameElement.classList.add('fade-out');
                    
                    // Get the selected month index
                    const selectedMonth = monthNames.indexOf(this.textContent);
                    
                    // Fade out content
                    const daysContainer = document.querySelector('.days');
                    daysContainer.classList.add('fade-out');
                    
                    // Set timeout for the fade effect to complete
                    setTimeout(() => {
                        // Update current date to selected month
                        currentDate = new Date(currentDate.getFullYear(), selectedMonth, 1);
                        
                        // Update header and generate view
                        updateCalendarHeader();
                        generateMonthView();
                        
                        // Fade in month name with new month
                        monthNameElement.classList.remove('fade-out');
                        monthNameElement.classList.add('fade-in');
                        
                        setTimeout(() => {
                            monthNameElement.classList.remove('fade-in');
                        }, 400);
                        
                        // Fade in the new content
                        daysContainer.classList.remove('fade-out');
                        daysContainer.classList.add('fade-in');
                        
                        // Remove fade-in class after animation completes
                        setTimeout(() => {
                            daysContainer.classList.remove('fade-in');
                            isTransitioning = false;
                        }, 400);
                        
                        // Close dropdown
                        monthDropdown.classList.remove('active');
                    }, 400);
                }
            });
            monthDropdown.appendChild(monthItem);
        }
    }
    
    // Toggle dropdowns on title click
    document.querySelector('.calendar-title-container').addEventListener('click', function() {
        if (currentView === 'year') {
            yearDropdown.classList.toggle('active');
            monthDropdown.classList.remove('active');
            
            // Scroll to currently selected year
            if (yearDropdown.classList.contains('active')) {
                const selectedYear = document.querySelector('.year-item.selected');
                if (selectedYear) {
                    setTimeout(() => {
                        selectedYear.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    }, 100);
                }
            }
        } else if (currentView === 'month') {
            monthDropdown.classList.toggle('active');
            yearDropdown.classList.remove('active');
            
            // Scroll to currently selected month
            if (monthDropdown.classList.contains('active')) {
                const selectedMonth = document.querySelector('.month-item.selected');
                if (selectedMonth) {
                    setTimeout(() => {
                        selectedMonth.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    }, 100);
                }
            }
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!yearDropdownContainer.contains(event.target)) {
            yearDropdown.classList.remove('active');
            monthDropdown.classList.remove('active');
        }
    });
    
    // Calendar view options
    const viewOptions = document.querySelectorAll('.view-option');
    viewOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Only proceed if we're not already transitioning
            if (!isTransitioning) {
                const newView = this.getAttribute('data-view');
                
                // Don't do anything if the same view is clicked
                if (newView === currentView) return;
                
                // Set transitioning flag
                isTransitioning = true;
                
                // Store the previous view for possible return
                viewBeforeTransition = currentView;
                
                // Update active class
                viewOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Get current and target view elements
                const currentViewElement = document.getElementById(`${currentView}-view`);
                const newViewElement = document.getElementById(`${newView}-view`);
                
                // Fade out current view
                currentViewElement.style.opacity = '0';
                
                // Set timeout for the fade effect to complete
                setTimeout(() => {
                    // Update current view
                    currentView = newView;
                    
                    // Hide current view and show new view
                    currentViewElement.classList.remove('active');
                    newViewElement.classList.add('active');
                    
                    // Update calendar for the selected view
                    updateCalendarHeader();
                    generateCalendarView();
                    
                    // Fade in new view
                    setTimeout(() => {
                        newViewElement.style.opacity = '1';
                        isTransitioning = false;
                    }, 50);
                }, 500);
            }
        });
    });
    
    // Update calendar header
    function updateCalendarHeader() {
        if (currentView === 'month') {
            monthNameElement.textContent = monthNames[currentDate.getMonth()];
            yearValueElement.textContent = currentDate.getFullYear();
        } else if (currentView === 'year') {
            monthNameElement.textContent = '';
            yearValueElement.textContent = currentDate.getFullYear();
        }
        
        // Update dropdown selections
        document.querySelectorAll('.year-item').forEach(item => {
            item.classList.remove('selected');
            if (parseInt(item.textContent) === currentDate.getFullYear()) {
                item.classList.add('selected');
            }
        });
        
        document.querySelectorAll('.month-item').forEach(item => {
            item.classList.remove('selected');
            if (item.textContent === monthNames[currentDate.getMonth()]) {
                item.classList.add('selected');
            }
        });
    }
    
    // Generate calendar view based on current view mode
    function generateCalendarView() {
        if (currentView === 'month') {
            generateMonthView();
        } else if (currentView === 'year') {
            generateYearView();
        }
    }
    
    // Generate month view
    function generateMonthView() {
        const daysContainer = document.querySelector('.days');
        daysContainer.innerHTML = '';
        
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        
        const firstDayIndex = firstDay.getDay();
        const lastDayDate = lastDay.getDate();
        const prevMonthLastDate = prevMonthLastDay.getDate();
        
        const today = new Date();
        
        // Previous month days
        for (let x = firstDayIndex; x > 0; x--) {
            const day = document.createElement('div');
            day.classList.add('day', 'other-month');
            
            const dayNum = document.createElement('div');
            dayNum.classList.add('day-number');
            dayNum.textContent = prevMonthLastDate - x + 1;
            
            const tooltip = document.createElement('div');
            tooltip.classList.add('day-tooltip');
            
            const prevMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
            const prevYear = prevMonth === 11 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
            
            const tooltipDate = new Date(prevYear, prevMonth, prevMonthLastDate - x + 1);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            tooltip.textContent = tooltipDate.toLocaleDateString('en-US', options);
            
            day.appendChild(dayNum);
            day.appendChild(tooltip);
            
            // Show tooltip on hover
            day.addEventListener('mouseenter', function() {
                tooltip.style.display = 'block';
            });
            
            day.addEventListener('mouseleave', function() {
                tooltip.style.display = 'none';
            });
            
            daysContainer.appendChild(day);
        }
        
        // Current month days
        for (let i = 1; i <= lastDayDate; i++) {
            const day = document.createElement('div');
            day.classList.add('day');
            
            // Check if it's today
            if (i === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) {
                day.classList.add('today');
            }
            
            const dayNum = document.createElement('div');
            dayNum.classList.add('day-number');
            dayNum.textContent = i;
            
            const tooltip = document.createElement('div');
            tooltip.classList.add('day-tooltip');
            
            const tooltipDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            tooltip.textContent = tooltipDate.toLocaleDateString('en-US', options);
            
            day.appendChild(dayNum);
            day.appendChild(tooltip);
            
            // Show tooltip on hover
            day.addEventListener('mouseenter', function() {
                tooltip.style.display = 'block';
            });
            
            day.addEventListener('mouseleave', function() {
                tooltip.style.display = 'none';
            });
            
            daysContainer.appendChild(day);
        }
        
        // Next month days
        const totalDays = firstDayIndex + lastDayDate;
        const daysToAdd = 42 - totalDays > 7 ? 42 - 7 - totalDays : 42 - totalDays;
        
        for (let j = 1; j <= daysToAdd; j++) {
            const day = document.createElement('div');
            day.classList.add('day', 'other-month');
            
            const dayNum = document.createElement('div');
            dayNum.classList.add('day-number');
            dayNum.textContent = j;
            
            const tooltip = document.createElement('div');
            tooltip.classList.add('day-tooltip');
            
            const nextMonth = currentDate.getMonth() === 11 ? 0 : currentDate.getMonth() + 1;
            const nextYear = nextMonth === 0 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
            
            const tooltipDate = new Date(nextYear, nextMonth, j);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            tooltip.textContent = tooltipDate.toLocaleDateString('en-US', options);
            
            day.appendChild(dayNum);
            day.appendChild(tooltip);
            
            // Show tooltip on hover
            day.addEventListener('mouseenter', function() {
                tooltip.style.display = 'block';
            });
            
            day.addEventListener('mouseleave', function() {
                tooltip.style.display = 'none';
            });
            
            daysContainer.appendChild(day);
        }
    }
    
    // Generate year view
    function generateYearView() {
        const monthsGrid = document.querySelector('.months-grid');
        monthsGrid.innerHTML = '';
        
        const year = currentDate.getFullYear();
        const today = new Date();
        
        for (let month = 0; month < 12; month++) {
            const monthElement = document.createElement('div');
            monthElement.classList.add('year-month');
            
            const monthTitle = document.createElement('div');
            monthTitle.classList.add('year-month-title');
            monthTitle.textContent = monthNames[month];
            
            const miniMonth = document.createElement('div');
            miniMonth.classList.add('mini-month');
            
            // Generate mini calendar for the month
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const firstDayIndex = firstDay.getDay();
            const lastDayDate = lastDay.getDate();
            
            // Add day headers (abbreviated)
            const dayAbbreviations = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            for (let i = 0; i < 7; i++) {
                const daySm = document.createElement('div');
                daySm.textContent = dayAbbreviations[i];
                daySm.style.color = 'rgba(180, 180, 180, 0.7)';
                daySm.style.fontSize = '0.7rem';
                miniMonth.appendChild(daySm);
            }
            
            // Add blank spaces for days before the first day of the month
            for (let k = 0; k < firstDayIndex; k++) {
                const blankDay = document.createElement('div');
                blankDay.classList.add('mini-day');
                miniMonth.appendChild(blankDay);
            }
            
            // Add days of the month
            for (let j = 1; j <= lastDayDate; j++) {
                const miniDay = document.createElement('div');
                miniDay.classList.add('mini-day');
                miniDay.textContent = j;
                
                // Highlight today
                if (j === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    miniDay.classList.add('today');
                }
                
                miniMonth.appendChild(miniDay);
            }
            
            monthElement.appendChild(monthTitle);
            monthElement.appendChild(miniMonth);
            monthsGrid.appendChild(monthElement);
            
            // Add click event to each month
            monthElement.addEventListener('click', function() {
                // Only proceed if we're not already transitioning
                if (!isTransitioning) {
                    // Set transitioning flag
                    isTransitioning = true;
                    
                    // Fade out
                    monthsGrid.classList.add('fade-out');
                    
                    // Set timeout for the fade effect to complete
                    setTimeout(() => {
                        // Update current date and view
                        currentDate = new Date(year, month, 1);
                        currentView = 'month';
                        
                        // Update view options active state
                        viewOptions.forEach(opt => {
                            if (opt.getAttribute('data-view') === 'month') {
                                opt.classList.add('active');
                            } else {
                                opt.classList.remove('active');
                            }
                        });
                        
                        // Update calendar views
                        const yearView = document.getElementById('year-view');
                        const monthView = document.getElementById('month-view');
                        
                        yearView.classList.remove('active');
                        monthView.classList.add('active');
                        
                        // Update header and generate view
                        updateCalendarHeader();
                        generateMonthView();
                        
                        // Fade in the month view
                        setTimeout(() => {
                            yearView.style.opacity = '0';
                            monthView.style.opacity = '1';
                            
                            const daysContainer = monthView.querySelector('.days');
                            daysContainer.classList.add('fade-in');
                            
                            // Remove fade-in class after animation completes
                            setTimeout(() => {
                                daysContainer.classList.remove('fade-in');
                                isTransitioning = false;
                            }, 400);
                        }, 50);
                    }, 400);
                }
            });
        }
    }
    
    // Calendar navigation
    document.getElementById('prev-btn').addEventListener('click', function() {
        // Only proceed if we're not already transitioning
        if (!isTransitioning) {
            // Set transitioning flag
            isTransitioning = true;
            
            // Fade out title elements
            if (currentView === 'month') {
                monthNameElement.classList.add('fade-out');
            }
            yearValueElement.classList.add('fade-out');
            
            // Fade out
            const viewToUpdate = document.querySelector('.calendar-view.active');
            if (viewToUpdate.id === 'month-view') {
                const daysContainer = viewToUpdate.querySelector('.days');
                daysContainer.classList.add('fade-out');
            } else if (viewToUpdate.id === 'year-view') {
                const monthsGrid = viewToUpdate.querySelector('.months-grid');
                monthsGrid.classList.add('fade-out');
            }
            
            // Set timeout for the fade effect to complete
            setTimeout(() => {
                // Update current date
                if (currentView === 'month') {
                    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                } else if (currentView === 'year') {
                    currentDate = new Date(currentDate.getFullYear() - 1, 0, 1);
                }
                
                // Update calendar
                updateCalendarHeader();
                generateCalendarView();
                
                // Fade in title elements
                if (currentView === 'month') {
                    monthNameElement.classList.remove('fade-out');
                    monthNameElement.classList.add('fade-in');
                    setTimeout(() => {
                        monthNameElement.classList.remove('fade-in');
                    }, 400);
                }
                yearValueElement.classList.remove('fade-out');
                yearValueElement.classList.add('fade-in');
                setTimeout(() => {
                    yearValueElement.classList.remove('fade-in');
                }, 400);
                
                // Fade in the new content
                if (viewToUpdate.id === 'month-view') {
                    const daysContainer = viewToUpdate.querySelector('.days');
                    daysContainer.classList.remove('fade-out');
                    daysContainer.classList.add('fade-in');
                    
                    // Remove fade-in class after animation completes
                    setTimeout(() => {
                        daysContainer.classList.remove('fade-in');
                        isTransitioning = false;
                    }, 400);
                } else if (viewToUpdate.id === 'year-view') {
                    const monthsGrid = viewToUpdate.querySelector('.months-grid');
                    monthsGrid.classList.remove('fade-out');
                    monthsGrid.classList.add('fade-in');
                    
                    // Remove fade-in class after animation completes
                    setTimeout(() => {
                        monthsGrid.classList.remove('fade-in');
                        isTransitioning = false;
                    }, 400);
                }
            }, 400);
        }
    });
    
    document.getElementById('next-btn').addEventListener('click', function() {
        // Only proceed if we're not already transitioning
        if (!isTransitioning) {
            // Set transitioning flag
            isTransitioning = true;
            
            // Fade out title elements
            if (currentView === 'month') {
                monthNameElement.classList.add('fade-out');
            }
            yearValueElement.classList.add('fade-out');
            
            // Fade out
            const viewToUpdate = document.querySelector('.calendar-view.active');
            if (viewToUpdate.id === 'month-view') {
                const daysContainer = viewToUpdate.querySelector('.days');
                daysContainer.classList.add('fade-out');
            } else if (viewToUpdate.id === 'year-view') {
                const monthsGrid = viewToUpdate.querySelector('.months-grid');
                monthsGrid.classList.add('fade-out');
            }
            
            // Set timeout for the fade effect to complete
            setTimeout(() => {
                // Update current date
                if (currentView === 'month') {
                    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                } else if (currentView === 'year') {
                    currentDate = new Date(currentDate.getFullYear() + 1, 0, 1);
                }
                
                // Update calendar
                updateCalendarHeader();
                generateCalendarView();
                
                // Fade in title elements
                if (currentView === 'month') {
                    monthNameElement.classList.remove('fade-out');
                    monthNameElement.classList.add('fade-in');
                    setTimeout(() => {
                        monthNameElement.classList.remove('fade-in');
                    }, 400);
                }
                yearValueElement.classList.remove('fade-out');
                yearValueElement.classList.add('fade-in');
                setTimeout(() => {
                    yearValueElement.classList.remove('fade-in');
                }, 400);
                
                // Fade in the new content
                if (viewToUpdate.id === 'month-view') {
                    const daysContainer = viewToUpdate.querySelector('.days');
                    daysContainer.classList.remove('fade-out');
                    daysContainer.classList.add('fade-in');
                    
                    // Remove fade-in class after animation completes
                    setTimeout(() => {
                        daysContainer.classList.remove('fade-in');
                        isTransitioning = false;
                    }, 400);
                } else if (viewToUpdate.id === 'year-view') {
                    const monthsGrid = viewToUpdate.querySelector('.months-grid');
                    monthsGrid.classList.remove('fade-out');
                    monthsGrid.classList.add('fade-in');
                    
                    // Remove fade-in class after animation completes
                    setTimeout(() => {
                        monthsGrid.classList.remove('fade-in');
                        isTransitioning = false;
                    }, 400);
                }
            }, 400);
        }
    });
    
    document.getElementById('today-button').addEventListener('click', function() {
        // Only proceed if we're not already transitioning
        if (!isTransitioning) {
            // Set transitioning flag
            isTransitioning = true;
            
            // Fade out title elements
            if (currentView === 'month') {
                monthNameElement.classList.add('fade-out');
            }
            yearValueElement.classList.add('fade-out');
            
            // Fade out
            const viewToUpdate = document.querySelector('.calendar-view.active');
            if (viewToUpdate.id === 'month-view') {
                const daysContainer = viewToUpdate.querySelector('.days');
                daysContainer.classList.add('fade-out');
            } else if (viewToUpdate.id === 'year-view') {
                const monthsGrid = viewToUpdate.querySelector('.months-grid');
                monthsGrid.classList.add('fade-out');
            }
            
            // Set timeout for the fade effect to complete
            setTimeout(() => {
                // Reset current date to today
                currentDate = new Date();
                
                // Update calendar
                updateCalendarHeader();
                generateCalendarView();
                
                // Fade in title elements
                if (currentView === 'month') {
                    monthNameElement.classList.remove('fade-out');
                    monthNameElement.classList.add('fade-in');
                    setTimeout(() => {
                        monthNameElement.classList.remove('fade-in');
                    }, 400);
                }
                yearValueElement.classList.remove('fade-out');
                yearValueElement.classList.add('fade-in');
                setTimeout(() => {
                    yearValueElement.classList.remove('fade-in');
                }, 400);
                
                // Fade in the new content
                if (viewToUpdate.id === 'month-view') {
                    const daysContainer = viewToUpdate.querySelector('.days');
                    daysContainer.classList.remove('fade-out');
                    daysContainer.classList.add('fade-in');
                    
                    // Remove fade-in class after animation completes
                    setTimeout(() => {
                        daysContainer.classList.remove('fade-in');
                        isTransitioning = false;
                    }, 400);
                } else if (viewToUpdate.id === 'year-view') {
                    const monthsGrid = viewToUpdate.querySelector('.months-grid');
                    monthsGrid.classList.remove('fade-out');
                    monthsGrid.classList.add('fade-in');
                    
                    // Remove fade-in class after animation completes
                    setTimeout(() => {
                        monthsGrid.classList.remove('fade-in');
                        isTransitioning = false;
                    }, 400);
                }
            }, 400);
        }
    });
    
    // Initialize the calendar
    function initCalendar() {
        populateYearDropdown();
        populateMonthDropdown();
        updateCalendarHeader();
        generateCalendarView();
    }
    
    // Initialize the page
    function init() {
        // Initialize clocks
        updateDigitalClock();
        updateAnalogClock();
        createMinuteMarks();
        
        // Initialize date display
        updateDateDisplay();
        
        // Initialize calendar
        initCalendar();
        
        // Set up timers
        setInterval(updateDigitalClock, 1000);
        setInterval(updateAnalogClock, 1000);
        setInterval(updateDateDisplay, 60000); // Update date display every minute
    }
    
    // Start the app
    init();
});
