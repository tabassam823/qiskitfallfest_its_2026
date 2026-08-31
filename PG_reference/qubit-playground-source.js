function _1(InlineDraw,Vec2,md){return(
md`# Interactive Visual Qubit Playground


### Instructions:

- Click or click+drag to place "wires".
- Place wires beside the source ( ${InlineDraw.source('')} ) to connect the wire to the source. Once you place a wire beside a source, qubits ( ${InlineDraw.ket(Vec2.unitFromRadians(0))}) will start to flow out of the source.
- Press the 'x' key to place an ${InlineDraw.box('X')} (a.k.a. NOT, or diagonal reflection) gate under your cursor.
- Press the 'z' key to place a ${InlineDraw.box('Z')} (vertical reflection) gate under the cursor.
- Press the delete/backspace key to remove the wire/gate under your cursor.

`
)}

function _2(md){return(
md`---`
)}

function _3(md){return(
md`## Playground
*Try placing wires and gates before moving onto the advanced instructions and puzzle...*`
)}

function _4(game,gridSize,CircuitGrid,Direction){return(
game(
  gridSize * 3,
  (circuit) =>
    CircuitGrid.insert(circuit, [1, 1], Direction.UP, CircuitGrid.SOURCE),
  () => {}
)
)}

function _5(md){return(
md`---`
)}

function _6(InlineDraw,Vec2,md){return(
md`## Advanced instructions

- Press the 'h' key to place an ${InlineDraw.box('H')} (a.k.a. Hadamard) gate under the cursor.
- Press the 'r' key to place an ${InlineDraw.box('⟲')} (a.k.a. R or 22.5° rotation) gate under the cursor.
  - 📘 Hint: try an H gate, followed by an R gate, followed by another H gate. What does this combination of gates do? How about H, R, R, H? H, R, R, R, H?
- Press the 'm' key to place a ${InlineDraw.box('📸')} measurement device under the cursor.
  - *📝 Note: the measurement device isn't useful for this puzzle, but it is included because it might be interesting to see what quantum measurement is like. The measurement device makes an input qubit either point up ${InlineDraw.ket(Vec2.unitFromRadians(Math.PI*3/2))} or right ${InlineDraw.ket(Vec2.unitFromRadians(0))}. The qubit aligns to up ${InlineDraw.ket(Vec2.unitFromRadians(Math.PI*3/2))} or right ${InlineDraw.ket(Vec2.unitFromRadians(0))} randomly, but the likelihood of the alignment result is proportional to how vertical or horizontal the qubit is (e.g. ${InlineDraw.ket(Vec2.unitFromRadians(0-0.2))} will most likely be aligned to pointing right).*`
)}

function _7(md){return(
md`---`
)}

function _8(InlineDraw,md){return(
md`## Challenge Puzzle
Place some wires to connect the source ( ${InlineDraw.source()} ) to the goal ( ${InlineDraw.box('🏁')} )!<br>
*Try to solve the puzzle using less than 6 gates! Leave a comment with your solution!*`
)}

function _9(game,gridSize,CircuitGrid,Direction,Radians,Numbers,Draw,Vec2){return(
game(
  gridSize * 3,
  (circuit) => {
    CircuitGrid.insert(circuit, [1, 1], Direction.UP, CircuitGrid.SOURCE);
    CircuitGrid.insert(circuit, [12, 1], Direction.UP, CircuitGrid.BOX, {
      func: (vec, item) => {
        circuit.items = circuit.items.filter((otherItem) => otherItem !== item);

        const goalRotation = Math.PI * 2 * (5 / 8);
        const itemRotation = Radians.fromVec(vec);
        const diff = Numbers.subMod(goalRotation, itemRotation, Math.PI * 2);

        if (diff < 0.01 && diff > -0.01) circuit.score++;
      },
      label: "🏁"
    });
  },
  (circuit, width, height, context) => {
    Draw.statusText([width - 300, 25], "Collect 10", context);
    Draw.item(
      {
        data: Vec2.rotate((Math.PI * 5) / 4, [0, 1]),
        position: [width - 158, 17]
      },
      context
    );
    Draw.statusText([width - 128, 25], "to solve.", context);
    Draw.statusText([width - 300, 55], circuit.score, context);
    Draw.statusText([width - 260, 55], "collected.", context);
  }
)
)}

function _10(md){return(
md`---`
)}

async function _11(FileAttachment,InlineDraw,Vec2,tex,md){return(
md`## About
### The playground
This playground gives you an visual way to understand and interact with quantum computing. You can get a sense for how a qubit can look and how it can change. It also allows you to create some simple "quantum algorithms" to solve a puzzle. My goal with this project is to create the foundation for a visual and interactive way of trying out quantum computer simulations.

This playground uses a mix between conventional "quantum circuit" symbols, and custom symbols. 
<figure align="center">
  <img alt="image.png" src="${await FileAttachment("qc2.png").url()}">
  <figcaption>An example of a conventional quantum circuit diagram.</figcaption>
</figure>
If you're curious about how the "arrow" qubits translate into conventional qubit notation:<br>
${InlineDraw.ket(Vec2.unitFromRadians(0))}${tex`=|0\rangle,`} ${InlineDraw.ket(Vec2.unitFromRadians(Math.PI))}${tex`=-|0\rangle,`}<br><br>
${InlineDraw.ket(Vec2.unitFromRadians(-Math.PI/2))}${tex`=|1\rangle,`} ${InlineDraw.ket(Vec2.unitFromRadians(Math.PI/2))}${tex`=-|1\rangle,`}<br>
${InlineDraw.ket(Vec2.unitFromRadians(-Math.PI/4))}${tex`=\frac{|0\rangle+|1\rangle}{\sqrt{2}},...`} (a qubit in superposition!)

Also note that in real quantum computers, ${InlineDraw.box('📸')} measurements are the only way to get information out of a quantum computer! Notice how measurements change the qubit (by aligning it) and give a random (yet controllable) result.

### What's next for interactive visual quantum?

I hope that this interactive and visual way of experiencing quantum computing can both make quantum computing more accessible, and set a foundation for a visual understanding of quantum computing.

I plan on making an article explaining the basics of quantum computing, with puzzles interspersed to challenge your understanding. Please follow me here on Observable or on twitter [@elliotokay](https://twitter.com/elliotokay) if you want to see more interactive visual quantum computing!

I would greatly appreciate any feedback on this playground and article! Please feel free to leave a comment or reach out, it would help me a lot!`
)}

