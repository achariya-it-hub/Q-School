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
  codingClass: { src: u("photo-1653566031285-8e198bca09d5", 1000), alt: "Young learner in a live coding class" },
  writingClass: { src: u("photo-1599666505327-7758b44a9985", 1000), alt: "Learner joining a creative writing session on a tablet" },
  liveClass: { src: u("photo-1623076189461-f7706b741c04", 1000), alt: "Young learner in a live class on a laptop" },
  coding: { src: u("photo-1597933471507-1ca5765185d8", 600), alt: "Boy learning to code on a laptop" },
  robotics: { src: u("photo-1603354351149-e97b9124020d", 600), alt: "Girl building a robot car in a workshop" },
  group: { src: u("photo-1585980243496-fe29a36bd382", 700), alt: "Children working together at a learning centre" },
  // full-width hero slides (landscape, larger)
  heroCoding: { src: u("photo-1653566031285-8e198bca09d5", 1920), alt: "Young learner coding on a laptop" },
  heroWorkshop: { src: u("photo-1585980243496-fe29a36bd382", 1920), alt: "Children building a project together at a workshop" },
} as const;
