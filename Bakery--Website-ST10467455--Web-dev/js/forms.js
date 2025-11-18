// forms.js - handles enquiry and contact forms with validation, client-side messaging and AJAX (demo)

document.addEventListener('DOMContentLoaded', () => {
  // Enquiry form
  const enq = document.getElementById('enquiryForm');
  if (enq) {
    enq.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!enq.checkValidity()) { enq.reportValidity(); return; }
      const data = Object.fromEntries(new FormData(enq).entries());
      // Demo: basic response logic
      let responseText = 'Thanks — we received your enquiry. We will reply shortly.';
      if (data.type === 'volunteer') responseText = 'Thanks! Our volunteer coordinator will contact you with upcoming dates.';
      if (data.type === 'order') responseText = 'Order enquiries: we will follow up with a quote and availability.';
      const msg = document.getElementById('enqMsg');
      if (msg) msg.textContent = responseText;

      // Try AJAX submit to a server endpoint; fallback to console
      try {
        await fetch('/api/enquiry', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
      } catch (err) {
        console.warn('AJAX enquiry failed (likely no backend in demo):', err);
      }
      enq.reset();
    });
  }

  // Contact form
  const contact = document.getElementById('contactForm');
  if (contact) {
    contact.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!contact.checkValidity()) { contact.reportValidity(); return; }
      const fd = new FormData(contact);
      const data = Object.fromEntries(fd.entries());
      const msgEl = document.getElementById('contactMsg');
      // Try sending to server
      try {
        const res = await fetch('/api/contact', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
        if (res.ok) {
          if (msgEl) msgEl.textContent = 'Message sent. Thank you!';
          contact.reset();
          return;
        } else {
          // server error: fall back to mailto
          throw new Error('Server responded with error');
        }
      } catch (err) {
        // Fallback: open user's mail client with prefilled email
        const subject = encodeURIComponent(`Contact from Sweet Crust: ${data.reason || 'General'}`);
        const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`);
        window.location.href = `mailto:hello@sweetcrust.example?subject=${subject}&body=${body}`;
      }
    });
  }
});