function _12(md){return(
md`---`
)}

function _13(md){return(
md`## Appendix: The code!`
)}

function _gridSize(){return(
64
)}

function _game(gridSize,DOM,width,InputState,Direction,Bool,Vec2,Array2D,CircuitGrid,Item,Draw,invalidation){return(
(height = gridSize * 3, onInit = () => {}, onLoop = () => {}) => {
  const context = DOM.context2d(width, height);
  const canvas = context.canvas;
  const input = new InputState(canvas);

  const circuit = {
    grid: [[]],
    wireCounter: 0,
    sourceWireFromWireNumber: new Map(),
    items: [],
    score: 0
  };
  onInit(circuit);

  let prevMousePos = [0, 0];
  let hoverIndex2D = [0, 0];
  let prevHoverIndex2D = [0, 0];
  let hoverDirection = Direction.UP;

  let frame;
  (function tick() {
    frame = requestAnimationFrame(tick);
    context.clearRect(0, 0, width, height);

    if (!Bool.fromVec2sAreEqual(input.mouse, prevMousePos)) {
      hoverIndex2D = Vec2.mulByNumber(input.mouse, 1 / gridSize).map(
        Math.floor
      );
    }
    prevMousePos = input.mouse;

    if (input.isKeyPressed("ArrowLeft")) {
      hoverIndex2D = Vec2.add(hoverIndex2D, [-1, 0]);
    }
    if (input.isKeyPressed("ArrowRight")) {
      hoverIndex2D = Vec2.add(hoverIndex2D, [1, 0]);
    }
    if (input.isKeyPressed("ArrowUp")) {
      hoverIndex2D = Vec2.add(hoverIndex2D, [0, -1]);
    }
    if (input.isKeyPressed("ArrowDown")) {
      hoverIndex2D = Vec2.add(hoverIndex2D, [0, 1]);
    }

    if (!Bool.fromVec2sAreEqual(prevHoverIndex2D, hoverIndex2D)) {
      hoverDirection = Direction.betweenVec2s(prevHoverIndex2D, hoverIndex2D);
    }

    const hoverEntry = Array2D.getEntry(circuit.grid, hoverIndex2D);
    const hoverOverwritable =
      !hoverEntry || hoverEntry.type === CircuitGrid.WIRE;

    if (
      input.isButtonDown("left") ||
      input.isKeyDown("enter") ||
      input.isKeyDown(" ")
    ) {
      CircuitGrid.insert(circuit, hoverIndex2D, hoverDirection);
    }
    if (hoverOverwritable) {
      if (input.isKeyDown("x")) {
        CircuitGrid.remove(circuit, hoverIndex2D);
        CircuitGrid.insert(
          circuit,
          hoverIndex2D,
          hoverDirection,
          CircuitGrid.BOX,
          {
            func: (vec) =>
              Vec2.leftMulBy4x4Matrix(
                [
                  [0, 1],
                  [1, 0]
                ],
                vec
              ),
            label: "X"
          }
        );
      }
      if (input.isKeyDown("z")) {
        CircuitGrid.remove(circuit, hoverIndex2D);
        CircuitGrid.insert(
          circuit,
          hoverIndex2D,
          hoverDirection,
          CircuitGrid.BOX,
          {
            func: (vec) =>
              Vec2.leftMulBy4x4Matrix(
                [
                  [1, 0],
                  [0, -1]
                ],
                vec
              ),
            label: "Z"
          }
        );
      }
      if (input.isKeyDown("h")) {
        CircuitGrid.remove(circuit, hoverIndex2D);
        CircuitGrid.insert(
          circuit,
          hoverIndex2D,
          hoverDirection,
          CircuitGrid.BOX,
          {
            func: (vec) =>
              Vec2.leftMulBy4x4Matrix(
                [
                  [1 / Math.sqrt(2), 1 / Math.sqrt(2)],
                  [1 / Math.sqrt(2), -1 / Math.sqrt(2)]
                ],
                vec
              ),
            label: "H"
          }
        );
      }
      if (input.isKeyDown("r")) {
        CircuitGrid.remove(circuit, hoverIndex2D);
        CircuitGrid.insert(
          circuit,
          hoverIndex2D,
          hoverDirection,
          CircuitGrid.BOX,
          {
            func: (vec) => Vec2.rotate(-Math.PI / 8, vec),
            label: "⟲"
          }
        );
      }
      if (input.isKeyDown("m")) {
        CircuitGrid.remove(circuit, hoverIndex2D);
        CircuitGrid.insert(
          circuit,
          hoverIndex2D,
          hoverDirection,
          CircuitGrid.BOX,
          {
            func: (vec) => {
              const probVec = [vec[0] ** 2, vec[1] ** 2];
              if (Math.random() < vec[0] ** 2) {
                return [1, 0];
              } else {
                return [0, 1];
              }
            },
            label: "📸"
          }
        );
      }
    }
    if (input.isKeyPressed("i")) {
      console.log(Array2D.getEntry(circuit.grid, hoverIndex2D));
    }
    if (input.isKeyDown("backspace")) {
      const wire = Array2D.getEntry(circuit.grid, hoverIndex2D);
      if (wire?.type !== CircuitGrid.SOURCE && wire?.data?.label !== "🏁") {
        CircuitGrid.remove(circuit, hoverIndex2D);
      }
    }

    for (const [wireNumber, wire] of circuit.sourceWireFromWireNumber) {
      if (wire.time % 60 === 0 && wire.adjacentWires.size > 0) {
        Item.make(wire, [1, 0], gridSize, circuit.items);
      }
      wire.time++;
    }

    for (const item of circuit.items) {
      const index2D = [
        Math.floor(item.position[0] / gridSize),
        Math.floor(item.position[1] / gridSize)
      ];
      const wire = Array2D.getEntry(circuit.grid, index2D);
      if (wire) {
        if (!Item.move(item, circuit.items, circuit.grid, gridSize)) {
          circuit.items = circuit.items.filter(
            (otherItem) => otherItem !== item
          );
        }
      } else {
        circuit.items = circuit.items.filter((otherItem) => otherItem !== item);
      }
    }

    Draw.grid(width, height, gridSize, context);
    Draw.cursorGridHighlight(hoverIndex2D, gridSize, context);
    Draw.cursorGridHighlight(prevHoverIndex2D, gridSize, context);
    onLoop(circuit, width, height, context);

    if (!Bool.fromVec2sAreEqual(prevHoverIndex2D, hoverIndex2D)) {
      prevHoverIndex2D = hoverIndex2D;
    }

    for (let x = 0; x < width / gridSize; x++) {
      for (let y = 0; y < height / gridSize; y++) {
        const entry = Array2D.getEntry(circuit.grid, [x, y]);
        if (entry?.type === CircuitGrid.WIRE) {
          Draw.wire(entry, gridSize, context);
        } else if (entry?.type === CircuitGrid.BOX) {
          Draw.wire(entry, gridSize, context);
        }
      }
    }

    for (const item of circuit.items) {
      Draw.item(item, context);
    }

    for (let x = 0; x < width / gridSize; x++) {
      for (let y = 0; y < height / gridSize; y++) {
        const entry = Array2D.getEntry(circuit.grid, [x, y]);
        if (entry?.type === CircuitGrid.BOX) {
          Draw.box(entry, gridSize, context);
        } else if (entry?.type === CircuitGrid.SOURCE) {
          Draw.source(entry, gridSize, context);
        }
      }
    }

    if (circuit.score > 9) {
      Draw.winCover(width, height, context);
    }

    input.frameReset();
  })();
  invalidation.then(() => cancelAnimationFrame(frame));

  return canvas;
}
)}

