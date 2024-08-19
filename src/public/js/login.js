document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Server error');
        }

        alert('Login successful');
        
        // Chuyển hướng đến trang chủ hoặc trang khác
        window.location.href = '/'; // Chuyển hướng đến trang chủ
    } catch (error) {
        alert(error.message || 'Server error');
    }
});
