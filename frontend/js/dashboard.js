// API Base URL - Use the same configuration as config.js
const API_URL = window.API_URL || 'https://tasksphere-web-production.up.railway.app/api';
let currentUser = null;
let authToken = null;
let currentSection = 'dashboard';

document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    
    function checkAuthentication() {
        authToken = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!authToken || !userStr) {
            window.location.href = 'login.html';
            return;
        }
        
        currentUser = JSON.parse(userStr);
        updateUserInfo();
        initializeDashboard();
    }
    
    function updateUserInfo() {
        document.querySelectorAll('.user-name').forEach(el => {
            el.textContent = currentUser.name;
        });
        document.querySelectorAll('.user-position').forEach(el => {
            el.textContent = currentUser.position;
        });
    }
    
    function initializeDashboard() {
        setupMenuNavigation();
        setupNotifications();
        loadDashboardSection('dashboard');
    }
    
    // ============================================
    // MENU NAVIGATION
    // ============================================
    function setupMenuNavigation() {
        const menuLinks = document.querySelectorAll('.menu-link');
        
        menuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const href = this.getAttribute('href');
                if (href === '#logout') {
                    handleLogout();
                    return;
                }
                
                const section = href.replace('#', '');
                
                // Update active state
                menuLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Load section
                loadDashboardSection(section);
            });
        });
    }
    
    // ============================================
    // LOAD DASHBOARD SECTIONS
    // ============================================
    async function loadDashboardSection(section) {
        currentSection = section;
        const mainContent = document.querySelector('.dashboard-main');
        
        // Update page header
        const pageHeader = document.querySelector('.page-header h2');
        if (pageHeader) {
            pageHeader.textContent = formatSectionName(section);
        }
        
        // Show loading
        mainContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        
        try {
            // Route based on user role and section
            if (currentUser.role === 'superadmin') {
                await loadSuperAdminSection(section);
            } else if (currentUser.role === 'admin') {
                await loadAdminSection(section);
            } else if (currentUser.role === 'employee') {
                await loadEmployeeSection(section);
            }
        } catch (error) {
            console.error('Error loading section:', error);
            mainContent.innerHTML = `<div class="error">Error loading ${section}. Please try again.</div>`;
        }
    }
    
    // ============================================
    // SUPER ADMIN SECTIONS
    // ============================================
    async function loadSuperAdminSection(section) {
        switch(section) {
            case 'dashboard':
                await loadDashboardOverview();
                break;
            case 'admins':
                await loadAdminsSection();
                break;
            case 'employees':
                await loadEmployeesSection();
                break;
            case 'projects':
                await loadProjectsSection();
                break;
            case 'tasks':
                await loadTasksSection();
                break;
            case 'security-codes':
                await loadSecurityCodesSection();
                break;
            case 'analytics':
                await loadAnalyticsSection();
                break;
            case 'profile':
                await loadProfileSection();
                break;
            case 'reports':
                await loadReportsSection();
                break;
            default:
                document.querySelector('.dashboard-main').innerHTML = '<p>Section not found</p>';
        }
    }
    
    // ============================================
    // ADMIN SECTIONS
    // ============================================
    async function loadAdminSection(section) {
        switch(section) {
            case 'dashboard':
                await loadAdminDashboardOverview();
                break;
            case 'projects':
                await loadAdminProjectsSection();
                break;
            case 'tasks':
                await loadTasksSection();
                break;
            case 'team':
                await loadTeamSection();
                break;
            case 'analytics':
                await loadAnalyticsSection();
                break;
            case 'profile':
                await loadProfileSection();
                break;
            default:
                document.querySelector('.dashboard-main').innerHTML = '<p>Section not found</p>';
        }
    }
    
    // ============================================
    // EMPLOYEE SECTIONS
    // ============================================
    async function loadEmployeeSection(section) {
        switch(section) {
            case 'dashboard':
                await loadEmployeeDashboardOverview();
                break;
            case 'my-tasks':
                await loadMyTasksSection();
                break;
            case 'projects':
                await loadMyProjectsSection();
                break;
            case 'profile':
                await loadProfileSection();
                break;
            default:
                document.querySelector('.dashboard-main').innerHTML = '<p>Section not found</p>';
        }
    }
    
    function formatSectionName(section) {
        return section.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    // ============================================
    // DASHBOARD OVERVIEW
    // ============================================
    async function loadDashboardOverview() {
        const mainContent = document.querySelector('.dashboard-main');
        
        let html = `
            <div class="page-header">
                <h2>System Overview</h2>
                <button class="btn-export" onclick="exportReport()">
                    <i class="fas fa-download"></i>
                    Export Report
                </button>
            </div>
            
            <div class="stats-row">
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-title">Total Admins</span>
                        <div class="stat-icon purple">
                            <i class="fas fa-user-tie"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="totalAdmins">0</div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-title">Total Employees</span>
                        <div class="stat-icon cyan">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="totalEmployees">0</div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-title">Total Projects</span>
                        <div class="stat-icon green">
                            <i class="fas fa-project-diagram"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="totalProjects">0</div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-title">Total Tasks</span>
                        <div class="stat-icon orange">
                            <i class="fas fa-tasks"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="totalTasks">0</div>
                </div>
            </div>
            
            <div class="tasks-section">
                <h3>Recent Activity</h3>
                <div id="recentActivity">
                    <div class="activity-list">
                        <div class="activity-item">
                            <div class="activity-icon purple">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <div class="activity-content">
                                <p class="activity-text">System initialized successfully</p>
                                <span class="activity-time">Just now</span>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-icon cyan">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <div class="activity-content">
                                <p class="activity-text">Welcome to TaskFlow! Start by creating admins and managing your team.</p>
                                <span class="activity-time">Today</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        mainContent.innerHTML = html;
        
        // Load statistics
        await loadStatistics();
    }
    
    async function loadStatistics() {
        try {
            if (currentUser.role === 'superadmin') {
                const response = await fetch(`${API_URL}/superadmin/stats`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('totalAdmins').textContent = data.data.totalAdmins || 0;
                    document.getElementById('totalEmployees').textContent = data.data.totalEmployees || 0;
                }
            }
            
            // Load projects count
            const projectsResponse = await fetch(`${API_URL}/admin/projects`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const projectsData = await projectsResponse.json();
            if (projectsData.success) {
                document.getElementById('totalProjects').textContent = projectsData.count || 0;
            }
            
            // Load tasks count
            const tasksResponse = await fetch(`${API_URL}/admin/tasks`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const tasksData = await tasksResponse.json();
            if (tasksData.success) {
                document.getElementById('totalTasks').textContent = tasksData.count || 0;
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }
    
    // ============================================
    // ADMINS SECTION
    // ============================================
    async function loadAdminsSection() {
        const mainContent = document.querySelector('.dashboard-main');
        
        mainContent.innerHTML = `
            <div class="page-header">
                <h2>Admin Management</h2>
                <div style="display: flex; gap: 12px;">
                    <button class="btn-primary" onclick="showCreateAdminModal()">
                        <i class="fas fa-user-plus"></i>
                        Create Admin
                    </button>
                    <button class="btn-secondary" onclick="showGenerateCodeModal()">
                        <i class="fas fa-key"></i>
                        Generate Security Code
                    </button>
                </div>
            </div>
            
            <div id="createAdminFormContainer" style="display: none;">
                <div class="tasks-section">
                    <h3>Create New Admin</h3>
                    <form id="createAdminForm" class="project-form" onsubmit="handleCreateAdmin(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Name *</label>
                                <input type="text" id="adminName" required placeholder="Enter admin name">
                            </div>
                            <div class="form-group">
                                <label>Email *</label>
                                <input type="email" id="adminEmail" required placeholder="admin@company.com">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Password *</label>
                                <input type="password" id="adminPassword" required placeholder="Enter password" minlength="6">
                            </div>
                            <div class="form-group">
                                <label>Position *</label>
                                <input type="text" id="adminPosition" required placeholder="e.g., Project Manager">
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-user-plus"></i>
                                Create Admin
                            </button>
                            <button type="button" class="btn-secondary" onclick="hideCreateAdminModal()">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div class="tasks-section">
                <div class="tasks-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Position</th>
                                <th>Created</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="adminsTableBody">
                            <tr><td colspan="6" class="loading">Loading admins...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        await loadAdmins();
    }
    
    async function loadAdmins() {
        try {
            const response = await fetch(`${API_URL}/superadmin/admins`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            const tbody = document.getElementById('adminsTableBody');
            
            if (data.success && data.data.length > 0) {
                tbody.innerHTML = data.data.map(admin => `
                    <tr>
                        <td>${admin.name}</td>
                        <td>${admin.email}</td>
                        <td>${admin.position}</td>
                        <td>${formatDate(admin.createdAt)}</td>
                        <td><span class="badge ${admin.isActive ? 'success' : 'danger'}">${admin.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td>
                            <button class="btn-sm btn-secondary" onclick="toggleAdminStatus('${admin._id}', ${admin.isActive})">
                                ${admin.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="no-data">No admins found</td></tr>';
            }
        } catch (error) {
            console.error('Error loading admins:', error);
            document.getElementById('adminsTableBody').innerHTML = '<tr><td colspan="6" class="error">Error loading admins</td></tr>';
        }
    }
    
    // ============================================
    // EMPLOYEES SECTION
    // ============================================
    async function loadEmployeesSection() {
        const mainContent = document.querySelector('.dashboard-main');
        
        mainContent.innerHTML = `
            <div class="page-header">
                <h2>Employee Management</h2>
            </div>
            
            <div class="tasks-section">
                <div class="tasks-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Position</th>
                                <th>Joined</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="employeesTableBody">
                            <tr><td colspan="6" class="loading">Loading employees...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        await loadEmployees();
    }
    
    async function loadEmployees() {
        try {
            const response = await fetch(`${API_URL}/superadmin/employees`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            const tbody = document.getElementById('employeesTableBody');
            
            if (data.success && data.data.length > 0) {
                tbody.innerHTML = data.data.map(employee => `
                    <tr>
                        <td>${employee.name}</td>
                        <td>${employee.email}</td>
                        <td>${employee.position}</td>
                        <td>${formatDate(employee.createdAt)}</td>
                        <td><span class="badge ${employee.isActive ? 'success' : 'danger'}">${employee.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td>
                            <button class="btn-sm btn-secondary" onclick="viewEmployeeDetails('${employee._id}')">
                                View Details
                            </button>
                            <button class="btn-sm btn-danger" onclick="deleteEmployee('${employee._id}', '${employee.name}')" style="margin-left: 0.5rem;">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="no-data">No employees found</td></tr>';
            }
        } catch (error) {
            console.error('Error loading employees:', error);
            document.getElementById('employeesTableBody').innerHTML = '<tr><td colspan="6" class="error">Error loading employees</td></tr>';
        }
    }
    
    // Delete employee function
    window.deleteEmployee = async function(employeeId, employeeName) {
        if (!confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/superadmin/user/${employeeId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Employee deleted successfully');
                await loadEmployees(); // Reload the employee list
            } else {
                alert(data.message || 'Failed to delete employee');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            alert('Error deleting employee. Please try again.');
        }
    };
    
    // ============================================
    // PROJECTS SECTION (SUPER ADMIN)
    // ============================================
    async function loadProjectsSection() {
        const mainContent = document.querySelector('.dashboard-main');
        
        mainContent.innerHTML = `
            <div class="page-header">
                <h2>Projects Management</h2>
                <button class="btn-primary" onclick="showCreateProjectModal()">
                    <i class="fas fa-plus"></i>
                    Create Project
                </button>
            </div>
            
            <div id="createProjectFormContainer" style="display: none;">
                <div class="tasks-section">
                    <h3>Create New Project</h3>
                    <form id="createProjectForm" class="project-form" onsubmit="handleSuperAdminCreateProject(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Project Subject *</label>
                                <input type="text" id="projectSubject" required placeholder="Enter project name">
                            </div>
                            <div class="form-group">
                                <label>Project Code *</label>
                                <input type="text" id="projectCode" required placeholder="e.g., PROJ001">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Daily Production Target *</label>
                                <input type="number" id="dailyProductionTarget" required min="1" placeholder="e.g., 200">
                            </div>
                            <div class="form-group">
                                <label>Assign to Project Manager *</label>
                                <select id="projectManager" required style="padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); color: var(--text-primary);">
                                    <option value="">Loading admins...</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-plus"></i>
                                Create & Assign Project
                            </button>
                            <button type="button" class="btn-secondary" onclick="hideCreateProjectModal()">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div class="tasks-section">
                <div id="projectsGrid" class="projects-list">
                    <p class="loading">Loading projects...</p>
                </div>
            </div>
        `;
        
        await loadProjects();
        await loadAdminsForProjectAssignment();
    }
    
    async function loadAdminsForProjectAssignment() {
        try {
            const response = await fetch(`${API_URL}/superadmin/admins`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            const select = document.getElementById('projectManager');
            if (select && data.success && data.data.length > 0) {
                const activeAdmins = data.data.filter(admin => admin.isActive);
                if (activeAdmins.length > 0) {
                    select.innerHTML = '<option value="">Select Project Manager</option>' + 
                        activeAdmins.map(admin => 
                            `<option value="${admin._id}">${admin.name} - ${admin.position}</option>`
                        ).join('');
                } else {
                    select.innerHTML = '<option value="">No active admins available</option>';
                }
            } else if (select) {
                select.innerHTML = '<option value="">No admins available</option>';
            }
        } catch (error) {
            console.error('Error loading admins:', error);
            const select = document.getElementById('projectManager');
            if (select) {
                select.innerHTML = '<option value="">Error loading admins</option>';
            }
        }
    }
    
    async function loadUsersForProjectAssignment() {
        try {
            const response = await fetch(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            const select = document.getElementById('assignedUsers');
            if (select && data.success && data.data.length > 0) {
                select.innerHTML = data.data.map(user => 
                    `<option value="${user._id}">${user.name} (${user.position})</option>`
                ).join('');
            } else if (select) {
                select.innerHTML = '<option value="">No users available</option>';
            }
        } catch (error) {
            console.error('Error loading users:', error);
            const select = document.getElementById('assignedUsers');
            if (select) {
                select.innerHTML = '<option value="">Error loading users</option>';
            }
        }
    }
    
    async function loadProjects() {
        try {
            const response = await fetch(`${API_URL}/admin/projects`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            const grid = document.getElementById('projectsGrid');
            
            if (data.success && data.data.length > 0) {
                grid.innerHTML = data.data.map(project => `
                    <div class="project-card-detailed">
                        <div class="project-header">
                            <div>
                                <h4>${project.projectSubject}</h4>
                                <p class="project-code">Code: ${project.projectCode}</p>
                            </div>
                            <span class="project-status ${project.status}">${project.status}</span>
                        </div>
                        <div class="project-info">
                            <div class="info-item">
                                <i class="fas fa-bullseye"></i>
                                <span>Daily Target: ${project.dailyProductionTarget}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-user-tie"></i>
                                <span>Manager: ${project.createdBy ? project.createdBy.name : 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-users"></i>
                                <span>Team: ${project.assignedUsers ? project.assignedUsers.length : 0} employees</span>
                            </div>
                        </div>
                        <div class="project-actions">
                            <button class="btn-sm btn-secondary" onclick="viewProjectDetails('${project._id}')">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                        </div>
                    </div>
                `).join('');
            } else {
                grid.innerHTML = '<p class="no-data">No projects found. Create your first project!</p>';
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            document.getElementById('projectsGrid').innerHTML = '<p class="error">Error loading projects</p>';
        }
    }
    
    // ============================================
    // TASKS SECTION
    // ============================================
    async function loadTasksSection() {
        const mainContent = document.querySelector('.dashboard-main');
        
        mainContent.innerHTML = `
            <div class="page-header">
                <h2>Tasks Overview</h2>
            </div>
            
            <div class="tasks-section">
                <div id="tasksGrid" class="tasks-grid">
                    <p class="loading">Loading tasks...</p>
                </div>
            </div>
        `;
        
        await loadTasks();
    }
    
    async function loadTasks() {
        try {
            const response = await fetch(`${API_URL}/admin/tasks`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            const grid = document.getElementById('tasksGrid');
            
            if (data.success && data.data.length > 0) {
                grid.innerHTML = data.data.map(task => {
                    // Determine status badge color and text
                    let statusBadge = '';
                    if (task.status === 'pending-approval') {
                        statusBadge = '<span class="task-status pending-approval" style="background: #f59e0b; color: white; text-transform: uppercase; font-weight: 600;">Pending Approval</span>';
                    } else if (task.status === 'completed') {
                        statusBadge = '<span class="task-status completed" style="background: #10b981; color: white;"><i class="fas fa-check-circle"></i> Approved</span>';
                    } else if (task.status === 'rejected') {
                        statusBadge = '<span class="task-status rejected" style="background: #ef4444; color: white;"><i class="fas fa-times-circle"></i> Rejected</span>';
                    } else {
                        statusBadge = `<span class="task-status ${task.status}">${task.status}</span>`;
                    }
                    
                    // Action buttons for pending tasks
                    let actionButtons = '';
                    if (task.status === 'pending-approval') {
                        actionButtons = `
                            <div style="display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                                <button class="btn-sm btn-success" onclick="showApproveTaskModal('${task._id}')">
                                    <i class="fas fa-check"></i> Approve
                                </button>
                                <button class="btn-sm btn-danger" onclick="showRejectTaskModal('${task._id}')">
                                    <i class="fas fa-times"></i> Reject
                                </button>
                            </div>
                        `;
                    } else if (task.status === 'completed' && task.feedback) {
                        actionButtons = `
                            <div style="margin-top: 12px; padding: 10px; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; border-radius: 6px; font-size: 13px;">
                                <div style="font-weight: 600; color: #10b981; margin-bottom: 4px;">
                                    <i class="fas fa-comment"></i> Your Feedback:
                                </div>
                                <div style="color: var(--text-secondary);">${task.feedback}</div>
                            </div>
                        `;
                    } else if (task.status === 'rejected' && task.feedback) {
                        actionButtons = `
                            <div style="margin-top: 12px; padding: 10px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 6px; font-size: 13px;">
                                <div style="font-weight: 600; color: #ef4444; margin-bottom: 4px;">
                                    <i class="fas fa-comment"></i> Your Feedback:
                                </div>
                                <div style="color: var(--text-secondary);">${task.feedback}</div>
                            </div>
                        `;
                    }
                    
                    return `
                        <div class="task-card ${task.status}">
                            <div class="task-header">
                                <h4>${task.projectId.projectSubject}</h4>
                                ${statusBadge}
                            </div>
                            <div class="task-info">
                                <span>Employee: ${task.userId.name}</span>
                                <span>Date: ${formatDate(task.date)}</span>
                            </div>
                            <div class="task-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${task.completionPercentage}%"></div>
                                </div>
                                <span>${task.completionPercentage}%</span>
                            </div>
                            <div class="task-stats-row">
                                <span>Target: ${task.dailyTarget}</span>
                                <span>Completed: ${task.totalProduction}</span>
                                <span>Hours: ${8 - task.remainingHours}/8</span>
                            </div>
                            ${actionButtons}
                        </div>
                    `;
                }).join('');
            } else {
                grid.innerHTML = '<p class="no-data">No tasks found</p>';
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            document.getElementById('tasksGrid').innerHTML = '<p class="error">Error loading tasks</p>';
        }
    }
    
    // ============================================
    // SECURITY CODES SECTION
    // ============================================
    async function loadSecurityCodesSection() {
        const mainContent = document.querySelector('.dashboard-main');
        
        mainContent.innerHTML = `
            <div class="page-header">
                <h2>Security Codes</h2>
                <button class="btn-primary" onclick="generateSecurityCode()">
                    <i class="fas fa-key"></i>
                    Generate New Code
                </button>
            </div>
            
            <div class="tasks-section">
                <div class="tasks-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Type</th>
                                <th>Created</th>
                                <th>Expires</th>
                                <th>Used By</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="codesTableBody">
                            <tr><td colspan="7" class="loading">Loading security codes...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        await loadSecurityCodes();
    }
    
    async function loadSecurityCodes() {
        try {
            const response = await fetch(`${API_URL}/superadmin/security-codes`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            const tbody = document.getElementById('codesTableBody');
            
            if (data.success && data.data.length > 0) {
                tbody.innerHTML = data.data.map(code => `
                    <tr>
                        <td><code>${code.code}</code></td>
                        <td>${code.type}</td>
                        <td>${formatDate(code.createdAt)}</td>
                        <td>${formatDate(code.expiresAt)}</td>
                        <td>${code.usedBy ? code.usedBy.name : 'Not used'}</td>
                        <td><span class="badge ${code.used ? 'danger' : 'success'}">${code.used ? 'Used' : 'Available'}</span></td>
                        <td>
                            ${!code.used ? `
                                <button class="btn-sm btn-danger" onclick="deleteSecurityCode('${code._id}', '${code.code}')" title="Delete code">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            ` : '<span style="color: var(--text-secondary); font-size: 0.875rem;">Cannot delete</span>'}
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="7" class="no-data">No security codes generated yet</td></tr>';
            }
        } catch (error) {
            console.error('Error loading security codes:', error);
            document.getElementById('codesTableBody').innerHTML = '<tr><td colspan="7" class="error">Error loading codes</td></tr>';
        }
    }
    
    // ============================================
    // ANALYTICS SECTION
    // ============================================
    async function loadAnalyticsSection() {
        const mainContent = document.querySelector('.dashboard-main');
        
        mainContent.innerHTML = `
            <div class="page-header">
                <h2>Analytics & Reports</h2>
            </div>
            
            <div class="stats-row">
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-title">Completion Rate</span>
                        <div class="stat-icon green">
                            <i class="fas fa-chart-line"></i>
                        </div>
                    </div>
                    <div class="stat-value">0%</div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-title">Average Production</span>
                        <div class="stat-icon cyan">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                    </div>
                    <div class="stat-value">0</div>
                </div>
            </div>
            
            <div class="tasks-section">
                <h3>Performance Metrics</h3>
                <p>Analytics dashboard coming soon...</p>
            </div>
        `;
    }
    
    // ============================================
    // REPORTS SECTION
    // ============================================
    async function loadReportsSection() {
        const mainContent = document.querySelector('.dashboard-main');
        
        mainContent.innerHTML = `
            <div class="page-header">
                <h2>System Reports</h2>
                <button class="btn-primary" onclick="exportReport()">
                    <i class="fas fa-download"></i>
                    Export Report
                </button>
            </div>
            
            <div class="tasks-section">
                <h3>Available Reports</h3>
                <p>Report generation coming soon...</p>
            </div>
        `;
    }
    
    // ============================================
    // ADMIN DASHBOARD OVERVIEW
    // ============================================
    async function loadAdminDashboardOverview() {
        const mainContent = document.querySelector('.dashboard-main');
        
        let html = `
            <div class="page-header">
                <h2>Team Overview</h2>
                <button class="btn-export" onclick="exportReport()">
                    <i class="fas fa-download"></i>
                    Export Report
                </button>
            </div>
            
            <div class="stats-row">
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-title">Total Projects</span>
                        <div class="stat-icon cyan">
                            <i class="fas fa-project-diagram"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="totalProjects">0</div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-title">Total Tasks</span>
                        <div class="stat-icon orange">
                            <i class="fas fa-tasks"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="totalTasks">0</div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-title">In Progress</span>
                        <div class="stat-icon purple">
                            <i class="fas fa-spinner"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="inProgressTasks">0</div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-title">Completed</span>
                        <div class="stat-icon green">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="completedTasks">0</div>
                </div>
            </div>
            
            <div class="tasks-section">
                <h3>Recent Tasks</h3>
                <div id="recentTasks"></div>
            </div>
        `;
        
        mainContent.innerHTML = html;
        
        // Load admin statistics
        await loadAdminStatistics();
    }
    
    async function loadAdminStatistics() {
        try {
            // Load projects count
            const projectsResponse = await fetch(`${API_URL}/admin/projects`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const projectsData = await projectsResponse.json();
            if (projectsData.success) {
                document.getElementById('totalProjects').textContent = projectsData.count || 0;
            }
            
            // Load tasks count
            const tasksResponse = await fetch(`${API_URL}/admin/tasks`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const tasksData = await tasksResponse.json();
            if (tasksData.success) {
                document.getElementById('totalTasks').textContent = tasksData.count || 0;
                
                // Count in-progress and completed
                const inProgress = tasksData.data.filter(t => t.status === 'in-progress').length;
                const completed = tasksData.data.filter(t => t.status === 'completed').length;
                
                document.getElementById('inProgressTasks').textContent = inProgress;
                document.getElementById('completedTasks').textContent = completed;
            }
        } catch (error) {
            console.error('Error loading admin statistics:', error);
        }
    }
    
    // ============================================
    // ADMIN PROJECTS SECTION
    // ============================================
    async function loadAdminProjectsSection() {
        const mainContent = document.querySelector('.dashboard-main');
        
        mainContent.innerHTML = `
            <div class="page-header">
                <h2>My Projects</h2>
                <button class="btn-primary" onclick="showCreateProjectModal()">
                    <i class="fas fa-plus"></i>
                    Create Project
                </button>
            </div>
            
            <div id="createProjectFormContainer" style="display: none;">
                <div class="tasks-section">
                    <h3>Create New Project</h3>
                    <form id="createProjectForm" class="project-form" onsubmit="handleCreateProject(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Project Subject *</label>
                                <input type="text" id="projectSubject" required placeholder="Enter project name">
                            </div>
                            <div class="form-group">
                                <label>Project Code *</label>
                                <input type="text" id="projectCode" required placeholder="e.g., PROJ001">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Daily Production Target *</label>
                                <input type="number" id="dailyProductionTarget" required min="1" placeholder="e.g., 200">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Employee Emails (one per line) *</label>
                            <textarea id="userEmails" required placeholder="employee1@company.com&#10;employee2@company.com&#10;employee3@company.com" rows="5" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit; resize: vertical;"></textarea>
                            <small style="color: var(--text-secondary); display: block; margin-top: 8px;">
                                <i class="fas fa-info-circle"></i> Enter one email address per line. Invitations will be sent to each employee.
                            </small>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-plus"></i>
                                Create Project & Send Invitations
                            </button>
                            <button type="button" class="btn-secondary" onclick="hideCreateProjectModal()">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div class="tasks-section">
                <div id="projectsGrid" class="projects-list">
                    <p class="loading">Loading projects...</p>
                </div>
            </div>
        `;
        
        await loadAdminProjects();
    }
    
    async function loadAdminProjects() {
        try {
            const response = await fetch(`${API_URL}/admin/projects`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            const grid = document.getElementById('projectsGrid');
            
            if (data.success && data.data.length > 0) {
                grid.innerHTML = data.data.map(project => `
                    <div class="project-card-detailed">
                        <div class="project-header">
                            <div>
                                <h4>${project.projectSubject}</h4>
                                <p class="project-code">Code: ${project.projectCode}</p>
                            </div>
                            <span class="project-status ${project.status}">${project.status}</span>
                        </div>
                        <div class="project-info">
                            <div class="info-item">
                                <i class="fas fa-bullseye"></i>
                                <span>Daily Target: ${project.dailyProductionTarget}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-users"></i>
                                <span>Assigned: ${project.assignedUsers ? project.assignedUsers.length : 0} employees</span>
                            </div>
                        </div>
                        <div class="project-employees">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <h5 style="margin: 0;">Assigned Employees:</h5>
                                <button class="btn-sm btn-primary" onclick="showInviteEmployeesModal('${project._id}', '${project.projectSubject}')" style="font-size: 12px; padding: 6px 12px;">
                                    <i class="fas fa-user-plus"></i> Invite Employees
                                </button>
                            </div>
                            <div id="employees-${project._id}" class="employee-list">
                                <p class="loading-small">Loading...</p>
                            </div>
                        </div>
                        <div class="project-actions">
                            <button class="btn-sm btn-secondary" onclick="viewProjectDetails('${project._id}')">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            <button class="btn-sm btn-secondary" onclick="viewProjectInvitations('${project._id}')">
                                <i class="fas fa-envelope"></i> View Invitations
                            </button>
                        </div>
                    </div>
                `).join('');
                
                // Load employees for each project
                data.data.forEach(project => {
                    loadProjectEmployees(project._id, project.assignedUsers);
                });
            } else {
                grid.innerHTML = '<p class="no-data">No projects found. Create your first project!</p>';
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            document.getElementById('projectsGrid').innerHTML = '<p class="error">Error loading projects</p>';
        }
    }
    
    async function loadProjectEmployees(projectId, assignedUsers) {
        const container = document.getElementById(`employees-${projectId}`);
        
        if (!assignedUsers || assignedUsers.length === 0) {
            container.innerHTML = '<p class="no-data-small">No employees assigned yet</p>';
            return;
        }
        
        try {
            // Fetch full user details
            const response = await fetch(`${API_URL}/admin/project/${projectId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            if (data.success && data.data.assignedUsers && data.data.assignedUsers.length > 0) {
                container.innerHTML = data.data.assignedUsers.map(user => `
                    <div class="employee-tag">
                        <span>${user.name}</span>
                        <button class="remove-employee" onclick="removeEmployeeFromProject('${projectId}', '${user._id}', '${user.name}')" title="Remove employee">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p class="no-data-small">No employees assigned yet</p>';
            }
        } catch (error) {
            console.error('Error loading project employees:', error);
            container.innerHTML = '<p class="error-small">Error loading employees</p>';
        }
    }
    
    // ============================================
    // TEAM SECTION
    // ============================================
    async function loadTeamSection() {
        const mainContent = document.querySelector('.dashboard-main');
        
        mainContent.innerHTML = `
            <div class="page-header">
                <h2>Team Members</h2>
            </div>
            
            <div class="tasks-section">
                <div class="tasks-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Position</th>
                                <th>Role</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="teamTableBody">
                            <tr><td colspan="5" class="loading">Loading team members...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        await loadTeamMembers();
    }
    
    async function loadTeamMembers() {
        try {
            const response = await fetch(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            const tbody = document.getElementById('teamTableBody');
            
            if (data.success && data.data.length > 0) {
                // Filter out the current user (admin themselves)
                const teamMembers = data.data.filter(user => user._id !== currentUser._id);
                
                if (teamMembers.length > 0) {
                    tbody.innerHTML = teamMembers.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.position}</td>
                            <td><span class="badge ${user.role === 'admin' ? 'purple' : 'cyan'}">${user.role}</span></td>
                            <td><span class="badge success">Active</span></td>
                        </tr>
                    `).join('');
                } else {
                    tbody.innerHTML = '<tr><td colspan="5" class="no-data">No team members found</td></tr>';
                }
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="no-data">No team members found</td></tr>';
            }
        } catch (error) {
            console.error('Error loading team members:', error);
            document.getElementById('teamTableBody').innerHTML = '<tr><td colspan="5" class="error">Error loading team members</td></tr>';
        }
    }
    
    // ============================================
    // EMPLOYEE DASHBOARD OVERVIEW
    // ============================================
    async function loadEmployeeDashboardOverview() {
        const mainContent = document.querySelector('.dashboard-main');
        
        let html = `
            <div class="page-header">
                <h2>My Dashboard</h2>
            </div>
            
            <!-- Pending Invitations Section -->
            <div id="pendingInvitationsSection" style="display: none;">
                <div class="tasks-section">
                    <h3><i class="fas fa-envelope"></i> Pending Project Invitations</h3>
                    <div id="invitationsList"></div>
                </div>
            </div>
            
            <div class="stats-row">
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-title">Total Tasks</span>
                        <div class="stat-icon green">
                            <i class="fas fa-tasks"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="empTotalTasks">0</div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-title">In Progress</span>
                        <div class="stat-icon orange">
                            <i class="fas fa-spinner"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="empInProgressTasks">0</div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-title">Completed</span>
                        <div class="stat-icon green">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="empCompletedTasks">0</div>
                </div>
                
                <div class="stat-box">
                    <div class="stat-header">
                        <span class="stat-title">Avg Completion</span>
                        <div class="stat-icon purple">
                            <i class="fas fa-chart-line"></i>
                        </div>
                    </div>
                    <div class="stat-value" id="empAvgCompletion">0%</div>
                </div>
            </div>
            
            <div class="tasks-section">
                <h3>Submitted Tasks</h3>
                <div id="submittedTasksContainer">
                    <p class="loading">Loading submitted tasks...</p>
                </div>
            </div>
        `;
        
        mainContent.innerHTML = html;
        
        // Load employee statistics
        await loadEmployeeStatistics();
        await loadSubmittedTasks();
        await loadPendingInvitations();
    }
    
    async function loadSubmittedTasks() {
        try {
            const response = await fetch(`${API_URL}/employee/tasks`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            const container = document.getElementById('submittedTasksContainer');
            
            if (data.success && data.data.length > 0) {
                // Filter only submitted tasks (pending-approval, completed, rejected)
                const submittedTasks = data.data.filter(task => 
                    task.status === 'pending-approval' || 
                    task.status === 'completed' || 
                    task.status === 'rejected'
                );
                
                if (submittedTasks.length > 0) {
                    container.innerHTML = submittedTasks.map(task => {
                        const completedHours = task.hourlyUpdates.map(u => u.hour).sort((a, b) => a - b);
                        const hoursDisplay = completedHours.length > 0 
                            ? `Hours: ${completedHours.join(', ')} of 8` 
                            : 'Hours: 0/8';
                        
                        let statusBadge = '';
                        if (task.status === 'pending-approval') {
                            statusBadge = '<span class="task-status pending-approval" style="background: #ef4444; color: white;">Pending Approval</span>';
                        } else if (task.status === 'completed') {
                            statusBadge = '<span class="task-status completed" style="background: #10b981; color: white;"><i class="fas fa-check-circle"></i> Approved</span>';
                        } else if (task.status === 'rejected') {
                            statusBadge = '<span class="task-status rejected" style="background: #ef4444; color: white;"><i class="fas fa-times-circle"></i> Rejected</span>';
                        }
                        
                        return `
                            <div class="task-card ${task.status}" style="margin-bottom: 16px;">
                                <div class="task-header">
                                    <h4>${task.projectId.projectSubject}</h4>
                                    ${statusBadge}
                                </div>
                                <div class="task-info">
                                    <span>Code: ${task.projectId.projectCode}</span>
                                    <span>Date: ${formatDate(task.date)}</span>
                                </div>
                                <div class="task-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${task.completionPercentage}%"></div>
                                    </div>
                                    <span>${task.completionPercentage}%</span>
                                </div>
                                <div class="task-stats-row">
                                    <span>Target: ${task.dailyTarget}</span>
                                    <span>Completed: ${task.totalProduction}</span>
                                    <span>${hoursDisplay}</span>
                                </div>
                                ${task.feedback ? `
                                    <div style="margin-top: 12px; padding: 12px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 8px;">
                                        <div style="font-weight: 600; color: #ef4444; margin-bottom: 4px;">
                                            <i class="fas fa-comment"></i> Manager Feedback:
                                        </div>
                                        <div style="color: var(--text-secondary); font-size: 14px;">${task.feedback}</div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('');
                } else {
                    container.innerHTML = '<p class="no-data">No submitted tasks yet. Complete and submit your tasks from "My Tasks" section.</p>';
                }
            } else {
                container.innerHTML = '<p class="no-data">No submitted tasks yet. Complete and submit your tasks from "My Tasks" section.</p>';
            }
        } catch (error) {
            console.error('Error loading submitted tasks:', error);
            document.getElementById('submittedTasksContainer').innerHTML = '<p class="error">Error loading submitted tasks</p>';
        }
    }
    
    async function loadPendingInvitations() {
        try {
            const response = await fetch(`${API_URL}/employee/invitations`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            if (data.success && data.data.length > 0) {
                const section = document.getElementById('pendingInvitationsSection');
                const list = document.getElementById('invitationsList');
                
                section.style.display = 'block';
                
                list.innerHTML = data.data.map(inv => `
                    <div class="invitation-card">
                        <div class="invitation-header">
                            <div>
                                <h4>${inv.projectId.projectSubject}</h4>
                                <p class="invitation-code">Code: ${inv.projectId.projectCode}</p>
                            </div>
                            <span class="invitation-badge pending">Pending</span>
                        </div>
                        <div class="invitation-info">
                            <p><i class="fas fa-user"></i> Invited by: ${inv.invitedBy.name} (${inv.invitedBy.position})</p>
                            <p><i class="fas fa-bullseye"></i> Daily Target: ${inv.projectId.dailyProductionTarget}</p>
                            <p><i class="fas fa-calendar"></i> Invited: ${formatDate(inv.createdAt)}</p>
                        </div>
                        <div class="invitation-actions">
                            <button class="btn-sm btn-success" onclick="respondToInvitation('${inv._id}', 'accept')">
                                <i class="fas fa-check"></i> Accept
                            </button>
                            <button class="btn-sm btn-danger" onclick="respondToInvitation('${inv._id}', 'reject')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading invitations:', error);
        }
    }
    
    window.respondToInvitation = async function(invitationId, response) {
        const action = response === 'accept' ? 'accept' : 'reject';
        const confirmMsg = response === 'accept' 
            ? 'Are you sure you want to accept this project invitation?' 
            : 'Are you sure you want to reject this project invitation?';
        
        if (!confirm(confirmMsg)) {
            return;
        }
        
        try {
            const apiResponse = await fetch(`${API_URL}/employee/invitation/${invitationId}/respond`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ response: action })
            });
            
            const data = await apiResponse.json();
            
            if (data.success) {
                alert(response === 'accept' 
                    ? 'Invitation accepted! The project has been added to your projects list.' 
                    : 'Invitation rejected.');
                // Reload dashboard
                await loadEmployeeDashboardOverview();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error responding to invitation:', error);
            alert('Network error. Please try again.');
        }
    };
    
    async function loadEmployeeStatistics() {
        try {
            const response = await fetch(`${API_URL}/employee/stats`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('empTotalTasks').textContent = data.data.totalTasks || 0;
                document.getElementById('empInProgressTasks').textContent = data.data.inProgressTasks || 0;
                document.getElementById('empCompletedTasks').textContent = data.data.completedTasks || 0;
                document.getElementById('empAvgCompletion').textContent = (data.data.averageCompletion || 0) + '%';
            }
        } catch (error) {
            console.error('Error loading employee statistics:', error);
        }
    }
    
    async function loadTodayTask() {
        try {
            const response = await fetch(`${API_URL}/employee/task/today`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            const container = document.getElementById('todayTaskContainer');
            
            if (data.success && data.data) {
                const task = data.data;
                
                // Get completed hours list
                const completedHours = task.hourlyUpdates.map(u => u.hour).sort((a, b) => a - b);
                const hoursDisplay = completedHours.length > 0 
                    ? `Hours: ${completedHours.join(', ')} of 8` 
                    : 'Hours: 0/8';
                
                // Determine status badge color and text
                let statusBadge = '';
                if (task.status === 'pending-approval') {
                    statusBadge = '<span class="task-status pending-approval" style="background: #ef4444; color: white;">Pending Approval</span>';
                } else if (task.status === 'completed') {
                    statusBadge = '<span class="task-status completed" style="background: #10b981; color: white;"><i class="fas fa-check-circle"></i> Approved</span>';
                } else if (task.status === 'rejected') {
                    statusBadge = '<span class="task-status rejected" style="background: #ef4444; color: white;"><i class="fas fa-times-circle"></i> Rejected</span>';
                } else {
                    statusBadge = `<span class="task-status ${task.status}">${task.status}</span>`;
                }
                
                container.innerHTML = `
                    <div class="task-card ${task.status}">
                        <div class="task-header">
                            <h4>${task.projectId.projectSubject}</h4>
                            ${statusBadge}
                        </div>
                        <div class="task-info">
                            <span>Project Code: ${task.projectId.projectCode}</span>
                            <span>Date: ${formatDate(task.date)}</span>
                        </div>
                        <div class="task-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${task.completionPercentage}%"></div>
                            </div>
                            <span>${task.completionPercentage}%</span>
                        </div>
                        <div class="task-stats-row">
                            <span>Target: ${task.dailyTarget}</span>
                            <span>Completed: ${task.totalProduction}</span>
                            <span>${hoursDisplay}</span>
                        </div>
                        ${task.status === 'in-progress' ? `
                            <div style="display: flex; gap: 12px; margin-top: 12px;">
                                <button class="btn-primary" onclick="showAddHourlyUpdateModal('${task._id}')" style="flex: 1;">
                                    <i class="fas fa-plus"></i>
                                    Add Hourly Update
                                </button>
                                ${task.hourlyUpdates.length >= 8 ? `
                                    <button class="btn-primary" onclick="submitTaskForApproval('${task._id}')" style="flex: 1; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                        <i class="fas fa-paper-plane"></i>
                                        Submit for Approval
                                    </button>
                                ` : ''}
                            </div>
                        ` : ''}
                        ${task.status === 'pending-approval' ? `
                            <div style="margin-top: 12px; padding: 14px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; border-radius: 8px;">
                                <div style="display: flex; align-items: center; gap: 8px; color: #ef4444; font-weight: 600;">
                                    <i class="fas fa-clock"></i>
                                    <span>Waiting for manager approval...</span>
                                </div>
                            </div>
                        ` : ''}
                        ${task.feedback ? `
                            <div style="margin-top: 12px; padding: 12px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 8px;">
                                <div style="font-weight: 600; color: #ef4444; margin-bottom: 4px;">
                                    <i class="fas fa-comment"></i> Manager Feedback:
                                </div>
                                <div style="color: var(--text-secondary); font-size: 14px;">${task.feedback}</div>
                            </div>
                        ` : ''}
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="no-data-card">
                        <i class="fas fa-calendar-plus"></i>
                        <p>No task created for today</p>
                        <button class="btn-primary" onclick="showCreateTaskModal()">
                            <i class="fas fa-plus"></i>
                            Create Today's Task
                        </button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading today task:', error);
            document.getElementById('todayTaskContainer').innerHTML = '<p class="error">Error loading today\'s task</p>';
        }
    }
    
    // ============================================
    // MY TASKS SECTION (EMPLOYEE)
    // ============================================
    async function loadMyTasksSection() {
        const mainContent = document.querySelector('.dashboard-main');
        
        mainContent.innerHTML = `
            <div class="page-header">
                <h2>My Tasks</h2>
                <button class="btn-primary" onclick="showCreateTaskModal()">
                    <i class="fas fa-plus"></i>
                    Create Today's Task
                </button>
            </div>
            
            <div class="tasks-section">
                <div id="myTasksGrid" class="tasks-grid">
                    <p class="loading">Loading tasks...</p>
                </div>
            </div>
        `;
        
        await loadMyTasks();
    }
    
    async function loadMyTasks() {
        try {
            const response = await fetch(`${API_URL}/employee/tasks`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            const grid = document.getElementById('myTasksGrid');
            
            if (data.success && data.data.length > 0) {
                grid.innerHTML = data.data.map(task => {
                    // Get completed hours list
                    const completedHours = task.hourlyUpdates.map(u => u.hour).sort((a, b) => a - b);
                    const uniqueHours = [...new Set(completedHours)]; // Remove duplicates
                    const hoursDisplay = completedHours.length > 0 
                        ? `Hours: ${completedHours.join(', ')} of 8` 
                        : 'Hours: 0/8';
                    
                    // Check if ALL 8 hours are completed
                    // Either: all 8 unique hours (1-8) OR only hour 8 (special case)
                    const allHoursCompleted = (uniqueHours.length === 8 && uniqueHours.every(h => h >= 1 && h <= 8)) ||
                                             (uniqueHours.length === 1 && uniqueHours[0] === 8) ||
                                             task.remainingHours === 0;
                    
                    // Determine status badge
                    let statusBadge = '';
                    if (task.status === 'pending-approval') {
                        statusBadge = '<span class="task-status pending-approval" style="background: #ef4444; color: white;">Pending Approval</span>';
                    } else if (task.status === 'completed') {
                        statusBadge = '<span class="task-status completed" style="background: #10b981; color: white;"><i class="fas fa-check-circle"></i> Approved</span>';
                    } else if (task.status === 'rejected') {
                        statusBadge = '<span class="task-status rejected" style="background: #ef4444; color: white;"><i class="fas fa-times-circle"></i> Rejected</span>';
                    } else {
                        statusBadge = `<span class="task-status ${task.status}">${task.status}</span>`;
                    }
                    
                    // Determine button text and action
                    let actionButton = '';
                    if (task.status === 'in-progress') {
                        // Show Submit button when ALL 8 hours completed
                        if (allHoursCompleted) {
                            actionButton = `
                                <button class="btn-primary" onclick="submitTaskForApproval('${task._id}')" style="width: 100%; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                    <i class="fas fa-paper-plane"></i>
                                    Submit for Approval
                                </button>
                            `;
                        } else {
                            // Show Add Update button
                            actionButton = `
                                <button class="btn-primary" onclick="showAddHourlyUpdateModal('${task._id}')" style="width: 100%;">
                                    <i class="fas fa-plus"></i>
                                    Add Hourly Update
                                </button>
                            `;
                        }
                    } else if (task.status === 'pending-approval') {
                        actionButton = `
                            <div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; border-radius: 8px; text-align: center;">
                                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #ef4444; font-weight: 600;">
                                    <i class="fas fa-clock"></i>
                                    <span>Waiting for manager approval...</span>
                                </div>
                            </div>
                        `;
                    }
                    
                    return `
                        <div class="task-card ${task.status}">
                            <div class="task-header">
                                <h4>${task.projectId.projectSubject}</h4>
                                ${statusBadge}
                            </div>
                            <div class="task-info">
                                <span>Code: ${task.projectId.projectCode}</span>
                                <span>Date: ${formatDate(task.date)}</span>
                            </div>
                            <div class="task-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${task.completionPercentage}%"></div>
                                </div>
                                <span>${task.completionPercentage}%</span>
                            </div>
                            <div class="task-stats-row">
                                <span>Target: ${task.dailyTarget}</span>
                                <span>Completed: ${task.totalProduction}</span>
                                <span>${hoursDisplay}</span>
                            </div>
                            ${actionButton}
                            ${task.feedback ? `
                                <div style="margin-top: 12px; padding: 10px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 6px; font-size: 13px;">
                                    <div style="font-weight: 600; color: #ef4444; margin-bottom: 4px;">
                                        <i class="fas fa-comment"></i> Feedback:
                                    </div>
                                    <div style="color: var(--text-secondary);">${task.feedback}</div>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');
            } else {
                grid.innerHTML = '<p class="no-data">No tasks found</p>';
            }
        } catch (error) {
            console.error('Error loading my tasks:', error);
            document.getElementById('myTasksGrid').innerHTML = '<p class="error">Error loading tasks</p>';
        }
    }
    
    // ============================================
    // MY PROJECTS SECTION (EMPLOYEE)
    // ============================================
    async function loadMyProjectsSection() {
        const mainContent = document.querySelector('.dashboard-main');
        
        mainContent.innerHTML = `
            <div class="page-header">
                <h2>My Projects</h2>
            </div>
            
            <div class="tasks-section">
                <div id="myProjectsGrid" class="tasks-grid">
                    <p class="loading">Loading projects...</p>
                </div>
            </div>
        `;
        
        await loadMyProjects();
    }
    
    async function loadMyProjects() {
        try {
            const response = await fetch(`${API_URL}/employee/projects`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            const grid = document.getElementById('myProjectsGrid');
            
            if (data.success && data.data.length > 0) {
                grid.innerHTML = data.data.map(project => `
                    <div class="project-card">
                        <h4>${project.projectSubject}</h4>
                        <p class="project-code">Code: ${project.projectCode}</p>
                        <p>Daily Target: ${project.dailyProductionTarget}</p>
                        <p>Created by: ${project.createdBy.name}</p>
                        <span class="project-status ${project.status}">${project.status}</span>
                    </div>
                `).join('');
            } else {
                grid.innerHTML = '<p class="no-data">No projects assigned to you</p>';
            }
        } catch (error) {
            console.error('Error loading my projects:', error);
            document.getElementById('myProjectsGrid').innerHTML = '<p class="error">Error loading projects</p>';
        }
    }
    
    // ============================================
    // PROFILE SECTION
    // ============================================
    async function loadProfileSection() {
        const mainContent = document.querySelector('.dashboard-main');
        
        mainContent.innerHTML = `
            <div class="page-header">
                <h2>My Profile</h2>
            </div>
            
            <div class="tasks-section">
                <div class="profile-card">
                    <h3>${currentUser.name}</h3>
                    <p><strong>Email:</strong> ${currentUser.email}</p>
                    <p><strong>Position:</strong> ${currentUser.position}</p>
                    <p><strong>Role:</strong> ${currentUser.role}</p>
                </div>
            </div>
        `;
    }
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    // ============================================
    // GLOBAL FUNCTIONS (called from HTML)
    // ============================================
    window.generateSecurityCode = async function() {
        try {
            const response = await fetch(`${API_URL}/superadmin/generate-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ expiryDays: 30 })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Create a custom modal to display the code
                const modal = document.createElement('div');
                modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                `;
                
                modal.innerHTML = `
                    <div style="
                        background: var(--card-bg);
                        border-radius: 12px;
                        padding: 32px;
                        max-width: 500px;
                        width: 90%;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                    ">
                        <div style="text-align: center;">
                            <div style="
                                width: 64px;
                                height: 64px;
                                background: linear-gradient(135deg, #7c3aed, #a855f7);
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                margin: 0 auto 20px;
                            ">
                                <i class="fas fa-key" style="font-size: 28px; color: white;"></i>
                            </div>
                            <h2 style="margin: 0 0 8px; color: var(--text-primary);">Security Code Generated!</h2>
                            <p style="color: var(--text-secondary); margin: 0 0 24px;">Share this code with the new admin</p>
                            
                            <div style="
                                background: var(--bg-secondary);
                                border: 2px solid #7c3aed;
                                border-radius: 8px;
                                padding: 20px;
                                margin-bottom: 16px;
                            ">
                                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">SECURITY CODE</div>
                                <div id="generatedCode" style="
                                    font-size: 32px;
                                    font-weight: bold;
                                    color: #7c3aed;
                                    letter-spacing: 4px;
                                    font-family: monospace;
                                ">${data.data.code}</div>
                            </div>
                            
                            <div style="
                                background: var(--bg-secondary);
                                border-radius: 8px;
                                padding: 16px;
                                margin-bottom: 24px;
                                text-align: left;
                            ">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="color: var(--text-secondary);">Type:</span>
                                    <span style="color: var(--text-primary); font-weight: 500;">Admin</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="color: var(--text-secondary);">Created:</span>
                                    <span style="color: var(--text-primary); font-weight: 500;">${new Date().toLocaleDateString()}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: var(--text-secondary);">Expires:</span>
                                    <span style="color: var(--text-primary); font-weight: 500;">${formatDate(data.data.expiresAt)}</span>
                                </div>
                            </div>
                            
                            <div style="display: flex; gap: 12px;">
                                <button onclick="copySecurityCode('${data.data.code}')" style="
                                    flex: 1;
                                    padding: 12px 24px;
                                    background: #7c3aed;
                                    color: white;
                                    border: none;
                                    border-radius: 8px;
                                    font-size: 16px;
                                    font-weight: 500;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 8px;
                                ">
                                    <i class="fas fa-copy"></i>
                                    Copy Code
                                </button>
                                <button onclick="closeSecurityCodeModal()" style="
                                    flex: 1;
                                    padding: 12px 24px;
                                    background: var(--bg-secondary);
                                    color: var(--text-primary);
                                    border: 1px solid var(--border-color);
                                    border-radius: 8px;
                                    font-size: 16px;
                                    font-weight: 500;
                                    cursor: pointer;
                                ">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                modal.id = 'securityCodeModal';
                
                // Reload security codes if on that section
                if (currentSection === 'security-codes') {
                    await loadSecurityCodes();
                }
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error generating code:', error);
            alert('Network error. Please try again.');
        }
    };
    
    window.copySecurityCode = function(code) {
        navigator.clipboard.writeText(code).then(() => {
            const btn = event.target.closest('button');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            btn.style.background = '#10b981';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '#7c3aed';
            }, 2000);
        }).catch(err => {
            alert('Failed to copy code. Please copy manually: ' + code);
        });
    };
    
    window.closeSecurityCodeModal = function() {
        const modal = document.getElementById('securityCodeModal');
        if (modal) {
            modal.remove();
        }
    };
    
    window.deleteSecurityCode = async function(codeId, codeValue) {
        if (!confirm(`Are you sure you want to delete security code: ${codeValue}?\n\nThis action cannot be undone. The code will no longer be usable for admin registration.`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/superadmin/security-code/${codeId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Security code deleted successfully!');
                // Reload security codes
                await loadSecurityCodes();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting security code:', error);
            alert('Network error. Please try again.');
        }
    };
    
    window.showCreateAdminModal = function() {
        const container = document.getElementById('createAdminFormContainer');
        if (container) {
            container.style.display = 'block';
            container.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    window.hideCreateAdminModal = function() {
        const container = document.getElementById('createAdminFormContainer');
        if (container) {
            container.style.display = 'none';
            document.getElementById('createAdminForm').reset();
        }
    };
    
    window.handleCreateAdmin = async function(event) {
        event.preventDefault();
        
        const name = document.getElementById('adminName').value;
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const position = document.getElementById('adminPosition').value;
        
        try {
            const response = await fetch(`${API_URL}/superadmin/create-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    position
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Admin created successfully!\n\nThe admin can now login with:\nEmail: ' + email + '\nPassword: ' + password + '\n\nMake sure to share these credentials securely.');
                hideCreateAdminModal();
                await loadAdmins();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            alert('Network error. Please try again.');
        }
    };
    
    window.showGenerateCodeModal = window.generateSecurityCode;
    
    window.toggleAdminStatus = async function(adminId, currentStatus) {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this admin?`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/superadmin/admin/${adminId}/toggle-status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Admin status updated successfully!');
                await loadAdmins();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error toggling admin status:', error);
            alert('Network error. Please try again.');
        }
    };
    
    window.viewEmployeeDetails = function(employeeId) {
        alert('Employee details view coming soon!');
    };
    
    window.showCreateProjectModal = function() {
        const container = document.getElementById('createProjectFormContainer');
        if (container) {
            container.style.display = 'block';
            container.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    window.hideCreateProjectModal = function() {
        const container = document.getElementById('createProjectFormContainer');
        if (container) {
            container.style.display = 'none';
            document.getElementById('createProjectForm').reset();
        }
    };
    
    window.handleCreateProject = async function(event) {
        event.preventDefault();
        
        const projectSubject = document.getElementById('projectSubject').value;
        const projectCode = document.getElementById('projectCode').value;
        const dailyProductionTarget = document.getElementById('dailyProductionTarget').value;
        const userEmailsText = document.getElementById('userEmails').value;
        
        // Parse emails from textarea (one per line)
        const userEmails = userEmailsText
            .split('\n')
            .map(email => email.trim())
            .filter(email => email.length > 0);
        
        if (userEmails.length === 0) {
            alert('Please enter at least one employee email address');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = userEmails.filter(email => !emailRegex.test(email));
        
        if (invalidEmails.length > 0) {
            alert('Invalid email format:\n' + invalidEmails.join('\n'));
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/admin/project`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    projectSubject,
                    projectCode,
                    dailyProductionTarget: parseInt(dailyProductionTarget),
                    userEmails
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(`Project created successfully!\n\nInvitations sent to ${userEmails.length} employee(s).\n\nEmployees will receive notifications and can accept/reject the invitation.`);
                hideCreateProjectModal();
                if (currentUser.role === 'admin') {
                    await loadAdminProjects();
                } else {
                    await loadProjects();
                }
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Network error. Please try again.');
        }
    };
    
    window.handleSuperAdminCreateProject = async function(event) {
        event.preventDefault();
        
        const projectSubject = document.getElementById('projectSubject').value;
        const projectCode = document.getElementById('projectCode').value;
        const dailyProductionTarget = document.getElementById('dailyProductionTarget').value;
        const projectManagerId = document.getElementById('projectManager').value;
        
        if (!projectManagerId) {
            alert('Please select a Project Manager');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/superadmin/project`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    projectSubject,
                    projectCode,
                    dailyProductionTarget: parseInt(dailyProductionTarget),
                    projectManagerId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Project created and assigned to Project Manager successfully!');
                hideCreateProjectModal();
                await loadProjects();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Network error. Please try again.');
        }
    };
    
    window.showCreateTaskModal = async function() {
        try {
            // Get employee's projects
            const response = await fetch(`${API_URL}/employee/projects`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            console.log('Employee projects response:', data); // Debug log
            
            if (!data.success) {
                alert('Error loading projects: ' + (data.message || 'Unknown error'));
                return;
            }
            
            if (data.data.length === 0) {
                const modalHtml = `
                    <div id="noProjectModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(4px);">
                        <div style="background: var(--bg-primary); border-radius: 16px; padding: 0; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.4); overflow: hidden;">
                            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 24px; color: white; text-align: center;">
                                <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                                    <i class="fas fa-exclamation-triangle" style="font-size: 32px;"></i>
                                </div>
                                <h3 style="margin: 0; font-size: 24px; font-weight: 600;">No Projects Assigned</h3>
                            </div>
                            
                            <div style="padding: 24px;">
                                <p style="color: var(--text-primary); font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                                    You don't have any projects assigned yet. To create tasks, you need to be part of a project.
                                </p>
                                
                                <div style="background: var(--bg-secondary); padding: 16px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #10b981;">
                                    <h4 style="margin: 0 0 12px 0; color: var(--text-primary); font-size: 14px; font-weight: 600;">
                                        <i class="fas fa-lightbulb" style="color: #10b981; margin-right: 8px;"></i>
                                        What to do:
                                    </h4>
                                    <ol style="margin: 0; padding-left: 20px; color: var(--text-secondary); font-size: 14px; line-height: 1.8;">
                                        <li>Check your <strong>Dashboard</strong> for pending project invitations</li>
                                        <li>Accept any invitations you receive</li>
                                        <li>Or contact your manager to invite you to a project</li>
                                    </ol>
                                </div>
                                
                                <button onclick="document.getElementById('noProjectModal').remove(); loadDashboardSection('dashboard');" style="width: 100%; padding: 14px 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s ease;">
                                    <i class="fas fa-home" style="margin-right: 8px;"></i>
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.insertAdjacentHTML('beforeend', modalHtml);
                return;
            }
            
            // Create beautiful modal
            const projectOptions = data.data.map(p => 
                `<option value="${p._id}">${p.projectSubject} (${p.projectCode}) - Target: ${p.dailyProductionTarget}</option>`
            ).join('');
            
            const modalHtml = `
                <div id="createTaskModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(4px);">
                    <div style="background: var(--bg-primary); border-radius: 16px; padding: 0; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.4); animation: modalSlideIn 0.3s ease-out; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; color: white;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-tasks" style="font-size: 24px;"></i>
                                </div>
                                <div>
                                    <h3 style="margin: 0; font-size: 24px; font-weight: 600;">Create Today's Task</h3>
                                    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Select a project to start working on</p>
                                </div>
                            </div>
                        </div>
                        
                        <form id="createTaskForm" onsubmit="handleCreateTask(event)" style="padding: 24px;">
                            <div style="margin-bottom: 24px;">
                                <label style="display: block; margin-bottom: 8px; color: var(--text-primary); font-weight: 500; font-size: 14px;">
                                    <i class="fas fa-project-diagram" style="margin-right: 8px; color: #10b981;"></i>
                                    Select Project *
                                </label>
                                <select id="taskProjectId" required style="width: 100%; padding: 14px 16px; border: 2px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit; font-size: 15px; transition: all 0.3s ease; cursor: pointer;">
                                    <option value="">Choose a project...</option>
                                    ${projectOptions}
                                </select>
                                <div id="projectInfo" style="margin-top: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 8px; border-left: 3px solid #10b981; display: none;">
                                    <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 13px;">
                                        <i class="fas fa-info-circle" style="color: #10b981;"></i>
                                        <span>You'll have 8 hours to complete the daily target</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%); padding: 16px; border-radius: 10px; margin-bottom: 24px; border: 1px solid rgba(16, 185, 129, 0.2);">
                                <div style="display: flex; align-items: start; gap: 12px;">
                                    <i class="fas fa-lightbulb" style="color: #10b981; font-size: 20px; margin-top: 2px;"></i>
                                    <div>
                                        <h4 style="margin: 0 0 6px 0; color: var(--text-primary); font-size: 14px; font-weight: 600;">Quick Tip</h4>
                                        <p style="margin: 0; color: var(--text-secondary); font-size: 13px; line-height: 1.5;">
                                            Track your progress hourly to stay on target. You can update your production every hour throughout the day.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" style="flex: 1; padding: 14px 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                    <i class="fas fa-plus-circle" style="margin-right: 8px;"></i>
                                    Create Task
                                </button>
                                <button type="button" onclick="hideCreateTaskModal()" style="flex: 0.4; padding: 14px 24px; background: var(--bg-secondary); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s ease;">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <style>
                    @keyframes modalSlideIn {
                        from {
                            opacity: 0;
                            transform: translateY(-20px) scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                    
                    #taskProjectId:focus {
                        outline: none;
                        border-color: #10b981;
                        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
                    }
                    
                    #createTaskForm button[type="submit"]:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
                    }
                    
                    #createTaskForm button[type="button"]:hover {
                        background: var(--bg-tertiary);
                        border-color: var(--text-secondary);
                    }
                </style>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Add project selection handler to show info
            document.getElementById('taskProjectId').addEventListener('change', function() {
                const projectInfo = document.getElementById('projectInfo');
                if (this.value) {
                    projectInfo.style.display = 'block';
                } else {
                    projectInfo.style.display = 'none';
                }
            });
            
        } catch (error) {
            console.error('Error loading projects:', error);
            alert('Network error. Please try again.');
        }
    };
    
    window.hideCreateTaskModal = function() {
        const modal = document.getElementById('createTaskModal');
        if (modal) {
            modal.style.animation = 'modalSlideOut 0.3s ease-out';
            setTimeout(() => modal.remove(), 300);
        }
    };
    
    window.handleCreateTask = async function(event) {
        event.preventDefault();
        
        const projectId = document.getElementById('taskProjectId').value;
        
        if (!projectId) {
            alert('Please select a project');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/employee/task`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ projectId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                hideCreateTaskModal();
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 24px; border-radius: 12px; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4); z-index: 10001; animation: slideInRight 0.3s ease-out;';
                successMsg.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 8px;"></i> Task created successfully!';
                document.body.appendChild(successMsg);
                
                setTimeout(() => {
                    successMsg.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => successMsg.remove(), 300);
                }, 3000);
                
                // Reload current section
                if (currentSection === 'dashboard') {
                    await loadTodayTask();
                } else if (currentSection === 'my-tasks') {
                    await loadMyTasks();
                }
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Network error. Please try again.');
        }
    };
    
    window.showAddHourlyUpdateModal = async function(taskId) {
        try {
            // Get current task details
            const taskResponse = await fetch(`${API_URL}/employee/task/${taskId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const taskData = await taskResponse.json();
            
            if (!taskData.success) {
                alert('Error loading task details');
                return;
            }
            
            const task = taskData.data;
            const currentHour = task.hourlyUpdates.length + 1;
            const completionPercentage = task.completionPercentage || 0;
            const totalProduction = task.totalProduction || 0;
            const dailyTarget = task.dailyTarget || 0;
            
            const modalHtml = `
                <div id="hourlyUpdateModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(4px);">
                    <div style="background: var(--bg-primary); border-radius: 16px; padding: 0; max-width: 550px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.4); animation: modalSlideIn 0.3s ease-out; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 24px; color: white;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-clock" style="font-size: 24px;"></i>
                                </div>
                                <div>
                                    <h3 style="margin: 0; font-size: 24px; font-weight: 600;">Add Hourly Update</h3>
                                    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Track your production progress</p>
                                </div>
                            </div>
                        </div>
                        
                        <form id="hourlyUpdateForm" onsubmit="handleHourlyUpdate(event, '${taskId}')" style="padding: 24px;">
                            <!-- Current Progress -->
                            <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%); padding: 16px; border-radius: 12px; margin-bottom: 24px; border: 1px solid rgba(59, 130, 246, 0.2);">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                    <div>
                                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Current Progress</div>
                                        <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">${completionPercentage}%</div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Completed</div>
                                        <div style="font-size: 20px; font-weight: 600; color: #3b82f6;">${totalProduction} / ${dailyTarget}</div>
                                    </div>
                                </div>
                                <div style="width: 100%; height: 8px; background: rgba(59, 130, 246, 0.2); border-radius: 4px; overflow: hidden;">
                                    <div style="width: ${completionPercentage}%; height: 100%; background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); transition: width 0.3s ease;"></div>
                                </div>
                            </div>
                            
                            <!-- Hour Number Input -->
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: var(--text-primary); font-weight: 500; font-size: 14px;">
                                    <i class="fas fa-hourglass-half" style="margin-right: 8px; color: #3b82f6;"></i>
                                    Hour Number (1-8) *
                                </label>
                                <input type="number" id="hourNumber" min="1" max="8" value="${currentHour}" required style="width: 100%; padding: 14px 16px; border: 2px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit; font-size: 15px; transition: all 0.3s ease;">
                                <small style="color: var(--text-secondary); font-size: 12px; margin-top: 6px; display: block;">
                                    <i class="fas fa-info-circle"></i> Current hour: ${currentHour} of 8
                                </small>
                            </div>
                            
                            <!-- Production Input -->
                            <div style="margin-bottom: 24px;">
                                <label style="display: block; margin-bottom: 8px; color: var(--text-primary); font-weight: 500; font-size: 14px;">
                                    <i class="fas fa-chart-line" style="margin-right: 8px; color: #3b82f6;"></i>
                                    Production for This Hour *
                                </label>
                                <input type="number" id="hourProduction" min="0" required placeholder="Enter production amount" style="width: 100%; padding: 14px 16px; border: 2px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit; font-size: 15px; transition: all 0.3s ease;">
                                <small style="color: var(--text-secondary); font-size: 12px; margin-top: 6px; display: block;">
                                    <i class="fas fa-bullseye"></i> Target per hour: ${Math.ceil(dailyTarget / 8)}
                                </small>
                            </div>
                            
                            <!-- Predicted Progress -->
                            <div id="predictedProgress" style="background: var(--bg-secondary); padding: 14px; border-radius: 10px; margin-bottom: 24px; border-left: 3px solid #10b981; display: none;">
                                <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 13px;">
                                    <i class="fas fa-calculator" style="color: #10b981;"></i>
                                    <span>New progress will be: <strong id="newPercentage" style="color: var(--text-primary);">0%</strong></span>
                                </div>
                            </div>
                            
                            <div style="display: flex; gap: 12px;">
                                <button type="submit" style="flex: 1; padding: 14px 24px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                                    <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
                                    Add Update
                                </button>
                                <button type="button" onclick="hideHourlyUpdateModal()" style="flex: 0.4; padding: 14px 24px; background: var(--bg-secondary); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s ease;">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <style>
                    #hourNumber:focus, #hourProduction:focus {
                        outline: none;
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    }
                    
                    #hourlyUpdateForm button[type="submit"]:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
                    }
                    
                    #hourlyUpdateForm button[type="button"]:hover {
                        background: var(--bg-tertiary);
                        border-color: var(--text-secondary);
                    }
                </style>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Add production input handler to show predicted progress
            document.getElementById('hourProduction').addEventListener('input', function() {
                const production = parseInt(this.value) || 0;
                const newTotal = totalProduction + production;
                const newPercentage = Math.min(Math.round((newTotal / dailyTarget) * 100), 100);
                
                const predictedDiv = document.getElementById('predictedProgress');
                const percentageSpan = document.getElementById('newPercentage');
                
                if (production > 0) {
                    predictedDiv.style.display = 'block';
                    percentageSpan.textContent = newPercentage + '%';
                } else {
                    predictedDiv.style.display = 'none';
                }
            });
            
        } catch (error) {
            console.error('Error loading task:', error);
            alert('Network error. Please try again.');
        }
    };
    
    window.hideHourlyUpdateModal = function() {
        const modal = document.getElementById('hourlyUpdateModal');
        if (modal) {
            modal.style.animation = 'modalSlideOut 0.3s ease-out';
            setTimeout(() => modal.remove(), 300);
        }
    };
    
    window.handleHourlyUpdate = async function(event, taskId) {
        event.preventDefault();
        
        const hourNumber = parseInt(document.getElementById('hourNumber').value);
        const production = parseInt(document.getElementById('hourProduction').value);
        
        if (!hourNumber || hourNumber < 1 || hourNumber > 8) {
            alert('Please enter a valid hour number (1-8)');
            return;
        }
        
        if (!production || production < 0) {
            alert('Please enter a valid production amount');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/employee/task/${taskId}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    hourNumber,
                    production
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                hideHourlyUpdateModal();
                
                const summary = data.data.summary;
                
                // Show success message with details
                const successMsg = document.createElement('div');
                successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 20px 24px; border-radius: 12px; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4); z-index: 10001; animation: slideInRight 0.3s ease-out; max-width: 350px;';
                successMsg.innerHTML = `
                    <div style="display: flex; align-items: start; gap: 12px;">
                        <i class="fas fa-check-circle" style="font-size: 24px; margin-top: 2px;"></i>
                        <div>
                            <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">Hour ${summary.hourNumber} Updated!</div>
                            <div style="font-size: 13px; opacity: 0.95; line-height: 1.5;">
                                <div>This Hour: <strong>${summary.thisHourProduction}</strong></div>
                                <div>Total: <strong>${summary.cumulativeTotal}</strong></div>
                                <div>Progress: <strong>${summary.completionPercentage}%</strong></div>
                                <div>Remaining: <strong>${summary.remainingHours} hours</strong></div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(successMsg);
                
                setTimeout(() => {
                    successMsg.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => successMsg.remove(), 300);
                }, 5000);
                
                // Check if 8 hours completed - show submit option
                if (summary.remainingHours === 0 && summary.status !== 'completed') {
                    setTimeout(() => {
                        if (confirm('You have completed all 8 hours!\n\nWould you like to submit this task for manager approval?')) {
                            submitTaskForApproval(taskId);
                        }
                    }, 1000);
                }
                
                // Reload current section to update button
                await loadMyTasks();
            } else {
                hideHourlyUpdateModal();
                
                // Check if error is about hour already updated
                if (data.message && data.message.includes('already been updated')) {
                    alert('This hour has already been updated.\n\nRefreshing the page to show current status...');
                    await loadMyTasks();
                } else {
                    alert('Error: ' + data.message);
                }
            }
        } catch (error) {
            console.error('Error adding hourly update:', error);
            alert('Network error. Please try again.');
        }
    };
    
    window.submitTaskForApproval = async function(taskId) {
        try {
            const response = await fetch(`${API_URL}/employee/task/${taskId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px 24px; border-radius: 12px; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4); z-index: 10001; animation: slideInRight 0.3s ease-out;';
                successMsg.innerHTML = '<i class="fas fa-paper-plane" style="margin-right: 8px;"></i> Task submitted for manager approval!';
                document.body.appendChild(successMsg);
                
                setTimeout(() => {
                    successMsg.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => successMsg.remove(), 300);
                }, 3000);
                
                // Reload current section
                if (currentSection === 'dashboard') {
                    await loadEmployeeDashboardOverview();
                } else if (currentSection === 'my-tasks') {
                    await loadMyTasks();
                }
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error submitting task:', error);
            alert('Network error. Please try again.');
        }
    };
    
    window.exportReport = function() {
        alert('Export functionality coming soon!');
    };
    
    window.removeEmployeeFromProject = async function(projectId, userId, userName) {
        if (!confirm(`Are you sure you want to remove ${userName} from this project?\n\nThey will receive a notification about this removal.`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/admin/project/${projectId}/employee/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(`${userName} has been removed from the project.\n\nA notification has been sent to them.`);
                // Reload the project employees
                await loadAdminProjects();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error removing employee:', error);
            alert('Network error. Please try again.');
        }
    };
    
    window.viewProjectDetails = function(projectId) {
        alert('Project details view coming soon!');
    };
    
    window.viewProjectInvitations = async function(projectId) {
        try {
            const response = await fetch(`${API_URL}/admin/project/${projectId}/invitations`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (data.data.length === 0) {
                    alert('No invitations sent for this project yet.');
                    return;
                }
                
                const invitationsList = data.data.map(inv => 
                    `${inv.userId.name} (${inv.userId.email}) - Status: ${inv.status.toUpperCase()}`
                ).join('\n');
                
                alert(`Project Invitations:\n\n${invitationsList}`);
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error loading invitations:', error);
            alert('Network error. Please try again.');
        }
    };
    
    window.showInviteEmployeesModal = function(projectId, projectName) {
        const modalHtml = `
            <div id="inviteEmployeesModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div style="background: var(--bg-primary); border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    <h3 style="margin: 0 0 16px 0; color: var(--text-primary);">Invite Employees to ${projectName}</h3>
                    <form id="inviteEmployeesForm" onsubmit="handleInviteEmployees(event, '${projectId}')">
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 8px; color: var(--text-primary);">Employee Emails (one per line) *</label>
                            <textarea id="inviteEmployeeEmails" required placeholder="employee1@company.com&#10;employee2@company.com&#10;employee3@company.com" rows="6" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit; resize: vertical;"></textarea>
                            <small style="color: var(--text-secondary); display: block; margin-top: 8px;">
                                <i class="fas fa-info-circle"></i> Enter one email address per line. Invitations will be sent to each employee.
                            </small>
                        </div>
                        <div style="display: flex; gap: 12px; margin-top: 20px;">
                            <button type="submit" class="btn-primary" style="flex: 1;">
                                <i class="fas fa-paper-plane"></i> Send Invitations
                            </button>
                            <button type="button" class="btn-secondary" onclick="hideInviteEmployeesModal()" style="flex: 1;">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };
    
    window.hideInviteEmployeesModal = function() {
        const modal = document.getElementById('inviteEmployeesModal');
        if (modal) {
            modal.remove();
        }
    };
    
    window.handleInviteEmployees = async function(event, projectId) {
        event.preventDefault();
        
        const userEmailsText = document.getElementById('inviteEmployeeEmails').value;
        
        // Parse emails from textarea (one per line)
        const userEmails = userEmailsText
            .split('\n')
            .map(email => email.trim())
            .filter(email => email.length > 0);
        
        if (userEmails.length === 0) {
            alert('Please enter at least one employee email address');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = userEmails.filter(email => !emailRegex.test(email));
        
        if (invalidEmails.length > 0) {
            alert('Invalid email format:\n' + invalidEmails.join('\n'));
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/admin/project/${projectId}/invite-employees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ userEmails })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(`Invitations sent successfully to ${userEmails.length} employee(s)!\n\nEmployees will receive notifications and can accept/reject the invitation.`);
                hideInviteEmployeesModal();
                await loadAdminProjects();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error inviting employees:', error);
            alert('Network error. Please try again.');
        }
    };
    
    // ============================================
    // TASK APPROVAL/REJECTION
    // ============================================
    window.showApproveTaskModal = function(taskId) {
        const modalHtml = `
            <div id="approveTaskModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(4px);">
                <div style="background: var(--bg-primary); border-radius: 16px; padding: 0; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.4); overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; color: white; text-align: center;">
                        <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                            <i class="fas fa-check-circle" style="font-size: 32px;"></i>
                        </div>
                        <h3 style="margin: 0; font-size: 24px; font-weight: 600;">Approve Task</h3>
                        <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Confirm task completion and provide feedback</p>
                    </div>
                    
                    <form id="approveTaskForm" onsubmit="handleApproveTask(event, '${taskId}')" style="padding: 24px;">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: var(--text-primary); font-weight: 500; font-size: 14px;">
                                <i class="fas fa-comment" style="margin-right: 8px; color: #10b981;"></i>
                                Feedback (Optional)
                            </label>
                            <textarea id="approveFeedback" placeholder="Great work! Keep it up..." rows="4" style="width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit; resize: vertical; font-size: 14px;"></textarea>
                        </div>
                        
                        <div style="display: flex; gap: 12px;">
                            <button type="submit" style="flex: 1; padding: 14px 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s ease;">
                                <i class="fas fa-check" style="margin-right: 8px;"></i>
                                Approve Task
                            </button>
                            <button type="button" onclick="hideApproveTaskModal()" style="flex: 0.4; padding: 14px 24px; background: var(--bg-secondary); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer;">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };
    
    window.hideApproveTaskModal = function() {
        const modal = document.getElementById('approveTaskModal');
        if (modal) modal.remove();
    };
    
    window.handleApproveTask = async function(event, taskId) {
        event.preventDefault();
        
        const feedback = document.getElementById('approveFeedback').value.trim();
        
        try {
            const response = await fetch(`${API_URL}/admin/task/${taskId}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ 
                    approved: true,
                    feedback: feedback || 'Task approved successfully!'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                hideApproveTaskModal();
                
                // Show success toast
                const toast = document.createElement('div');
                toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 24px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10001; animation: slideInRight 0.3s ease-out;';
                toast.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 8px;"></i> Task approved successfully!';
                document.body.appendChild(toast);
                
                setTimeout(() => toast.remove(), 3000);
                
                // Reload tasks
                await loadTasks();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error approving task:', error);
            alert('Network error. Please try again.');
        }
    };
    
    window.showRejectTaskModal = function(taskId) {
        const modalHtml = `
            <div id="rejectTaskModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(4px);">
                <div style="background: var(--bg-primary); border-radius: 16px; padding: 0; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.4); overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 24px; color: white; text-align: center;">
                        <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                            <i class="fas fa-times-circle" style="font-size: 32px;"></i>
                        </div>
                        <h3 style="margin: 0; font-size: 24px; font-weight: 600;">Reject Task</h3>
                        <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Provide feedback for improvement</p>
                    </div>
                    
                    <form id="rejectTaskForm" onsubmit="handleRejectTask(event, '${taskId}')" style="padding: 24px;">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: var(--text-primary); font-weight: 500; font-size: 14px;">
                                <i class="fas fa-comment" style="margin-right: 8px; color: #ef4444;"></i>
                                Feedback (Required) *
                            </label>
                            <textarea id="rejectFeedback" required placeholder="Please explain what needs to be improved..." rows="4" style="width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit; resize: vertical; font-size: 14px;"></textarea>
                            <small style="color: var(--text-secondary); display: block; margin-top: 8px;">
                                <i class="fas fa-info-circle"></i> Feedback is required when rejecting a task
                            </small>
                        </div>
                        
                        <div style="display: flex; gap: 12px;">
                            <button type="submit" style="flex: 1; padding: 14px 24px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s ease;">
                                <i class="fas fa-times" style="margin-right: 8px;"></i>
                                Reject Task
                            </button>
                            <button type="button" onclick="hideRejectTaskModal()" style="flex: 0.4; padding: 14px 24px; background: var(--bg-secondary); color: var(--text-primary); border: 2px solid var(--border-color); border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer;">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    };
    
    window.hideRejectTaskModal = function() {
        const modal = document.getElementById('rejectTaskModal');
        if (modal) modal.remove();
    };
    
    window.handleRejectTask = async function(event, taskId) {
        event.preventDefault();
        
        const feedback = document.getElementById('rejectFeedback').value.trim();
        
        if (!feedback) {
            alert('Please provide feedback when rejecting a task');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/admin/task/${taskId}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ 
                    approved: false,
                    feedback: feedback
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                hideRejectTaskModal();
                
                // Show warning toast
                const toast = document.createElement('div');
                toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 16px 24px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10001; animation: slideInRight 0.3s ease-out;';
                toast.innerHTML = '<i class="fas fa-times-circle" style="margin-right: 8px;"></i> Task rejected with feedback';
                document.body.appendChild(toast);
                
                setTimeout(() => toast.remove(), 3000);
                
                // Reload tasks
                await loadTasks();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error rejecting task:', error);
            alert('Network error. Please try again.');
        }
    };
    
    // ============================================
    // NOTIFICATIONS
    // ============================================
    function setupNotifications() {
        const notificationBtn = document.querySelector('.notification-btn');
        const notificationPanel = document.querySelector('.notification-panel');
        const markAllReadBtn = document.querySelector('.btn-mark-read');
        
        if (notificationBtn && notificationPanel) {
            notificationBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                notificationPanel.classList.toggle('active');
                
                // Reload notifications when panel is opened
                if (notificationPanel.classList.contains('active')) {
                    loadNotifications();
                }
            });
            
            document.addEventListener('click', function(e) {
                if (!notificationPanel.contains(e.target) && !notificationBtn.contains(e.target)) {
                    notificationPanel.classList.remove('active');
                }
            });
        }
        
        // Connect mark all as read button
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                markAllNotificationsAsRead();
            });
        }
        
        // Initial load
        loadNotifications();
        
        // Refresh notifications every 30 seconds
        setInterval(loadNotifications, 30000);
    }
    
    async function loadNotifications() {
        try {
            const response = await fetch(`${API_URL}/notifications`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            const notificationList = document.querySelector('.notification-list');
            
            if (data.success) {
                // Update badge count
                const badge = document.querySelector('.notification-badge');
                if (badge) {
                    badge.textContent = data.unreadCount || 0;
                    badge.style.display = data.unreadCount > 0 ? 'flex' : 'none';
                }
                
                // Populate notification list
                if (notificationList) {
                    if (data.data && data.data.length > 0) {
                        notificationList.innerHTML = data.data.map(notification => {
                            const isUnread = !notification.isRead;
                            const timeAgo = formatTimeAgo(new Date(notification.createdAt));
                            
                            // Icon based on notification type
                            let icon = 'fa-bell';
                            let iconColor = '#3b82f6';
                            
                            if (notification.type === 'task_completed' || notification.type === 'task_approved') {
                                icon = 'fa-check-circle';
                                iconColor = '#10b981';
                            } else if (notification.type === 'task_rejected') {
                                icon = 'fa-times-circle';
                                iconColor = '#ef4444';
                            } else if (notification.type === 'project_assigned' || notification.type === 'project_invitation') {
                                icon = 'fa-project-diagram';
                                iconColor = '#8b5cf6';
                            } else if (notification.type === 'invitation_accepted') {
                                icon = 'fa-user-check';
                                iconColor = '#10b981';
                            } else if (notification.type === 'invitation_rejected') {
                                icon = 'fa-user-times';
                                iconColor = '#ef4444';
                            }
                            
                            return `
                                <div class="notification-item ${isUnread ? 'unread' : ''}" onclick="markNotificationAsRead('${notification._id}')" style="cursor: pointer;">
                                    <div class="notification-icon" style="background: ${iconColor}20; color: ${iconColor};">
                                        <i class="fas ${icon}"></i>
                                    </div>
                                    <div class="notification-content">
                                        <h4>${notification.title}</h4>
                                        <p>${notification.message}</p>
                                        <span class="notification-time">${timeAgo}</span>
                                    </div>
                                    ${isUnread ? '<div class="unread-dot"></div>' : ''}
                                </div>
                            `;
                        }).join('');
                    } else {
                        notificationList.innerHTML = '<p class="no-data" style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">No notifications yet</p>';
                    }
                }
            } else {
                if (notificationList) {
                    notificationList.innerHTML = '<p class="error" style="text-align: center; padding: 20px; color: #ef4444;">Error loading notifications</p>';
                }
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            const notificationList = document.querySelector('.notification-list');
            if (notificationList) {
                notificationList.innerHTML = '<p class="error" style="text-align: center; padding: 20px; color: #ef4444;">Failed to load notifications</p>';
            }
        }
    }
    
    // Helper function to format time ago
    function formatTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        
        const months = Math.floor(days / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    
    // Mark notification as read
    window.markNotificationAsRead = async function(notificationId) {
        try {
            await fetch(`${API_URL}/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            // Reload notifications
            await loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };
    
    // Mark all as read
    window.markAllNotificationsAsRead = async function() {
        try {
            const response = await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            const data = await response.json();
            
            if (data.success) {
                await loadNotifications();
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };
    
    // ============================================
    // LOGOUT
    // ============================================
    function handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
    }
    
    console.log('Dashboard initialized successfully');
});