function _Item(Vec2,gridSize,Direction,Array2D,CircuitGrid,Bool)
{
  const _targetPosition = (wire, wirePosition) => {
    const centerOfGridSquare = Vec2.fromIndexAndScale(wire.index2D, gridSize);
    if (wirePosition < 0.5) {
      if (!wire.fromWire) return false;
      const fromDir = Direction.betweenVec2s(
        wire.index2D,
        wire.fromWire.index2D
      );
      const fromStartPosition = Vec2.add(
        centerOfGridSquare,
        Vec2.mulByNumber(Vec2.unitFromDirection(fromDir), gridSize / 2)
      );

      return Vec2.lerp(fromStartPosition, centerOfGridSquare, wirePosition * 2);
    } else {
      if (!wire.toWire) return false;
      const toDir = Direction.betweenVec2s(wire.index2D, wire.toWire.index2D);
      const toEndPosition = Vec2.add(
        centerOfGridSquare,
        Vec2.mulByNumber(Vec2.unitFromDirection(toDir), gridSize / 2)
      );

      return Vec2.lerp(
        centerOfGridSquare,
        toEndPosition,
        (wirePosition - 0.5) * 2
      );
    }
  };

  const isBlocked = (wire, wirePosition, items, item) => {
    for (const otherItem of items) {
      if (otherItem === item) break;

      if (wire === otherItem.wire) return true;

      if (wire.toWire === otherItem.wire) {
        const diff = Math.abs(wirePosition - (1 + otherItem.wirePosition));
        if (diff < 0.8) return true;
      }
    }
    return false;
  };

  const make = (wire, data, gridSize, items) => {
    const center = Vec2.add(
      Vec2.mulByNumber(wire.index2D, gridSize),
      Vec2.fromNumber(gridSize / 2)
    );
    if (!isBlocked(wire, 0.5, items)) {
      items.push({
        wirePosition: 0.5,
        position: center,
        wire,
        data,
        lastTransformIndex: [-1, -1]
      });
    }
  };

  const move = (item, items, grid, gridSize) => {
    const itemIndex2D = [
      Math.floor(item.position[0] / gridSize),
      Math.floor(item.position[1] / gridSize)
    ];

    const newWire = Array2D.getEntry(grid, itemIndex2D);
    if (item.wire !== newWire && newWire) {
      item.wire = newWire;
      item.wirePosition = item.wirePosition % 1;
    }
    const wire = item.wire;

    let targetPosition = _targetPosition(wire, item.wirePosition);
    if (!targetPosition) return false;

    let speed = 0.04;

    const itemIsInCenter = item.wirePosition < 0.6 && item.wirePosition > 0.4;
    if (wire.type === CircuitGrid.BOX) {
      speed = 0.02;
      if (
        itemIsInCenter &&
        !Bool.fromVec2sAreEqual(item.lastTransformIndex, wire.index2D)
      ) {
        item.lastTransformIndex = wire.index2D;
        item.data = wire.data.func(item.data, item);
      }
    }

    item.position = Vec2.lerp(item.position, targetPosition, 0.5);
    if (!isBlocked(wire, item.wirePosition, items, item)) {
      item.wirePosition += speed;
    }

    if (item.wirePosition >= 0.5) {
      if (!wire.toWire) {
        item.wirePosition = 0.499;
      }
    }

    return true;
  };

  return {
    make,
    move
  };
}


