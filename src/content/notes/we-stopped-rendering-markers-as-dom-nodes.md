---
title: "We stopped rendering markers as DOM nodes"
tags: ["mapbox", "performance"]
publishedAt: "2026-07-12"
draft: false
---

_The map looks simple. The part that made it fast isn't in the map component at all._

At 1acre we had 10,000+ land and plot listings, each needing a marker on the map: a different icon depending on whether it's a plot or a land, colored by price range. Somewhere past a few thousand markers, the map on mobile stopped being a map and started being a slideshow.

The obvious first instinct is `new mapboxgl.Marker()` per listing. Don't. Each one is a real DOM element, an absolutely positioned `<div>` that Mapbox repositions on every pan and zoom by writing a CSS transform to it, every frame, for every marker on screen. That's fine for 50 markers. At 10,000 it's 10,000 elements sitting in the DOM, each one costing style recalculation and layout on every camera move. Mobile Safari gave up first.

The fix wasn't a clever marker component. It was giving Mapbox nothing to individually track at all.

### One layer, not ten thousand markers

Mapbox GL renders `symbol` layers on the GPU, from a GeoJSON source, same as it renders roads or building fills. If every listing is a feature in one `FeatureCollection`, the count stops mattering to the render loop: it's one WebGL draw call whether the source has 10 points or 1,00,000.

```ts
map.addSource("markers-land", {
  type: "geojson",
  data: { type: "FeatureCollection", features: [] },
});

map.addLayer({
  id: "layer-land",
  type: "symbol",
  source: "markers-land",
  layout: {
    "icon-image": ["get", "iconImage"],
    "icon-size": 1,
    "icon-allow-overlap": true,
  },
});
```

Updating the map is just replacing the source's data:

```ts
function updateData(locations) {
  const features = locations.map((loc) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [loc.lng, loc.lat] },
    properties: { iconImage: loc.markerId },
  }));

  map.getSource("markers-land").setData({
    type: "FeatureCollection",
    features,
  });
}
```

No manual DOM diffing, no per-marker event listeners. One `setData` call, and Mapbox figures out what's on screen.

### Icons need to exist before they can be referenced

`icon-image: ["get", "iconImage"]` means every feature just names an image ID that has to already be registered on the map via `map.addImage()`. That's where "plot vs. land, colored by price range" actually happens, not as runtime logic, but as which image ID a listing points to.

Each marker type has an SVG sprite sheet with a symbol per price bracket already baked in: `land-owner-0` through `land-owner-12`, already colored. The backend decides the bracket and hands the client a `marker_id` like `land-owner-7`. The client's only job is to make sure that image exists on the map once:

```ts
async function loadSprite(baseType: string) {
  if (loadedSprites.has(baseType)) return;
  const svg = await fetch(`/marker-sprites/${baseType}.svg`).then((r) =>
    r.text(),
  );

  for (const symbol of parseSymbols(svg)) {
    if (map.hasImage(symbol.id)) continue;
    const bitmap = await rasterize(symbol); // canvas -> ImageBitmap
    map.addImage(symbol.id, bitmap, { pixelRatio: 2 });
  }
  loadedSprites.add(baseType);
}
```

This is the only place a `<canvas>` shows up in the whole pipeline, as a one-time conversion step from SVG to a bitmap Mapbox can hand to the GPU, cached with `map.hasImage` so it never runs twice for the same symbol. It's not "a canvas layer" rendering the markers; it's a cache that runs once per icon variant, no matter how many listings use it.

### The part that actually mattered: not re-fetching

The rendering pipeline above was never the bottleneck once it existed. The bottleneck was network: re-fetching listings on every pan.

The first version scoped each request to the current viewport, refetching on `moveend`. It felt right, why ask for markers you can't see? In practice it meant every pan requested a dataset that was 90% identical to what you already had, plus a sliver of new area, over and over, for every small movement of the map.

What we ship instead: fetch the full (server-clustered, so payload stays bounded) dataset once, and cache it hard.

```ts
const query = useQuery({
  queryKey: ["clusteredLands", filterString],
  queryFn: () => fetchClusteredLands(INDIA_BOUNDS, ZOOM_FOR_SIZE, filterString),
  gcTime: Infinity,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});
```

Bounds aren't in the query key. Panning and zooming become pure client-side operations against a GeoJSON source that's already populated, zero network cost after the initial load, no matter how the user moves the camera.

That comes with a tradeoff we accepted deliberately: because nothing here refetches on its own, a listing added or removed on the backend won't show up until the user does a full page reload. Correctness gave up a little ground to make panning free. For a map where listings change over hours, not seconds, that trade was worth it.

The map component itself ended up looking almost boring: a source, a layer, a `setData` call. The interesting code is the part that decides what goes into that call, and how rarely it gets called at all.
