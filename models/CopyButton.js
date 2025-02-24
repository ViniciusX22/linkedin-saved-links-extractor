class CopyButton {
  setup() {
    window.addEventListener("load", this.observeFiltersBar.bind(this));
  }

  handleCopyButtonClick(event) {
    event.preventDefault();

    const linkExtractor = new LinkExtractor();
    linkExtractor.run();
  }

  getCurrentItem() {
    const urlParts = window.location.pathname.split("/").filter(Boolean);
    return urlParts[urlParts.length - 1].replace(/[-_]/g, " ");
  }

  addCopyButton() {
    const filtersBar = document.querySelector(SELECTORS.FILTERS_BAR);
    if (!filtersBar) return;

    if (filtersBar.querySelector(SELECTORS.EXTRACT_LINKS_BUTTON)) return;

    const newFilterItem = document.createElement("li");
    newFilterItem.className = "search-reusables__primary-filter";

    const buttonElement = document.createElement("button");
    buttonElement.textContent = "Copy all posts links";
    buttonElement.className = [
      "artdeco-pill",
      "artdeco-pill--slate",
      "artdeco-pill--choice",
      "artdeco-pill--2",
      "search-reusables__filter-pill-button",
      "artdeco-pill--selected",
      "copy-links-btn",
    ].join(" ");

    const itemName = this.getCurrentItem();
    buttonElement.textContent = `Copy all ${itemName} links`;
    buttonElement.classList.add("copy-links-btn");

    buttonElement.style.setProperty("--color-checked", "var(--color-brand)");
    buttonElement.style.setProperty(
      "--color-checked-hover",
      "var(--color-brand-active)"
    );
    buttonElement.style.setProperty(
      "--color-checked-active",
      "var(--color-brand-active)"
    );

    buttonElement.addEventListener(
      "click",
      this.handleCopyButtonClick.bind(this)
    );

    newFilterItem.appendChild(buttonElement);
    filtersBar.appendChild(newFilterItem);
  }

  observeFiltersBar() {
    const observer = new MutationObserver(() => {
      if (document.querySelector(SELECTORS.FILTERS_BAR)) {
        this.addCopyButton();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}
