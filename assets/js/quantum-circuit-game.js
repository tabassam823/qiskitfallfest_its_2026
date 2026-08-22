/**
 * Qiskit Fall Fest ITS 2026 - Quantum Circuit Playground & Game Engine
 * Full 2-qubit & 3-qubit statevector matrix calculation, interactive gates, and challenge validator
 */

(function () {
  'use strict';

  // --- 1. Complex Number Math Utilities ---
  class Complex {
    constructor(re = 0, im = 0) {
      this.re = re;
      this.im = im;
    }
    add(c) {
      return new Complex(this.re + c.re, this.im + c.im);
    }
    sub(c) {
      return new Complex(this.re - c.re, this.im - c.im);
    }
    mul(c) {
      return new Complex(
        this.re * c.re - this.im * c.im,
        this.re * c.im + this.im * c.re
      );
    }
    mulScalar(s) {
      return new Complex(this.re * s, this.im * s);
    }
    absSq() {
      return this.re * this.re + this.im * this.im;
    }
  }

  // --- 2. Quantum Matrix Gates Definitions ---
  const INV_SQRT2 = 1 / Math.SQRT2;

  // Single Qubit Gate Matrices (2x2)
  const GATES_1Q = {
    I: [
      [new Complex(1, 0), new Complex(0, 0)],
      [new Complex(0, 0), new Complex(1, 0)]
    ],
    X: [ // Pauli-X (NOT / Qubit Flip)
      [new Complex(0, 0), new Complex(1, 0)],
      [new Complex(1, 0), new Complex(0, 0)]
    ],
    H: [ // Hadamard (Superposition)
      [new Complex(INV_SQRT2, 0), new Complex(INV_SQRT2, 0)],
      [new Complex(INV_SQRT2, 0), new Complex(-INV_SQRT2, 0)]
    ],
    Z: [ // Pauli-Z (Phase Flip)
      [new Complex(1, 0), new Complex(0, 0)],
      [new Complex(0, 0), new Complex(-1, 0)]
    ],
    S: [ // Phase S (π/2 Phase)
      [new Complex(1, 0), new Complex(0, 0)],
      [new Complex(0, 0), new Complex(0, 1)]
    ]
  };

  // --- 3. Circuit State & Levels ---
  const NUM_QUBITS = 3;
  const NUM_STEPS = 6;
  let circuitGrid = Array.from({ length: NUM_QUBITS }, () => Array(NUM_STEPS).fill(null));
  let selectedGate = 'X';
  let currentLevel = 1;

  const CHALLENGES = [
    {
      level: 1,
      title: "Tantangan 1: Qubit Flip (Pauli-X)",
      objective: "Ubah keadaan qubit q[0] dari Naik (|0⟩) menjadi Turun (|1⟩).",
      hint: "Gunakan gerbang Pauli-X (NOT Gate) pada q[0] untuk membalik keadaan spin kuantum.",
      numQubitsNeeded: 1,
      checkWin: (probs, state) => {
        // Target: P(|1..>) on qubit 0 is 100% -> basis states with q0=1
        // In 3-qubit basis (q0 is MSB or LSB, let's treat q0 as first qubit: binary 1xx -> states 4,5,6,7)
        const p1_q0 = probs[4] + probs[5] + probs[6] + probs[7];
        return p1_q0 > 0.98;
      }
    },
    {
      level: 2,
      title: "Tantangan 2: Quantum Superposition (Hadamard)",
      objective: "Buat qubit q[0] berada dalam keadaan superposisi |+⟩ (50% Naik |0⟩ dan 50% Turun |1⟩).",
      hint: "Tempatkan gerbang H (Hadamard) pada q[0] untuk menciptakan superposisi merata.",
      numQubitsNeeded: 1,
      checkWin: (probs, state) => {
        const p0_q0 = probs[0] + probs[1] + probs[2] + probs[3];
        const p1_q0 = probs[4] + probs[5] + probs[6] + probs[7];
        return Math.abs(p0_q0 - 0.5) < 0.05 && Math.abs(p1_q0 - 0.5) < 0.05;
      }
    },
    {
      level: 3,
      title: "Tantangan 3: Phase Inversion (Keadaan |−⟩)",
      objective: "Ciptakan keadaan superposisi fase terbalik |−⟩ = (|0⟩ − |1⟩)/√2 pada q[0].",
      hint: "Pasang gerbang H lalu ikuti dengan gerbang Z pada q[0].",
      numQubitsNeeded: 1,
      checkWin: (probs, state) => {
        // State 0 amplitude ~ +1/√2, State 4 amplitude ~ -1/√2
        const s0 = state[0];
        const s4 = state[4];
        const isSuperposition = Math.abs(probs[0] - 0.5) < 0.05 && Math.abs(probs[4] - 0.5) < 0.05;
        const isNegativePhase = s0.re > 0.6 && s4.re < -0.6;
        return isSuperposition && isNegativePhase;
      }
    },
    {
      level: 4,
      title: "Tantangan 4: Bell State Entanglement (|Φ⁺⟩)",
      objective: "Ciptakan jalinan kuantum (Entanglement) sempurna antara q[0] dan q[1] menjadi (|00⟩ + |11⟩)/√2.",
      hint: "Pasang gerbang H pada q[0], lalu pasang gerbang CNOT dengan kontrol q[0] dan target q[1].",
      numQubitsNeeded: 2,
      checkWin: (probs, state) => {
        // Bell state |000> and |110> have 50% probability each (q0=0, q1=0 -> 0; q0=1, q1=1 -> 6 or 4+2)
        // With q0, q1, q2 indices:
        // |000> is 0, |110> is 6 (q0=1, q1=1, q2=0)
        const p00 = probs[0];
        const p11 = probs[6];
        const otherP = probs.reduce((sum, p, i) => (i !== 0 && i !== 6 ? sum + p : sum), 0);
        return Math.abs(p00 - 0.5) < 0.05 && Math.abs(p11 - 0.5) < 0.05 && otherP < 0.02;
      }
    },
    {
      level: 5,
      title: "Tantangan 5: Quantum Cascade Inversion (|111⟩)",
      objective: "Ubah seluruh 3 qubit (q[0], q[1], q[2]) menjadi keadaan Turun |111⟩ (Probabilitas 100%).",
      hint: "Gunakan X pada q[0], lalu CNOT dari q[0] ke q[1], dan CNOT dari q[1] ke q[2] (atau pasang X pada ketiga qubit).",
      numQubitsNeeded: 3,
      checkWin: (probs, state) => {
        // State |111> is index 7
        return probs[7] > 0.98;
      }
    },
    {
      level: 0,
      title: "Mode Bebas (Sandbox Mode)",
      objective: "Eksperimen bebas merakit sirkuit kuantum 3-qubit apa saja dan ekspor kode Qiskit Python.",
      hint: "Tambahkan kombinasi gerbang X, H, Z, CNOT, atau SWAP untuk mengamati perubahan probabilitas dan spin kuantum.",
      numQubitsNeeded: 3,
      checkWin: () => false
    }
  ];

  // --- 4. Quantum Simulation Math ---
  // Tensor product of two vectors
  function tensorVector(v1, v2) {
    const res = [];
    for (let i = 0; i < v1.length; i++) {
      for (let j = 0; j < v2.length; j++) {
        res.push(v1[i].mul(v2[j]));
      }
    }
    return res;
  }

  // Apply single-qubit gate to 3-qubit statevector
  function apply1QGate(state, targetQubit, gateMatrix) {
    const dim = state.length; // 8 for 3 qubits
    const newState = Array.from({ length: dim }, () => new Complex(0, 0));

    // targetQubit: 0 (MSB: step 4), 1 (step 2), 2 (LSB: step 1)
    const bitPos = 2 - targetQubit; // for 3 qubits
    const mask = 1 << bitPos;

    for (let i = 0; i < dim; i++) {
      const bitVal = (i & mask) ? 1 : 0;
      const i0 = i & ~mask;
      const i1 = i | mask;

      if (bitVal === 0) {
        // newState[i0] = M00 * state[i0] + M01 * state[i1]
        // newState[i1] = M10 * state[i0] + M11 * state[i1]
        const v0 = state[i0];
        const v1 = state[i1];

        newState[i0] = gateMatrix[0][0].mul(v0).add(gateMatrix[0][1].mul(v1));
        newState[i1] = gateMatrix[1][0].mul(v0).add(gateMatrix[1][1].mul(v1));
      }
    }
    return newState;
  }

  // Apply CNOT gate (control -> target)
  function applyCNOT(state, controlQubit, targetQubit) {
    const dim = state.length;
    const newState = [...state];

    const cBit = 2 - controlQubit;
    const tBit = 2 - targetQubit;
    const cMask = 1 << cBit;
    const tMask = 1 << tBit;

    for (let i = 0; i < dim; i++) {
      // If control bit is 1 and target bit is 0, swap state[i] with state[i with target bit 1]
      if ((i & cMask) && !(i & tMask)) {
        const flippedIndex = i | tMask;
        const temp = newState[i];
        newState[i] = newState[flippedIndex];
        newState[flippedIndex] = temp;
      }
    }
    return newState;
  }

  // Apply SWAP gate (between qubit A and qubit B)
  function applySWAP(state, qA, qB) {
    const dim = state.length;
    const newState = [...state];

    const bA = 2 - qA;
    const bB = 2 - qB;
    const mA = 1 << bA;
    const mB = 1 << bB;

    for (let i = 0; i < dim; i++) {
      const bitA = (i & mA) ? 1 : 0;
      const bitB = (i & mB) ? 1 : 0;
      if (bitA !== bitB && bitA === 0) {
        const swappedIndex = (i & ~mB) | mA;
        const temp = newState[i];
        newState[i] = newState[swappedIndex];
        newState[swappedIndex] = temp;
      }
    }
    return newState;
  }

  // Simulate whole circuit
  function simulateCircuit() {
    // Initial state: |000>
    let state = Array.from({ length: 8 }, (_, i) => i === 0 ? new Complex(1, 0) : new Complex(0, 0));

    for (let col = 0; col < NUM_STEPS; col++) {
      // Check for 2-qubit gates first in this column
      let cnotFound = false;
      let controlQ = -1, targetQ = -1;

      for (let q = 0; q < NUM_QUBITS; q++) {
        const gate = circuitGrid[q][col];
        if (gate && gate.type === 'CX_CTRL') controlQ = q;
        if (gate && gate.type === 'CX_TARG') targetQ = q;
      }

      if (controlQ !== -1 && targetQ !== -1) {
        state = applyCNOT(state, controlQ, targetQ);
        cnotFound = true;
      }

      // Check for SWAP
      let swapQ1 = -1, swapQ2 = -1;
      for (let q = 0; q < NUM_QUBITS; q++) {
        const gate = circuitGrid[q][col];
        if (gate && gate.type === 'SWAP') {
          if (swapQ1 === -1) swapQ1 = q;
          else swapQ2 = q;
        }
      }
      if (swapQ1 !== -1 && swapQ2 !== -1) {
        state = applySWAP(state, swapQ1, swapQ2);
      }

      // Apply single qubit gates
      for (let q = 0; q < NUM_QUBITS; q++) {
        const gate = circuitGrid[q][col];
        if (gate && typeof gate === 'string' && GATES_1Q[gate]) {
          state = apply1QGate(state, q, GATES_1Q[gate]);
        }
      }
    }

    // Calculate probabilities: P(i) = |a_i|^2
    const probs = state.map(c => c.absSq());
    return { state, probs };
  }

  // --- 5. UI Rendering & Interactions ---

  function renderCircuitGrid() {
    const gridContainer = document.getElementById('circuit-grid');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    for (let q = 0; q < NUM_QUBITS; q++) {
      const row = document.createElement('div');
      row.className = 'flex items-center space-x-3 py-3 relative';

      // Qubit Label
      const label = document.createElement('div');
      label.className = 'w-14 text-right font-mono font-bold text-sm text-cyan-300 flex items-center justify-end space-x-1.5 flex-shrink-0';
      label.innerHTML = `<span>q[${q}]</span> <span class="text-xs text-slate-500">|0⟩</span>`;
      row.appendChild(label);

      // Wire Container
      const wireWrap = document.createElement('div');
      wireWrap.className = 'flex-grow flex items-center space-x-3 relative';

      // Background Line Wire
      const wireLine = document.createElement('div');
      wireLine.className = 'absolute top-1/2 left-0 right-0 h-[2px] bg-slate-700 -translate-y-1/2 z-0';
      wireWrap.appendChild(wireLine);

      // Slot Buttons (Steps)
      for (let s = 0; s < NUM_STEPS; s++) {
        const slot = document.createElement('button');
        slot.type = 'button';
        slot.className = 'w-12 h-12 rounded-xl flex items-center justify-center relative z-10 transition-all font-mono font-bold text-sm shadow-md border ';

        const gate = circuitGrid[q][s];
        if (!gate) {
          slot.className += 'bg-slate-900/90 border-slate-700/60 text-slate-500 hover:border-cyan-400 hover:bg-slate-800';
          slot.innerHTML = '+';
        } else if (typeof gate === 'string') {
          if (gate === 'X') {
            slot.className += 'bg-gradient-to-br from-pink-500 to-rose-600 border-pink-300 text-white shadow-pink-500/20';
            slot.innerHTML = 'X';
          } else if (gate === 'H') {
            slot.className += 'bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-300 text-white shadow-purple-500/20';
            slot.innerHTML = 'H';
          } else if (gate === 'Z') {
            slot.className += 'bg-gradient-to-br from-cyan-600 to-blue-600 border-cyan-300 text-white shadow-cyan-500/20';
            slot.innerHTML = 'Z';
          } else if (gate === 'S') {
            slot.className += 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-300 text-white shadow-amber-500/20';
            slot.innerHTML = 'S';
          }
        } else if (typeof gate === 'object') {
          if (gate.type === 'CX_CTRL') {
            slot.className += 'bg-slate-950 border-cyan-400 text-cyan-400';
            slot.innerHTML = '●';
          } else if (gate.type === 'CX_TARG') {
            slot.className += 'bg-cyan-500 border-cyan-200 text-black';
            slot.innerHTML = '⊕';
          } else if (gate.type === 'SWAP') {
            slot.className += 'bg-emerald-600 border-emerald-300 text-white';
            slot.innerHTML = '✕';
          }
        }

        // Slot click handler
        slot.addEventListener('click', () => {
          handleSlotClick(q, s);
        });

        wireWrap.appendChild(slot);
      }

      row.appendChild(wireWrap);
      gridContainer.appendChild(row);
    }
  }

  function handleSlotClick(qubit, step) {
    if (selectedGate === 'TRASH') {
      // If CX or SWAP, clear the pair
      const current = circuitGrid[qubit][step];
      if (current && (current.type === 'CX_CTRL' || current.type === 'CX_TARG' || current.type === 'SWAP')) {
        for (let q = 0; q < NUM_QUBITS; q++) circuitGrid[q][step] = null;
      } else {
        circuitGrid[qubit][step] = null;
      }
    } else if (selectedGate === 'CX') {
      // Create CX from q0 -> q1 (or q1 -> q2, or toggle)
      if (qubit === 0) {
        circuitGrid[0][step] = { type: 'CX_CTRL' };
        circuitGrid[1][step] = { type: 'CX_TARG' };
      } else if (qubit === 1) {
        circuitGrid[1][step] = { type: 'CX_CTRL' };
        circuitGrid[2][step] = { type: 'CX_TARG' };
      } else {
        circuitGrid[2][step] = { type: 'CX_CTRL' };
        circuitGrid[0][step] = { type: 'CX_TARG' };
      }
    } else if (selectedGate === 'SWAP') {
      if (qubit === 0) {
        circuitGrid[0][step] = { type: 'SWAP' };
        circuitGrid[1][step] = { type: 'SWAP' };
      } else {
        circuitGrid[1][step] = { type: 'SWAP' };
        circuitGrid[2][step] = { type: 'SWAP' };
      }
    } else {
      // Single qubit gate
      circuitGrid[qubit][step] = selectedGate;
    }

    updateDashboard();
  }

  function updateDashboard() {
    renderCircuitGrid();
    const { state, probs } = simulateCircuit();

    // 1. Update Spin Visualizers
    // Calculate P(|0>) and P(|1>) for each qubit
    // q0: states 0-3 are |0>, states 4-7 are |1>
    const p1_q0 = probs[4] + probs[5] + probs[6] + probs[7];
    const p0_q0 = 1 - p1_q0;

    // q1: states {0,1,4,5} are |0>, {2,3,6,7} are |1>
    const p1_q1 = probs[2] + probs[3] + probs[6] + probs[7];
    const p0_q1 = 1 - p1_q1;

    // q2: states {0,2,4,6} are |0>, {1,3,5,7} are |1>
    const p1_q2 = probs[1] + probs[3] + probs[5] + probs[7];
    const p0_q2 = 1 - p1_q2;

    updateSpinCard(0, p0_q0, p1_q0);
    updateSpinCard(1, p0_q1, p1_q1);
    updateSpinCard(2, p0_q2, p1_q2);

    // 2. Update Probability Bar Chart
    const probContainer = document.getElementById('prob-bars-container');
    if (probContainer) {
      probContainer.innerHTML = '';
      const basisLabels = ['|000⟩', '|001⟩', '|010⟩', '|011⟩', '|100⟩', '|101⟩', '|110⟩', '|111⟩'];
      
      basisLabels.forEach((label, idx) => {
        const p = probs[idx];
        const percent = (p * 100).toFixed(1);

        const barRow = document.createElement('div');
        barRow.className = 'space-y-1';
        barRow.innerHTML = `
          <div class="flex justify-between text-xs font-mono text-slate-300">
            <span>${label}</span>
            <span class="font-bold ${p > 0.05 ? 'text-cyan-400' : 'text-slate-500'}">${percent}%</span>
          </div>
          <div class="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-300 ${p > 0.05 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-slate-700'}" style="width: ${percent}%;"></div>
          </div>
        `;
        probContainer.appendChild(barRow);
      });
    }

    // 3. Update Qiskit Python Code Preview
    updateQiskitCode();

    // 4. Validate Challenge Win Condition
    checkChallengeWin(probs, state);
  }

  function updateSpinCard(qIndex, p0, p1) {
    const card = document.getElementById(`qubit-spin-card-${qIndex}`);
    if (!card) return;

    const arrowEl = card.querySelector('.spin-arrow');
    const labelEl = card.querySelector('.spin-state-text');
    const probEl = card.querySelector('.spin-prob-text');

    if (Math.abs(p0 - 1) < 0.02) {
      // Pure Spin Up |0>
      arrowEl.textContent = '↑';
      arrowEl.className = 'spin-arrow text-4xl text-emerald-400 font-bold transition-all duration-300';
      labelEl.textContent = 'Naik (|0⟩)';
      labelEl.className = 'spin-state-text text-sm font-bold text-emerald-300 font-mono';
    } else if (Math.abs(p1 - 1) < 0.02) {
      // Pure Spin Down |1>
      arrowEl.textContent = '↓';
      arrowEl.className = 'spin-arrow text-4xl text-pink-400 font-bold transition-all duration-300';
      labelEl.textContent = 'Turun (|1⟩)';
      labelEl.className = 'spin-state-text text-sm font-bold text-pink-300 font-mono';
    } else {
      // Superposition
      arrowEl.textContent = '⥮';
      arrowEl.className = 'spin-arrow text-4xl text-purple-400 font-bold animate-pulse transition-all duration-300';
      labelEl.textContent = 'Superposisi (|ψ⟩)';
      labelEl.className = 'spin-state-text text-sm font-bold text-purple-300 font-mono';
    }

    probEl.textContent = `P(|0⟩): ${(p0 * 100).toFixed(0)}% • P(|1⟩): ${(p1 * 100).toFixed(0)}%`;
  }

  function updateQiskitCode() {
    const codeBox = document.getElementById('qiskit-python-code');
    if (!codeBox) return;

    let lines = [
      'from qiskit import QuantumCircuit',
      'qc = QuantumCircuit(3, 3)\n'
    ];

    for (let col = 0; col < NUM_STEPS; col++) {
      let stepGates = [];
      for (let q = 0; q < NUM_QUBITS; q++) {
        const g = circuitGrid[q][col];
        if (g) {
          if (typeof g === 'string') {
            lines.push(`qc.${g.toLowerCase()}(${q})`);
          } else if (g.type === 'CX_CTRL') {
            // Find target
            for (let t = 0; t < NUM_QUBITS; t++) {
              if (circuitGrid[t][col] && circuitGrid[t][col].type === 'CX_TARG') {
                lines.push(`qc.cx(${q}, ${t})`);
              }
            }
          } else if (g.type === 'SWAP') {
            for (let t = q + 1; t < NUM_QUBITS; t++) {
              if (circuitGrid[t][col] && circuitGrid[t][col].type === 'SWAP') {
                lines.push(`qc.swap(${q}, ${t})`);
              }
            }
          }
        }
      }
    }

    lines.push('\nqc.measure_all()');
    lines.push('# Eksekusi: result = sampler.run([qc]).result()');
    codeBox.textContent = lines.join('\n');
  }

  function checkChallengeWin(probs, state) {
    const challenge = CHALLENGES.find(c => c.level === currentLevel);
    const winBadge = document.getElementById('challenge-status-badge');
    const winModal = document.getElementById('win-modal');

    if (!challenge || challenge.level === 0) {
      if (winBadge) {
        winBadge.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700';
        winBadge.textContent = 'Mode Eksperimen Bebas';
      }
      return;
    }

    const won = challenge.checkWin(probs, state);

    if (won) {
      if (winBadge) {
        winBadge.className = 'px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400 shadow-lg shadow-emerald-500/20 animate-bounce';
        winBadge.textContent = '🎉 TARGET TERCAPAI!';
      }
      if (winModal && winModal.classList.contains('hidden')) {
        winModal.classList.remove('hidden');
        winModal.classList.add('flex');
      }
    } else {
      if (winBadge) {
        winBadge.className = 'px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40';
        winBadge.textContent = '⏳ Target Belum Tercapai';
      }
    }
  }

  function setLevel(lvl) {
    currentLevel = lvl;
    // Clear circuit
    circuitGrid = Array.from({ length: NUM_QUBITS }, () => Array(NUM_STEPS).fill(null));

    const challenge = CHALLENGES.find(c => c.level === lvl);
    const titleEl = document.getElementById('challenge-title');
    const objEl = document.getElementById('challenge-objective');
    const hintEl = document.getElementById('challenge-hint');

    if (titleEl && challenge) titleEl.textContent = challenge.title;
    if (objEl && challenge) objEl.textContent = challenge.objective;
    if (hintEl && challenge) hintEl.textContent = `💡 Petunjuk: ${challenge.hint}`;

    // Update level buttons
    const levelBtns = document.querySelectorAll('.level-select-btn');
    levelBtns.forEach(btn => {
      const bLvl = parseInt(btn.getAttribute('data-level'), 10);
      if (bLvl === lvl) {
        btn.classList.remove('bg-slate-800', 'text-slate-300', 'border-slate-700');
        btn.classList.add('bg-cyan-500', 'text-black', 'border-cyan-400', 'shadow-lg', 'shadow-cyan-500/20');
      } else {
        btn.classList.add('bg-slate-800', 'text-slate-300', 'border-slate-700');
        btn.classList.remove('bg-cyan-500', 'text-black', 'border-cyan-400', 'shadow-lg', 'shadow-cyan-500/20');
      }
    });

    updateDashboard();
  }

  // --- 6. Initialization on DOM Load ---
  document.addEventListener('DOMContentLoaded', () => {
    // Gate Palette selection
    const paletteBtns = document.querySelectorAll('.gate-palette-btn');
    paletteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        paletteBtns.forEach(b => {
          b.classList.remove('ring-2', 'ring-cyan-400', 'scale-105');
        });
        btn.classList.add('ring-2', 'ring-cyan-400', 'scale-105');
        selectedGate = btn.getAttribute('data-gate');
      });
    });

    // Level buttons
    const levelBtns = document.querySelectorAll('.level-select-btn');
    levelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lvl = parseInt(btn.getAttribute('data-level'), 10);
        setLevel(lvl);
      });
    });

    // Clear Circuit Button
    const clearBtn = document.getElementById('clear-circuit-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        circuitGrid = Array.from({ length: NUM_QUBITS }, () => Array(NUM_STEPS).fill(null));
        updateDashboard();
      });
    }

    // Copy Code Button
    const copyCodeBtn = document.getElementById('copy-qiskit-btn');
    if (copyCodeBtn) {
      copyCodeBtn.addEventListener('click', () => {
        const code = document.getElementById('qiskit-python-code').textContent;
        navigator.clipboard.writeText(code).then(() => {
          copyCodeBtn.textContent = 'Tersalin! ✔';
          setTimeout(() => { copyCodeBtn.textContent = 'Salin Kode 📋'; }, 2000);
        });
      });
    }

    // Modal Close and Next Level button
    const winModal = document.getElementById('win-modal');
    const nextLvlBtn = document.getElementById('next-level-btn');
    const closeWinModalBtn = document.getElementById('close-win-modal-btn');

    if (nextLvlBtn) {
      nextLvlBtn.addEventListener('click', () => {
        if (winModal) {
          winModal.classList.add('hidden');
          winModal.classList.remove('flex');
        }
        if (currentLevel < 5) {
          setLevel(currentLevel + 1);
        } else {
          setLevel(0); // Sandbox
        }
      });
    }

    if (closeWinModalBtn) {
      closeWinModalBtn.addEventListener('click', () => {
        if (winModal) {
          winModal.classList.add('hidden');
          winModal.classList.remove('flex');
        }
      });
    }

    // Initial Load
    setLevel(1);
  });

})();
