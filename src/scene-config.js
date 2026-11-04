// Artwork-relative coordinates, independent of browser size.
// Calibrated to the expanded room; all motion stays within small local masks.
export const scene = {
  size: [2752, 1536],
  center: [.56, .52],
  mobileCenter: [.64, .52],
  head: { center: [1930 / 2752, 721 / 1536], radius: [125 / 2752, 148 / 1536], pivot: [1850 / 2752, 819 / 1536] },
  eyes: [
    { center: [1891 / 2752, 724 / 1536], radius: [13 / 2752, 8 / 1536], angle: .78, iris: [.6, 0, 6.7, 6.7], neutral: [-2.3, .1], travel: [5.8, 3.4] },
    { center: [1926 / 2752, 755 / 1536], radius: [13 / 2752, 8 / 1536], angle: .78, iris: [2.5, -1.4, 6.7, 6.7], neutral: [-2.3, .1], travel: [5.8, 3.4] },
  ],
  cat: { center: [.425, .538], radius: [.045, .040], tail: [.445, .55], tailRadius: [.025, .026] },
  laptop: {center:[1550/2752,760/1536],radius:[130/2752,135/1536],bounds:[1410,630,265,260]},
  lamp: { center: [.4145, .226], radius: [.045, .066] },
  page: {center:[420/2752,576/1536],radius:[55/2752,85/1536],
    paper:[369,499,108,173],patch:[361,490,125,189],nail:[411,506,17,17]},
  foot: {center:[1320/2752,514/1536],radius:[125/2752,165/1536],
    pivot:[1375/2752,565/1536],tip:[1286,452]},
  clock: { center: [0.55, 0.15], radius: [0.05, 0.05] },
  guitar: { center: [2360/2752,790/1536], radius: [125/2752,220/1536], bounds:[2255,565,205,445] },
  book: { center: [1468/2752,1475/1536], radius: [145/2752,70/1536], bounds:[1330,1420,275,116] },
  controller: { center: [0.7, 0.85], radius: [0.05, 0.05] },
  futureObjects: ['workbench', 'pinboard', 'bookshelf', 'trophy', 'records', 'camera', 'notebook', 'window'],
};