function _Draw(Vec2,Iterable,Direction,Numbers,Radians,Color)
{
  const winCover = (width, height, context) => {
    context.fillStyle = "#48DC83";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#19753e";
    context.font = "bold 60px Source Serif Pro";
    context.fillText("You solved it!", width / 2 - 200, height / 2 - 30);
  };

  const statusText = ([x, y], text, context) => {
    context.fillStyle = "#333";
    context.font = "bold 26px Source Serif Pro";
    context.fillText(text, x, y);
  };

  const cursorGridHighlight = ([x, y], gridSize, context) => {
    context.fillStyle = "#FFD600";
    context.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
  };

  const grid = (width, height, gridSize, context) => {
    context.fillStyle = "#EEE";
    for (let x = 0; x < width; x += gridSize) {
      context.fillRect(x - 2, 0, 2, height);
    }
    for (let y = 0; y < height; y += gridSize) {
      context.fillRect(0, y - 2, width, 2);
    }
  };

  const wire = (w, gridSize, context) => {
    const center = Vec2.add(
      Vec2.mulByNumber(w.index2D, gridSize),
      Vec2.fromNumber(gridSize / 2)
    );

    const adjacentConnectionPositions = Array.from(
      Iterable.map(w.adjacentWires, (adjacentWire) => {
        const direction = Direction.betweenVec2s(
          w.index2D,
          adjacentWire.index2D
        );
        const dirVec = Vec2.unitFromDirection(direction);
        const connectionPosition = Vec2.add(
          center,
          Vec2.mulByNumber(dirVec, gridSize / 2)
        );
        return connectionPosition;
      })
    );

    context.lineWidth = 7;
    context.strokeStyle = "black";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    if (adjacentConnectionPositions.length === 0) {
      context.moveTo(...Vec2.add(center, [-5, 0]));
      context.lineTo(...Vec2.add(center, [5, 0]));
      context.moveTo(...Vec2.add(center, [0, -5]));
      context.lineTo(...Vec2.add(center, [0, 5]));
    } else {
      for (const position of adjacentConnectionPositions) {
        context.moveTo(...center);
        context.lineTo(...position);
      }
    }
    context.stroke();
    context.closePath();

    // Notes for bendy wires:
    // wire direction cases (11 total)
    // if (w.adjacentWires.size === 2) {
    //   - straight line (vertical or horizontal)

    //   - bend (4 corners)
    // } else if (w.adjacentWires.size === 1) {
    //   - short line (4 cardinal directions)
    // } else {
    //   - no directions
    // }

    // if (w.toWire || w.fromWire) {
    //   animate flow
    // }
  };
  const box = (w, gridSize, context) => {
    const gridInset = 10;
    const topLeft = Vec2.add(
      Vec2.mulByNumber(w.index2D, gridSize),
      Vec2.fromNumber(gridInset)
    );
    const length = gridSize - gridInset * 2;

    // BOX
    context.strokeStyle = "black";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 9;
    context.beginPath();
    context.moveTo(...topLeft);
    context.lineTo(...Vec2.add(topLeft, [length, 0]));
    context.lineTo(...Vec2.add(topLeft, [length, length]));
    context.lineTo(...Vec2.add(topLeft, [0, length]));
    context.lineTo(...topLeft);
    context.stroke();
    context.fillStyle = "white";
    context.fill();
    context.closePath();

    // TEXT
    context.fillStyle = "black";
    context.font = "30px arial";
    context.fillText(
      w.data.label,
      ...Vec2.add(topLeft, [length / 3.8, length * 0.75])
    );
  };

  const arrow = (tail, tip, color, context) => {
    context.strokeStyle = color;
    context.lineCap = "round";
    context.lineJoin = "round";
    const size = Numbers.distanceBetweenVec2s(tail, tip);
    context.lineWidth = size / 6;
    context.beginPath();
    context.moveTo(...tail);
    context.lineTo(...tip);
    const arrowHead1Angle = Radians.betweenVec2s(tip, tail) + Math.PI / 4;
    const arrowHead2Angle = Radians.betweenVec2s(tip, tail) - Math.PI / 4;
    const arrowHead1 = Vec2.add(
      tip,
      Vec2.mulByNumber(Vec2.unitFromRadians(arrowHead1Angle), size / 2)
    );
    const arrowHead2 = Vec2.add(
      tip,
      Vec2.mulByNumber(Vec2.unitFromRadians(arrowHead2Angle), size / 2)
    );
    context.lineTo(...arrowHead1);
    context.moveTo(...tip);
    context.lineTo(...arrowHead2);
    context.stroke();
    context.closePath();
  };

  const source = (w, gridSize, context) => {
    const center = Vec2.add(
      Vec2.mulByNumber(w.index2D, gridSize),
      Vec2.fromNumber(gridSize / 2)
    );
    context.fillStyle = "black";
    context.beginPath();
    context.arc(...center, gridSize / 2, 0, Math.PI * 2, true); // Outer circle
    context.fill();
    context.closePath();
    //wire(w, gridSize, context);
    arrow(
      [center[0] - 10, center[1]],
      [center[0] + 10, center[1]],
      "white",
      context
    );
  };

  const ket = (position, color, context) => {
    const height = 11;
    const backWidth = 15;
    const forwardWidth = 11;

    context.strokeStyle = "white";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 9;
    context.fillStyle = "white";
    context.beginPath();
    // back line |
    context.moveTo(...Vec2.add(position, [-backWidth, height]));
    context.lineTo(...Vec2.add(position, [-backWidth, -height]));
    // front angle bracket >
    context.lineTo(...Vec2.add(position, [forwardWidth, -height]));
    context.lineTo(...Vec2.add(position, [forwardWidth + height, 0]));
    context.lineTo(...Vec2.add(position, [forwardWidth, height]));
    context.lineTo(...Vec2.add(position, [-backWidth, height]));
    context.fill();
    //context.stroke();
    context.closePath();

    context.strokeStyle = color;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 3;
    context.beginPath();
    // back line |
    context.moveTo(...Vec2.add(position, [-backWidth, height]));
    context.lineTo(...Vec2.add(position, [-backWidth, -height]));
    // front angle bracket >
    context.moveTo(...Vec2.add(position, [forwardWidth, -height]));
    context.lineTo(...Vec2.add(position, [forwardWidth + height, 0]));
    context.lineTo(...Vec2.add(position, [forwardWidth, height]));
    context.stroke();
    context.closePath();
  };
  const item = (item, context) => {
    const color = Color.interpolateHex(0xff0000, 0x0000ff, item.data[0] ** 2);
    ket(item.position, color, context);
    const flippedYData = [item.data[0], -item.data[1]]; // Flip y coordinate so up is [1,0]
    const angle = Radians.betweenVec2s([0, 0], flippedYData);
    const tail = Vec2.add(
      item.position,
      Vec2.mulByNumber(Vec2.rotateHalf(Vec2.unitFromRadians(angle)), 8)
    );
    const tip = Vec2.add(
      item.position,
      Vec2.mulByNumber(Vec2.unitFromRadians(angle), 8)
    );
    arrow(tail, tip, color, context);
  };

  return {
    winCover,
    statusText,
    cursorGridHighlight,
    grid,
    wire,
    box,
    source,
    item
  };
}


