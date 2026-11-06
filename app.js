// ==========================================
// JOBS IN PAKISTAN - FRONTEND LOGIC
// ==========================================

const API_URL = 'https://script.google.com/macros/s/AKfycby7GvcrzzGKUDKm6raySb1bTzJEzv0EKlqobSU4PWLFkiLNDOkQawmuu9N7orajSAtpGw/exec';

document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const btnClear = document.getElementById('btn-clear');
    const btnSearch = document.getElementById('btn-search');
    const jobListings = document.getElementById('job-listings');
    const liveCounter = document.getElementById('live-counter');
    const resultsTitle = document.getElementById('results-title');
    
    // Current Search State
    let currentCategory = 'all';

    // 1. Initial Load
    fetchJobs();

    // 2. Tab Switching Logic
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            currentCategory = button.getAttribute('data-category');
            adjustFiltersForCategory(currentCategory);
            
            // Fetch jobs for the new tab
            fetchJobs();
        });
    });

    // 3. Search Button Logic
    btnSearch.addEventListener('click', () => {
        fetchJobs();
    });

    // 4. Clear Filters Logic
    btnClear.addEventListener('click', () => {
        document.querySelectorAll('.filter-dropdown').forEach(dropdown => dropdown.value = "");
        document.getElementById('keyword-search').value = "";
        fetchJobs();
    });

    // 5. Adjust Filter Visibility Based on Tab
    function adjustFiltersForCategory(category) {
        const salaryFilter = document.getElementById('filter-salary');
        if (category === 'government') {
            salaryFilter.innerHTML = `
                <option value="">BPS Scale</option>
                <option value="BPS-01">BPS-01 to 05</option>
                <option value="BPS-11">BPS-11 to 15</option>
                <option value="BPS-16">BPS-16</option>
                <option value="BPS-17">BPS-17 and above</option>
            `;
        } else if (category === 'private') {
            salaryFilter.innerHTML = `
                <option value="">Salary Range</option>
                <option value="25k">Below Rs. 25,000</option>
                <option value="50k">Rs. 25,000 - 50,000</option>
                <option value="100k">Rs. 50,000 - 100,000</option>
            `;
        } else {
            salaryFilter.innerHTML = `<option value="">BPS / Salary</option>`;
        }
    }

    // 6. Fetch Data from Google Sheets API
    async function fetchJobs() {
        // Show loading state
        jobListings.innerHTML = '<div class="text-center" style="padding: 40px; color: var(--text-muted);">Loading latest jobs from database...</div>';
        
        // Gather filter values
        const keyword = document.getElementById('keyword-search').value;
        const location = document.getElementById('filter-location').value;
        const education = document.getElementById('filter-education').value;
        const field = document.getElementById('filter-field').value;
        const experience = document.getElementById('filter-experience').value;
        const jobType = document.getElementById('filter-type').value;

        // Build the URL with search parameters
        const url = new URL(API_URL);
        url.searchParams.append('category', currentCategory);
        if (keyword) url.searchParams.append('keyword', keyword);
        if (location) url.searchParams.append('location', location);
        if (education) url.searchParams.append('education', education);
        if (field) url.searchParams.append('field', field);
        if (experience) url.searchParams.append('experience', experience);
        if (jobType) url.searchParams.append('jobType', jobType);

        try {
            const response = await fetch(url);
            const result = await response.json();
            
            if (result.status === 'success') {
                displayJobs(result.data.jobs, result.data.pagination.totalJobs);
            } else {
                showError("Could not load jobs. Please try again later.");
            }
        } catch (error) {
            showError("Network error. Please check your internet connection.");
        }
    }

    // 7. Display the Job Cards
    function displayJobs(jobs, totalJobsCount) {
        liveCounter.innerText = `Discover ${totalJobsCount} Opportunities Across Pakistan`;
        resultsTitle.innerText = currentCategory === 'all' ? 'Latest Jobs' : `${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Jobs`;
        
        if (jobs.length === 0) {
            jobListings.innerHTML = '<div class="text-center" style="padding: 40px; color: var(--text-muted);">No jobs found matching your criteria. Try clearing filters.</div>';
            return;
        }

        let html = '';
        jobs.forEach(job => {
            const badgeClass = job['Job Category'].toLowerCase() === 'government' ? 'badge-gov' : 'badge-private';
            const salaryOrBps = job['BPS / PPS Scale'] ? job['BPS / PPS Scale'] : (job['Salary Minimum'] ? `Rs. ${job['Salary Minimum']}+` : 'Salary Not Mentioned');
            
            html += `
                <div class="job-card">
                    <h3 class="job-title">${job['Job Title']}</h3>
                    <p class="job-org">${job['Organization']} · ${job['City']}</p>
                    <div class="job-badges">
                        <span class="badge ${badgeClass}">${job['Job Category']}</span>
                        <span class="badge badge-neutral">${salaryOrBps}</span>
                        <span class="badge badge-neutral">${job['Education']}</span>
                        <span class="badge badge-neutral">${job['Job Type']}</span>
                    </div>
                    <button class="view-details" onclick="window.open('${job['Application URL'] || job['Source URL']}', '_blank')">View Details & Apply →</button>
                </div>
            `;
        });
        
        jobListings.innerHTML = html;
    }

    function showError(msg) {
        jobListings.innerHTML = `<div class="text-center" style="padding: 40px; color: #dc2626;">${msg}</div>`;
        liveCounter.innerText = "System temporarily unavailable";
    }
});