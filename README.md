# Meshify

A Figma plugin for converting Figma's vector objects into PPL meshes.

## Limitations

- No Z axis support (2D meshes only). If you need 3D support, we'd recommend [ModEngineer's PewPewLive-MeshExporter](https://github.com/ModEngineer/PewPewLive-MeshExporter) for Blender.
- No colors per vertex. You may only set one color for the entire mesh.
- No Bézier curve support. As a result, some meshes will look jagged or incomplete.

Other limitations will be removed before the full release.

## Quirks

- Y axis is inverted on export. Figma's Y axis goes down, whereas PewPew Live's goes up. This was done so that the meshes are visually accurate in both places.
- The plugin will individually flatten the selected objects before converting them into meshes. This is done to permanently apply modifiers such as rotation and flip.

## Development build

```sh
bun dev
```

Bun must be installed as it is used for bundling.

## License

MIT