function _InlineDraw(DOM,gridSize,Item,Draw)
{
  const ket = (vec) => {
    const ketContext = DOM.context2d(gridSize - 22, gridSize - 30);
    const canvas = ketContext.canvas;

    const items = [];
    ketContext.clearRect(0, 0, gridSize - 22, gridSize - 30);
    ketContext.translate(-15, -15);
    Item.make({ index2D: [0, 0] }, vec, gridSize, items);
    Draw.item(items[0], ketContext);
    ketContext.translate(15, 15);

    return canvas;
  };
  const box = (label) => {
    const context = DOM.context2d(gridSize * 0.5, gridSize * 0.5);
    const canvas = context.canvas;
    context.scale(0.5, 0.5);
    Draw.box({ index2D: [0, 0], data: { label } }, gridSize, context);

    return canvas;
  };
  const source = () => {
    const context = DOM.context2d(gridSize * 0.5, gridSize * 0.5);
    const canvas = context.canvas;
    context.scale(0.5, 0.5);
    Draw.source({ index2D: [0, 0] }, gridSize, context);

    return canvas;
  };

  return {
    ket,
    box,
    source
  };
}


function _Color()
{
  const rgbToHex = ([r, g, b]) => {
    let hexColor = 0;
    return (r << 16) + (g << 8) + b;
  };

  const hexToRgb = (hexColor) => {
    hexColor >>>= 0;
    const b = hexColor & 0xff,
      g = (hexColor & 0xff00) >>> 8,
      r = (hexColor & 0xff0000) >>> 16;
    return [r, g, b];
  };

  const rgbToCSSColorString = ([r, g, b]) => `rgb(${r},${g},${b})`;

  const interpolateHex = (hexColor1, hexColor2, value = 0.5) => {
    const [r1, g1, b1] = hexToRgb(hexColor1);
    const [r2, g2, b2] = hexToRgb(hexColor2);
    return rgbToCSSColorString([
      r1 * value + r2 * (1 - value),
      g1 * value + g2 * (1 - value),
      b1 * value + b2 * (1 - value)
    ]);
  };

  return { interpolateHex };
}


