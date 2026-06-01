// ========================
// E-Commerce JavaScript
// ========================

// Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Add product to cart
function addToCart(productId, productName, productPrice, productImage) {
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage,
      quantity: 1
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showNotification('Product added to cart!');
}

// Update cart count badge
function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

// Show notification
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
  notification.style.top = '80px';
  notification.style.right = '20px';
  notification.style.zIndex = '2000';
  notification.innerHTML = `
    ${message}
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  `;
  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Remove item from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  displayCart();
}

// Update item quantity
function updateQuantity(productId, quantity) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      displayCart();
    }
  }
}

// Calculate cart total
function getCartTotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Display cart items
function displayCart() {
  const cartContainer = document.getElementById('cart-items');
  
  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <h3>Your cart is empty</h3>
        <p>Continue shopping to add items to your cart</p>
        <a href="product.html" class="btn btn-primary-custom">Continue Shopping</a>
      </div>
    `;
    document.getElementById('checkout-section').style.display = 'none';
    return;
  }

  let html = `
    <div class="cart-table">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
  `;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    html += `
      <tr>
        <td class="text-left">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <span class="cart-item-name ml-2">${item.name}</span>
        </td>
        <td>💲${item.price.toFixed(2)}</td>
        <td>
          <input type="number" class="quantity-input" value="${item.quantity}" 
                 onchange="updateQuantity('${item.id}', this.value)" min="1">
        </td>
        <td>💲${itemTotal.toFixed(2)}</td>
        <td>
          <button class="btn-remove" onclick="removeFromCart('${item.id}')">Remove</button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
    <div class="cart-summary">
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>💲${getCartTotal().toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Shipping:</span>
        <span>💲50.00</span>
      </div>
      <div class="summary-row">
        <span>Tax (10%):</span>
        <span>💲${(getCartTotal() * 0.1).toFixed(2)}</span>
      </div>
      <div class="summary-row total">
        <span>Total:</span>
        <span>💲${(getCartTotal() + 50 + (getCartTotal() * 0.1)).toFixed(2)}</span>
      </div>
      <a href="checkout.html" class="btn btn-checkout">Proceed to Checkout</a>
    </div>
  `;

  cartContainer.innerHTML = html;
  document.getElementById('checkout-section').style.display = 'block';
}

// Validate checkout form
function validateCheckoutForm() {
  const form = document.getElementById('checkout-form');
  
  if (!form) return false;

  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.classList.add('is-invalid');
      isValid = false;
    } else {
      field.classList.remove('is-invalid');
    }
  });

  // Email validation
  const emailField = form.querySelector('input[type="email"]');
  if (emailField && emailField.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailField.value)) {
      emailField.classList.add('is-invalid');
      isValid = false;
    }
  }

  // Phone validation
  const phoneField = form.querySelector('input[name="phone"]');
  if (phoneField && phoneField.value) {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneField.value)) {
      phoneField.classList.add('is-invalid');
      isValid = false;
    }
  }

  // Zip code validation
  const zipField = form.querySelector('input[name="zip"]');
  if (zipField && zipField.value) {
    const zipRegex = /^[0-9]{6}$/;
    if (!zipRegex.test(zipField.value)) {
      zipField.classList.add('is-invalid');
      isValid = false;
    }
  }

  return isValid;
}

// Place order
function placeOrder(event) {
  event.preventDefault();

  if (!validateCheckoutForm()) {
    showNotification('Please fill all required fields correctly');
    return;
  }

  // Store order data
  const orderData = {
    orderNumber: 'ORD-' + Date.now(),
    orderDate: new Date().toLocaleDateString(),
    items: cart,
    total: getCartTotal() + 50 + (getCartTotal() * 0.1)
  };

  localStorage.setItem('lastOrder', JSON.stringify(orderData));
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();

  // Redirect to order confirmation
  window.location.href = 'order_confirmation.html';
}

// Display order confirmation
function displayOrderConfirmation() {
  const confirmationContainer = document.getElementById('confirmation-container');
  
  if (!confirmationContainer) return;

  const orderData = JSON.parse(localStorage.getItem('lastOrder'));

  if (!orderData) {
    confirmationContainer.innerHTML = `
      <div class="confirmation-container">
        <h2>No order found</h2>
        <p>Please place an order first</p>
        <a href="product.html" class="btn btn-continue">Continue Shopping</a>
      </div>
    `;
    return;
  }

  let itemsHtml = '';
  orderData.items.forEach(item => {
    itemsHtml += `
      <div class="detail-row">
        <span>${item.name} (x${item.quantity})</span>
        <span>💲${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `;
  });

  const html = `
    <div class="confirmation-container">
      <div class="confirmation-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <h1 class="confirmation-title">Order Confirmed!</h1>
      <p class="confirmation-message">Thank you for your purchase. Your order has been confirmed.</p>
      
      <div class="order-details">
        <div class="detail-row">
          <strong>Order Number:</strong>
          <strong>${orderData.orderNumber}</strong>
        </div>
        <div class="detail-row">
          <strong>Order Date:</strong>
          <strong>${orderData.orderDate}</strong>
        </div>
        <div style="border-top: 2px solid var(--primary-color); margin: 15px 0; padding-top: 15px;">
          <h4 style="margin-bottom: 15px; text-align: left;">Order Summary:</h4>
          ${itemsHtml}
        </div>
        <div class="detail-row" style="border-top: 2px solid var(--primary-color); padding-top: 15px; font-weight: 700; font-size: 18px; color: var(--secondary-color);">
          <span>Total Amount:</span>
          <span>💲${orderData.total.toFixed(2)}</span>
        </div>
      </div>

      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        A confirmation email has been sent to your registered email address.
      </p>
      <a href="index.html" class="btn btn-continue">Back to Home</a>
    </div>
  `;

  confirmationContainer.innerHTML = html;
}

// Contact form validation
function validateContactForm() {
  const form = document.getElementById('contact-form');
  
  if (!form) return false;

  let isValid = true;
  const nameField = form.querySelector('input[name="name"]');
  const emailField = form.querySelector('input[name="email"]');
  const messageField = form.querySelector('textarea[name="message"]');

  // Name validation
  if (!nameField.value.trim() || nameField.value.trim().length < 3) {
    nameField.classList.add('is-invalid');
    isValid = false;
  } else {
    nameField.classList.remove('is-invalid');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailField.value.trim() || !emailRegex.test(emailField.value)) {
    emailField.classList.add('is-invalid');
    isValid = false;
  } else {
    emailField.classList.remove('is-invalid');
  }

  // Message validation
  if (!messageField.value.trim() || messageField.value.trim().length < 10) {
    messageField.classList.add('is-invalid');
    isValid = false;
  } else {
    messageField.classList.remove('is-invalid');
  }

  return isValid;
}

// Submit contact form
function submitContactForm(event) {
  event.preventDefault();

  if (!validateContactForm()) {
    showNotification('Please fill all fields correctly');
    return;
  }

  showNotification('Thank you for contacting us! We will get back to you soon.');
  document.getElementById('contact-form').reset();
  document.getElementById('contact-form').querySelectorAll('.form-control').forEach(field => {
    field.classList.remove('is-invalid');
  });
}

// Search products
function searchProducts(query) {
  const allProducts = document.querySelectorAll('.product-card');
  const query_lower = query.toLowerCase();

  allProducts.forEach(product => {
    const productName = product.querySelector('.product-name').textContent.toLowerCase();
    if (productName.includes(query_lower)) {
      product.style.display = 'block';
    } else {
      product.style.display = 'none';
    }
  });
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
});

// Remove is-invalid class when user types in input field
document.addEventListener('input', function(e) {
  if (e.target.classList.contains('form-control')) {
    e.target.classList.remove('is-invalid');
  }
});