const nav = document.querySelector(".site-nav");
const menuToggle = document.querySelector(".menu-toggle");
const mobilePanel = document.querySelector(".mobile-panel");
const navOverlay = document.querySelector(".nav-overlay");
const mobilePanelClose = document.querySelector(".mobile-panel-close");
const stickyCta = document.querySelector(".sticky-cta");
const modalBackdrop = document.querySelector(".modal-backdrop");
const modalTitle = document.querySelector("#modal-title");
const modalCopy = document.querySelector("#modal-copy");
const modalFeeTag = document.querySelector(".modal-fee-tag");
const modalClose = document.querySelector(".modal-close");
const toast = document.querySelector(".toast");
const REGISTRATION_PAYMENT_URL = "https://rzp.io/rzp/msmeconnectsummit2026";
const API_CSRF_URL = "api/csrf.php";
const API_SUBMIT_URL = "api/submit.php";

const showToast = (message) => {
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 4500);
};

const fetchCsrfToken = async () => {
  const response = await fetch(API_CSRF_URL, {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  const payload = await response.json();

  if (!response.ok || !payload.success || !payload.token) {
    throw new Error("csrf_unavailable");
  }

  return payload.token;
};

const modalContent = {
  nomination: {
    title: "Registration MSME CONNECT Summit 2026",
    copy: "",
  },
};

let isMenuOpen = false;
let menuScrollY = 0;

const setMenuOpen = (open) => {
  if (!nav || !menuToggle || !mobilePanel) {
    return;
  }

  if (document.body.classList.contains("modal-open")) {
    open = false;
  }

  isMenuOpen = open;

  nav.classList.toggle("open", open);
  mobilePanel.classList.toggle("is-open", open);
  navOverlay?.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);

  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mobilePanel.setAttribute("aria-hidden", String(!open));
  navOverlay?.setAttribute("aria-hidden", String(!open));

  if (open) {
    menuScrollY = window.scrollY;
    document.body.style.top = `-${menuScrollY}px`;
    return;
  }

  document.body.style.top = "";
  window.scrollTo(0, menuScrollY);
};

const toggleMenu = () => {
  if (document.body.classList.contains("modal-open")) {
    return;
  }

  setMenuOpen(!isMenuOpen);
};

setMenuOpen(false);

menuToggle?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  toggleMenu();
});

let mobilePanelTouchStartX = 0;

mobilePanel?.addEventListener(
  "touchstart",
  (event) => {
    mobilePanelTouchStartX = event.changedTouches[0]?.screenX ?? 0;
  },
  { passive: true }
);

mobilePanel?.addEventListener(
  "touchend",
  (event) => {
    const touchEndX = event.changedTouches[0]?.screenX ?? 0;
    const deltaX = touchEndX - mobilePanelTouchStartX;

    if (deltaX > 56) {
      setMenuOpen(false);
    }
  },
  { passive: true }
);

mobilePanelClose?.addEventListener("click", (event) => {
  event.preventDefault();
  setMenuOpen(false);
});

navOverlay?.addEventListener("click", () => {
  setMenuOpen(false);
});

const sections = Array.from(document.querySelectorAll(".section-anchor"));
const navLinks = Array.from(document.querySelectorAll(".site-nav .nav-link, .mobile-panel .nav-link"));
const navSectionIds = new Set(
  navLinks.map((link) => link.getAttribute("href")?.slice(1)).filter(Boolean)
);
const trackedSections = sections.filter((section) => navSectionIds.has(section.id));

let scrollSpyPaused = false;
let pendingNavSection = null;
let scrollIdleTimer = null;

const setActiveLink = (id) => {
  if (!id) {
    return;
  }

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("active", isActive);
  });
};

const getNavScrollOffset = () => {
  const navHeight = nav?.offsetHeight ?? 68;
  return navHeight + 16;
};

const revealSection = (section) => {
  if (section?.classList.contains("reveal-on-scroll")) {
    section.classList.add("is-visible");
  }
};

