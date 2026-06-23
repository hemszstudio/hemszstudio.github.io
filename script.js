const bootScreen = document.getElementById("bootScreen");
const header = document.querySelector(".site-header");
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
const cursorGlow = document.getElementById("cursorGlow");

window.addEventListener("load", () => {
  setTimeout(() => bootScreen.classList.add("hidden"), 900);
});

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 30);
});

menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.classList.toggle("active", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
});

document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
  revealObserver.observe(element);
});

window.addEventListener("pointermove", (event) => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

document.querySelectorAll(".magnetic").forEach(button => {
  button.addEventListener("pointermove", event => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    button.style.transform = `translate(${x * 0.09}px, ${y * 0.09}px)`;
  });
  button.addEventListener("pointerleave", () => {
    button.style.transform = "";
  });
});

const filters = document.querySelectorAll(".filter");
const projects = document.querySelectorAll(".project");

filters.forEach(filter => {
  filter.addEventListener("click", () => {
    filters.forEach(item => item.classList.remove("active"));
    filter.classList.add("active");

    const selected = filter.dataset.filter;
    projects.forEach(project => {
      const visible = selected === "all" || project.dataset.category === selected;
      project.classList.toggle("hidden", !visible);
    });
  });
});

document.getElementById("year").textContent = new Date().getFullYear();


// v12 — service-specific enquiry fields
const serviceSelect = document.getElementById("serviceSelect");
const eventDateField = document.getElementById("eventDateField");
const eventLocationField = document.getElementById("eventLocationField");
const eventDateInput = document.getElementById("eventDateInput");
const eventLocationInput = document.getElementById("eventLocationInput");
const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");

function updateEventFields() {
  const isPhotography = serviceSelect && serviceSelect.value === "Photography Package";

  [eventDateField, eventLocationField].forEach(field => {
    if (field) field.classList.toggle("show", isPhotography);
  });

  if (eventDateInput) eventDateInput.required = isPhotography;
  if (eventLocationInput) eventLocationInput.required = isPhotography;

  if (!isPhotography) {
    if (eventDateInput) eventDateInput.value = "";
    if (eventLocationInput) eventLocationInput.value = "";
  }
}

if (serviceSelect) {
  serviceSelect.addEventListener("change", updateEventFields);
  updateEventFields();
}




// v17 — real Web3Forms submission
if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton ? submitButton.textContent : "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    if (formNote) {
      formNote.textContent = "Sending your enquiry...";
      formNote.style.color = "var(--muted)";
    }

    try {
      const formData = new FormData(contactForm);
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Submission failed");
      }

      if (formNote) {
        formNote.textContent = "Enquiry sent successfully. We’ll get back to you soon.";
        formNote.style.color = "var(--violet-2)";
      }

      contactForm.reset();
      updateEventFields();
    } catch (error) {
      if (formNote) {
        formNote.textContent = "Could not send the enquiry. Please try again or contact us directly.";
        formNote.style.color = "#ff8b8b";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  });
}
