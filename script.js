class CGPACalculator {
    constructor() {
        this.gradeChart = {
            "A": 4.00,
            "A-": 3.67,
            "B+": 3.33,
            "B": 3.00,
            "B-": 2.67,
            "C+": 2.33,
            "C": 2.00,
            "C-": 1.67,
            "D+": 1.33,
            "D": 1.00,
            "F": 0.00
        };
        
        // Add course list
        this.courseList = [
            'Course 1', 'Course 2', 'Course 3', 'Course 4',
            'Course 5', 'Course 6', 'Course 7', 'Course 8',
            'Course 9', 'Course 10', 'Course 11', 'Course 12'
        ];

        this.validationModal = document.getElementById('validationModal');
        this.developerModal = document.getElementById('developerModal');
        this.initializeUI();
        this.initializeModalCloseButtons();
        this.initializeTheme();
        this.courseRegistry = new Map(); // Tracks latest course attempts
        this.initializeFAB();
    }

    initializeUI() {
        this.completedCredits = document.getElementById('completedCredits');
        this.currentCGPA = document.getElementById('currentCGPA');
        this.resultsModal = document.getElementById('resultsModal');
        this.gradeChartModal = document.getElementById('gradeChartModal');
        
        // Initialize event listeners
        document.getElementById('addCourse').addEventListener('click', () => this.addCourseRow());
        document.getElementById('addRetake').addEventListener('click', () => this.addRetakeRow());
        document.getElementById('calculateButton').addEventListener('click', () => this.calculateFinalCGPA());
        document.getElementById('resetButton').addEventListener('click', () => this.resetCalculator());

        // Add modal close button listeners
        document.querySelectorAll('.modal .close-button').forEach(button => {
            button.addEventListener('click', () => {
                this.resultsModal.classList.remove('show');
                this.gradeChartModal.classList.remove('show');
            });
        });

        // Close modals when clicking outside
        [this.resultsModal, this.gradeChartModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }

    initializeModalCloseButtons() {
        // Close buttons in modals
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                modal.classList.remove('show');
            });
        });

        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.querySelector('.theme-toggle');
        themeIcon.textContent = savedTheme === 'dark' ? 'light_mode' : 'dark_mode';

        // Add theme toggle listener
        document.querySelector('.theme-toggle').parentElement.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update icon
            themeIcon.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
        });
    }

    addCourseRow() {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        
        const courseNumber = document.querySelectorAll('.course-card').length + 1;
        
        const gradeOptions = Object.entries(this.gradeChart).map(([grade, points]) => 
            `<option value="${grade}">${grade} (${points.toFixed(2)})</option>`
        ).join('');

        const creditOptions = [1,2,3,4].map(num => 
            `<option value="${num}">${num} Credit${num > 1 ? 's' : ''}</option>`
        ).join('');

        courseCard.innerHTML = `
            <div class="course-header">
                <h3>Course ${courseNumber}</h3>
                <button class="delete-button" onclick="calculator.removeCourse(this)">
                    <i class="material-icons">delete</i>
                </button>
            </div>
            <div class="course-inputs">
                <div class="input-field">
                    <label>Credits</label>
                    <div class="select-wrapper">
                        <i class="material-icons">credit_card</i>
                        <select class="credit-hours" required>
                            <option value="" disabled selected>Select Credits</option>
                            ${creditOptions}
                        </select>
                    </div>
                </div>
                <div class="input-field">
                    <label>Grade</label>
                    <div class="select-wrapper">
                        <i class="material-icons">grade</i>
                        <select class="grade" required>
                            <option value="" disabled selected>Select Grade</option>
                            ${gradeOptions}
                        </select>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('coursesList').appendChild(courseCard);
    }

    addRetakeRow() {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card retake-card';
        
        const courseNumber = document.querySelectorAll('.course-card').length + 1;
        
        const gradeOptions = Object.entries(this.gradeChart).map(([grade, points]) => 
            `<option value="${grade}">${grade} (${points.toFixed(2)})</option>`
        ).join('');

        const creditOptions = [1,2,3,4].map(num => 
            `<option value="${num}">${num} Credit${num > 1 ? 's' : ''}</option>`
        ).join('');

        courseCard.innerHTML = `
            <div class="course-header">
                <h3>Retake ${courseNumber}</h3>
                <button class="delete-button" onclick="calculator.removeCourse(this)">
                    <i class="material-icons">delete</i>
                </button>
            </div>
            <div class="course-inputs">
                <div class="input-field">
                    <label>Credits</label>
                    <div class="select-wrapper">
                        <i class="material-icons">credit_card</i>
                        <select class="credit-hours" required>
                            <option value="" disabled selected>Select Credits</option>
                            ${creditOptions}
                        </select>
                    </div>
                </div>
                <div class="input-field">
                    <label>Previous</label>
                    <div class="select-wrapper">
                        <i class="material-icons">history</i>
                        <select class="previous-grade" required>
                            <option value="" disabled selected>Select Grade</option>
                            ${gradeOptions}
                        </select>
                    </div>
                </div>
                <div class="input-field">
                    <label>New</label>
                    <div class="select-wrapper">
                        <i class="material-icons">grade</i>
                        <select class="new-grade" required>
                            <option value="" disabled selected>Select Grade</option>
                            ${gradeOptions}
                        </select>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('coursesList').appendChild(courseCard);
    }

    removeCourse(button) {
        const courseCard = button.closest('.course-card');
        courseCard.remove();
        
        // Renumber remaining courses
        document.querySelectorAll('.course-card').forEach((card, index) => {
            card.querySelector('h3').textContent = `Course ${index + 1}`;
        });
    }

    validateInitialInputs() {
        if (!this.completedCredits.value || !this.currentCGPA.value) {
            // Show validation modal
            this.validationModal.classList.add('show');
            return false;
        }
        return true;
    }

    closeValidationModal() {
        this.validationModal.classList.remove('show');
        // Focus on the first empty input
        if (!this.completedCredits.value) {
            this.completedCredits.focus();
        } else if (!this.currentCGPA.value) {
            this.currentCGPA.focus();
        }
    }

    validateInputs() {
        let isValid = true;
        let message = '';

        // Validate completed credits and current CGPA
        if (!this.completedCredits.value && !this.currentCGPA.value) {
            // Both empty is fine - new student
        } else {
            if (!this.completedCredits.value) {
                message = 'Please enter completed credits';
                this.completedCredits.focus();
                isValid = false;
            } else if (!this.currentCGPA.value) {
                message = 'Please enter current CGPA';
                this.currentCGPA.focus();
                isValid = false;
            }
        }

        // Validate if there are any courses added
        const courses = document.querySelectorAll('.course-card');
        if (courses.length === 0) {
            message = 'Please add at least one course';
            isValid = false;
        } else {
            // Validate each course's inputs
            courses.forEach((card, index) => {
                const creditHours = card.querySelector('.credit-hours').value;
                const grade = card.querySelector('.grade')?.value || 
                            card.querySelector('.new-grade')?.value;

                if (!creditHours) {
                    message = `Please enter credit hours for Course ${index + 1}`;
                    isValid = false;
                }
                if (!grade) {
                    message = `Please select grade for Course ${index + 1}`;
                    isValid = false;
                }
            });
        }

        if (!isValid) {
            this.showError(message);
        }

        return isValid;
    }

    showError(message) {
        // Create and show error toast
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <i class="material-icons">error</i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    calculateFinalCGPA() {
        // Check initial inputs first
        if (!this.validateInitialInputs()) {
            return;
        }

        if (!this.validateInputs()) {
            return;
        }

        const previousCredits = parseFloat(this.completedCredits.value) || 0;
        const previousCGPA = parseFloat(this.currentCGPA.value) || 0;
        const previousPoints = previousCredits * previousCGPA;

        let currentPoints = 0;       // For current GPA calculation
        let cgpaPoints = 0;          // For final CGPA calculation
        let gpaCredits = 0;          // Credits affecting current GPA
        let totalCredits = previousCredits; // Total completed credits

        document.querySelectorAll('.course-card').forEach(card => {
            const creditHours = parseFloat(card.querySelector('.credit-hours').value) || 0;
            const isRetake = card.classList.contains('retake-card');

            if (isRetake) {
                const previousGrade = card.querySelector('.previous-grade').value;
                const newGrade = card.querySelector('.new-grade').value;
                
                // For current GPA: use full new grade
                const newGradePoints = this.gradeChart[newGrade] * creditHours;
                currentPoints += newGradePoints;
                
                // For final CGPA: only grade improvement
                const gradeDiff = this.gradeChart[newGrade] - this.gradeChart[previousGrade];
                cgpaPoints += gradeDiff * creditHours;
                
                gpaCredits += creditHours;
            } else {
                const grade = card.querySelector('.grade').value;
                const gradePoints = this.gradeChart[grade] * creditHours;
                
                currentPoints += gradePoints;
                cgpaPoints += gradePoints;
                gpaCredits += creditHours;
                totalCredits += creditHours;
            }
        });

        // Calculate GPAs
        const totalPoints = previousPoints + cgpaPoints;
        const currentGPA = gpaCredits > 0 ? (currentPoints / gpaCredits).toFixed(2) : "0.00";
        const finalCGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

        // Update display
        document.getElementById('currentGPA').textContent = currentGPA;
        document.getElementById('cgpa').textContent = finalCGPA;
        document.getElementById('totalCredits').textContent = totalCredits;
        document.getElementById('gpaCredits').textContent = gpaCredits;
        this.resultsModal.classList.add('show');
        
        // Animate values
        this.animateValue('currentGPA', currentGPA);
        this.animateValue('cgpa', finalCGPA);
        this.animateValue('totalCredits', totalCredits);
    }

    showGradeChart() {
        this.gradeChartModal.classList.add('show');
    }

    showDeveloperInfo() {
        this.developerModal.classList.add('show');
    }

    animateValue(elementId, final) {
        const element = document.getElementById(elementId);
        const start = parseFloat(element.textContent);
        const duration = 1000;
        const steps = 60;
        const increment = (final - start) / steps;
        
        let current = start;
        const timer = setInterval(() => {
            current += increment;
            if ((increment >= 0 && current >= final) || 
                (increment < 0 && current <= final)) {
                clearInterval(timer);
                element.textContent = final;
            } else {
                element.textContent = current.toFixed(2);
            }
        }, duration / steps);
    }

    resetCalculator() {
        this.completedCredits.value = '';
        this.currentCGPA.value = '';
        document.getElementById('coursesList').innerHTML = '';
        this.resultsModal.classList.remove('show');
        document.getElementById('currentGPA').textContent = '0.00';
        document.getElementById('cgpa').textContent = '0.00';
        document.getElementById('totalCredits').textContent = '0';
        document.getElementById('gpaCredits').textContent = '0';
    }

    addCourse(courseElement) {
        const courseName = courseElement.dataset.courseName;
        const isRetake = courseElement.classList.contains('retake');
        
        // Store only the latest attempt for each course
        this.courseRegistry.set(courseName, {
            credit: parseFloat(courseElement.querySelector('.credit-hours').value),
            grade: courseElement.querySelector('.grade').value,
            isRetake
        });
    }

    calculateCGPA() {
        let totalPoints = 0;
        let totalCredits = 0;

        this.courseRegistry.forEach(course => {
            const gradePoint = this.gradeChart[course.grade];
            totalPoints += gradePoint * course.credit;
            totalCredits += course.credit;
        });

        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
    }

    initializeFAB() {
        const mainFab = document.getElementById('mainFab');
        const fabActions = document.querySelector('.fab-actions');
        
        mainFab.addEventListener('click', (e) => {
            e.stopPropagation();
            fabActions.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!mainFab.contains(e.target) && !fabActions.contains(e.target)) {
                fabActions.classList.remove('active');
            }
        });
    }
}

// Initialize the calculator when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new CGPACalculator();
}); 