const getActiveSectionId = () => {
  if (!trackedSections.length) {
    return "home";
  }

  if (document.body.classList.contains("modal-open") || isMenuOpen) {
    return pendingNavSection ?? trackedSections[0].id;
  }

  const scrollBottom = window.scrollY + window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;

  if (scrollBottom >= docHeight - 48) {
    return trackedSections[trackedSections.length - 1].id;
  }

  const scrollPosition = window.scrollY + getNavScrollOffset();
  let activeId = trackedSections[0].id;

  trackedSections.forEach((section) => {
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    if (scrollPosition >= sectionTop - 8) {
      activeId = section.id;
    }
  });

  return activeId;
};

const updateActiveNav = () => {
  if (scrollSpyPaused && pendingNavSection) {
    setActiveLink(pendingNavSection);
    return;
  }

  setActiveLink(getActiveSectionId());
};

const pauseScrollSpy = (sectionId) => {
  pendingNavSection = sectionId;
  scrollSpyPaused = true;
  setActiveLink(sectionId);
};

const resumeScrollSpyWhenIdle = () => {
  if (scrollIdleTimer) {
    window.clearTimeout(scrollIdleTimer);
  }

  scrollIdleTimer = window.setTimeout(() => {
    scrollSpyPaused = false;
    pendingNavSection = null;
    updateActiveNav();
  }, 160);
};

const scrollToSection = (target) => {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  const top = target.getBoundingClientRect().top + window.scrollY - getNavScrollOffset();

  window.scrollTo({
    top: Math.max(0, top),
    behavior,
  });
};

const navigateToSection = (sectionId, href) => {
  const target = document.getElementById(sectionId);
  if (!target) {
    return false;
  }

  const wasMenuOpen = isMenuOpen;
  if (wasMenuOpen) {
    setMenuOpen(false);
  }

  pauseScrollSpy(sectionId);
  revealSection(target);

  window.requestAnimationFrame(() => {
    scrollToSection(target);
    history.replaceState(null, "", href);
  });

  return true;
};

document.querySelectorAll(".mobile-panel .nav-link, .mobile-panel .nav-pill[href^='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href?.startsWith("#") || href.length < 2) {
      setMenuOpen(false);
      return;
    }

    const sectionId = href.slice(1);

    if (navigateToSection(sectionId, href)) {
      event.preventDefault();
    } else {
      setMenuOpen(false);
    }
  });
});

document.querySelectorAll(".nav-right .nav-link, .nav-right .nav-pill[href^='#'], .nav-brand[href^='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href?.startsWith("#") || href.length < 2) {
      return;
    }

    const sectionId = href.slice(1);

    if (navigateToSection(sectionId, href)) {
      event.preventDefault();
    }
  });
});

window.addEventListener("scroll", () => {
  stickyCta?.classList.toggle("visible", window.scrollY > 520);

  if (scrollSpyPaused) {
    updateActiveNav();
    resumeScrollSpyWhenIdle();
    return;
  }

  updateActiveNav();
}, { passive: true });

updateActiveNav();

if (window.location.hash) {
  const initialSectionId = window.location.hash.slice(1);
  const initialTarget = document.getElementById(initialSectionId);

  if (initialTarget) {
    window.requestAnimationFrame(() => {
      pauseScrollSpy(initialSectionId);
      revealSection(initialTarget);
      scrollToSection(initialTarget);
      resumeScrollSpyWhenIdle();
    });
  }
}

window.addEventListener("resize", () => {
  if (window.innerWidth > 1200 && isMenuOpen) {
    setMenuOpen(false);
  }
  updateActiveNav();
});

let modalScrollY = 0;

const closeCustomSelects = (root = document) => {
  root.querySelectorAll("[data-custom-select].is-open").forEach((select) => {
    const trigger = select.querySelector(".custom-select-trigger");
    const options = select.querySelector(".custom-select-options");
    const field = select.closest(".modal-field--select");

    select.classList.remove("is-open", "is-open-up");
    field?.classList.remove("is-open");
    trigger?.setAttribute("aria-expanded", "false");
    options?.setAttribute("hidden", "");
  });
};

