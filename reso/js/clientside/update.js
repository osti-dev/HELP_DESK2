console.log('Update.js is loaded...');

function getDateOnly(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}-${year}`;
}

async function filterTicketRefNumb() {
    const submitUpdate = $('#submitUpdate');
    const filteredArea = $('#updateDetailsCntr');
    const enterTrnCntr = $('.entertrnCntr');

    submitUpdate.on('click', async function() {
        const currentTicketRefNumber = $('#trn').val();

        if (!currentTicketRefNumber) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Please enter the Ticket Reference Number.",
                showConfirmButton: false,
                timer: 2000
            });
            return;
        }
        filteredArea.html('');
        filteredArea.show();
        enterTrnCntr.hide();

        try {
            const response = await fetch(`/api/ticket/${currentTicketRefNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // throw new Error(`HTTP error! status: ${response.status}`);
                    Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    html: "<span style='color: #D25D5D;'>Invalid entered Ticket Reference Number.</span><br> Please check the number and try again.",
                    showConfirmButton: false,
                    timer: 3000
                });
                filteredArea.html('');
                filteredArea.hide();
                enterTrnCntr.show();
                $('#trn').val('');
                return;
            }

            const data = await response.json();
            console.log('API response:', data);
            console.log('Status:', data.ticket ? data.ticket.status : 'No ticket status');

            if (!data.ticket) {
                // filteredArea.html('<p class="text-red-500">No ticket data found.</p>');
                  Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    html: "<h1>Invalid entered Ticker Reference Number.</h1>",
                    text: "Please check the number and try again.",
                    showConfirmButton: false,
                    timer: 2000
                });
                return;
            }

            const ticket = data.ticket;

            const escapeHtml = (unsafe) => {
    // If unsafe is undefined, null, or not a string, return an empty string or a safe default
                if (unsafe === null || unsafe === undefined) {
                    return '';
                }
                // Convert to string to handle numbers or other types
                const safeString = String(unsafe);
                return safeString
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            };
            // // Escape HTML to prevent XSS
            // const escapeHtml = (unsafe) => {
            //     return unsafe
            //         .replace(/&/g, "&amp;")
            //         .replace(/</g, "&lt;")
            //         .replace(/>/g, "&gt;")
            //         .replace(/"/g, "&quot;")
            //         .replace(/'/g, "&#039;");
            // };

            switch (ticket.status) {
                case 'OPEN':
                    filteredArea.html(`
                        <div class="ticket-details p-4 border rounded">
                            <h2 class="text-xl font-bold">YOUR TICKET REFERENCE NUMBER CURRENT STATUS:</h2>
                            <h4 style="color: #838383ff;">Ticket Details</h4>
                            <p class="trnColor"><strong>Ticket ID: </strong> ${escapeHtml(ticket.id.toString())}</p>
                            <p class="statusColor"><strong>Current Status: </strong> ${escapeHtml(ticket.status)}</p>
                            <p><strong>Subject: </strong> ${escapeHtml(ticket.subject)}</p>
                            <p><strong>Description: </strong> ${escapeHtml(ticket.description)}</p>
                            <p><strong>Schedule: </strong> ${escapeHtml(getDateOnly(ticket.schedule))}</p>
                            <h4 style="border-top: 1px solid gray; width: 100%; color: #838383ff; padding-top: 10px;">Assignment</h4>
                            <p><strong>Assigned Department: </strong> ${escapeHtml(ticket.assigned_team)}</p>
                            <p><strong>Department Leader: </strong> ${escapeHtml(ticket.team_leader)}</p>
                            <h4 style="border-top: 1px solid gray; width: 100%; color: #838383ff; padding-top: 10px;">Requestor Information</h4>
                            <p><strong>Company Name: </strong> ${escapeHtml(ticket.company_name)}</p>
                            <p><strong>Name: </strong> ${escapeHtml(ticket.name)}</p>
                            <p><strong>Email: </strong> ${escapeHtml(ticket.email)}</p>
                            <p><strong>Contact Number: </strong> ${escapeHtml(ticket.contact_numb)}</p>
                            <p><strong>Address: </strong> ${escapeHtml(ticket.address)}</p>
                            <input type="submit" id="back" value="BACK" class="back-btn">
                        </div>
                    `);
                    break;
                case 'IN-PROGRESS':
                    filteredArea.html(`
                        <div class="ticket-details p-4 border rounded">
                            <h2 class="text-xl font-bold">YOUR TICKET REFERENCE NUMBER CURRENT STATUS:</h2>
                            <h4 style="color: #838383ff;">Ticket Details</h4>
                            <p class="trnColor"><strong>Ticket ID: </strong> ${escapeHtml(ticket.id.toString())}</p>
                            <p class="statusColor"><strong>Current Status: </strong> ${escapeHtml(ticket.status)}</p>
                            <p><strong>Subject: </strong> ${escapeHtml(ticket.subject)}</p>
                            <p><strong>Description: </strong> ${escapeHtml(ticket.description)}</p>
                            <h4 style="border-top: 1px solid gray; width: 100%; color: #838383ff; padding-top: 10px;">Escalation Workflow</h4>
                            <p><strong>Escalation Level : </strong>${escapeHtml(ticket.current_level)}</p>
                            <p><strong>Action Taken: </strong>${escapeHtml(ticket.current_action)}</p>
                            <p><strong>Resolution Notes: </strong>${escapeHtml(ticket.current_attempt)}</p>
                            <p><strong>Last Updated: </strong> ${escapeHtml(getDateOnly(ticket.updated_at))}</p>
                            <h4 style="border-top: 1px solid gray; width: 100%; color: #838383ff; padding-top: 10px;">Assignment</h4>
                            <p><strong>Assigned Department: </strong> ${escapeHtml(ticket.assigned_team)}</p>
                            <p><strong>Department Leader: </strong> ${escapeHtml(ticket.team_leader)}</p>
                            <h4 style="border-top: 1px solid gray; width: 100%; color: #838383ff; padding-top: 10px;">Requestor Information</h4>
                            <p><strong>Company Name: </strong> ${escapeHtml(ticket.company_name)}</p>
                            <p><strong>Name: </strong> ${escapeHtml(ticket.name)}</p>
                            <p><strong>Email: </strong> ${escapeHtml(ticket.email)}</p>
                            <input type="submit" id="back" value="BACK" class="back-btn">
                        </div>
                    `);
                    break;
                case 'CLOSED':
                    filteredArea.html(`
                        <div class="ticket-details p-4 border rounded">
                            <h2 class="text-xl font-bold">YOUR TICKET REFERENCE NUMBER CURRENT STATUS:</h2>
                            <h4 style="color: #838383ff;">Ticket Details</h4>
                            <p class="trnColor"><strong>Ticket ID: </strong> ${escapeHtml(ticket.id.toString())}</p>
                            <p class="statusColor"><strong>Current Status: </strong> ${escapeHtml(ticket.status)}</p>
                            <p><strong>Subject: </strong>${escapeHtml(ticket.subject)}</p>
                            <h4 style="border-top: 1px solid gray; width: 100%; color: #838383ff; padding-top: 10px;">Requestor Information</h4>
                            <p><strong>Company Name: </strong> ${escapeHtml(ticket.company_name)}</p>
                            <p><strong>Name: </strong> ${escapeHtml(ticket.name)}</p>
                            <p><strong>Description: </strong> ${escapeHtml(ticket.description)}</p>
                            <br>
                            <p style=" display: flex; justify-content: center; font-size: 16px;  color: #B12C00;"><i>Your Ticket Reference Number has been marked as CLOSED. The issue you reported has been successfully resolved. If you encounter any further concerns, please feel free to submit a new support request. Thank you, and have a great day!</i></p>
                            <br>
                            <input type="submit" id="back" value="BACK" class="back-btn">
                        </div>
                    `);
                    break;
                default:
                    filteredArea.html(`<p class="text-red-500">Unknown ticket status: ${escapeHtml(ticket.status)}</p>`);
                    break;
            }

            $('#back').on('click', function(){
                filteredArea.html('');
                filteredArea.hide();
                enterTrnCntr.show();
                $('#trn').val('');
            });

        } catch (error) {
            console.error('Error fetching ticket:', error);
            filteredArea.html('<p class="text-red-500">Error fetching ticket details. Please try again later.</p>');
            filteredArea.html('');
            filteredArea.hide();
            enterTrnCntr.show();
            $('#trn').val('');
        }
    });
}
