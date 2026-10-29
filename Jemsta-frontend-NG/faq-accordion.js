/* Smooth expand/collapse animation for the FAQ <details> elements.
   Falls back to native instant toggle if the browser lacks the
   Web Animations API, and is skipped entirely when the visitor
   has requested reduced motion. */

const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
).matches;

class FaqAccordion {
    constructor(details) {
        this.details = details;
        this.summary = details.querySelector('summary');
        this.content = details.querySelector('.faq-content');
        this.animation = null;
        this.isClosing = false;
        this.isExpanding = false;

        if (!this.summary || !this.content) return;

        this.summary.addEventListener('click', (event) => this.onClick(event));
    }

    onClick(event) {
        event.preventDefault();
        this.details.style.overflow = 'hidden';

        if (this.isClosing || !this.details.open) {
            this.open();
        } else if (this.isExpanding || this.details.open) {
            this.shrink();
        }
    }

    shrink() {
        this.isClosing = true;
        this.details.classList.remove('is-open');

        const startHeight = `${this.details.offsetHeight}px`;
        const endHeight = `${this.summary.offsetHeight}px`;

        if (this.animation) this.animation.cancel();

        this.animation = this.details.animate(
            { height: [startHeight, endHeight] },
            { duration: 260, easing: 'ease-out' }
        );

        this.animation.onfinish = () => this.onAnimationFinish(false);
        this.animation.oncancel = () => (this.isClosing = false);
    }

    open() {
        this.details.style.height = `${this.details.offsetHeight}px`;
        this.details.open = true;
        this.details.classList.add('is-open');
        window.requestAnimationFrame(() => this.expand());
    }

    expand() {
        this.isExpanding = true;
        const startHeight = `${this.details.offsetHeight}px`;
        const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight}px`;

        if (this.animation) this.animation.cancel();

        this.animation = this.details.animate(
            { height: [startHeight, endHeight] },
            { duration: 280, easing: 'ease-out' }
        );

        this.animation.onfinish = () => this.onAnimationFinish(true);
        this.animation.oncancel = () => (this.isExpanding = false);
    }

    onAnimationFinish(open) {
        this.details.open = open;
        this.animation = null;
        this.isClosing = false;
        this.isExpanding = false;
        this.details.style.height = '';
        this.details.style.overflow = '';
    }
}

if (!prefersReducedMotion && typeof HTMLElement.prototype.animate === 'function') {
    document.querySelectorAll('#faq details').forEach((details) => {
        new FaqAccordion(details);
    });
}
