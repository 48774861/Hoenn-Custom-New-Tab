// Navigate to a new link.
export function navigate(url) {
  setTimeout(() => {
    window.location.href = url;
  }, 0.001);
}