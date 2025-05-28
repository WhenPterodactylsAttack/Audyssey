document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.querySelector('.btn-login');
    const signupBtn = document.querySelector('.btn-primary');
    const modal = document.getElementById('authModal');
    const closeBtn = document.querySelector('.close-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const getStartedBtn = document.querySelector('.hero-content .btn-large');
    
    // login tab modal
    loginBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
        showTab('login');
    });
    
    // signup tab
    signupBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
        showTab('signup');
    });
    
    // close
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showTab(tabName);
        });
    });
    
    function showTab(tabName) {
        tabBtns.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        tabContents.forEach(content => {
            if (content.id === tabName) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
    }

    getStartedBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
        showTab('login');
    });
    
    // placeholder for auth stuff (@backend people)
    const authForms = document.querySelectorAll('.auth-form');
    authForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            modal.style.display = 'none';
            window.location.href= './games.html'; // redirect to games page after login/signup
        });
    });
});