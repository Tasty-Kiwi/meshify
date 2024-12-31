# Meshify

A Figma plugin for converting Figma's vector objects into PPL meshes.

## Limitations

- No Z axis support (2D meshes only). If you need 3D support, we'd recommend [ModEngineer's PewPewLive-MeshExporter](https://github.com/ModEngineer/PewPewLive-MeshExporter) for Blender.
- No colors per vertex. You may only set one color for the entire mesh.
- No Bézier curve support. As a result, some meshes will look jagged or incomplete.

Other limitations will be removed before the full release.

## Development build

```sh
bun dev
```

Bun must be installed as it is used for bundling.

## License

MIT
