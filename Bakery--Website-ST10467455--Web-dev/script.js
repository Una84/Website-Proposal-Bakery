// Update footer year
document.querySelectorAll('#year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
  
  // Custom Orders form
  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      document.getElementById('orderMsg').textContent =
        "Thank you! We’ve received your custom order request and will be in touch.";
      orderForm.reset();
    });
  }
  