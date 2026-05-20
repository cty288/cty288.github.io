const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const header = document.querySelector("[data-header]");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const navObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  {
    rootMargin: "-30% 0px -55% 0px",
    threshold: [0.1, 0.3, 0.6],
  }
);

sections.forEach((section) => navObserver.observe(section));

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
    rootMargin: "0px 0px -10% 0px",
    threshold: 0.12,
  }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
const projectCards = Array.from(document.querySelectorAll(".project-card"));
const copyEmailBubbles = Array.from(document.querySelectorAll("[data-copy-email]"));

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((candidate) => {
      candidate.classList.toggle("active", candidate === button);
    });

    projectCards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.category === filter;
      card.hidden = !shouldShow;
    });
  });
});

const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px";
  document.body.append(textArea);
  textArea.select();

  const didCopy = document.execCommand("copy");
  textArea.remove();

  if (!didCopy) {
    throw new Error("Clipboard copy command failed.");
  }
};

copyEmailBubbles.forEach((bubble) => {
  const textElement = bubble.querySelector(".email-copy-text");
  const email = bubble.dataset.copyEmail;
  const defaultText = textElement?.textContent || email;
  let resetTimer;

  const showCopyState = (message, className) => {
    window.clearTimeout(resetTimer);
    bubble.classList.remove("is-copied", "is-copy-failed");
    bubble.classList.add(className);

    if (textElement) {
      textElement.textContent = message;
    }

    resetTimer = window.setTimeout(() => {
      bubble.classList.remove(className);

      if (textElement) {
        textElement.textContent = defaultText;
      }
    }, 1400);
  };

  const handleCopy = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await copyToClipboard(email);
      showCopyState(bubble.dataset.copyFeedback || "Copied", "is-copied");
    } catch (error) {
      console.error("Could not copy email address.", error);
      showCopyState("Copy failed", "is-copy-failed");
    }
  };

  bubble.addEventListener("click", handleCopy);
  bubble.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      handleCopy(event);
    }
  });
});

window.addEventListener("load", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
