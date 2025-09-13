$(document).ready(function () {
    $('#requestForm').on('submit', function (event) {
        event.preventDefault(); // Prevent default form submission
        submitRequest();
    });
});

async function submitRequest() { 
    const $submitButton = $('#submitRequest');
    const originalButtonText = $submitButton.val();
    $submitButton.prop('disabled', true).val('Submitting...'); 

    // Show loading SweetAlert (stays until manually closed)
    Swal.fire({
        title: "Submitting...",
        html: "Please wait while your request is being processed.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        // Collect form data
        const formData = {
            company_name: $('#companyName').val(),
            name: $('#name').val(),
            email: $('#email').val(),
            contact_numb: $('#contactNumber').val(),
            address: $('#address').val(),
            schedule: $('#date').val(),
            subject: $('#subject').val(),
            description: $('#description').val()
        };

        // Basic client-side validation
        for (const [key, value] of Object.entries(formData)) {
            if (!value) {
                throw new Error(`Please fill in the ${key.replace('_', ' ')} field`);
            }
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            throw new Error('Please enter a valid email address');
        }

        // Send request
        const response = await fetch('/api/request-ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok || !(result.status === "ok" || result.status === "success")) {
            throw new Error(result.error || 'Failed to submit request');
        }

        // Close loading SweetAlert
        await Swal.close();

        // Show success SweetAlert
        await Swal.fire({
            position: "center",
            icon: "success",
            title: "Your request has been submitted.",
            text: "Check your email for Ticket Reference Number",
            showConfirmButton: false,
            timer: 5000
        });

        $submitButton.val('Submitted');
        $('#requestForm')[0].reset(); // Reset form after success
    } catch (error) {
        console.error('Error submitting request:', error);
        
        // Close loading SweetAlert
        await Swal.close();

        // Show error SweetAlert
        await Swal.fire({
            title: "Error!",
            text: error.message || 'An error occurred while submitting your request. Please try again later.',
            icon: "error",
            confirmButtonText: "OK"
        });
    } finally {
        $submitButton.prop('disabled', false).val(originalButtonText);
    }
}
