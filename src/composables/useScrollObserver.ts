import { onMounted, onUnmounted, ref } from 'vue';

export function useScrollObserver(options: IntersectionObserverInit = {}) {
  const elements = ref<HTMLElement[]>([]);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          // Optionally unobserve after animating once
          observer?.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px',
      ...options,
    });

    const targets = document.querySelectorAll('.reveal-on-scroll');
    targets.forEach((el) => observer?.observe(el));
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  return {
    elements,
  };
}
