class CGPACalculator {
    constructor() {
        this.gradeChart = {
            "A": 4.00,
            "A-": 3.67,
            "B+": 3.33,
            "B": 3.00,
            "B-": 2.67,
            "C+": 2.33,
            "C": 2.00
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

        let newPoints = 0;
        let newCredits = 0;
        const courses = new Map(); // To track best grades for each course

        // Calculate points from regular courses
        document.querySelectorAll('.course-card:not(.retake-card)').forEach(card => {
            const creditHours = parseFloat(card.querySelector('.credit-hours').value) || 0;
            const grade = card.querySelector('.grade').value;
            const points = this.gradeChart[grade] * creditHours;
            
            courses.set(`Course ${courses.size + 1}`, {
                creditHours,
                points,
                gradePoints: this.gradeChart[grade]
            });
        });

        // Handle retake courses
        document.querySelectorAll('.retake-card').forEach(card => {
            const creditHours = parseFloat(card.querySelector('.credit-hours').value) || 0;
            const previousGrade = card.querySelector('.previous-grade').value;
            const newGrade = card.querySelector('.new-grade').value;
            
            const previousPoints = this.gradeChart[previousGrade] * creditHours;
            const newPoints = this.gradeChart[newGrade] * creditHours;
            
            // Only count the better grade
            if (newPoints > previousPoints) {
                courses.set(`Retake Course ${courses.size + 1}`, {
                    creditHours,
                    points: newPoints,
                    gradePoints: this.gradeChart[newGrade]
                });
            } else {
                courses.set(`Retake Course ${courses.size + 1}`, {
                    creditHours,
                    points: previousPoints,
                    gradePoints: this.gradeChart[previousGrade]
                });
            }
        });

        // Calculate totals
        let currentPoints = 0;
        let currentCredits = 0;
        courses.forEach(course => {
            currentPoints += course.points;
            currentCredits += course.creditHours;
        });

        // Calculate GPAs
        const currentGPA = currentCredits > 0 ? (currentPoints / currentCredits).toFixed(2) : "0.00";
        const totalCredits = previousCredits + currentCredits;
        const totalPoints = previousPoints + currentPoints;
        const finalCGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

        // Update display
        document.getElementById('currentGPA').textContent = currentGPA;
        document.getElementById('cgpa').textContent = finalCGPA;
        document.getElementById('totalCredits').textContent = totalCredits;
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
    }
}

// Initialize the calculator when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new CGPACalculator();
}); 