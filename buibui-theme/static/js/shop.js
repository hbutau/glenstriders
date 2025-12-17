/**
 * Glen Striders Shop - WhatsApp Order Form Handler
 * Handles order forms for merchandise and subscriptions
 */

// WhatsApp number for orders (without + or spaces)
const WHATSAPP_NUMBER = '263778459367';

// Current order type
let currentOrderType = '';

/**
 * Open the order form modal for a specific product type
 * @param {string} type - The product type: 'vest', 'tshirt', or 'subscription'
 */
function openOrderForm(type) {
  currentOrderType = type;
  
  // Hide all forms first
  document.getElementById('apparelForm').style.display = 'none';
  document.getElementById('subscriptionForm').style.display = 'none';
  
  // Update modal title and show appropriate form
  const modalTitle = document.getElementById('orderModalLabel');
  
  if (type === 'vest') {
    modalTitle.textContent = 'Order Club Vest';
    document.getElementById('apparelForm').style.display = 'block';
  } else if (type === 'tshirt') {
    modalTitle.textContent = 'Order T-Shirt';
    document.getElementById('apparelForm').style.display = 'block';
  } else if (type === 'subscription') {
    modalTitle.textContent = 'Club Subscription';
    document.getElementById('subscriptionForm').style.display = 'block';
  }
  
  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById('orderModal'));
  modal.show();
}

/**
 * Handle subscription type change to show/hide partner name field
 */
document.addEventListener('DOMContentLoaded', function() {
  const subscriptionType = document.getElementById('subscriptionType');
  const partnerNameDiv = document.getElementById('partnerNameDiv');
  const partnerName = document.getElementById('partnerName');
  
  if (subscriptionType) {
    subscriptionType.addEventListener('change', function() {
      if (this.value === 'Couple') {
        partnerNameDiv.style.display = 'block';
        partnerName.required = true;
      } else {
        partnerNameDiv.style.display = 'none';
        partnerName.required = false;
      }
    });
  }
});

/**
 * Validate and submit the order via WhatsApp
 */
function submitOrder() {
  let message = '';
  let isValid = false;
  
  if (currentOrderType === 'vest' || currentOrderType === 'tshirt') {
    // Validate apparel form
    const name = document.getElementById('apparelName').value.trim();
    const size = document.getElementById('apparelSize').value;
    const quantity = document.getElementById('apparelQuantity').value;
    const notes = document.getElementById('apparelNotes').value.trim();
    
    if (!name || !size || !quantity) {
      alert('Please fill in all required fields.');
      return;
    }
    
    // Build WhatsApp message for apparel
    const itemName = currentOrderType === 'vest' ? 'Club Vest' : 'T-Shirt';
    const price = currentOrderType === 'vest' ? '$8' : '$10';
    
    message = `*New Order from Glen Striders Shop*\n\n`;
    message += `*Item:* ${itemName}\n`;
    message += `*Price:* ${price}\n`;
    message += `*Customer Name:* ${name}\n`;
    message += `*Size:* ${size}\n`;
    message += `*Quantity:* ${quantity}\n`;
    
    if (notes) {
      message += `*Notes:* ${notes}\n`;
    }
    
    message += `\nPlease confirm availability and delivery details.`;
    isValid = true;
    
  } else if (currentOrderType === 'subscription') {
    // Validate subscription form
    const name = document.getElementById('subscriberName').value.trim();
    const type = document.getElementById('subscriptionType').value;
    const phone = document.getElementById('subscriberPhone').value.trim();
    const notes = document.getElementById('subscriberNotes').value.trim();
    
    if (!name || !type || !phone) {
      alert('Please fill in all required fields.');
      return;
    }
    
    // Check if couple membership and partner name is required
    if (type === 'Couple') {
      const partnerName = document.getElementById('partnerName').value.trim();
      if (!partnerName) {
        alert('Please enter your partner\'s name for couple membership.');
        return;
      }
    }
    
    // Build WhatsApp message for subscription
    message = `*New Subscription Request - Glen Striders*\n\n`;
    message += `*Name:* ${name}\n`;
    message += `*Subscription Type:* ${type}\n`;
    
    if (type === 'Couple') {
      const partnerName = document.getElementById('partnerName').value.trim();
      message += `*Partner's Name:* ${partnerName}\n`;
    }
    
    message += `*Phone Number:* ${phone}\n`;
    
    if (notes) {
      message += `*Additional Information:* ${notes}\n`;
    }
    
    message += `\nLooking forward to joining Glen Striders!`;
    isValid = true;
  }
  
  if (isValid) {
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL using Click to Chat API
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new window
    window.open(whatsappURL, '_blank');
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
    modal.hide();
    
    // Reset forms
    resetForms();
  }
}

/**
 * Reset all forms
 */
function resetForms() {
  document.getElementById('apparelForm').reset();
  document.getElementById('subscriptionForm').reset();
  document.getElementById('partnerNameDiv').style.display = 'none';
}
