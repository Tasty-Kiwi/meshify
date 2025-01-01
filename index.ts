interface Mesh {
  vertexes: number[][]
  segments: number[][]
  colors?: number[]
}

const rgbaFloatToInt = (r: number, g: number, b: number, a: number) =>
  new Uint32Array([
    (Math.round(r * 255) << 24) |
      (Math.round(g * 255) << 16) |
      (Math.round(b * 255) << 8) |
      Math.round(a * 255),
  ])[0]

const nodes: readonly SceneNode[] = figma.currentPage.selection

function convert(workingNode: VectorNode): Mesh {
  console.log(workingNode)

  const mesh: Mesh = {
    vertexes: [],
    segments: [],
  }

  workingNode.vectorNetwork.vertices.forEach((vertex) => {
    console.log(workingNode.height, workingNode.y)
    mesh.vertexes.push([workingNode.x + vertex.x, workingNode.y + (workingNode.height - vertex.y)])
  })

  if (
    workingNode.strokes &&
    workingNode.strokes.length > 0 &&
    workingNode.strokes[0].type === "SOLID"
  ) {
    if (
      workingNode.strokes[0].color.r === 1 &&
      workingNode.strokes[0].color.g === 1 &&
      workingNode.strokes[0].color.b === 1 &&
      workingNode.strokes[0].opacity === 1
    ) {
      console.log("Optimizing white color...")
    } else {
      mesh.colors = []
      for (const _ of workingNode.vectorNetwork.vertices) {
        mesh.colors.push(
          rgbaFloatToInt(
            workingNode.strokes[0].color.r,
            workingNode.strokes[0].color.g,
            workingNode.strokes[0].color.b,
            workingNode.strokes[0].opacity ? workingNode.strokes[0].opacity : 1
          )
        )
      }
    }
  }

  const segments = workingNode.vectorNetwork.segments
  let start = -1
  let end = -1
  let workingSegment: number[] = []

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (i === 0) {
      // Start: 0, End: 1 => 0 -> 1
      workingSegment.push(segment.start, segment.end)

      start = segment.start
      end = segment.end

      continue
    }

    if (segment.start === end) {
      start = segment.start
      end = segment.end
      // Start: 0, End: 1 ->
      // Start: 1, End: 2 => 0 -> 1 -> 2
      workingSegment.push(segment.end)
    } else {
      start = segment.start
      end = segment.end
      mesh.segments.push(workingSegment)
      workingSegment = []

      // Start: 0, End: 1 => 0 -> 1
      workingSegment.push(start, end)
    }

    if (i === segments.length - 1) {
      mesh.segments.push(workingSegment)
    }
  }

  return mesh
}

const meshes: Mesh[] = []

if (nodes.length === 0) {
  figma.notify("⚠️ Please select at least one layer")
  figma.closePlugin()
} else {
  for (const node of nodes) {
    // Check if the node is a vector node
    if (nodes[0].type === "VECTOR") {
      const mesh = convert(node as VectorNode)
      meshes.push(mesh)
    } else {
      figma.notify("⚠️ Please select a vector node")
      figma.closePlugin()
    }
  }
  const luaTable =
    "meshes=" +
    JSON.stringify(meshes)
      .replaceAll("[", "{")
      .replaceAll("]", "}")
      .replaceAll(":", "=")
      .replaceAll('"', "")

  figma.showUI(
    `
      <style>
        .btn {
          color: #ffffff;
          background-color: #2c2c2c;
          font-size: 0.875rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          padding-left: 1.5rem;
          padding-right: 1.5rem;
          border-radius: 0.375rem;
          margin-top: auto;
          width: fit-content;
          margin-top: 0.25rem;
        }
      </style>
      <script>
        function handleCopy() {
          var copyText = document.getElementById("code")
          copyText.select()
          copyText.setSelectionRange(0, 99999)
          document.execCommand("copy")
        }

        function handleDownload() {
          var link = document.createElement("a")
          var content = document.getElementById("code").value
          var file = new Blob([content], { type: "text/plain" })
          link.href = URL.createObjectURL(file)
          link.download = "mesh.lua"
          link.click()
          URL.revokeObjectURL(link.href)
        }
      </script>
      <h1 style="font-family: sans-serif;">Your mesh:</h1>
      <textarea id="code" readonly style="resize: none; height: 10rem; width: 460px">${luaTable}</textarea>
      <div>
        <button class="btn" style="margin-top: 0.25rem" onclick="handleCopy()">
          Copy to clipboard
        </button>
        <button class="btn" onclick="handleDownload()">Save</button>
      </div>
    `,
    {
      width: 480,
      height: 320,
      title: "Meshify - Mesh output",
    }
  )
}