const resetCustomSelect = (select) => {
  const hiddenInput = select.querySelector('input[type="hidden"]');
  const valueEl = select.querySelector(".custom-select-value");
  const trigger = select.querySelector(".custom-select-trigger");
  const optionsPanel = select.querySelector(".custom-select-options");
  const options = select.querySelectorAll(".custom-select-options [role='option']");
  const field = select.closest(".modal-field--select");
  const errorEl = field?.querySelector("[data-seat-error]");

  if (hiddenInput) {
    hiddenInput.value = "";
  }

  if (valueEl) {
    valueEl.textContent = "Select category";
    valueEl.classList.add("is-placeholder");
  }

  options.forEach((option) => {
    option.setAttribute("aria-selected", "false");
  });

  select.classList.remove("is-open", "is-open-up", "is-invalid", "has-value");
  field?.classList.remove("is-open", "is-invalid");
  trigger?.setAttribute("aria-expanded", "false");
  optionsPanel?.setAttribute("hidden", "");
  if (errorEl) {
    errorEl.hidden = true;
  }
};

const setCustomSelectValue = (select, option) => {
  const hiddenInput = select.querySelector('input[type="hidden"]');
  const valueEl = select.querySelector(".custom-select-value");
  const options = select.querySelectorAll(".custom-select-options [role='option']");
  const field = select.closest(".modal-field--select");
  const errorEl = field?.querySelector("[data-seat-error]");

  if (!hiddenInput || !valueEl || !option) {
    return;
  }

  const value = option.dataset.value ?? option.textContent.trim();
  const label = option.textContent.trim();

  hiddenInput.value = value;
  valueEl.textContent = label;
  valueEl.classList.remove("is-placeholder");
  select.classList.remove("is-invalid");
  select.classList.add("has-value");
  field?.classList.remove("is-invalid");

  options.forEach((item) => {
    item.setAttribute("aria-selected", String(item === option));
  });

  if (errorEl) {
    errorEl.hidden = true;
  }

  hiddenInput.dispatchEvent(new Event("input", { bubbles: true }));
};

const initCustomSelects = (root = document) => {
  root.querySelectorAll("[data-custom-select]").forEach((select) => {
    if (select.dataset.selectReady === "true") {
      return;
    }

    select.dataset.selectReady = "true";

    const hiddenInput = select.querySelector('input[type="hidden"]');
    const trigger = select.querySelector(".custom-select-trigger");
    const valueEl = select.querySelector(".custom-select-value");
    const optionsPanel = select.querySelector(".custom-select-options");
    const options = Array.from(select.querySelectorAll(".custom-select-options [role='option']"));
    const field = select.closest(".modal-field--select");

    if (!hiddenInput || !trigger || !valueEl || !optionsPanel) {
      return;
    }

    const openSelect = () => {
      closeCustomSelects(document);
      select.classList.remove("is-open-up");

      const rect = select.getBoundingClientRect();
      if (window.innerHeight - rect.bottom < 220) {
        select.classList.add("is-open-up");
      }

      select.classList.add("is-open");
      field?.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      optionsPanel.removeAttribute("hidden");
      field?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    };

    const closeSelect = () => {
      select.classList.remove("is-open", "is-open-up");
      field?.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      optionsPanel.setAttribute("hidden", "");
    };

    const chooseOption = (option) => {
      setCustomSelectValue(select, option);
      closeSelect();
    };

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      if (select.classList.contains("is-open")) {
        closeSelect();
      } else {
        openSelect();
      }
    });

    options.forEach((option, index) => {
      option.addEventListener("click", (event) => {
        event.stopPropagation();
        chooseOption(option);
      });

      option.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          chooseOption(option);
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          options[Math.min(index + 1, options.length - 1)]?.focus();
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          if (index === 0) {
            trigger.focus();
          } else {
            options[index - 1]?.focus();
          }
        }
      });
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!select.classList.contains("is-open")) {
          openSelect();
          options[0]?.focus();
        }
      }
    });

    hiddenInput.addEventListener("invalid", (event) => {
      event.preventDefault();
      select.classList.add("is-invalid");
      field?.classList.add("is-invalid");
      field?.querySelector("[data-seat-error]")?.removeAttribute("hidden");
    });
  });
};

