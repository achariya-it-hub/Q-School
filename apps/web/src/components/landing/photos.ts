/**
 * Home-page photos. These are free-licence stock photos from Unsplash
 * (https://unsplash.com/license), loaded from Unsplash's CDN.
 *
 * To use your own photos (recommended: real Q-School classes and centres, with
 * parents' consent), copy the files into apps/web/public/photos/ and change a
 * `src` to e.g. "/photos/live-class.jpg". If an image ever fails to load, the
 * page shows a branded illustration instead.
 */
const u = (id: string, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const PHOTOS = {
  codingClass: { src: "/images/pic-girl.png", alt: "Young Neo Sapiens learner at Q-School" },
  writingClass: { src: "/images/programs/quantum-reading.jpg", alt: "Learner reading and comprehending deeply" },
  liveClass: { src: "/images/bmit-hero.png", alt: "Young learner in a live Q-School quantum class" },
  coding: { src: "/images/programs/quantum-learning.jpg", alt: "Boy building cognitive mental models" },
  robotics: { src: "/images/programs/quantum-creation.jpg", alt: "Child building creative innovations in a workshop" },
  group: { src: "/images/workshop.png", alt: "Children working together at a Q-School learning centre" },
  // full-width hero slides (landscape, larger)
  heroCoding: { src: "/images/side-brain.png", alt: "Human Intelligence in the Age of AI" },
  heroWorkshop: { src: "/images/side-family.png", alt: "Modern state-of-the-art Q-School learning space" },
} as const;