function _CircuitGrid(Iterable,Graph,Array2D,Direction,Vec2)
{
  const WIRE = Symbol("wire");
  const BOX = Symbol("Box");
  const SOURCE = Symbol("Source");

  const _propogateWireDirection = (sourceWire) => {
    for (const [wire, prevWire] of Iterable.skip(
      1,
      Iterable.withHistory(
        2,
        Graph.walk(sourceWire, (v) => v.adjacentWires)
      )
    )) {
      wire.toWire = null;
      wire.fromWire = prevWire;
      prevWire.toWire = wire;
    }
  };

  const _propogateWireNumber = (
    sourceWireFromWireNumber,
    inWire,
    wireNumber
  ) => {
    for (const wire of Graph.walk(inWire, (v) => v.adjacentWires)) {
      if (wire.type === SOURCE) {
        sourceWireFromWireNumber.delete(wire.wireNumber);
        sourceWireFromWireNumber.set(wireNumber, wire);
      }
      wire.wireNumber = wireNumber;
    }
  };

  const _removeConnect = (circuit, fromWire, toWire) => {
    if (fromWire.adjacentWires.has(toWire)) {
      fromWire.adjacentWires.delete(toWire);
      _propogateWireNumber(
        circuit.sourceWireFromWireNumber,
        fromWire,
        circuit.wireCounter++
      );

      const sourceWire = circuit.sourceWireFromWireNumber.get(
        fromWire.wireNumber
      );
      if (sourceWire) {
        _propogateWireDirection(sourceWire);
      } else {
        for (const currentWire of Graph.walk(
          fromWire,
          (v) => v.adjacentWires
        )) {
          currentWire.toWire = null;
          currentWire.fromWire = null;
        }
      }
    }
  };

  const remove = (circuit, index2D) => {
    const grid = circuit.grid;
    const wire = Array2D.getEntry(grid, index2D);
    if (wire) {
      if (wire.type === SOURCE) {
        circuit.sourceWireFromWireNumber.delete(wire.wireNumber);
      }
      Array2D.setEntry(grid, index2D, undefined);
      for (const direction of Direction.DIRECTIONS) {
        const adjacent = Array2D.getEntry(
          grid,
          Vec2.add(index2D, Vec2.fromDirection(direction))
        );

        if (adjacent) {
          _removeConnect(circuit, adjacent, wire);
        }
      }
    }
  };

  // This function just checks if the fromEntry is able to connect to the toEntry,
  // it doesn't check if the toEntry can connect to the fromEntry.
  const _canConnect = (sourceWireFromWireNumber, fromWire, toWire) => {
    if (!fromWire || !toWire) return false;
    if (fromWire.type === WIRE || fromWire.type === BOX) {
      return (
        fromWire.adjacentWires.size < 2 &&
        fromWire.wireNumber !== toWire.wireNumber &&
        !(
          sourceWireFromWireNumber.has(fromWire.wireNumber) &&
          sourceWireFromWireNumber.has(toWire.wireNumber)
        )
      );
    } else if (fromWire.type === SOURCE) {
      return (
        fromWire.adjacentWires.size < 1 &&
        !sourceWireFromWireNumber.has(toWire.wireNumber)
      );
    }
    console.warn(fromWire, toWire);
    throw "CircuitGrid _canConnect unexpected code path!";
  };

  const _tryConnect = (sourceWireFromWireNumber, wire1, wire2) => {
    if (
      _canConnect(sourceWireFromWireNumber, wire1, wire2) &&
      _canConnect(sourceWireFromWireNumber, wire2, wire1)
    ) {
      const wireNumber = Math.min(wire1.wireNumber, wire2.wireNumber);
      wire1.wireNumber = wireNumber;
      wire2.wireNumber = wireNumber;

      wire1.adjacentWires.add(wire2);
      wire2.adjacentWires.add(wire1);

      _propogateWireNumber(sourceWireFromWireNumber, wire1, wireNumber);
      _propogateWireNumber(sourceWireFromWireNumber, wire2, wireNumber);

      const sourceWire = sourceWireFromWireNumber.get(wireNumber);
      if (sourceWire) {
        _propogateWireDirection(sourceWire);
      }
      return true;
    }
    return false;
  };

  const _forceConnect = (circuit, fromWire, toWire) => {
    let relocatedWire;
    const alreadyConnected = toWire.adjacentWires.has(fromWire);
    const canForceConnect = !_canConnect(
      circuit.sourceWireFromWireNumber,
      toWire,
      fromWire
    );
    if (!alreadyConnected && canForceConnect) {
      let toAdjacentWire;
      if (
        circuit.sourceWireFromWireNumber.has(toWire.wireNumber) &&
        circuit.sourceWireFromWireNumber.has(fromWire.wireNumber) &&
        toWire.wireNumber !== fromWire.wireNumber
      ) {
        toAdjacentWire =
          toWire.fromWire || Iterable.first(toWire.adjacentWires);
      } else {
        toAdjacentWire = toWire.toWire || Iterable.first(toWire.adjacentWires);
      }

      if (toAdjacentWire) {
        relocatedWire = toAdjacentWire;
        _removeConnect(circuit, toWire, toAdjacentWire);
        _removeConnect(circuit, toAdjacentWire, toWire);
      }
    }
    _tryConnect(circuit.sourceWireFromWireNumber, fromWire, toWire);
    return relocatedWire;
  };

  const _setWire = (circuit, wire) => {
    for (const direction of Direction.DIRECTIONS) {
      const adjacentWire = Array2D.getEntry(
        circuit.grid,
        Vec2.add(wire.index2D, Vec2.fromDirection(direction))
      );
      _tryConnect(circuit.sourceWireFromWireNumber, wire, adjacentWire);
    }
  };

  const insert = (circuit, index2D, facing, type = WIRE, data) => {
    const grid = circuit.grid;
    if (Array2D.getEntry(grid, index2D)) {
      const wire = Array2D.getEntry(grid, index2D);

      const fromWire = Array2D.getEntry(
        grid,
        Vec2.add(index2D, Vec2.fromDirection(Direction.opposite(facing)))
      );
      if (fromWire) {
        const relocatedWire1 = _forceConnect(circuit, fromWire, wire);
        const relocatedWire2 = _forceConnect(circuit, wire, fromWire);

        _setWire(circuit, fromWire);
        // note: the next two lines are commented because they
        // can make relocated wires connect, which can be distracting
        // when the user didn't explicitely ask for that to happen.
        //if (relocatedWire1) _setWire(circuit, relocatedWire1);
        //if (relocatedWire2) _setWire(circuit, relocatedWire2);
      }
    } else {
      const wire = {
        type,
        index2D,
        adjacentWires: new Set(),
        toWire: null,
        fromWire: null,
        wireNumber: circuit.wireCounter++,
        time: 0,
        data
      };
      Array2D.setEntry(grid, index2D, wire);

      _setWire(circuit, wire);
    }
  };

  return {
    insert,
    remove,
    WIRE,
    BOX,
    SOURCE
  };
}


function _Iterable()
{
  const withHistory = function* (number, iterable) {
    let history = Array(number);
    for (const result of iterable) {
      history = [result, ...history];
      history.length = number;
      yield history;
    }
  };
  const range = function* (start, end, step = 1) {
    for (let n = start; n < end; n += step) {
      yield n;
    }
  };
  const take = function* (number, iterable) {
    let i = 0;
    for (const item of iterable) {
      i++;
      if (i > number) break;
      yield item;
    }
  };
  const first = (iterable) => Array.from(take(1, iterable))[0];
  const skip = function* (number, iterable) {
    let i = 0;
    for (const item of iterable) {
      i++;
      if (i <= number) continue;
      yield item;
    }
  };
  const map = function* (iterable, func) {
    for (const item of iterable) yield func(item);
  };
  const some = function (iterable, func) {
    for (const item of iterable) {
      if (func(item)) return true;
    }
    return false;
  };

  return {
    withHistory,
    range,
    take,
    first,
    skip,
    map,
    some
  };
}


function _Graph()
{
  const walkDepthFirst = function* (
    inVertex,
    adjacentVerticesFromVertex = (v) => v.adjacentVertices
  ) {
    const visitedNodes = new Set([inVertex]);
    const stack = [inVertex];

    while (stack.length !== 0) {
      const currentVertex = stack.pop();
      yield currentVertex;

      for (const adjacentVertex of adjacentVerticesFromVertex(currentVertex)) {
        if (!visitedNodes.has(adjacentVertex)) {
          visitedNodes.add(adjacentVertex);
          stack.push(adjacentVertex);
        }
      }
    }
  };
  const walkBreadthFirst = function* (
    inVertex,
    adjacentVerticesFromVertex = (v) => v.adjacentVertices
  ) {
    const visitedNodes = new Set([inVertex]);
    const queue = [inVertex];

    while (queue.length !== 0) {
      const currentVertex = queue.shift();
      yield currentVertex;

      for (const adjacentVertex of adjacentVerticesFromVertex(currentVertex)) {
        if (!visitedNodes.has(adjacentVertex)) {
          visitedNodes.add(adjacentVertex);
          queue.push(adjacentVertex);
        }
      }
    }
  };

  return {
    walkDepthFirst,
    walkBreadthFirst,
    walk: walkBreadthFirst
  };
}


