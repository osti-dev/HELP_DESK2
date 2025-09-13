
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}


console.log('dashboard.js is loaded.....');

const tableBody = $('#dataTable tbody');

let nowPH = new Date(new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }));

function getDateOnly(dateString) {
    if (!dateString || typeof dateString !== 'string') {
        return 'Invalid Date';
    }

    try {
        const date = new Date(dateString);

        // Convert to Philippines local time
        const options = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' };
        const [month, day, year] = date.toLocaleDateString('en-PH', options).split('/');

        // MySQL format: YYYY-MM-DD
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.warn('Invalid date format:', dateString);
        return 'Invalid Date';
    }
}



// function getDateOnly(dateString) {
//     if (!dateString || typeof dateString !== 'string') {
//         return 'Invalid Date';
//     }
    
//     try {
//         const datePart = dateString.split('T')[0];
//         const [year, month, day] = datePart.split('-');
//         if (!year || !month || !day) {
//             return 'Invalid Date';
//         }
//         return `${month.padStart(2, '0')}-${day.padStart(2, '0')}-${year}`;
//     } catch (error) {
//         console.warn('Invalid date format:', dateString);
//         return 'Invalid Date';
//     }
// }

function getCurrentDatePH() {
    // Get PH time
    let nowPH = new Date(new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }));

    let month = String(nowPH.getMonth() + 1).padStart(2, '0');
    let day = String(nowPH.getDate()).padStart(2, '0');
    let year = nowPH.getFullYear();

    return `${month}-${day}-${year}`;
}

function populateTable(tickets) {
    tableBody.empty();
    
    if (!Array.isArray(tickets) || tickets.length === 0) {
        tableBody.append(
            $('<tr>').append(
                $('<td>').attr('colspan', 17).text('No data available').css({ textAlign: 'center' })
            )
        );
        return;
    }

    tickets.forEach(ticket => {
        if (!ticket) return;

        const row = `
            <tr data-ticket-id="${ticket.id}">
                <td>${ticket.id || ''}</td>
                <td>${ticket.status || ''}</td>
                <td>${ticket.company_name || ''}</td>
                <td>${ticket.subject || ''}</td>
                <td class="descript">${ticket.description || ''}</td>
                <td>${getDateOnly(ticket.schedule) || ''}</td>
                <td>${ticket.priority || ''}</td>
                <td>${ticket.category || ''}</td>
                <td>${ticket.current_level || ''}</td>
                <td>${ticket.current_action || ''}</td>
                <td>${ticket.current_attempt || ''}</td>
                <td>${getDateOnly(ticket.updated_at) || ''}</td>
                <td>${ticket.assigned_team || ''}</td>
                <td>${ticket.team_leader || ''}</td>
                <td>${ticket.assigned_person || ''}</td>
                <td class="td-name">${ticket.name || ''}</td>
                <td>${ticket.email || ''}</td>
                <td>${ticket.contact_numb || ''}</td>
                <td>${ticket.address || ''}</td>
                <td>${getDateOnly(ticket.created_at) || ''}</td>
            </tr>`;
        tableBody.append(row);
    });
}