const resetRegistrationForm = (form) => {
  if (!form) {
    return;
  }

  form.reset();
  form._resetPincodeLookup?.();
  form.querySelectorAll("[data-custom-select]").forEach(resetCustomSelect);
  form.querySelectorAll(".modal-field.is-invalid").forEach((field) => {
    field.classList.remove("is-invalid");
  });
};

const trimRegistrationFields = (form) => {
  form.querySelectorAll("input:not([type='hidden'])").forEach((input) => {
    input.value = input.value.trim();
  });
};

const validateSeatField = (form) => {
  const seatInput = form.querySelector('[name="seat"]');
  const select = seatInput?.closest("[data-custom-select]");
  const field = select?.closest(".modal-field--select");
  const errorEl = field?.querySelector("[data-seat-error]");
  const trigger = select?.querySelector(".custom-select-trigger");

  if (seatInput?.value) {
    select?.classList.remove("is-invalid");
    field?.classList.remove("is-invalid");
    if (errorEl) {
      errorEl.hidden = true;
    }
    return true;
  }

  select?.classList.add("is-invalid");
  field?.classList.add("is-invalid");
  if (errorEl) {
    errorEl.hidden = false;
  }
  trigger?.focus();
  field?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  return false;
};

const validateRegistrationForm = (form) => {
  trimRegistrationFields(form);

  if (!validateSeatField(form)) {
    return false;
  }

  if (!form.checkValidity()) {
    const firstInvalid = form.querySelector(":invalid:not([type='hidden'])");
    firstInvalid?.focus();
    form.reportValidity();
    return false;
  }

  return true;
};

const PINCODE_LOOKUP_DELAY = 350;
const PINCODE_FETCH_TIMEOUT = 6000;
const PINCODE_RETRY_DELAY = 400;
const pincodeLookupCache = new Map();

const formatPlaceName = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\b([a-z])/g, (_, char) => char.toUpperCase());
};

const PINCODE_SOURCES = [
  {
    id: "india-postal",
    buildUrl: (pincode) => `https://postal-pincode-api.vercel.app/api/v1/pincode/${pincode}`,
    parse(data) {
      const rows = data?.data;
      if (!Array.isArray(rows) || !rows.length) {
        return null;
      }

      const row = rows.find((entry) => entry.state && entry.district) || rows[0];
      const state = formatPlaceName(row.state);
      const district = formatPlaceName(row.district);

      if (!state || !district) {
        return null;
      }

      return { state, district };
    },
  },
  {
    id: "zippopotam",
    buildUrl: (pincode) => `https://api.zippopotam.us/in/${pincode}`,
    parse(data) {
      const place = data?.places?.[0];
      const state = formatPlaceName(place?.state);

      if (!state) {
        return null;
      }

      return { state, district: "", partial: true };
    },
  },
];

