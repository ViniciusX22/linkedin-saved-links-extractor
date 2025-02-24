class LinkExtractor {
  constructor() {
    this.isFirstPage = true;
    this.links = [];
  }

  findNextElement(startingElement, selector) {
    let next = startingElement;
    while (next) {
      if (next.nextElementSibling) {
        next = next.nextElementSibling;
      } else {
        while (next.parentElement && !next.parentElement.nextElementSibling) {
          next = next.parentElement;
        }
        next = next.parentElement
          ? next.parentElement.nextElementSibling
          : null;
      }

      if (!next) continue;

      const nextMatchingElement = next.querySelector(selector);
      if (!nextMatchingElement) continue;

      return nextMatchingElement;
    }
    return null;
  }

  async waitForLoaderToDisappear(selector) {
    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        const loader = document.querySelector(selector);
        if (!loader) {
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  async getLinks() {
    const startingButton = document.querySelectorAll(
      SELECTORS.MORE_ACTIONS_BUTTON
    )[1];
    let nextButton = startingButton;

    await new Promise((resolve) => setTimeout(resolve, 100));
    window.focus();

    while (nextButton) {
      nextButton = this.findNextElement(
        nextButton,
        SELECTORS.MORE_ACTIONS_BUTTON
      );

      if (nextButton?.closest(SELECTORS.OVERLAY_CONTAINER)) break;

      nextButton.scrollIntoView();
      nextButton.click();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const optionsContainer = nextButton.nextElementSibling;
      const copyLinkButton = optionsContainer?.querySelector(
        SELECTORS.COPY_LINK_BUTTON
      );

      if (!copyLinkButton) continue;

      copyLinkButton.click();
      document.body.focus(); // focus on body to read from clipboard

      this.links.push(
        await navigator.clipboard
          .readText()
          .catch((e) => console.error("Failed to read from clipboard", e))
      );

      if (document.querySelector(SELECTORS.POSTS_LOADER)) {
        await this.waitForLoaderToDisappear(SELECTORS.POSTS_LOADER);
      }
    }

    if (this.links.length === 0) {
      alert("No links found!");
      return;
    }
  }

  async goToNextPage() {
    const nextButton = document.querySelector(SELECTORS.NEXT_PAGE_BUTTON);

    if (!nextButton || nextButton.disabled) return false;

    if (this.isFirstPage) {
      this.isFirstPage = false;
      const userConfirmed = confirm("Copy links from all pages?");
      if (!userConfirmed) return false;
    }

    nextButton.click();

    await this.waitForLoaderToDisappear(SELECTORS.JOBS_LOADER);

    return true;
  }

  async run() {
    await this.getLinks();

    const shouldContinue = await this.goToNextPage();

    if (shouldContinue) {
      await this.run();
      return;
    }

    await navigator.clipboard
      .writeText(this.links.join("\n\n"))
      .catch((e) => console.error("Failed to copy to clipboard", e));

    alert("Links copied to clipboard!");
  }
}
