/**
 * Qiskit Fall Fest ITS 2026
 * Interactive Visual Qubit Flow Playground & Game Engine
 * 
 * Based on the reference architecture by Elliot (@vezwork/qubit-playground)
 * Adapted & enhanced for Qiskit Fall Fest ITS 2026
 */

(function () {
  'use strict';

  // ==========================================
  // 1. MATHEMATICS & VECTOR HELPERS
  // ==========================================
  const Numbers = {
    mod: (x, n) => ((x % n) + n) % n,
    subMod: (a, b, n = 1) => {
      const diff = Math.abs(b - a);
      return Math.min(diff, n - diff);
    },
    round: (n, step = 1) => Math.round(n / step) * step,
    distanceBetweenVec2s: ([x1, y1], [x2, y2]) => Math.hypot(x2 - x1, y2 - y1)
  };

  const Radians = {
    betweenVec2s: ([x1, y1], [x2, y2]) => Numbers.mod(Math.atan2(-(y2 - y1), x2 - x1), Math.PI * 2),
    fromVec: ([x, y]) => Math.atan2(y, x),
    fromDirection: null // Assigned in Direction module
  };

  const Direction = {
    UP: Symbol('UP'),
    LEFT: Symbol('LEFT'),
    DOWN: Symbol('DOWN'),
    RIGHT: Symbol('RIGHT'),
    get DIRECTIONS() {
      return [this.RIGHT, this.UP, this.LEFT, this.DOWN];
    },
    fromRadians: (θ) => Direction.DIRECTIONS[Numbers.mod(Math.round(θ / (Math.PI / 2)), 4)],
    betweenVec2s: (v1, v2) => Direction.fromRadians(Radians.betweenVec2s(v1, v2)),
    opposite: (dir) => {
      if (dir === Direction.UP) return Direction.DOWN;
      if (dir === Direction.DOWN) return Direction.UP;
      if (dir === Direction.LEFT) return Direction.RIGHT;
      if (dir === Direction.RIGHT) return Direction.LEFT;
      return Direction.UP;
    }
  };

  Radians.fromDirection = (dir) => {
    if (dir === Direction.RIGHT) return 0;
    if (dir === Direction.UP) return Math.PI / 2;
    if (dir === Direction.LEFT) return Math.PI;
    if (dir === Direction.DOWN) return (Math.PI * 3) / 2;
    return 0;
  };

  const Vec2 = {
    fromNumber: (num) => [num, num],
    unitFromRadians: (θ) => [Math.cos(θ), -Math.sin(θ)],
    unitFromDirection: (direction) => Vec2.unitFromRadians(Radians.fromDirection(direction)),
    fromDirection: (dir) => {
      if (dir === Direction.RIGHT) return [1, 0];
      if (dir === Direction.UP) return [0, -1];
      if (dir === Direction.LEFT) return [-1, 0];
      if (dir === Direction.DOWN) return [0, 1];
      return [0, 0];
    },
    mulByNumber: ([x, y], n) => [x * n, y * n],
    leftMulBy4x4Matrix: ([[m1, m2], [m3, m4]], [x, y]) => [
      m1 * x + m2 * y,
      m3 * x + m4 * y
    ],
    add: ([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2],
    subtract: ([x1, y1], [x2, y2]) => [x1 - x2, y1 - y2],
    round: ([x, y]) => [Math.round(x), Math.round(y)],
    rotateQuarter: ([x, y]) => [y, -x],
    rotateHalf: ([x, y]) => [-x, -y],
    rotate: (θ, [x, y]) => [
      Math.cos(θ) * x + Math.sin(θ) * y,
      -Math.sin(θ) * x + Math.cos(θ) * y
    ],
    lerp: (v1, v2, p) => Vec2.add(Vec2.mulByNumber(v1, 1 - p), Vec2.mulByNumber(v2, p)),
    fromIndexAndScale: (top, size) => Vec2.add(Vec2.mulByNumber(top, size), Vec2.fromNumber(size / 2))
  };

  const Bool = {
    fromVec2sAreEqual: (v1, v2) => {
      if (!v1 || !v2) return false;
      return v1[0] === v2[0] && v1[1] === v2[1];
    }
  };

  const Color = {
    rgbToHex: ([r, g, b]) => (r << 16) + (g << 8) + b,
    hexToRgb: (hex) => {
      hex >>>= 0;
      return [(hex & 0xff0000) >>> 16, (hex & 0xff00) >>> 8, hex & 0xff];
    },
    rgbToCSSColorString: ([r, g, b]) => `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`,
    interpolateHex: (hex1, hex2, value = 0.5) => {
      const [r1, g1, b1] = Color.hexToRgb(hex1);
      const [r2, g2, b2] = Color.hexToRgb(hex2);
      const v = Math.max(0, Math.min(1, value));
      return Color.rgbToCSSColorString([
        r1 * v + r2 * (1 - v),
        g1 * v + g2 * (1 - v),
        b1 * v + b2 * (1 - v)
      ]);
    }
  };

  // ==========================================
  // 2. ITERABLE & GRAPH HELPERS
  // ==========================================
  const Iterable = {
    *withHistory(number, iterable) {
      let history = Array(number);
      for (const result of iterable) {
        history = [result, ...history];
        history.length = number;
        yield history;
      }
    },
    *take(number, iterable) {
      let i = 0;
      for (const item of iterable) {
        i++;
        if (i > number) break;
        yield item;
      }
    },
    first(iterable) {
      for (const item of iterable) return item;
      return undefined;
    },
    *skip(number, iterable) {
      let i = 0;
      for (const item of iterable) {
        i++;
        if (i <= number) continue;
        yield item;
      }
    },
    *map(iterable, func) {
      for (const item of iterable) yield func(item);
    }
  };

  const Graph = {
    *walkBreadthFirst(inVertex, adjacentVerticesFromVertex = (v) => v.adjacentWires) {
      const visitedNodes = new Set([inVertex]);
      const queue = [inVertex];

      while (queue.length !== 0) {
        const currentVertex = queue.shift();
        yield currentVertex;

        const adj = adjacentVerticesFromVertex(currentVertex);
        if (adj) {
          for (const adjacentVertex of adj) {
            if (!visitedNodes.has(adjacentVertex)) {
              visitedNodes.add(adjacentVertex);
              queue.push(adjacentVertex);
            }
          }
        }
      }
    },
    walk(inVertex, adjFn) {
      return Graph.walkBreadthFirst(inVertex, adjFn);
    }
  };

  const Array2D = {
    setEntry: (array2d, [x, y], value) => {
      if (!array2d[x]) array2d[x] = [];
      array2d[x][y] = value;
    },
    getEntry: (array2d, [x, y]) => {
      if (array2d[x]) return array2d[x][y];
      return undefined;
    }
  };

  // ==========================================
  // 3. CIRCUIT GRID SYSTEM
  // ==========================================
  const WIRE = Symbol('wire');
  const BOX = Symbol('Box');
  const SOURCE = Symbol('Source');

  const CircuitGrid = {
    WIRE,
    BOX,
    SOURCE,

    _propagateWireDirection(sourceWire) {
      for (const [wire, prevWire] of Iterable.skip(
        1,
        Iterable.withHistory(2, Graph.walk(sourceWire, (v) => v.adjacentWires))
      )) {
        wire.toWire = null;
        wire.fromWire = prevWire;
        prevWire.toWire = wire;
      }
    },

    _propagateWireNumber(sourceWireFromWireNumber, inWire, wireNumber) {
      for (const wire of Graph.walk(inWire, (v) => v.adjacentWires)) {
        if (wire.type === SOURCE) {
          sourceWireFromWireNumber.delete(wire.wireNumber);
          sourceWireFromWireNumber.set(wireNumber, wire);
        }
        wire.wireNumber = wireNumber;
      }
    },

    _removeConnect(circuit, fromWire, toWire) {
      if (fromWire.adjacentWires.has(toWire)) {
        fromWire.adjacentWires.delete(toWire);
        CircuitGrid._propagateWireNumber(
          circuit.sourceWireFromWireNumber,
          fromWire,
          circuit.wireCounter++
        );

        const sourceWire = circuit.sourceWireFromWireNumber.get(fromWire.wireNumber);
        if (sourceWire) {
          CircuitGrid._propagateWireDirection(sourceWire);
        } else {
          for (const currentWire of Graph.walk(fromWire, (v) => v.adjacentWires)) {
            currentWire.toWire = null;
            currentWire.fromWire = null;
          }
        }
      }
    },

    remove(circuit, index2D) {
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
            CircuitGrid._removeConnect(circuit, adjacent, wire);
          }
        }
      }
    },

    _canConnect(sourceWireFromWireNumber, fromWire, toWire) {
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
      return false;
    },

    _tryConnect(sourceWireFromWireNumber, wire1, wire2) {
      if (
        CircuitGrid._canConnect(sourceWireFromWireNumber, wire1, wire2) &&
        CircuitGrid._canConnect(sourceWireFromWireNumber, wire2, wire1)
      ) {
        const wireNumber = Math.min(wire1.wireNumber, wire2.wireNumber);
        wire1.wireNumber = wireNumber;
        wire2.wireNumber = wireNumber;

        wire1.adjacentWires.add(wire2);
        wire2.adjacentWires.add(wire1);

        CircuitGrid._propagateWireNumber(sourceWireFromWireNumber, wire1, wireNumber);
        CircuitGrid._propagateWireNumber(sourceWireFromWireNumber, wire2, wireNumber);

        const sourceWire = sourceWireFromWireNumber.get(wireNumber);
        if (sourceWire) {
          CircuitGrid._propagateWireDirection(sourceWire);
        }
        return true;
      }
      return false;
    },

    _forceConnect(circuit, fromWire, toWire) {
      let relocatedWire;
      const alreadyConnected = toWire.adjacentWires.has(fromWire);
      const canForceConnect = !CircuitGrid._canConnect(
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
          toAdjacentWire = toWire.fromWire || Iterable.first(toWire.adjacentWires);
        } else {
          toAdjacentWire = toWire.toWire || Iterable.first(toWire.adjacentWires);
        }

        if (toAdjacentWire) {
          relocatedWire = toAdjacentWire;
          CircuitGrid._removeConnect(circuit, toWire, toAdjacentWire);
          CircuitGrid._removeConnect(circuit, toAdjacentWire, toWire);
        }
      }
      CircuitGrid._tryConnect(circuit.sourceWireFromWireNumber, fromWire, toWire);
      return relocatedWire;
    },

    _setWire(circuit, wire) {
      for (const direction of Direction.DIRECTIONS) {
        const adjacentWire = Array2D.getEntry(
          circuit.grid,
          Vec2.add(wire.index2D, Vec2.fromDirection(direction))
        );
        if (adjacentWire) {
          CircuitGrid._tryConnect(circuit.sourceWireFromWireNumber, wire, adjacentWire);
        }
      }
    },

    insert(circuit, index2D, facing = Direction.UP, type = WIRE, data) {
      const grid = circuit.grid;
      const existing = Array2D.getEntry(grid, index2D);
      if (existing) {
        const fromWire = Array2D.getEntry(
          grid,
          Vec2.add(index2D, Vec2.fromDirection(Direction.opposite(facing)))
        );
        if (fromWire) {
          CircuitGrid._forceConnect(circuit, fromWire, existing);
          CircuitGrid._forceConnect(circuit, existing, fromWire);
          CircuitGrid._setWire(circuit, fromWire);
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
        CircuitGrid._setWire(circuit, wire);
      }
    }
  };

  // ==========================================
  // 4. ITEM / QUBIT PACKET SIMULATION
  // ==========================================
  const Item = {
    _targetPosition: (wire, wirePosition, gridSize) => {
      const centerOfGridSquare = Vec2.fromIndexAndScale(wire.index2D, gridSize);
      if (wirePosition < 0.5) {
        if (!wire.fromWire) return false;
        const fromDir = Direction.betweenVec2s(wire.index2D, wire.fromWire.index2D);
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
        return Vec2.lerp(centerOfGridSquare, toEndPosition, (wirePosition - 0.5) * 2);
      }
    },

    isBlocked: (wire, wirePosition, items, item) => {
      for (const otherItem of items) {
        if (otherItem === item) break;
        if (wire === otherItem.wire) return true;
        if (wire.toWire === otherItem.wire) {
          const diff = Math.abs(wirePosition - (1 + otherItem.wirePosition));
          if (diff < 0.8) return true;
        }
      }
      return false;
    },

    make: (wire, data, gridSize, items) => {
      const center = Vec2.add(
        Vec2.mulByNumber(wire.index2D, gridSize),
        Vec2.fromNumber(gridSize / 2)
      );
      if (!Item.isBlocked(wire, 0.5, items)) {
        items.push({
          wirePosition: 0.5,
          position: center,
          wire,
          data: [...data],
          lastTransformIndex: [-1, -1]
        });
      }
    },

    move: (item, items, grid, gridSize) => {
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
      if (!wire) return false;

      const targetPosition = Item._targetPosition(wire, item.wirePosition, gridSize);
      if (!targetPosition) return false;

      let speed = 0.04;
      const itemIsInCenter = item.wirePosition < 0.6 && item.wirePosition > 0.4;

      if (wire.type === CircuitGrid.BOX) {
        speed = 0.02;
        if (
          itemIsInCenter &&
          !Bool.fromVec2sAreEqual(item.lastTransformIndex, wire.index2D)
        ) {
          item.lastTransformIndex = [...wire.index2D];
          if (wire.data && typeof wire.data.func === 'function') {
            const transformed = wire.data.func(item.data, item);
            if (transformed) item.data = transformed;
          }
        }
      }

      item.position = Vec2.lerp(item.position, targetPosition, 0.5);
      if (!Item.isBlocked(wire, item.wirePosition, items, item)) {
        item.wirePosition += speed;
      }

      if (item.wirePosition >= 0.5) {
        if (!wire.toWire) {
          item.wirePosition = 0.499;
        }
      }

      return true;
    }
  };

  // ==========================================
  // 5. GRAPHICS & CANVAS DRAWING
  // ==========================================
  const Draw = {
    winCover(width, height, context) {
      context.save();
      context.fillStyle = 'rgba(72, 220, 131, 0.95)';
      context.fillRect(0, 0, width, height);

      context.fillStyle = '#065f46';
      context.font = 'bold 36px Outfit, sans-serif';
      context.textAlign = 'center';
      context.fillText('🎉 Challenge Completed!', width / 2, height / 2 - 15);

      context.font = '500 18px Outfit, sans-serif';
      context.fillText('You successfully delivered 10 target qubits to the goal!', width / 2, height / 2 + 25);
      context.restore();
    },

    statusText([x, y], text, context, color = '#002868', font = 'bold 18px Outfit, sans-serif') {
      context.save();
      context.fillStyle = color;
      context.font = font;
      context.fillText(text, x, y);
      context.restore();
    },

    cursorGridHighlight([x, y], gridSize, context) {
      context.save();
      context.fillStyle = 'rgba(255, 183, 3, 0.35)';
      context.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
      context.strokeStyle = '#FFB703';
      context.lineWidth = 2;
      context.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
      context.restore();
    },

    grid(width, height, gridSize, context) {
      context.save();
      context.strokeStyle = '#E2E8F0';
      context.lineWidth = 1;
      for (let x = 0; x < width; x += gridSize) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
      context.restore();
    },

    wire(w, gridSize, context) {
      const center = Vec2.add(
        Vec2.mulByNumber(w.index2D, gridSize),
        Vec2.fromNumber(gridSize / 2)
      );

      const adjacentConnectionPositions = Array.from(
        Iterable.map(w.adjacentWires, (adjacentWire) => {
          const direction = Direction.betweenVec2s(w.index2D, adjacentWire.index2D);
          const dirVec = Vec2.unitFromDirection(direction);
          return Vec2.add(center, Vec2.mulByNumber(dirVec, gridSize / 2));
        })
      );

      context.save();
      context.lineWidth = 7;
      context.strokeStyle = '#002868';
      context.lineCap = 'round';
      context.lineJoin = 'round';
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
      context.restore();
    },

    box(w, gridSize, context) {
      const gridInset = 8;
      const topLeft = Vec2.add(
        Vec2.mulByNumber(w.index2D, gridSize),
        Vec2.fromNumber(gridInset)
      );
      const length = gridSize - gridInset * 2;

      context.save();
      context.strokeStyle = '#002868';
      context.fillStyle = '#FFFFFF';
      context.lineWidth = 4;
      context.lineCap = 'round';
      context.lineJoin = 'round';

      context.beginPath();
      context.rect(topLeft[0], topLeft[1], length, length);
      context.fill();
      context.stroke();
      context.closePath();

      // Gate Label or Emoji
      context.fillStyle = '#002868';
      context.font = 'bold 22px Outfit, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(
        w.data?.label || '',
        topLeft[0] + length / 2,
        topLeft[1] + length / 2
      );
      context.restore();
    },

    arrow(tail, tip, color, context) {
      context.save();
      context.strokeStyle = color;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      const size = Numbers.distanceBetweenVec2s(tail, tip);
      context.lineWidth = Math.max(2, size / 6);
      context.beginPath();
      context.moveTo(...tail);
      context.lineTo(...tip);

      const arrowHead1Angle = Radians.betweenVec2s(tip, tail) + Math.PI / 4;
      const arrowHead2Angle = Radians.betweenVec2s(tip, tail) - Math.PI / 4;
      const arrowHead1 = Vec2.add(tip, Vec2.mulByNumber(Vec2.unitFromRadians(arrowHead1Angle), size / 2));
      const arrowHead2 = Vec2.add(tip, Vec2.mulByNumber(Vec2.unitFromRadians(arrowHead2Angle), size / 2));

      context.lineTo(...arrowHead1);
      context.moveTo(...tip);
      context.lineTo(...arrowHead2);
      context.stroke();
      context.closePath();
      context.restore();
    },

    source(w, gridSize, context) {
      const center = Vec2.add(
        Vec2.mulByNumber(w.index2D, gridSize),
        Vec2.fromNumber(gridSize / 2)
      );

      context.save();
      context.fillStyle = '#002868';
      context.beginPath();
      context.arc(...center, gridSize / 2 - 6, 0, Math.PI * 2, true);
      context.fill();
      context.closePath();

      Draw.arrow(
        [center[0] - 10, center[1]],
        [center[0] + 10, center[1]],
        '#FFB703',
        context
      );
      context.restore();
    },

    ket(position, color, context) {
      const height = 11;
      const backWidth = 15;
      const forwardWidth = 11;

      context.save();
      context.strokeStyle = '#FFFFFF';
      context.fillStyle = '#FFFFFF';
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = 8;
      context.beginPath();
      context.moveTo(...Vec2.add(position, [-backWidth, height]));
      context.lineTo(...Vec2.add(position, [-backWidth, -height]));
      context.lineTo(...Vec2.add(position, [forwardWidth, -height]));
      context.lineTo(...Vec2.add(position, [forwardWidth + height, 0]));
      context.lineTo(...Vec2.add(position, [forwardWidth, height]));
      context.lineTo(...Vec2.add(position, [-backWidth, height]));
      context.fill();
      context.closePath();

      context.strokeStyle = color;
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(...Vec2.add(position, [-backWidth, height]));
      context.lineTo(...Vec2.add(position, [-backWidth, -height]));
      context.moveTo(...Vec2.add(position, [forwardWidth, -height]));
      context.lineTo(...Vec2.add(position, [forwardWidth + height, 0]));
      context.lineTo(...Vec2.add(position, [forwardWidth, height]));
      context.stroke();
      context.closePath();
      context.restore();
    },

    item(item, context) {
      const prob0 = Math.max(0, Math.min(1, item.data[0] ** 2));
      const color = Color.interpolateHex(0xef4444, 0x3b82f6, prob0);
      Draw.ket(item.position, color, context);

      const flippedYData = [item.data[0], -item.data[1]];
      const angle = Radians.betweenVec2s([0, 0], flippedYData);
      const tail = Vec2.add(item.position, Vec2.mulByNumber(Vec2.rotateHalf(Vec2.unitFromRadians(angle)), 8));
      const tip = Vec2.add(item.position, Vec2.mulByNumber(Vec2.unitFromRadians(angle), 8));
      Draw.arrow(tail, tip, color, context);
    }
  };

  // ==========================================
  // 6. INLINE CANVAS SAMPLE GENERATOR
  // ==========================================
  const InlineDraw = {
    ket(vec, size = 48) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size * 0.75;
      const ctx = canvas.getContext('2d');
      const item = {
        position: [size / 2, size * 0.375],
        data: vec
      };
      Draw.item(item, ctx);
      return canvas;
    },
    box(label, size = 32) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      Draw.box({ index2D: [0, 0], data: { label } }, size, ctx);
      return canvas;
    },
    source(size = 32) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      Draw.source({ index2D: [0, 0] }, size, ctx);
      return canvas;
    }
  };

  // ==========================================
  // 7. INPUT STATE CONTROLLER
  // ==========================================
  class InputState {
    constructor(el) {
      this._el = el;
      if (el.tabIndex === -1) el.tabIndex = 1;

      this.keysDown = {};
      this.keysPressed = {};
      this.keysReleased = {};
      this.buttonsDown = {};
      this.buttonsPressed = {};
      this.buttonsReleased = {};
      this.mouse = [0, 0];
      this.selectedTool = 'wire';

      this.frameReset();

      el.addEventListener('contextmenu', (e) => e.preventDefault());

      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        el.focus();
        this.buttonsDown[e.button] = true;
        this.buttonsPressed[e.button] = true;
      });

      window.addEventListener('mouseup', (e) => {
        this.buttonsDown[e.button] = false;
        this.buttonsReleased[e.button] = true;
      });

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        this.mouse = [
          (e.clientX - rect.left) * (el.width / rect.width),
          (e.clientY - rect.top) * (el.height / rect.height)
        ];
      });

      window.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        if (!this.keysDown[k]) {
          this.keysPressed[k] = true;
          this.keysDown[k] = true;
        }
        if (k.includes('arrow') && document.activeElement === el) {
          e.preventDefault();
        }
      });

      window.addEventListener('keyup', (e) => {
        const k = e.key.toLowerCase();
        this.keysReleased[k] = true;
        this.keysDown[k] = false;
      });

      // Touch handlers for mobile / tablet
      el.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        if (touch) {
          const rect = el.getBoundingClientRect();
          this.mouse = [
            (touch.clientX - rect.left) * (el.width / rect.width),
            (touch.clientY - rect.top) * (el.height / rect.height)
          ];
          this.buttonsDown[0] = true;
          this.buttonsPressed[0] = true;
        }
        e.preventDefault();
      }, { passive: false });

      el.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        if (touch) {
          const rect = el.getBoundingClientRect();
          this.mouse = [
            (touch.clientX - rect.left) * (el.width / rect.width),
            (touch.clientY - rect.top) * (el.height / rect.height)
          ];
          this.buttonsDown[0] = true;
        }
        e.preventDefault();
      }, { passive: false });

      el.addEventListener('touchend', (e) => {
        this.buttonsDown[0] = false;
        this.buttonsReleased[0] = true;
        e.preventDefault();
      }, { passive: false });
    }

    isKeyDown(key) {
      return Boolean(this.keysDown[key.toLowerCase()]);
    }

    isKeyPressed(key) {
      return Boolean(this.keysPressed[key.toLowerCase()]);
    }

    isButtonDown(button) {
      const code = typeof button === 'string' ? (button === 'left' ? 0 : button === 'right' ? 2 : 1) : button;
      return Boolean(this.buttonsDown[code]);
    }

    frameReset() {
      this.keysPressed = {};
      this.keysReleased = {};
      this.buttonsPressed = {};
      this.buttonsReleased = {};
    }
  }

  // ==========================================
  // 8. QUANTUM GATE DEFINITIONS
  // ==========================================
  const QuantumGates = {
    X: {
      label: 'X',
      title: 'Pauli-X (NOT / Bit-Flip)',
      matrix: [[0, 1], [1, 0]],
      func: (vec) => Vec2.leftMulBy4x4Matrix([[0, 1], [1, 0]], vec)
    },
    Z: {
      label: 'Z',
      title: 'Pauli-Z (Phase-Flip)',
      matrix: [[1, 0], [0, -1]],
      func: (vec) => Vec2.leftMulBy4x4Matrix([[1, 0], [0, -1]], vec)
    },
    H: {
      label: 'H',
      title: 'Hadamard (Superposition)',
      matrix: [[1 / Math.SQRT2, 1 / Math.SQRT2], [1 / Math.SQRT2, -1 / Math.SQRT2]],
      func: (vec) => Vec2.leftMulBy4x4Matrix([[1 / Math.SQRT2, 1 / Math.SQRT2], [1 / Math.SQRT2, -1 / Math.SQRT2]], vec)
    },
    R: {
      label: '⟲',
      title: 'Rotation (22.5° / π/8)',
      func: (vec) => Vec2.rotate(-Math.PI / 8, vec)
    },
    M: {
      label: '📸',
      title: 'Measurement Apparatus',
      func: (vec) => {
        const prob0 = vec[0] ** 2;
        return Math.random() < prob0 ? [1, 0] : [0, 1];
      }
    }
  };

  // ==========================================
  // 9. GAME ENGINE RUNTIME
  // ==========================================
  class QubitPlaygroundGame {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.gridSize = options.gridSize || 64;
      this.width = canvas.width;
      this.height = canvas.height;
      this.input = new InputState(canvas);

      this.circuit = {
        grid: [[]],
        wireCounter: 0,
        sourceWireFromWireNumber: new Map(),
        items: [],
        score: 0,
        targetScore: options.targetScore || 10,
        gateCount: 0
      };

      this.prevMousePos = [0, 0];
      this.hoverIndex2D = [0, 0];
      this.prevHoverIndex2D = [0, 0];
      this.hoverDirection = Direction.UP;
      this.running = true;
      this.onLoop = options.onLoop || (() => {});
      this.onInit = options.onInit || (() => {});
      this.onScoreUpdate = options.onScoreUpdate || (() => {});

      this.onInit(this.circuit);
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    destroy() {
      this.running = false;
    }

    reset() {
      this.circuit = {
        grid: [[]],
        wireCounter: 0,
        sourceWireFromWireNumber: new Map(),
        items: [],
        score: 0,
        targetScore: this.circuit.targetScore,
        gateCount: 0
      };
      this.onInit(this.circuit);
      this.onScoreUpdate(this.circuit.score, this.circuit.targetScore);
    }

    placeGate(typeKey, index2D, direction) {
      const gate = QuantumGates[typeKey];
      if (!gate) return;
      CircuitGrid.remove(this.circuit, index2D);
      CircuitGrid.insert(
        this.circuit,
        index2D,
        direction,
        CircuitGrid.BOX,
        {
          func: gate.func,
          label: gate.label,
          typeKey
        }
      );
      this.updateCircuitMetrics();
    }

    updateCircuitMetrics() {
      let count = 0;
      for (let x = 0; x < this.width / this.gridSize; x++) {
        for (let y = 0; y < this.height / this.gridSize; y++) {
          const entry = Array2D.getEntry(this.circuit.grid, [x, y]);
          if (entry?.type === CircuitGrid.BOX && entry?.data?.label !== '🏁' && entry?.data?.label !== '🎯') {
            count++;
          }
        }
      }
      this.circuit.gateCount = count;
      const countEl = document.getElementById('active-gate-count');
      if (countEl) countEl.textContent = count;
    }

    loop() {
      if (!this.running) return;

      const { ctx, width, height, gridSize, circuit, input } = this;
      ctx.clearRect(0, 0, width, height);

      // Track mouse hover cell
      if (!Bool.fromVec2sAreEqual(input.mouse, this.prevMousePos)) {
        this.hoverIndex2D = Vec2.mulByNumber(input.mouse, 1 / gridSize).map(Math.floor);
      }
      this.prevMousePos = input.mouse;

      // Keyboard arrow navigation
      if (input.isKeyPressed('arrowleft')) this.hoverIndex2D = Vec2.add(this.hoverIndex2D, [-1, 0]);
      if (input.isKeyPressed('arrowright')) this.hoverIndex2D = Vec2.add(this.hoverIndex2D, [1, 0]);
      if (input.isKeyPressed('arrowup')) this.hoverIndex2D = Vec2.add(this.hoverIndex2D, [0, -1]);
      if (input.isKeyPressed('arrowdown')) this.hoverIndex2D = Vec2.add(this.hoverIndex2D, [0, 1]);

      if (!Bool.fromVec2sAreEqual(this.prevHoverIndex2D, this.hoverIndex2D)) {
        this.hoverDirection = Direction.betweenVec2s(this.prevHoverIndex2D, this.hoverIndex2D);
      }

      // Constrain hover to grid dimensions
      const maxX = Math.floor(width / gridSize) - 1;
      const maxY = Math.floor(height / gridSize) - 1;
      this.hoverIndex2D[0] = Math.max(0, Math.min(maxX, this.hoverIndex2D[0]));
      this.hoverIndex2D[1] = Math.max(0, Math.min(maxY, this.hoverIndex2D[1]));

      const hoverEntry = Array2D.getEntry(circuit.grid, this.hoverIndex2D);
      const hoverOverwritable = !hoverEntry || hoverEntry.type === CircuitGrid.WIRE || hoverEntry.type === CircuitGrid.BOX;

      // Handle Mouse / Touch Action based on Selected Tool
      if (input.isButtonDown('left') || input.isKeyDown('enter') || input.isKeyDown(' ')) {
        if (input.selectedTool === 'wire') {
          CircuitGrid.insert(circuit, this.hoverIndex2D, this.hoverDirection);
        } else if (input.selectedTool === 'erase') {
          if (hoverEntry?.type !== CircuitGrid.SOURCE && hoverEntry?.data?.label !== '🏁' && hoverEntry?.data?.label !== '🎯') {
            CircuitGrid.remove(circuit, this.hoverIndex2D);
            this.updateCircuitMetrics();
          }
        } else if (QuantumGates[input.selectedTool]) {
          if (hoverOverwritable && hoverEntry?.data?.label !== '🏁' && hoverEntry?.data?.label !== '🎯') {
            this.placeGate(input.selectedTool, this.hoverIndex2D, this.hoverDirection);
          }
        }
      }

      // Keyboard shortcuts for Gates
      if (hoverOverwritable && hoverEntry?.data?.label !== '🏁' && hoverEntry?.data?.label !== '🎯') {
        if (input.isKeyDown('x')) this.placeGate('X', this.hoverIndex2D, this.hoverDirection);
        if (input.isKeyDown('z')) this.placeGate('Z', this.hoverIndex2D, this.hoverDirection);
        if (input.isKeyDown('h')) this.placeGate('H', this.hoverIndex2D, this.hoverDirection);
        if (input.isKeyDown('r')) this.placeGate('R', this.hoverIndex2D, this.hoverDirection);
        if (input.isKeyDown('m')) this.placeGate('M', this.hoverIndex2D, this.hoverDirection);
      }

      // Backspace / Delete to remove
      if (input.isKeyDown('backspace') || input.isKeyDown('delete') || input.isButtonDown('right')) {
        const wire = Array2D.getEntry(circuit.grid, this.hoverIndex2D);
        if (wire?.type !== CircuitGrid.SOURCE && wire?.data?.label !== '🏁' && wire?.data?.label !== '🎯') {
          CircuitGrid.remove(circuit, this.hoverIndex2D);
          this.updateCircuitMetrics();
        }
      }

      // Spawn Qubits from Sources
      for (const [wireNumber, wire] of circuit.sourceWireFromWireNumber) {
        if (wire.time % 60 === 0 && wire.adjacentWires.size > 0) {
          Item.make(wire, [1, 0], gridSize, circuit.items);
        }
        wire.time++;
      }

      // Move Items along Circuit
      for (const item of circuit.items) {
        const index2D = [
          Math.floor(item.position[0] / gridSize),
          Math.floor(item.position[1] / gridSize)
        ];
        const wire = Array2D.getEntry(circuit.grid, index2D);
        if (wire) {
          if (!Item.move(item, circuit.items, circuit.grid, gridSize)) {
            circuit.items = circuit.items.filter((other) => other !== item);
          }
        } else {
          circuit.items = circuit.items.filter((other) => other !== item);
        }
      }

      // Render Grid and Highlights
      Draw.grid(width, height, gridSize, ctx);
      Draw.cursorGridHighlight(this.hoverIndex2D, gridSize, ctx);

      // Level specific HUD / callbacks
      this.onLoop(circuit, width, height, ctx);

      if (!Bool.fromVec2sAreEqual(this.prevHoverIndex2D, this.hoverIndex2D)) {
        this.prevHoverIndex2D = [...this.hoverIndex2D];
      }

      // Draw Wires
      for (let x = 0; x < width / gridSize; x++) {
        for (let y = 0; y < height / gridSize; y++) {
          const entry = Array2D.getEntry(circuit.grid, [x, y]);
          if (entry?.type === CircuitGrid.WIRE || entry?.type === CircuitGrid.BOX) {
            Draw.wire(entry, gridSize, ctx);
          }
        }
      }

      // Draw Flowing Items (Qubits)
      for (const item of circuit.items) {
        Draw.item(item, ctx);
      }

      // Draw Boxes (Gates) & Sources
      for (let x = 0; x < width / gridSize; x++) {
        for (let y = 0; y < height / gridSize; y++) {
          const entry = Array2D.getEntry(circuit.grid, [x, y]);
          if (entry?.type === CircuitGrid.BOX) {
            Draw.box(entry, gridSize, ctx);
          } else if (entry?.type === CircuitGrid.SOURCE) {
            Draw.source(entry, gridSize, ctx);
          }
        }
      }

      // Win Condition Display
      if (circuit.score >= circuit.targetScore && circuit.targetScore > 0) {
        Draw.winCover(width, height, ctx);
      }

      input.frameReset();
      requestAnimationFrame(this.loop);
    }
  }

  // ==========================================
  // 10. PREDEFINED CHALLENGE LEVELS
  // ==========================================
  const ChallengeLevels = {
    // 1. FREE SANDBOX PLAYGROUND
    sandbox: {
      id: 'sandbox',
      title: 'Freeform Quantum Sandbox',
      subtitle: 'Build circuits freely and discover quantum superposition, phase changes, and measurement collapse in real-time.',
      targetScore: 0,
      description: 'Place wires from the source (O→) and add gates (H, X, Z, R, Measurement 📸) to see how qubits transform.',
      init(circuit, gridSize) {
        CircuitGrid.insert(circuit, [1, 2], Direction.UP, CircuitGrid.SOURCE);
      },
      loop(circuit, width, height, ctx) {
        Draw.statusText([width - 240, 32], 'Sandbox Mode', ctx, '#002868');
        Draw.statusText([width - 240, 60], 'Free experiment', ctx, '#64748B', '500 14px Outfit, sans-serif');
      }
    },

    // 2. LEVEL 1: THE TARGET GOAL FLAG (From Observable Reference Notebook)
    challenge1: {
      id: 'challenge1',
      title: 'Challenge 1: Rotate to the Goal Angle (5π/4)',
      subtitle: 'Connect the Source to the Goal Flag 🏁 and rotate the qubit vector to match the target direction.',
      targetScore: 10,
      description: 'Target State: Vector angle 5π/4 (225°). Try placing gates (like H, R, X) along the wire to align the arrows! Deliver 10 matching qubits.',
      init(circuit, gridSize) {
        CircuitGrid.insert(circuit, [1, 1], Direction.UP, CircuitGrid.SOURCE);
        CircuitGrid.insert(circuit, [13, 1], Direction.UP, CircuitGrid.BOX, {
          label: '🏁',
          func: (vec, item) => {
            circuit.items = circuit.items.filter((other) => other !== item);
            const goalRotation = Math.PI * 2 * (5 / 8);
            const itemRotation = Radians.fromVec(vec);
            const diff = Numbers.subMod(goalRotation, itemRotation, Math.PI * 2);

            if (diff < 0.18 && diff > -0.18) {
              circuit.score++;
              if (window.onQubitPlaygroundScore) {
                window.onQubitPlaygroundScore(circuit.score, circuit.targetScore);
              }
            }
          }
        });
      },
      loop(circuit, width, height, ctx) {
        Draw.statusText([width - 260, 28], `Collect ${circuit.targetScore}`, ctx);
        Draw.item(
          {
            data: Vec2.rotate((Math.PI * 5) / 4, [0, 1]),
            position: [width - 130, 20]
          },
          ctx
        );
        Draw.statusText([width - 100, 28], 'to win', ctx);
        Draw.statusText([width - 260, 56], `${circuit.score} / ${circuit.targetScore} collected`, ctx, '#0284C7', 'bold 15px Outfit, sans-serif');
      }
    },

    // 3. LEVEL 2: SUPERPOSITION GENERATOR (|0> -> |+>)
    challenge2: {
      id: 'challenge2',
      title: 'Challenge 2: Superposition Channel (|+⟩)',
      subtitle: 'Transform base state |0⟩ into equal superposition |+⟩ = (|0⟩ + |1⟩)/√2 using the Hadamard (H) gate.',
      targetScore: 10,
      description: 'Route qubits through the Hadamard gate so they rotate to 45° (-π/4) superposition and reach the Quantum Collector.',
      init(circuit, gridSize) {
        CircuitGrid.insert(circuit, [1, 2], Direction.UP, CircuitGrid.SOURCE);
        CircuitGrid.insert(circuit, [13, 2], Direction.UP, CircuitGrid.BOX, {
          label: '🎯',
          func: (vec, item) => {
            circuit.items = circuit.items.filter((other) => other !== item);
            const targetVec = [1 / Math.SQRT2, 1 / Math.SQRT2];
            const dist = Math.hypot(vec[0] - targetVec[0], vec[1] - targetVec[1]);
            const altDist = Math.hypot(vec[0] - targetVec[0], vec[1] - (-targetVec[1]));

            if (dist < 0.18 || altDist < 0.18) {
              circuit.score++;
              if (window.onQubitPlaygroundScore) {
                window.onQubitPlaygroundScore(circuit.score, circuit.targetScore);
              }
            }
          }
        });
      },
      loop(circuit, width, height, ctx) {
        Draw.statusText([width - 260, 28], `Deliver |+⟩ to 🎯`, ctx);
        Draw.item(
          {
            data: [1 / Math.SQRT2, 1 / Math.SQRT2],
            position: [width - 90, 20]
          },
          ctx
        );
        Draw.statusText([width - 260, 56], `${circuit.score} / ${circuit.targetScore} delivered`, ctx, '#0284C7', 'bold 15px Outfit, sans-serif');
      }
    },

    // 4. LEVEL 3: BIT-FLIP INVERSION (|0> -> |1>)
    challenge3: {
      id: 'challenge3',
      title: 'Challenge 3: Pauli-X Bit Flip (|0⟩ ➔ |1⟩)',
      subtitle: 'Invert the input state |0⟩ to state |1⟩ using a Pauli-X (NOT) quantum gate.',
      targetScore: 10,
      description: 'Input qubits start in |0⟩ (red, pointing right). Use the X gate to invert them to |1⟩ (blue, pointing up) and reach the target.',
      init(circuit, gridSize) {
        CircuitGrid.insert(circuit, [1, 1], Direction.UP, CircuitGrid.SOURCE);
        CircuitGrid.insert(circuit, [13, 3], Direction.UP, CircuitGrid.BOX, {
          label: '🎯',
          func: (vec, item) => {
            circuit.items = circuit.items.filter((other) => other !== item);
            if (Math.abs(vec[0]) < 0.25 && Math.abs(vec[1]) > 0.75) {
              circuit.score++;
              if (window.onQubitPlaygroundScore) {
                window.onQubitPlaygroundScore(circuit.score, circuit.targetScore);
              }
            }
          }
        });
      },
      loop(circuit, width, height, ctx) {
        Draw.statusText([width - 260, 28], `Deliver |1⟩ to 🎯`, ctx);
        Draw.item(
          {
            data: [0, 1],
            position: [width - 90, 20]
          },
          ctx
        );
        Draw.statusText([width - 260, 56], `${circuit.score} / ${circuit.targetScore} collected`, ctx, '#0284C7', 'bold 15px Outfit, sans-serif');
      }
    },

    // 5. LEVEL 4: GATE COMBO CHALLENGE (H -> R -> H)
    challenge4: {
      id: 'challenge4',
      title: 'Challenge 4: Gate Combinator (H + R + H)',
      subtitle: 'Compose Hadamard and 22.5° Rotation gates in sequence to achieve non-trivial phase rotations.',
      targetScore: 10,
      description: 'Hint: An H gate, followed by R, followed by H creates a custom rotation! Reach the target angle and deliver 10 qubits.',
      init(circuit, gridSize) {
        CircuitGrid.insert(circuit, [1, 2], Direction.UP, CircuitGrid.SOURCE);
        CircuitGrid.insert(circuit, [14, 2], Direction.UP, CircuitGrid.BOX, {
          label: '🏁',
          func: (vec, item) => {
            circuit.items = circuit.items.filter((other) => other !== item);
            const goalAngle = (Math.PI * 3) / 8;
            const angle = Radians.fromVec(vec);
            const diff = Numbers.subMod(goalAngle, angle, Math.PI * 2);
            if (diff < 0.25) {
              circuit.score++;
              if (window.onQubitPlaygroundScore) {
                window.onQubitPlaygroundScore(circuit.score, circuit.targetScore);
              }
            }
          }
        });
      },
      loop(circuit, width, height, ctx) {
        Draw.statusText([width - 260, 28], `Angle 3π/8 to 🏁`, ctx);
        Draw.item(
          {
            data: Vec2.rotate((Math.PI * 3) / 8, [1, 0]),
            position: [width - 90, 20]
          },
          ctx
        );
        Draw.statusText([width - 260, 56], `${circuit.score} / ${circuit.targetScore} collected`, ctx, '#0284C7', 'bold 15px Outfit, sans-serif');
      }
    }
  };

  // Expose globally
  window.QubitPlayground = {
    Game: QubitPlaygroundGame,
    Levels: ChallengeLevels,
    Gates: QuantumGates,
    Draw,
    InlineDraw,
    Vec2,
    CircuitGrid
  };

})();