const fetchJsonWithTimeout = async (url, signal) => {
  const response = await fetch(url, {
    signal,
    mode: "cors",
    credentials: "omit",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json();
};

const lookupPincodeFromSources = async (pincode, signal) => {
  let lastError = null;

  for (const source of PINCODE_SOURCES) {
    if (signal.aborted) {
      return { aborted: true };
    }

    try {
      const data = await fetchJsonWithTimeout(source.buildUrl(pincode), signal);
      const location = source.parse(data);

      if (location) {
        return { ok: true, ...location };
      }
    } catch (error) {
      if (error.name === "AbortError") {
        return { aborted: true };
      }

      lastError = error;
    }
  }

  if (lastError) {
    return { ok: false, reason: "network" };
  }

  return { ok: false, reason: "not_found" };
};

const fetchPincodeLocation = async (pincode, signal) => {
  if (pincodeLookupCache.has(pincode)) {
    return pincodeLookupCache.get(pincode);
  }

  let result = await lookupPincodeFromSources(pincode, signal);

  if (!result.ok && result.reason === "network" && !signal.aborted) {
    await new Promise((resolve) => window.setTimeout(resolve, PINCODE_RETRY_DELAY));

    if (!signal.aborted) {
      result = await lookupPincodeFromSources(pincode, signal);
    }
  }

  if (result.ok || result.reason === "not_found") {
    pincodeLookupCache.set(pincode, result);
  }

  return result;
};

const initPincodeLookup = (form) => {
  const pincodeInput = form.querySelector('[name="pincode"]');
  const stateInput = form.querySelector('[name="state"]');
  const districtInput = form.querySelector('[name="district"]');
  const hintEl = form.querySelector("[data-pincode-hint]");
  const pincodeField = pincodeInput?.closest(".modal-field");

  if (!pincodeInput || !stateInput || !districtInput) {
    return;
  }

  let debounceTimer = null;
  let abortController = null;
  let timeoutId = null;
  let activeRequestId = 0;
  let lastFetchedPin = "";

  const setHint = (message, tone = "idle") => {
    if (!hintEl) {
      return;
    }

    hintEl.textContent = message;
    hintEl.hidden = !message;
    hintEl.classList.remove("is-success", "is-warning", "is-loading");

    if (tone === "success") {
      hintEl.classList.add("is-success");
    } else if (tone === "warning") {
      hintEl.classList.add("is-warning");
    } else if (tone === "loading") {
      hintEl.classList.add("is-loading");
    }
  };

  const setLoading = (loading) => {
    pincodeField?.classList.toggle("is-loading", loading);
  };

  const cancelLookup = () => {
    window.clearTimeout(debounceTimer);
    window.clearTimeout(timeoutId);
    abortController?.abort();
    abortController = null;
    timeoutId = null;
    debounceTimer = null;
  };

  const clearAutoFilledLocation = () => {
    if (stateInput.dataset.autoFilled === "true") {
      stateInput.value = "";
      delete stateInput.dataset.autoFilled;
    }

    if (districtInput.dataset.autoFilled === "true") {
      districtInput.value = "";
      delete districtInput.dataset.autoFilled;
    }
  };

  const applyLocation = (state, district, partial = false) => {
    stateInput.value = state;
    stateInput.dataset.autoFilled = "true";
    stateInput.closest(".modal-field")?.classList.remove("is-invalid");

    if (district) {
      districtInput.value = district;
      districtInput.dataset.autoFilled = "true";
      districtInput.closest(".modal-field")?.classList.remove("is-invalid");
      setHint(
        partial
          ? "State filled automatically. Please confirm or enter your district."
          : "State and district filled automatically.",
        partial ? "warning" : "success",
      );
      return;
    }

    delete districtInput.dataset.autoFilled;
    setHint("State filled automatically. Please enter your district manually.", "warning");
  };

  const scheduleLookup = (pincode) => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      runLookup(pincode);
    }, PINCODE_LOOKUP_DELAY);
  };

  const runLookup = async (pincode) => {
    if (pincode.length !== 6 || pincode === lastFetchedPin) {
      return;
    }

    cancelLookup();

    const requestId = ++activeRequestId;
    abortController = new AbortController();
    timeoutId = window.setTimeout(() => abortController?.abort(), PINCODE_FETCH_TIMEOUT);

    setLoading(true);
    setHint("Fetching state and district…", "loading");

    try {
      const result = await fetchPincodeLocation(pincode, abortController.signal);

      if (requestId !== activeRequestId || pincodeInput.value !== pincode) {
        return;
      }

      if (result.aborted) {
        return;
      }

      if (result.ok) {
        lastFetchedPin = pincode;
        applyLocation(result.state, result.district, result.partial);
        return;
      }

      lastFetchedPin = "";
      clearAutoFilledLocation();

      if (result.reason === "not_found") {
        setHint("Pincode not found. Please enter state and district manually.", "warning");
      } else {
        setHint("Could not fetch location right now. Please enter state and district manually.", "warning");
      }
    } catch (error) {
      if (error.name === "AbortError" || requestId !== activeRequestId || pincodeInput.value !== pincode) {
        return;
      }

      lastFetchedPin = "";
      setHint("Could not fetch location right now. Please enter state and district manually.", "warning");
    } finally {
      window.clearTimeout(timeoutId);
      timeoutId = null;

      if (requestId === activeRequestId && pincodeInput.value === pincode) {
        setLoading(false);
      }
    }
  };

  const handlePincodeChange = (triggerLookup = true) => {
    pincodeInput.value = pincodeInput.value.replace(/\D/g, "").slice(0, 6);
    pincodeInput.closest(".modal-field")?.classList.remove("is-invalid");

    const pincode = pincodeInput.value;
    cancelLookup();
    setLoading(false);

    if (pincode.length < 6) {
      if (lastFetchedPin && pincode !== lastFetchedPin) {
        clearAutoFilledLocation();
        lastFetchedPin = "";
      }
      setHint("", "idle");
      return;
    }

    if (triggerLookup) {
      scheduleLookup(pincode);
    }
  };

  pincodeInput.addEventListener("input", () => handlePincodeChange(true));
  pincodeInput.addEventListener("paste", () => {
    window.requestAnimationFrame(() => handlePincodeChange(true));
  });
  pincodeInput.addEventListener("blur", () => {
    const pincode = pincodeInput.value;
    if (pincode.length === 6 && pincode !== lastFetchedPin) {
      runLookup(pincode);
    }
  });

  stateInput.addEventListener("input", () => {
    delete stateInput.dataset.autoFilled;
  });

  districtInput.addEventListener("input", () => {
    delete districtInput.dataset.autoFilled;
  });

  form._resetPincodeLookup = () => {
    activeRequestId += 1;
    cancelLookup();
    lastFetchedPin = "";
    setLoading(false);
    setHint("", "idle");
    delete stateInput.dataset.autoFilled;
    delete districtInput.dataset.autoFilled;
  };
};