function _Array2D()
{
  const setEntry = (array2d, [x, y], value) => {
    let column = array2d[x];
    if (!column) {
      column = [];
      array2d[x] = column;
    }
    array2d[x][y] = value;
  };
  const getEntry = (array2d, [x, y]) => {
    if (array2d[x]) {
      return array2d[x][y];
    }
  };
  return {
    setEntry,
    getEntry
  };
}


function _Vec2(Radians)
{
  const unitFromRadians = (θ) => [Math.cos(θ), -Math.sin(θ)];
  const unitFromDirection = (direction) =>
    unitFromRadians(Radians.fromDirection(direction));
  const mulByNumber = ([x, y], number) => [x * number, y * number];
  const leftMulBy4x4Matrix = ([[m1, m2], [m3, m4]], [x, y]) => [
    m1 * x + m2 * y,
    m3 * x + m4 * y
  ];
  const add = ([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2];
  const subtract = ([x1, y1], [x2, y2]) => [x1 - x2, y1 - y2];
  const round = ([x, y]) => [Math.round(x), Math.round(y)];
  const fromNumber = (number) => [number, number];
  const rotateQuarter = ([x, y]) => [y, -x];
  const rotateHalf = ([x, y]) => [-x, -y];
  const rotate = (θ, [x, y]) => [
    Math.cos(θ) * x + Math.sin(θ) * y,
    -Math.sin(θ) * x + Math.cos(θ) * y
  ];
  const lerp = (v1, v2, p) => add(mulByNumber(v1, 1 - p), mulByNumber(v2, p));
  const fromIndexAndScale = (top, size) =>
    add(mulByNumber(top, size), fromNumber(size / 2));

  return {
    fromNumber,
    unitFromRadians,
    unitFromDirection,
    mulByNumber,
    rotateQuarter,
    rotateHalf,
    rotate,
    leftMulBy4x4Matrix,
    add,
    subtract,
    round,
    lerp,
    fromIndexAndScale
  };
}


function _Bool()
{
  const fromVec2sAreEqual = ([x1, y1], [x2, y2]) => x1 === x2 && y1 === y2;

  return {
    fromVec2sAreEqual
  };
}


function _Radians(Numbers)
{
  const betweenVec2s = ([x1, y1], [x2, y2]) =>
    Numbers.mod(Math.atan2(-(y2 - y1), x2 - x1), Math.PI * 2);
  const fromVec = ([x, y]) => Math.atan2(y, x);

  return {
    betweenVec2s,
    fromVec
  };
}


function _Direction(Numbers,Radians,Vec2)
{
  const UP = Symbol("UP");
  const LEFT = Symbol("LEFT");
  const DOWN = Symbol("DOWN");
  const RIGHT = Symbol("RIGHT");
  const DIRECTIONS = [RIGHT, UP, LEFT, DOWN];
  const fromRadians = (θ) =>
    DIRECTIONS[Numbers.mod(Math.round(θ / (Math.PI / 2)), 4)];
  Radians.fromDirection = (direction) =>
    ({
      [RIGHT]: 0,
      [UP]: Math.PI / 2,
      [LEFT]: Math.PI,
      [DOWN]: (Math.PI * 3) / 2
    }[direction]);
  Vec2.fromDirection = (direction) =>
    ({
      [RIGHT]: [1, 0],
      [UP]: [0, -1],
      [LEFT]: [-1, 0],
      [DOWN]: [0, 1]
    }[direction]);
  const betweenVec2s = (v1, v2) => fromRadians(Radians.betweenVec2s(v1, v2));
  const opposite = (direction) =>
    ({ [UP]: DOWN, [DOWN]: UP, [LEFT]: RIGHT, [RIGHT]: LEFT }[direction]);

  return {
    UP,
    LEFT,
    DOWN,
    RIGHT,
    DIRECTIONS,
    fromRadians,
    betweenVec2s,
    opposite
  };
}


function _Numbers()
{
  const mod = (x, n) => ((x % n) + n) % n;
  // NOT VERIFIED TO WORK:
  const subMod = (a, b, n = 1) => {
    const diff = Math.abs(b - a);
    return Math.min(diff, n - diff);
  };
  const round = (n, step = 1) => Math.round(n / step) * step;
  const distanceBetweenVec2s = ([x1, y1], [x2, y2]) =>
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  return {
    mod,
    subMod,
    round,
    distanceBetweenVec2s
  };
}


function _InputState(HTMLElement,HTMLDocument){return(
class InputState {
  constructor(el = document.body, mobile) {
    if (!(el instanceof HTMLElement || el instanceof HTMLDocument))
      throw new TypeError(
        "ParameterError: el must be an HTMLElement or HTMLDocument!"
      );

    this._el = el;
    //allow this element to be focused
    if (el.tabIndex == -1) el.tabIndex = 1;
    //input state
    this.keysDown = {};
    this.keysPressed = {};
    this.keysReleased = {};
    this.buttonsDown = {};
    this.buttonsPressed = {};
    this.buttonsReleased = {};
    this.mouse = [0, 0];
    this.scroll = 0;

    this.frameReset();

    //mouse and keybaord
    //disable the context menu
    el.addEventListener("contextmenu", (e) => e.preventDefault());
    //add callbacks
    const mouseWheelHandler = (e) => {
      this.scroll += Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
    };
    el.addEventListener("mousewheel", mouseWheelHandler);
    el.addEventListener("DOMMouseScroll", mouseWheelHandler);
    el.addEventListener("mousedown", (e) => {
      e.preventDefault();
      el.focus();
    });
    document.body.addEventListener("mousedown", (e) => {
      //e.preventDefault();
      //el.focus();
      this.buttonsDown[e.button] = true;
      this.buttonsPressed[e.button] = true;
    });
    document.body.addEventListener("mouseup", (e) => {
      //e.preventDefault();
      this.buttonsDown[e.button] = false;
      this.buttonsReleased[e.button] = true;
    });
    el.addEventListener("mousemove", (e) => {
      this.mouse = [e.offsetX, e.offsetY];
    });
    document.body.addEventListener("keydown", (e) => {
      if (!this.keysDown[e.key.toLowerCase()]) {
        this.keysPressed[e.key.toLowerCase()] = true;
        this.keysDown[e.key.toLowerCase()] = true;
      }

      if (e.key.toLowerCase().includes("arrow")) {
        e.preventDefault();
      }
    });
    document.body.addEventListener("keyup", (e) => {
      this.keysReleased[e.key.toLowerCase()] = true;
      this.keysDown[e.key.toLowerCase()] = false;

      if (e.key.toLowerCase().includes("arrow")) {
        e.preventDefault();
      }
    });
    el.addEventListener(
      "touchstart",
      (event) => {
        const firstTouch = event.touches[0];
        if (firstTouch) {
          this.buttonsDown[0] = true;
          this.buttonsPressed[0] = true;
        }

        event.preventDefault();
      },
      true
    );
    el.addEventListener(
      "touchmove",
      (event) => {
        const firstTouch = event.touches[0];

        if (firstTouch) {
          this.buttonsDown[0] = true;

          const { left, top } = el.getBoundingClientRect();

          this.mouse = [firstTouch.clientX - left, firstTouch.clientY - top];
        }

        event.preventDefault();
      },
      true
    );
    el.addEventListener(
      "touchend",
      (event) => {
        const firstTouch = event.touches[0];

        this.buttonsDown[0] = false;
        this.buttonsReleased[0] = true;

        event.preventDefault();
      },
      true
    );
    el.addEventListener(
      "touchcancel",
      (event) => {
        const firstTouch = event.touches[0];

        this.buttonsDown[0] = false;
        this.buttonsReleased[0] = true;

        event.preventDefault();
      },
      true
    );
  }

  setCursor(...args) {
    this._el.style.cursor = args.reduce((a, c) => a + c + ", ", "") + "auto";
  }

  isKeyDown(key) {
    return this.keysDown[key.toLowerCase()] ? true : false;
  }

  isButtonDown(button) {
    if (typeof button == "string") button = this._stringToMouseCode(button);

    return this.buttonsDown[button] ? true : false;
  }

  isKeyPressed(key) {
    return this.keysPressed[key.toLowerCase()] ? true : false;
  }

  isKeyReleased(key) {
    return this.keysReleased[key.toLowerCase()] ? true : false;
  }

  isButtonPressed(button) {
    if (typeof button == "string") button = this._stringToMouseCode(button);

    return this.buttonsPressed[button] ? true : false;
  }

  isButtonReleased(button) {
    if (typeof button == "string") button = this._stringToMouseCode(button);

    return this.buttonsReleased[button] ? true : false;
  }

  _stringToMouseCode(str) {
    switch (str.toLowerCase()) {
      case "left":
        return 0;
      case "middle":
        return 1;
      case "right":
        return 2;
      default:
        throw "invalid mouse button";
    }
  }

  frameReset() {
    this.keysPressed = {};
    this.keysReleased = {};
    this.buttonsPressed = {};
    this.buttonsReleased = {};
    this.scroll = 0;
  }
}
)}

function _30(md){return(
md`** Thanks for taking a look! I like *Θbservable*!**<br>
> Special thanks to S.W. and D.B. for giving feedback while I built this.<br>

*version 0.2 beta*<br>
`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([
    ["qc2.png", {url: "https://static.observableusercontent.com/files/50cd148d9c7c0527e61c5674ac61cca8a306da44c333368d4bf88e7b3eff7cd27b8b66fb1b8a934358b5bd7b28ed4d61b9c680834c221c8c7f06903c7f80e622", mimeType: "image/png"}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["InlineDraw","Vec2","md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer()).define(["md"], _3);
  main.variable(observer()).define(["game","gridSize","CircuitGrid","Direction"], _4);
  main.variable(observer()).define(["md"], _5);
  main.variable(observer()).define(["InlineDraw","Vec2","md"], _6);
  main.variable(observer()).define(["md"], _7);
  main.variable(observer()).define(["InlineDraw","md"], _8);
  main.variable(observer()).define(["game","gridSize","CircuitGrid","Direction","Radians","Numbers","Draw","Vec2"], _9);
  main.variable(observer()).define(["md"], _10);
  main.variable(observer()).define(["FileAttachment","InlineDraw","Vec2","tex","md"], _11);
  main.variable(observer()).define(["md"], _12);
  main.variable(observer()).define(["md"], _13);
  main.variable(observer("gridSize")).define("gridSize", _gridSize);
  main.variable(observer("game")).define("game", ["gridSize","DOM","width","InputState","Direction","Bool","Vec2","Array2D","CircuitGrid","Item","Draw","invalidation"], _game);
  main.variable(observer("Item")).define("Item", ["Vec2","gridSize","Direction","Array2D","CircuitGrid","Bool"], _Item);
  main.variable(observer("Draw")).define("Draw", ["Vec2","Iterable","Direction","Numbers","Radians","Color"], _Draw);
  main.variable(observer("InlineDraw")).define("InlineDraw", ["DOM","gridSize","Item","Draw"], _InlineDraw);
  main.variable(observer("Color")).define("Color", _Color);
  main.variable(observer("CircuitGrid")).define("CircuitGrid", ["Iterable","Graph","Array2D","Direction","Vec2"], _CircuitGrid);
  main.variable(observer("Iterable")).define("Iterable", _Iterable);
  main.variable(observer("Graph")).define("Graph", _Graph);
  main.variable(observer("Array2D")).define("Array2D", _Array2D);
  main.variable(observer("Vec2")).define("Vec2", ["Radians"], _Vec2);
  main.variable(observer("Bool")).define("Bool", _Bool);
  main.variable(observer("Radians")).define("Radians", ["Numbers"], _Radians);
  main.variable(observer("Direction")).define("Direction", ["Numbers","Radians","Vec2"], _Direction);
  main.variable(observer("Numbers")).define("Numbers", _Numbers);
  main.variable(observer("InputState")).define("InputState", ["HTMLElement","HTMLDocument"], _InputState);
  main.variable(observer()).define(["md"], _30);
  return main;
}
