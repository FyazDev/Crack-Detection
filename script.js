import { resumeData } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {


  // Dynamic Metadata Population
  document.title = `${resumeData.name} | Portfolio`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc)
    metaDesc.setAttribute(
      "content",
      `Portfolio of ${resumeData.name}. ${resumeData.summary.substring(0, 150)}...`,
    );

  // Mobile Menu Logic
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const mobileNav = document.getElementById("mobile-nav");
  const mobileOverlay = document.getElementById("mobile-overlay");

  function toggleMenu(show) {
    mobileNav.classList.toggle("open", show);
    mobileOverlay.classList.toggle("active", show);
    document.body.style.overflow = show ? "hidden" : "";
  }

  menuToggle.addEventListener("click", () => toggleMenu(true));
  menuClose.addEventListener("click", () => toggleMenu(false));
  mobileOverlay.addEventListener("click", () => toggleMenu(false));

  // Close menu when clicking a link
  document.querySelectorAll(".mobile-nav-links a").forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });

  // Populate Hero
  // Populate Hero with split spans for animation
  const heroName = document.getElementById("hero-name");
  const nameParts = resumeData.name.split(" ");
  const first = nameParts[0];
  const last = nameParts.slice(1).join(" ");
  heroName.innerHTML = `<span class="first-name">${first}</span> <span class="last-name">${last}</span>`;

  const firstName = heroName.querySelector(".first-name");
  const lastName = heroName.querySelector(".last-name");

  // Name Scroll Animation
  window.addEventListener(
    "scroll",
    () => {
      const scrollPos = window.scrollY;
      // Animation range: 0 to 400px scroll
      const progress = Math.min(scrollPos / 400, 1);
      const opacity = 1 - progress;
      const scale = 1 + progress * 0.5;

      // Cap move distance on mobile to prevent extreme overflow
      const maxMove = window.innerWidth < 768 ? 80 : 150;
      const move = progress * maxMove;

      if (firstName && lastName) {
        firstName.style.transform = `translateX(-${move}px) scale(${scale})`;
        firstName.style.opacity = opacity;

        lastName.style.transform = `translateX(${move}px) scale(${scale})`;
        lastName.style.opacity = opacity;
      }
    },
    { passive: true },
  );
  // Hero summary removed as per request

  // Populate About
  document.getElementById("full-summary").textContent = resumeData.summary;
  document.getElementById("endeavor-text").textContent =
    resumeData.proposedEndeavor;

  // Populate Experience
  const expList = document.getElementById("experience-list");
  resumeData.experience.forEach((exp, index) => {
    const card = document.createElement("div");
    card.className = "exp-card";

    let slideshowHTML = "";
    if (exp.images && exp.images.length > 0) {
      const slides = exp.images.map((img, i) => `
        <div class="slide ${i === 0 ? 'active' : ''}">
          <img src="${img}" alt="Project Image ${i + 1}">
        </div>
      `).join("");
      
      const controls = exp.images.length > 1 ? `
        <button class="slide-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>
        <button class="slide-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>
        <div class="slide-dots">
          ${exp.images.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join("")}
        </div>
      ` : "";

      slideshowHTML = `
        <div class="exp-slideshow">
          ${slides}
          ${controls}
        </div>
      `;
    }

    card.innerHTML = `
            <div class="exp-header">
                <div>
                    <div class="exp-company">${exp.company}</div>
                    <h3>${exp.role}</h3>
                </div>
                <div class="exp-period">${exp.period}</div>
            </div>
            ${slideshowHTML}
            <ul class="exp-list">
                ${exp.points.map((point) => {
                  if (typeof point === 'object' && point !== null) {
                    let pointSlideshowHTML = "";
                    if (point.images && point.images.length > 0) {
                      const pSlides = point.images.map((img, i) => `
                        <div class="slide ${i === 0 ? 'active' : ''}">
                          <img src="${img}" alt="Project Image ${i + 1}">
                        </div>
                      `).join("");
                      const pControls = point.images.length > 1 ? `
                        <button class="slide-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>
                        <button class="slide-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>
                        <div class="slide-dots">
                          ${point.images.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join("")}
                        </div>
                      ` : "";
                      pointSlideshowHTML = `
                        <div class="exp-slideshow inline-slideshow">
                          ${pSlides}
                          ${pControls}
                        </div>
                      `;
                    }
                    let demoHTML = "";
                    if (point.demo && point.demo.url) {
                      demoHTML = `
                        <div class="live-demo">
                          <div class="live-demo-actions">
                            <button type="button" class="demo-btn demo-toggle" data-embed="${point.demo.embedUrl || point.demo.url}">
                              <i class="fas fa-play-circle"></i> <span>Try Live Demo</span>
                            </button>
                            <a class="demo-btn demo-link" href="${point.demo.url}" target="_blank" rel="noopener noreferrer">
                              <i class="fas fa-external-link-alt"></i> Open on Hugging Face
                            </a>
                          </div>
                          <div class="live-demo-frame" hidden></div>
                        </div>
                      `;
                    }
                    return `
                      <li class="inline-project">
                        <div class="project-content">${point.text}</div>
                        ${demoHTML}
                        ${pointSlideshowHTML}
                      </li>
                    `;
                  }
                  return `<li>${point}</li>`;
                }).join("")}
            </ul>
        `;
    expList.appendChild(card);
  });

  // Live demo toggles (lazy-load iframe on first open)
  document.querySelectorAll(".demo-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const frameWrap = btn.closest(".live-demo").querySelector(".live-demo-frame");
      const label = btn.querySelector("span");
      if (frameWrap.hidden) {
        if (!frameWrap.querySelector("iframe")) {
          frameWrap.innerHTML = `<iframe src="${btn.dataset.embed}" title="Live Demo" loading="lazy" allow="camera; clipboard-write" frameborder="0"></iframe>`;
        }
        frameWrap.hidden = false;
        label.textContent = "Hide Live Demo";
      } else {
        frameWrap.hidden = true;
        label.textContent = "Try Live Demo";
      }
    });
  });

  // Populate Skills
  const skillsGrid = document.getElementById("skills-grid");
  const skillCategories = [
    resumeData.skills.languages?.length ? { title: "Languages", data: resumeData.skills.languages } : null,
    resumeData.skills.machineLearning?.length ? { title: "AI & Machine Learning", data: resumeData.skills.machineLearning } : null,
    resumeData.skills.frameworks?.length ? { title: "Frameworks & Tools", data: resumeData.skills.frameworks } : null,
    resumeData.skills.networking?.length ? { title: "Networking & Systems", data: resumeData.skills.networking } : null,
    (resumeData.skills.imaging?.length || resumeData.skills.spatial?.length) ? {
      title: "Geospatial & Imaging",
      data: [...(resumeData.skills.imaging || []), ...(resumeData.skills.spatial || [])],
    } : null,
    resumeData.skills.other?.length ? { title: "Other Skills", data: resumeData.skills.other } : null,
  ].filter(Boolean);

  skillCategories.forEach((cat) => {
    const div = document.createElement("div");
    div.className = `skill-category`;
    div.innerHTML = `
            <h4>${cat.title}</h4>
            <div class="skill-tags">
                ${cat.data.map((skill) => `<span class="skill-tag">${skill}</span>`).join("")}
            </div>
        `;
    skillsGrid.appendChild(div);
  });

  // Populate Education
  const eduList = document.getElementById("education-list");
  resumeData.education.forEach((edu) => {
    const div = document.createElement("div");
    div.className = "edu-item";
    div.innerHTML = `
            <h3>${edu.degree}</h3>
            <div class="edu-meta">${edu.institution} | ${edu.period}</div>
            <p class="edu-desc">${edu.details}</p>
            ${edu.reportUrl ? `<a href="${edu.reportUrl}" target="_blank" class="skill-tag" style="margin-top:1rem; display:inline-block;"><i class="fas fa-file-pdf"></i> View Project Report</a>` : ""}
        `;
    eduList.appendChild(div);
  });

  // Populate Achievements
  const achList = document.getElementById("achievement-list");
  resumeData.achievements.forEach((ach) => {
    const li = document.createElement("li");
    
    let mediaHTML = "";
    if (ach.media && ach.media.length > 0) {
      const mediaItems = ach.media.map(file => {
        const isVideo = file.match(/\.(mp4|webm|ogg)$/i);
        if (isVideo) {
          return `<video controls class="ach-media-item"><source src="${file}" type="video/mp4">Your browser does not support the video tag.</video>`;
        } else {
          return `<img src="${file}" alt="Achievement Media" class="ach-media-item">`;
        }
      }).join("");
      mediaHTML = `<div class="ach-media-grid">${mediaItems}</div>`;
    }

    li.innerHTML = `
            <div class="ach-header">
                <div class="ach-icon"><i class="fas fa-trophy" style="color: var(--accent-color);"></i></div>
                <div class="ach-text">
                    ${ach.text}
                    ${ach.url ? `<br><a href="${ach.url}" target="_blank" class="ach-link"><i class="fas fa-link"></i> View Presentation</a>` : ""}
                </div>
            </div>
            ${mediaHTML}
        `;
    achList.appendChild(li);
  });

  // Populate Profiles/Links
  const profileContainer = document.getElementById("profiles-content");
  const profiles = [
    resumeData.contact.googleScholar ? {
      name: "Google Scholar",
      url: "https://" + resumeData.contact.googleScholar,
      icon: "fas fa-graduation-cap",
    } : null,
    resumeData.contact.github ? {
      name: "GitHub",
      url: "https://" + resumeData.contact.github,
      icon: "fab fa-github",
    } : null,
    resumeData.contact.linkedin ? {
      name: "LinkedIn",
      url: "https://" + resumeData.contact.linkedin,
      icon: "fab fa-linkedin",
    } : null,
    resumeData.contact.researchGate ? {
      name: "ResearchGate",
      url: "https://" + resumeData.contact.researchGate,
      icon: "fas fa-microscope",
    } : null,
  ].filter(Boolean);
  profiles.forEach((p) => {
    const a = document.createElement("a");
    a.href = p.url;
    a.className = "profile-btn";
    a.target = "_blank";
    a.innerHTML = `<i class="${p.icon}"></i> ${p.name}`;
    profileContainer.appendChild(a);
  });

  // Update Footer Links
  if (document.getElementById("linkedin-link"))
    document.getElementById("linkedin-link").href =
      "https://" + resumeData.contact.linkedin;
  if (document.getElementById("github-link") && resumeData.contact.github)
    document.getElementById("github-link").href =
      "https://" + resumeData.contact.github;
  if (document.getElementById("scholar-link"))
    document.getElementById("scholar-link").href =
      "https://" + resumeData.contact.googleScholar;
  if (document.getElementById("email-link"))
    document.getElementById("email-link").href =
      `mailto:${resumeData.contact.email}`;

  // Populate Contact Section
  if (document.getElementById("contact-email")) {
    document.getElementById("contact-email").href =
      `mailto:${resumeData.contact.email}`;
    document.getElementById("contact-email-text").textContent =
      resumeData.contact.email;
  }
  if (document.getElementById("contact-phone")) {
    document.getElementById("contact-phone").href =
      `tel:${resumeData.contact.phone.replace(/[^0-9+]/g, "")}`;
    document.getElementById("contact-phone-text").textContent =
      resumeData.contact.phone;
  }
  if (document.getElementById("contact-location-text")) {
    document.getElementById("contact-location-text").textContent =
      resumeData.contact.location;
  }

  // Custom Smooth Scroll for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = 100;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        // Custom slower smooth scroll implementation
        const startPosition = window.pageYOffset;
        const distance = offsetPosition - startPosition;
        const duration = 1200; // Increased duration for "slower" feel
        let start = null;

        window.requestAnimationFrame(function step(timestamp) {
          if (!start) start = timestamp;
          const progress = timestamp - start;
          const percent = Math.min(progress / duration, 1);

          // Easing function: easeInOutCubic
          const easing =
            percent < 0.5
              ? 4 * percent * percent * percent
              : 1 - Math.pow(-2 * percent + 2, 3) / 2;

          window.scrollTo(0, startPosition + distance * easing);

          if (progress < duration) {
            window.requestAnimationFrame(step);
          }
        });
      }
    });
  });

  // Reveal Animations with passive scroll listener for better performance
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        // stop observing after reveal to reduce overhead
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document
    .querySelectorAll("[data-reveal]")
    .forEach((el) => observer.observe(el));

  // Logo Click Scroll to Top
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Initialize Slideshows
  document.querySelectorAll('.exp-slideshow').forEach(slideshow => {
    let currentSlide = 0;
    const slides = slideshow.querySelectorAll('.slide');
    const dots = slideshow.querySelectorAll('.dot');
    const prevBtn = slideshow.querySelector('.slide-prev');
    const nextBtn = slideshow.querySelector('.slide-next');
    
    if (slides.length <= 1) return;

    function goToSlide(index) {
      slides[currentSlide].classList.remove('active');
      if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
      
      currentSlide = (index + slides.length) % slides.length;
      
      slides[currentSlide].classList.add('active');
      if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    
    dots.forEach(dot => {
      dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
    });
  });
});