const initRegistrationForm = (form) => {
  if (!form || form.dataset.formReady === "true") {
    return;
  }

  form.dataset.formReady = "true";

  const mobileInput = form.querySelector('[name="mobile"]');

  mobileInput?.addEventListener("input", () => {
    mobileInput.value = mobileInput.value.replace(/\D/g, "").slice(0, 10);
    mobileInput.closest(".modal-field")?.classList.remove("is-invalid");
  });

  initPincodeLookup(form);

  form.querySelectorAll("input:not([type='hidden'])").forEach((input) => {
    input.addEventListener("input", () => {
      input.closest(".modal-field")?.classList.remove("is-invalid");
    });
  });
};

const openModal = (type = "nomination") => {
  const content = modalContent[type] || modalContent.nomination;
  modalTitle.textContent = content.title;
  modalCopy.textContent = content.copy;

  if (modalFeeTag) {
    const isRegistration = type === "nomination";
    modalFeeTag.hidden = !isRegistration;
    modalFeeTag.textContent = isRegistration ? "MSME Connect" : "";
  }

  modalScrollY = window.scrollY;
  document.body.style.top = `-${modalScrollY}px`;

  modalBackdrop.classList.add("open");
  modalBackdrop.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  if (type === "nomination") {
    resetRegistrationForm(modalBackdrop.querySelector(".modal-form"));
  }

  const formBody = modalBackdrop.querySelector(".modal-form-body");
  if (formBody) {
    formBody.scrollTop = 0;
  }

  const firstInput = modalBackdrop.querySelector(".modal-form input:not([type='hidden'])");
  if (firstInput) {
    window.setTimeout(() => firstInput.focus(), 120);
  }
};

const closeModal = () => {
  closeCustomSelects(modalBackdrop);
  modalBackdrop.classList.remove("open");
  modalBackdrop.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  document.body.style.top = "";
  window.scrollTo(0, modalScrollY);
};

document.querySelectorAll("[data-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    setMenuOpen(false);
    openModal(button.dataset.modal);
  });
});

modalClose?.addEventListener("click", closeModal);
modalBackdrop?.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (modalBackdrop.classList.contains("open")) {
      if (modalBackdrop.querySelector("[data-custom-select].is-open")) {
        closeCustomSelects(modalBackdrop);
      } else {
        closeModal();
      }
    } else if (isMenuOpen) {
      setMenuOpen(false);
    }
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-custom-select]")) {
    closeCustomSelects(document);
  }
});

const registrationForm = document.querySelector(".modal-form");

registrationForm?.addEventListener("focusin", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.matches("input:not([type='hidden']), .custom-select-trigger")) {
    target.closest(".modal-field")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
});

registrationForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;

  if (!validateRegistrationForm(form)) {
    return;
  }

  const submitButton = form.querySelector(".modal-submit");
  const submitLabel = submitButton?.querySelector("span");

  if (submitButton) {
    submitButton.disabled = true;
  }
  if (submitLabel) {
    submitLabel.textContent = "Submitting…";
  }

  try {
    const csrfToken = await fetchCsrfToken();
    const formData = new FormData(form);
    formData.append("csrf_token", csrfToken);

    const response = await fetch(API_SUBMIT_URL, {
      method: "POST",
      body: formData,
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
      showToast(payload.message || "Unable to save registration. Please try again.");
      return;
    }

    showToast(payload.message || "Thank you. Your registration details have been captured.");
    window.setTimeout(() => {
      window.location.href = REGISTRATION_PAYMENT_URL;
    }, 600);
  } catch {
    showToast("Network error. Please check your connection and try again.");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
    if (submitLabel) {
      submitLabel.textContent = "Register Now";
    }
  }
});

initCustomSelects();
initRegistrationForm(registrationForm);

const initBenefitsSlider = () => {
  const slider = document.querySelector("[data-benefits-slider]");
  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll(".benefits-slide"));
  const dotsWrap = slider.querySelector("[data-benefits-dots]");
  const prevButton = slider.querySelector("[data-benefits-prev]");
  const nextButton = slider.querySelector("[data-benefits-next]");
  const status = slider.querySelector("[data-slider-status]");
  const viewport = slider.querySelector(".benefits-slider-viewport");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const slideCount = slides.length;
  if (!dotsWrap || slideCount === 0) {
    return;
  }

  const autoplayMs = prefersReducedMotion ? 0 : Number(slider.dataset.autoplay) || 2500;
  const durationMs = prefersReducedMotion ? 0 : Number(slider.dataset.duration) || 900;

  if (viewport) {
    viewport.style.setProperty("--slide-duration", `${durationMs}ms`);
  }

  const slideStates = ["is-active", "is-prev", "is-next", "is-hidden"];

  let current = 0;
  let timer = null;
  let touchStartX = 0;
  let isLocked = false;

  const wrapIndex = (index) => ((index % slideCount) + slideCount) % slideCount;

  const render = () => {
    const prevIndex = wrapIndex(current - 1);
    const nextIndex = wrapIndex(current + 1);

    slides.forEach((slide, index) => {
      slide.classList.remove(...slideStates);

      if (index === current) {
        slide.classList.add("is-active");
        slide.setAttribute("aria-hidden", "false");
      } else if (index === prevIndex) {
        slide.classList.add("is-prev");
        slide.setAttribute("aria-hidden", "true");
      } else if (index === nextIndex) {
        slide.classList.add("is-next");
        slide.setAttribute("aria-hidden", "true");
      } else {
        slide.classList.add("is-hidden");
        slide.setAttribute("aria-hidden", "true");
      }
    });

    dotsWrap.querySelectorAll("button").forEach((dot, index) => {
      dot.classList.toggle("active", index === current);
      dot.setAttribute("aria-current", index === current ? "true" : "false");
    });

    if (status) {
      status.textContent = `Showing slide ${current + 1} of ${slideCount}`;
    }
  };

  const goTo = (index) => {
    if (isLocked) {
      return;
    }

    const nextIndex = wrapIndex(index);
    if (nextIndex === current) {
      return;
    }

    if (durationMs > 0) {
      isLocked = true;
      window.setTimeout(() => {
        isLocked = false;
      }, durationMs);
    }

    current = nextIndex;
    render();
  };

  const stopAutoplay = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  const startAutoplay = () => {
    if (!autoplayMs) {
      return;
    }

    stopAutoplay();
    timer = window.setInterval(() => {
      goTo(current + 1);
    }, autoplayMs);
  };

  const restartAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.addEventListener("click", () => {
      goTo(index);
      restartAutoplay();
    });
    dotsWrap.appendChild(dot);
  });

  prevButton?.addEventListener("click", () => {
    goTo(current - 1);
    restartAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    goTo(current + 1);
    restartAutoplay();
  });

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);

  slider.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0]?.screenX ?? 0;
      stopAutoplay();
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchend",
    (event) => {
      const touchEndX = event.changedTouches[0]?.screenX ?? 0;
      const deltaX = touchEndX - touchStartX;

      if (Math.abs(deltaX) >= 42) {
        goTo(current + (deltaX < 0 ? 1 : -1));
      }

      restartAutoplay();
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  render();
  startAutoplay();
};