async function fetchAllData() {
    try {
        tableBody.empty();
        $('.error-message').remove();

        tableBody.append(
            $('<tr>').append(
                $('<td>').attr('colspan', 17).text('Loading...').css({ textAlign: 'center' })
            )
        );

        const response = await fetch('/api/filter-tickets-details', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const tickets = data.tickets || [];
        populateTable(tickets);
    } catch (error) {
        console.error('Error fetching data:', error);
        tableBody.empty();
        $('.error-message').remove();
        $('#dataTable').after(
            $('<div>').addClass('error-message')
                .text('Failed to load data. Please try again later.')
                .css({
                    color: 'red',
                    margin: '10px 0',
                    fontSize: '1rem',
                    textAlign: 'center'
                })
        );
    }
}

async function fetchDataBasedOnStatus(status) {
    try {
        tableBody.empty();
        $('.error-message').remove();

        tableBody.append(
            $('<tr>').append(
                $('<td>').attr('colspan', 20).text('Loading...').css({ textAlign: 'center' })
            )
        );

        const response = await fetch(`/api/filter-tickets-details/stats?status=${status}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const tickets = (data.tickets || []).filter(row => row.status === status);
        populateTable(tickets);
    } catch (error) {
        console.error(`Error fetching ${status} tickets:`, error);
        tableBody.empty();
        $('.error-message').remove();
        $('#dataTable').after(
            $('<div>').addClass('error-message')
                .text(`Failed to load ${status} tickets. Please try again later.`)
                .css({
                    color: 'red',
                    margin: '10px 0',
                    fontSize: '1rem',
                    textAlign: 'center'
                })
        );
    }
}

async function fetchDataBasedOnPriority(priority) {
    try {
        tableBody.empty();
        $('.error-message').remove();

        tableBody.append(
            $('<tr>').append(
                $('<td>').attr('colspan', 20).text('Loading...').css({ textAlign: 'center' })
            )
        );

        const response = await fetch(`/api/filter-tickets-details/stats?priority=${priority}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const tickets = (data.tickets || []).filter(row => row.priority === priority);
        populateTable(tickets);
    } catch (error) {
        console.error(`Error fetching ${priority} tickets:`, error);
        tableBody.empty();
        $('.error-message').remove();
        $('#dataTable').after(
            $('<div>').addClass('error-message')
                .text(`Failed to load ${priority} tickets. Please try again later.`)
                .css({
                    color: 'red',
                    margin: '10px 0',
                    fontSize: '1rem',
                    textAlign: 'center'
                })
        );
    }
}

function openEditPopup(ticketId) {
    const overlay = $('.modal-overlay');
    const editPopup = $('.edit-modal');

    overlay.css('display', 'flex');

    $.ajax({
        url: `/api/ticket/${ticketId}`,
        method: 'GET',
        success: function(response) {
            const ticket = response.ticket;

            $('#ticketId').text(ticket.id || '');
            $('#editStatus').val(ticket.status || '');
            $('#companyName').text(ticket.company_name || '');
            $('#requestorName').text(ticket.name || '');
            $('#subject').text(ticket.subject || '');
            $('#description').text(ticket.description || '');
            $('#editPriority').val(ticket.priority || '');
            $('#schedule').text(getDateOnly(ticket.schedule) || '');
            $('#editCategory').val(ticket.category || '');
            $('#editLevelNumber').val(ticket.current_level || '');
            $('#editLevelAction').val(ticket.current_action || '');
            $('#editLevelAttempt').val(ticket.current_attempt || '');
            $('#address').text(ticket.address || '');  
            $('#contactNumber').text(ticket.contact_numb || '');
            $('#editAssignedTeam').val(ticket.assigned_team || '');
            $('#editTeamLeader').val(ticket.team_leader || '');
            $('#email').text(ticket.email || '');
            $('#editAssignedPerson').val(ticket.assigned_person || '');
            $('#editCreatedAt').val(getDateOnly(ticket.created_at) || '');
            // $('#editUpdatedAt').val(getCurrentDatePH(ticket.updated_at) || '');
            $('#editUpdatedAt').val(getDateOnly(new Date().toISOString().slice(0, 19).replace('T', ' ')));
            // $('#editUpdatedAt').val(new Date().toLocaleString('en-PH', { hour12: false }).replace(',', ''));
            // $('#editUpdatedAt').val(getDateOnly(new Date().toISOString()));
            // $('#editUpdatedAt').val(getDateOnly(new Date().toLocaleString('en-PH', { hour12: false })));
            // $('#editUpdatedAt').val(getDateOnly(nowPH.toISOString()));
            // $('#editUpdatedAt').val(getDateOnly(new Date().toISOString('en-PH', {hour12: false}).slice(0, 19).replace('T', ' ')));

        },
        error: function(error) {
            console.error('Error fetching ticket details:', error);
            alert('Failed to load ticket details. Please try again.');
            overlay.css('display', 'none');
        }
    });

    overlay.off('click').on('click', function(e) {
        if (e.target === this) {
            overlay.css('display', 'none');
        }
    });

    editPopup.off('click').on('click', function(event) {
        event.stopPropagation();
    });

    $('#requestForm').off('submit').on('submit', function(event) {
        event.preventDefault();
        updateTicket(ticketId);
    });

    $('#escalate').off('click').on('click', function(event){
        event.preventDefault();
        levelEscalation(ticketId);
    });

    $('#cancelUpdate').off('click').on('click', function() {
        overlay.css('display', 'none');
    });
}

function levelEscalation(ticketId) {
    const newLevel = $('#editLevelNumber').val();
    const newAction = $('#editLevelAction').val();
    const newAttempt = $('#editLevelAttempt').val();

    // Validate inputs
    if (!newLevel || !newAction || !newAttempt) {
        alert('Please fill in all escalation fields (Level, Action, Attempt).');
        return;
    }

    // Fetch current ticket data
    $.ajax({
        url: `/api/ticket/${ticketId}`,
        type: 'GET',
        success: function(currentData) {
            const ticket = currentData.ticket || {};
            // Prepare new history entry with updated_at
            const currentTime = getDateOnly(new Date().toISOString().slice(0, 19).replace('T', ' '));
            const newHistoryEntry = {
                level: ticket.current_level || '',
                action: ticket.current_action || '',
                attempt: ticket.current_attempt || '',
                updated_at: currentTime // Add updated_at to history
            };

            // Get existing history (handle object, string, or null/undefined)
            let existingHistory = [];
            if (ticket.escalation_level_history) {
                if (typeof ticket.escalation_level_history === 'string') {
                    try {
                        existingHistory = JSON.parse(ticket.escalation_level_history);
                    } catch (e) {
                        console.error('Error parsing escalation_level_history:', e);
                        existingHistory = []; // Fallback to empty array on parse error
                    }
                } else if (Array.isArray(ticket.escalation_level_history)) {
                    existingHistory = ticket.escalation_level_history; // Already an array
                } else {
                    console.warn('escalation_level_history is not an array or valid JSON, initializing as empty array');
                    existingHistory = []; // Fallback to empty array
                }
            }

            // Ensure existingHistory is an array
            if (!Array.isArray(existingHistory)) {
                console.warn('escalation_level_history is not an array, initializing as empty array');
                existingHistory = [];
            }

            // Append new history entry to existing history
            existingHistory.push(newHistoryEntry);

            // Update request with new data and updated history
            $.ajax({
                url: `/api/ticket-level-tohistory/${ticketId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    current_level: newLevel,
                    current_action: newAction,
                    current_attempt: newAttempt,
                    escalation_level_history: existingHistory,
                    updated_at: currentTime // Send updated_at for the ticket
                }),
                success: function() {
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Support request escalated successfully.",
                        showConfirmButton: false,
                        timer: 3000
                    });
                    $('.modal-overlay').css('display', 'none'); // Close modal
                    fetchAllData(); // Refresh table
                },
                error: function(xhr, status, error) {
                    console.error('Error escalating ticket:', error);
                    alert('An error occurred while escalating the request: ' + (xhr.responseJSON?.error || error));
                }
            });
        },
        error: function(xhr, status, error) {
            console.error('Error fetching current ticket data:', error);
            alert('An error occurred while fetching current data: ' + (xhr.responseJSON?.error || error));
        }
    });
}

function updateTicket(ticketId) {
    const updatedData = {
        status: $('#editStatus').val(),
        priority: $('#editPriority').val(),
        category: $('#editCategory').val(),
        assigned_team: $('#editAssignedTeam').val(),
        team_leader: $('#editTeamLeader').val(),
        assigned_person: $('#editAssignedPerson').val(),
        updated_at: $('#editUpdatedAt').val(),
        current_level: $('#editLevelNumber').val(),
        current_action: $('#editLevelAction').val(),
        current_attempt: $('#editLevelAttempt').val()
    };

    let timerInterval;
    Swal.fire({
        title: "Updating Ticket...",
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
                timer.textContent = `${Swal.getTimerLeft()}`;
            }, 100);
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false
    });

    $.ajax({
        url: `/api/ticket/${ticketId}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(updatedData),
        success: function(response) {
            clearInterval(timerInterval);
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Ticket updated successfully.",
                showConfirmButton: false,
                timer: 3000
            });
            $('.modal-overlay').css('display', 'none');
            fetchAllData();
        },
        error: function(error) {
            clearInterval(timerInterval);
            console.error('Error updating ticket:', error);
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Failed to update ticket.",
                showConfirmButton: true
            });
        }
    });
}

// function updateTicket(ticketId) {
//     const updatedData = {
//         status: $('#editStatus').val(),
//         priority: $('#editPriority').val(),
//         category: $('#editCategory').val(),
//         assigned_team: $('#editAssignedTeam').val(),
//         team_leader: $('#editTeamLeader').val(),
//         assigned_person: $('#editAssignedPerson').val(),
//         updated_at: $('#editUpdatedAt').val(),
//         current_level: $('#editLevelNumber').val(),
//         current_action: $('#editLevelAction').val(),
//         current_attempt: $('#editLevelAttempt').val()
//     };

//     $.ajax({
//         url: `/api/ticket/${ticketId}`,
//         method: 'PUT',
//         contentType: 'application/json',
//         data: JSON.stringify(updatedData),
//         success: function(response) {
//             Swal.fire({
//             position: "center",
//             icon: "success",
//             title: "Ticket updated successfully.",
//             // text: "Check your email for Ticket Reference Number",
//             showConfirmButton: false,
//             timer: 3000
//         });
//             // alert('Ticket updated successfully');
//             $('.modal-overlay').css('display', 'none');
//             fetchAllData();
//         },
//         error: function(error) {
//             console.error('Error updating ticket:', error);
//             alert('Failed to update ticket.');
//         }
//     });
// }

// $(document).ready(function() {
//     $('#dataTable tbody').on('click', 'tr[data-ticket-id]', function() {
//         const ticketId = $(this).data('ticket-id');
//         openEditPopup(ticketId);
//         console.log('Table row is clicked!');
//     });
// });

async function searchKeyTerm(event) {
  const searchInput = $('#search').val().trim();
//   const searchInput = $('#search').val();


  // Clear previous results and errors
  tableBody.empty(); 
//   errorDiv.addClass('d-none').empty();
 
  // Validate input
//   if (!searchInput || searchInput.length < 2) {
//     // errorDiv.removeClass('d-none').text('Please enter at least 2 characters to search.');
//     alert('Please enter at least 2 characters to search.');
//     return;
//   }

    if(searchInput.length === 0){
        tableBody.html('<tr><td colspan="20">No Matching Contacts Found</td></tr>');
    }

    if(!searchInput || (event && event.type === 'search' && !searchInput)){
        fetchAllData();
        return;
    }

    // Show loading state
//   tableBody.html('<tr><td colspan="17">Loading...</td></tr>');
        tableBody.html('<tr><td colspan="20">No Matching Contacts Found</td></tr>');

  try {
    // Make AJAX request to the /api/search endpoint
    const response = await $.ajax({
      url: '/api/search',
      method: 'GET',
      data: { q: searchInput },
      dataType: 'json'
    });

    // console.log('Search response:', response);

    // Handle successful response
    if (response.results && response.results.length > 0) {
    //   tableBody.before(
    //     `<h4>Search Results (${response.count} found for "${response.query}")</h4>`
    //   );
      populateTable(response.results);
    } else {
      tableBody.append(
        $('<tr>').append(
          $('<td>').attr('colspan', 20).text('No data found').css({ 'text-align': 'center' })
        )
      );
    }
  } catch (error) {
    console.error('Search error:', error, error.responseJSON);
    const errorMessage = error.responseJSON?.error || 'An error occurred while searching. Please try again.';
    errorDiv.removeClass('d-none').text(errorMessage);
    tableBody.empty();
  }
}

async function updateStatusCounts(){
    try{
        const response = await $.ajax({
            url: '/api/counts',
            method: 'GET',
            dataType: 'json'
        });

        // console.log('Status and priority counts response:', response);

        $('#openBtn').text(`Open Tickets [${response.counts.status.OPEN || 0}]`);
        $('#inProgressBtn').text(`In-progress [${response.counts.status['IN-PROGRESS'] || 0}]`);
        $('#closedBtn').text(`Closed [${response.counts.status.CLOSED || 0}]`);
        $('#lowBtn').text(`Low [${response.counts.priority.LOW || 0}]`);
        $('#mediumBtn').text(`Medium [${response.counts.priority.MEDIUM || 0}]`);
        $('#highBtn').text(`High [${response.counts.priority.HIGH || 0}]`);
        $('#criticalBtn').text(`Critical [${response.counts.priority.CRITICAL || 0}]`);
        
    }catch(error){
          console.error('Error fetching status and priority counts:', error, error.responseJSON);
        const errorMessage = error.responseJSON?.error || error.statusText || 'Failed to load counts.';
        $('#dataTable').after(
            $('<div>').addClass('error-message')
                .text(errorMessage)
                .css({ color: 'red', margin: '10px 0', fontSize: '1rem', textAlign: 'center' })
        );
        // Fallback: set counts to 0
        $('#openBtn').text('Open Tickets [0]');
        $('#inProgressBtn').text('In-progress [0]');
        $('#closedBtn').text('Closed [0]');
        $('#lowBtn').text('Low [0]');
        $('#mediumBtn').text('Medium [0]');
        $('#highBtn').text('High [0]');
        $('#criticalBtn').text('Critical [0]');
    }
}