initBenefitsSlider();

const initSpotlightGallery = () => {
  const gallery = document.querySelector("[data-spotlight-gallery]");
  if (!gallery) {
    return;
  }

  const slides = gallery.querySelectorAll(".spotlight-gallery-slide");
  const slideCount = slides.length;
  if (slideCount <= 1) {
    return;
  }

  const STACK_DEPTH = 4;
  const STACK_LAYERS = ["p4", "p3", "p2", "p1"];
  const slideStates = [...STACK_LAYERS, "is-hidden"];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const autoplayMs = prefersReducedMotion ? 0 : Number(gallery.dataset.autoplay) || 2800;

  let current = 0;
  let timer = null;

  const wrapIndex = (index) => ((index % slideCount) + slideCount) % slideCount;

  const render = () => {
    slides.forEach((slide, index) => {
      slide.classList.remove(...slideStates);

      const offset = (current - index + slideCount) % slideCount;

      if (offset < STACK_DEPTH) {
        slide.classList.add(STACK_LAYERS[offset]);
        slide.setAttribute("aria-hidden", offset === 0 ? "false" : "true");
      } else {
        slide.classList.add("is-hidden");
        slide.setAttribute("aria-hidden", "true");
      }
    });
  };

  const goTo = (index) => {
    current = wrapIndex(index);
    render();
  };

  const stopAutoplay = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  const startAutoplay = () => {
    if (!autoplayMs) {
      return;
    }

    stopAutoplay();
    timer = window.setInterval(() => {
      goTo(current + 1);
    }, autoplayMs);
  };

  const restartAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  gallery.addEventListener("mouseenter", stopAutoplay);
  gallery.addEventListener("mouseleave", startAutoplay);

  gallery.addEventListener(
    "touchstart",
    () => {
      stopAutoplay();
    },
    { passive: true }
  );

  gallery.addEventListener(
    "touchend",
    () => {
      restartAutoplay();
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  render();
  startAutoplay();
};

initSpotlightGallery();

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".faq-item").forEach((faq) => {
      faq.classList.remove("open");
      faq.querySelector("button").setAttribute("aria-expanded", "false");
      faq.querySelector("span").textContent = "+";
    });

    if (!isOpen) {
      item.classList.add("open");
      button.setAttribute("aria-expanded", "true");
      button.querySelector("span").textContent = "−";
    }
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px",
  }
);

document.querySelectorAll(".reveal-on-scroll").forEach((section) => {
  revealObserver.observe(section);
});

const initCriteriaPillsMobileLayout = () => {
  const container = document.querySelector(".criteria-pills");
  if (!container) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 768px)");

  const getPillLabel = (pill) => pill.textContent.replace(/✓/g, "").trim();

  const restoreDesktopLayout = () => {
    if (!container.dataset.originalHtml) {
      return;
    }

    container.innerHTML = container.dataset.originalHtml;
    container.classList.remove("is-mobile-pyramid");
  };

  const applyMobileLayout = () => {
    if (!container.dataset.originalHtml) {
      container.dataset.originalHtml = container.innerHTML;
    }

    container.innerHTML = container.dataset.originalHtml;
    const pills = Array.from(container.querySelectorAll(":scope > div"));
    const sortedPills = pills.sort(
      (left, right) => getPillLabel(left).length - getPillLabel(right).length
    );

    container.innerHTML = "";
    container.classList.add("is-mobile-pyramid");

    sortedPills.forEach((pill) => {
      container.appendChild(pill);
    });
  };

  const updateLayout = () => {
    if (mobileQuery.matches) {
      applyMobileLayout();
      return;
    }

    restoreDesktopLayout();
  };

  updateLayout();
  mobileQuery.addEventListener("change", updateLayout);
};

initCriteriaPillsMobileLayout();
